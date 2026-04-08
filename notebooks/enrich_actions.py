"""
enrich_actions.py — Enrich SanteScope twin matching with FINESS health facility actions.

Adds per-commune counts: nb_mmg, nb_ssiad, nb_centres_sante, nb_pharmacies.
Re-runs KNN twin matching with richer action detection.
Re-exports all JSONs for the frontend.
"""

import pandas as pd
import numpy as np
import json
import time
import pathlib
import jsonschema
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import MinMaxScaler

ROOT = pathlib.Path(__file__).resolve().parent.parent
PROCESSED = pathlib.Path(__file__).resolve().parent / "data" / "processed"
RAW = pathlib.Path(__file__).resolve().parent / "data" / "raw"
OUTPUT_DIR = ROOT / "public" / "data"
COMMUNES_DIR = OUTPUT_DIR / "communes"
COMMUNES_DIR.mkdir(parents=True, exist_ok=True)

# ── Step 1: Load master parquet ──────────────────────────────────────────────
df = pd.read_parquet(PROCESSED / "communes_master.parquet")
print(f"Loaded master: {df.shape[0]} communes, {df.shape[1]} columns")

# Drop old jumelles & log_pop (will rebuild)
if "jumelles" in df.columns:
    df = df.drop(columns=["jumelles"])
if "log_pop" in df.columns:
    df = df.drop(columns=["log_pop"])

# ── Step 2: Load La Poste mapping (postal code → commune) ───────────────────
la_poste = pd.read_csv(RAW / "la_poste_cp_commune.csv", sep=",", encoding="utf-8", dtype=str)
la_poste = la_poste.rename(columns={
    "Code_commune_INSEE": "code_commune",
    "Code_postal": "code_postal",
})
la_poste["code_commune"] = la_poste["code_commune"].astype(str).str.zfill(5)
la_poste["code_postal"] = la_poste["code_postal"].astype(str).str.zfill(5)
la_poste = la_poste[["code_postal", "code_commune"]].drop_duplicates()

# Best mapping: most populated commune per postal code
la_poste_with_pop = la_poste.merge(
    df[["code_commune", "population"]], on="code_commune", how="left"
)
la_poste_best = (
    la_poste_with_pop
    .sort_values("population", ascending=False)
    .drop_duplicates(subset=["code_postal"], keep="first")
    [["code_postal", "code_commune"]]
)
print(f"La Poste best mapping: {len(la_poste_best)} postal codes")

# ── Step 3: Load FINESS and count target categories per commune ─────────────
finess_raw = pd.read_csv(
    RAW / "finess.csv",
    skiprows=1,
    header=None,
    sep=";",
    encoding="utf-8",
    usecols=[1, 15, 18, 19],
    dtype=str,
    low_memory=False,
)
finess_raw = finess_raw.rename(columns={
    1: "nofiness_ET",
    15: "ligne_acheminement",
    18: "category_code",
    19: "category_label",
})
print(f"FINESS raw: {len(finess_raw)} rows")

# Extract postal code
finess_raw["code_postal"] = finess_raw["ligne_acheminement"].str.extract(r"^(\d{5})")

# Join with La Poste to get code_commune
finess_with_commune = finess_raw.merge(la_poste_best, on="code_postal", how="left")
print(f"FINESS after La Poste join: {len(finess_with_commune)} rows")
print(f"FINESS join rate: {finess_with_commune['code_commune'].notna().mean():.1%}")

# Target categories
CATEGORIES = {
    "617": ("nb_mmg", "MMG"),
    "354": ("nb_ssiad", "SSIAD"),
    "636": ("nb_centres_sante", "Centre de soins"),
    "620": ("nb_pharmacies", "Pharmacie"),
}

for cat_code, (col_name, label) in CATEGORIES.items():
    cat_df = (
        finess_with_commune[
            (finess_with_commune["category_code"] == cat_code)
            & finess_with_commune["code_commune"].notna()
        ]
        .groupby("code_commune")
        .agg(**{col_name: ("nofiness_ET", "count")})
        .reset_index()
    )
    df = df.merge(cat_df, on="code_commune", how="left")
    df[col_name] = df[col_name].fillna(0).astype(int)
    print(f"  {label} (cat {cat_code}): {(df[col_name] > 0).sum()} communes, {df[col_name].sum()} total")

# ── Step 4: Re-run KNN twin matching ────────────────────────────────────────
TWIN_FEATURES = ["apl", "taux_pauvrete", "pct_75_plus", "log_pop", "densite_hab_km2"]
df["log_pop"] = np.log1p(df["population"])

features = df[TWIN_FEATURES].copy()
for col in TWIN_FEATURES:
    features[col] = features[col].fillna(features[col].median())

scaler = MinMaxScaler()
X = scaler.fit_transform(features)
print(f"\nFeature matrix: {X.shape}")

t0 = time.time()
nbrs = NearestNeighbors(n_neighbors=51, algorithm="ball_tree", metric="euclidean")
nbrs.fit(X)
distances, indices = nbrs.kneighbors(X)
print(f"KNN fit + query: {time.time() - t0:.2f}s")

# Improvement signal (enriched)
has_improved = (
    (df["has_msp"] == True)
    | (df["apl_evolution"] > 0.3)
    | (df["nb_mmg"] > 0)
    | (df["nb_ssiad"] > 0)
    | (df["nb_centres_sante"] > 0)
)
print(f"\n{has_improved.sum()} communes avec signal d'amelioration (enriched)")
print(f"  - MSP: {(df['has_msp'] == True).sum()}")
print(f"  - APL > 0.3: {(df['apl_evolution'] > 0.3).sum()}")
print(f"  - MMG: {(df['nb_mmg'] > 0).sum()}")
print(f"  - SSIAD: {(df['nb_ssiad'] > 0).sum()}")
print(f"  - Centres santé: {(df['nb_centres_sante'] > 0).sum()}")

# Region index
region_indices = {}
for reg in df["region"].dropna().unique():
    region_indices[reg] = set(df.index[df["region"] == reg].tolist())

MAX_TWINS = 5
SIMILARITY_SCALE = np.sqrt(len(TWIN_FEATURES))

# Precompute median pharmacies for "bon maillage" comparison
median_pharmacies = df.loc[df["nb_pharmacies"] > 0, "nb_pharmacies"].median()
print(f"Median pharmacies (among communes with >0): {median_pharmacies}")


def build_twin(i, j, dist):
    """Build twin dict with enriched actions."""
    twin_row = df.iloc[j]
    commune_row = df.iloc[i]
    sim = round(max(1 - (dist / SIMILARITY_SCALE), 0), 2)
    actions = []

    if twin_row["has_msp"]:
        actions.append(f"MSP installee ({int(twin_row['nb_msp'])} MSP)")

    if twin_row["nb_mmg"] > 0:
        actions.append("Maison medicale de garde (urgences proximite)")

    if twin_row["nb_ssiad"] > 0:
        actions.append("Soins infirmiers a domicile (aide 75+)")

    if twin_row["nb_centres_sante"] > 0:
        actions.append("Centre de soins et prevention")

    if (
        twin_row["nb_pharmacies"] > 0
        and twin_row["nb_pharmacies"] > commune_row["nb_pharmacies"]
        and twin_row["nb_pharmacies"] >= median_pharmacies
    ):
        actions.append("Bon maillage pharmacies")

    if pd.notna(twin_row["apl_evolution"]) and twin_row["apl_evolution"] > 0.3:
        apl_22 = f"{twin_row['apl_2022']:.1f}" if pd.notna(twin_row["apl_2022"]) else "?"
        apl_23 = f"{twin_row['apl_2023']:.1f}" if pd.notna(twin_row["apl_2023"]) else "?"
        actions.append(f"APL: {apl_22} -> {apl_23}")

    return {
        "code": str(twin_row["code_commune"]),
        "nom": str(twin_row["nom_commune"]),
        "similarite": sim,
        "actions": actions,
        "has_msp": bool(twin_row["has_msp"]),
        "apl_avant": round(float(twin_row["apl_2022"]), 1) if pd.notna(twin_row["apl_2022"]) else None,
        "apl_apres": round(float(twin_row["apl_2023"]), 1) if pd.notna(twin_row["apl_2023"]) else None,
    }


t0 = time.time()
jumelles_list = []

for i in range(len(df)):
    if i % 5000 == 0 and i > 0:
        print(f"  {i}/{len(df)} communes traitees ({time.time() - t0:.1f}s)")

    commune_region = df.iloc[i]["region"]
    neighbors = indices[i][1:]
    neighbor_dists = distances[i][1:]

    twins = []
    added_indices = set()

    # Step 1: same-region improved twins
    if commune_region and commune_region in region_indices:
        reg_set = region_indices[commune_region]
        for j, dist in zip(neighbors, neighbor_dists):
            if len(twins) >= MAX_TWINS:
                break
            if j in reg_set and has_improved.iloc[j]:
                twins.append(build_twin(i, j, dist))
                added_indices.add(j)

    # Step 2: expand nationally if <5 improved twins
    if len(twins) < MAX_TWINS:
        for j, dist in zip(neighbors, neighbor_dists):
            if len(twins) >= MAX_TWINS:
                break
            if j not in added_indices and has_improved.iloc[j]:
                twins.append(build_twin(i, j, dist))
                added_indices.add(j)

    # Step 3: if <3 twins, add best-match non-improved neighbors
    if len(twins) < 3:
        for j, dist in zip(neighbors, neighbor_dists):
            if len(twins) >= 3:
                break
            if j not in added_indices:
                twins.append(build_twin(i, j, dist))
                added_indices.add(j)

    jumelles_list.append(twins)

print(f"Twin selection complete: {time.time() - t0:.1f}s")


# Ensure native types for parquet
def ensure_native(twins):
    result = []
    for t in twins:
        d = {}
        for k, v in t.items():
            if hasattr(v, "tolist"):
                d[k] = v.tolist()
            else:
                d[k] = v
        result.append(d)
    return result


df["jumelles"] = [ensure_native(tw) for tw in jumelles_list]

# ── Step 5: Save updated parquet ─────────────────────────────────────────────
df.to_parquet(PROCESSED / "communes_master.parquet", index=False)
print(f"\nSaved parquet: {df.shape[0]} communes, {df.shape[1]} columns")

# ── Step 6: Re-export JSONs (replicating 05_export_json.ipynb) ───────────────
medians = json.load(open(PROCESSED / "national_medians.json"))


def data_quality(row):
    n = row["n_score_components"]
    if n >= 4:
        return "complete"
    elif n >= 3:
        return "partial"
    return "minimal"


df["data_quality"] = df.apply(data_quality, axis=1)


def to_native(val):
    if isinstance(val, (np.integer,)):
        return int(val)
    if isinstance(val, (np.floating,)):
        return round(float(val), 2) if pd.notna(val) else None
    if isinstance(val, (np.bool_,)):
        return bool(val)
    if isinstance(val, float) and pd.isna(val):
        return None
    if pd.isna(val) if not isinstance(val, (str, list, dict, bool)) else False:
        return None
    return val


def build_commune_dict(row, medians):
    spec_detail = {}
    sd = row.get("specialistes_detail")
    if sd is not None and not (isinstance(sd, float) and pd.isna(sd)):
        try:
            spec_detail = json.loads(sd) if isinstance(sd, str) else sd
        except Exception:
            pass

    domino = None
    da = row.get("domino_alert")
    if da is not None and not (isinstance(da, float) and pd.isna(da)):
        domino = {
            "medecins_55_plus": to_native(row.get("medecins_55plus_est")),
            "pct_55_plus": to_native(row.get("pct_55plus_dept")),
            "pct_55_plus_dept": to_native(row.get("pct_55plus_dept")),
            "projection_2030": to_native(row.get("projection_2030")),
        }
        eff_2025 = row.get("effectif_medecins_dept_2025")
        if pd.notna(eff_2025):
            domino["effectif_dept_2025"] = int(eff_2025)
        cagr = row.get("trend_medecins_cagr")
        if pd.notna(cagr):
            domino["trend_cagr"] = round(float(cagr), 2)
        delta = row.get("trend_medecins_delta_annuel")
        if pd.notna(delta):
            domino["trend_delta_annuel"] = round(float(delta), 1)

    apl_evo = None
    if pd.notna(row.get("apl_2022")) and pd.notna(row.get("apl_2023")):
        apl_evo = {"2022": round(float(row["apl_2022"]), 1), "2023": round(float(row["apl_2023"]), 1)}

    patho = None
    patho_cols = ["prev_diabete", "prev_cardio", "prev_psy", "prev_cancers", "prev_respiratoire"]
    if any(pd.notna(row.get(c)) for c in patho_cols):
        patho = {
            "diabete": to_native(row.get("prev_diabete")),
            "cardiovasculaire": to_native(row.get("prev_cardio")),
            "psychiatrique": to_native(row.get("prev_psy")),
            "cancers": to_native(row.get("prev_cancers")),
            "respiratoire": to_native(row.get("prev_respiratoire")),
        }

    coords = None
    if pd.notna(row.get("latitude")) and pd.notna(row.get("longitude")):
        coords = [round(float(row["latitude"]), 4), round(float(row["longitude"]), 4)]

    manques = row.get("manques")
    if manques is None:
        pass
    elif isinstance(manques, float) and pd.isna(manques):
        manques = None
    elif hasattr(manques, "tolist"):
        manques = manques.tolist()
    elif not isinstance(manques, list):
        manques = None

    jumelles_raw = row.get("jumelles", [])
    if jumelles_raw is None or (isinstance(jumelles_raw, float) and pd.isna(jumelles_raw)):
        jumelles = []
    else:
        jumelles = []
        for t in jumelles_raw:
            td = {}
            for k, v in (t.items() if isinstance(t, dict) else []):
                if hasattr(v, "tolist"):
                    td[k] = v.tolist()
                elif isinstance(v, (np.integer,)):
                    td[k] = int(v)
                elif isinstance(v, (np.floating,)):
                    td[k] = float(v) if pd.notna(v) else None
                elif isinstance(v, (np.bool_,)):
                    td[k] = bool(v)
                else:
                    td[k] = v
            jumelles.append(td)

    pop = row.get("population", 0)
    pop = int(pop) if pd.notna(pop) else 0

    return {
        "code": str(row["code_commune"]),
        "nom": str(row["nom_commune"]),
        "dept": str(row["code_departement"]),
        "region": to_native(row.get("region")),
        "pop": pop,
        "score": to_native(row.get("score")),
        "classe": to_native(row.get("classe")),
        "data_quality": row["data_quality"],
        "score_detail": {
            "apl": to_native(row.get("apl")),
            "apl_national": round(float(medians["apl"]), 1),
            "pauvrete": to_native(row.get("taux_pauvrete")),
            "pauvrete_national": round(float(medians["pauvrete"]), 4),
            "pct_75_seuls": to_native(row.get("pct_75_plus")),
            "pct_75_seuls_national": round(float(medians["pct_75_seuls"]), 4),
            "temps_urgences_min": to_native(row.get("temps_urgences_min")),
            "temps_urgences_national": round(float(medians["temps_urgences_min"]), 1),
        },
        "medecins": {
            "generalistes": int(row.get("nb_generalistes", 0)),
            "specialistes": spec_detail if spec_detail else {},
            "total": int(row.get("nb_medecins_total", 0)),
        },
        "manques": manques,
        "domino": domino,
        "jumelles": jumelles,
        "msp_presente": bool(row.get("has_msp", False)),
        "apl_evolution": apl_evo,
        "pathologies_dept": patho,
        "coords": coords,
    }


COMMUNE_SCHEMA = {
    "type": "object",
    "required": ["code", "nom", "dept", "pop", "data_quality"],
    "properties": {
        "code": {"type": "string"},
        "nom": {"type": "string"},
        "dept": {"type": "string"},
        "region": {"type": ["string", "null"]},
        "pop": {"type": "integer"},
        "score": {"type": ["number", "null"]},
        "classe": {"type": ["string", "null"]},
        "data_quality": {"type": "string", "enum": ["complete", "partial", "minimal"]},
        "score_detail": {"type": "object"},
        "medecins": {"type": "object"},
        "manques": {"type": ["array", "null"]},
        "domino": {"type": ["object", "null"]},
        "jumelles": {"type": "array"},
        "msp_presente": {"type": "boolean"},
        "apl_evolution": {"type": ["object", "null"]},
        "pathologies_dept": {"type": ["object", "null"]},
        "coords": {"type": ["array", "null"]},
    },
}

print("\nExporting per-commune JSONs...")
t0 = time.time()
errors = []

for idx, (_, row) in enumerate(df.iterrows()):
    if idx % 10000 == 0 and idx > 0:
        print(f"  {idx}/{len(df)} exported ({time.time() - t0:.1f}s)")

    commune_dict = build_commune_dict(row, medians)

    try:
        jsonschema.validate(commune_dict, COMMUNE_SCHEMA)
    except jsonschema.ValidationError as e:
        errors.append((row["code_commune"], str(e.message)[:100]))
        if len(errors) > 100:
            print(f"STOP: too many errors ({len(errors)})")
            break

    fpath = COMMUNES_DIR / f"{row['code_commune']}.json"
    with open(fpath, "w", encoding="utf-8") as f:
        json.dump(commune_dict, f, ensure_ascii=False, separators=(",", ":"))

print(f"Export complete: {len(df)} communes in {time.time() - t0:.1f}s")
assert len(errors) == 0, f"Schema validation errors: {errors[:10]}"

# Export index.json
index_data = []
for _, row in df.iterrows():
    index_data.append({
        "code": str(row["code_commune"]),
        "nom": str(row["nom_commune"]),
        "dept": str(row["code_departement"]),
        "score": round(float(row["score"]), 1) if pd.notna(row["score"]) else None,
        "classe": str(row["classe"]) if pd.notna(row.get("classe")) else None,
        "pop": int(row["population"]) if pd.notna(row["population"]) else 0,
    })

with open(OUTPUT_DIR / "index.json", "w", encoding="utf-8") as f:
    json.dump(index_data, f, ensure_ascii=False, separators=(",", ":"))

print(f"index.json: {(OUTPUT_DIR / 'index.json').stat().st_size / 1024:.0f} KB, {len(index_data)} entries")

# ── Step 7: Verify Versailles (78646) ───────────────────────────────────────
versailles = df[df["code_commune"] == "78646"].iloc[0]
print(f"\n{'='*60}")
print(f"Versailles (78646) — jumelles enrichies:")
print(f"  nb_mmg={versailles['nb_mmg']}, nb_ssiad={versailles['nb_ssiad']}, "
      f"nb_centres_sante={versailles['nb_centres_sante']}, nb_pharmacies={versailles['nb_pharmacies']}")
for i, tw in enumerate(versailles["jumelles"]):
    print(f"  Twin {i+1}: {tw['nom']} ({tw['code']}) — sim={tw['similarite']}")
    for a in tw["actions"]:
        print(f"    -> {a}")
    if not tw["actions"]:
        print(f"    -> (aucune action detectee)")

print(f"\n=== DONE ===")
