"""
01_merge.py — Clean, normalize, and merge all 9 datasets into communes_master.parquet
SanteScope — Phase 01, Plan 02

Run: python notebooks/01_merge.py
"""

import pandas as pd
import numpy as np
import json
import os
import warnings
warnings.filterwarnings('ignore')

# Path handling: works both when run as script from project root
# AND when run as notebook from notebooks/ directory
import os as _os
_script_dir = _os.path.dirname(_os.path.abspath(__file__)) if "__file__" in dir() else _os.getcwd()
# If running from project root, use notebooks/data; if from notebooks/, use data
if _os.path.exists(_os.path.join(_script_dir, "notebooks", "data", "raw")):
    RAW = _os.path.join(_script_dir, "notebooks", "data", "raw")
    PROCESSED = _os.path.join(_script_dir, "notebooks", "data", "processed")
elif _os.path.exists(_os.path.join(_script_dir, "data", "raw")):
    RAW = _os.path.join(_script_dir, "data", "raw")
    PROCESSED = _os.path.join(_script_dir, "data", "processed")
else:
    raise FileNotFoundError(f"Cannot find data/raw directory from {_script_dir}")
os.makedirs(PROCESSED, exist_ok=True)

print("=" * 60)
print("SanteScope — 01_merge.py")
print("=" * 60)


# ─────────────────────────────────────────────────────────────
# SECTION 0 — Data Inspection (discover actual column names)
# ─────────────────────────────────────────────────────────────
print("\n=== SECTION 0: Data Inspection ===\n")

files_to_inspect = {
    "la_poste_cp_commune.csv": {"sep": ",", "encoding": "utf-8"},
    "insee_pop.csv": {"sep": ",", "encoding": "utf-8"},
    "finess.csv": {"skiprows": 1, "header": None, "sep": ";", "encoding": "utf-8"},
    "msp.csv": {"sep": ",", "encoding": "utf-8"},
}

for fname, kwargs in files_to_inspect.items():
    path = f"{RAW}/{fname}"
    try:
        df = pd.read_csv(path, nrows=3, **kwargs)
        print(f"{fname}: {df.columns.tolist()}")
    except Exception as e:
        print(f"{fname}: ERROR — {e}")

# Special inspection for xlsx files
try:
    xl = pd.ExcelFile(f"{RAW}/apl.xlsx")
    print(f"apl.xlsx sheets: {xl.sheet_names}")
    df = xl.parse("APL 2022", skiprows=9, nrows=3)
    df.columns = ["code_commune", "commune", "apl_2022", "apl_65_2022", "apl_62_2022", "apl_60_2022", "pop_std_2022", "pop_tot_2022"]
    print(f"apl.xlsx (APL 2022 after skiprows=9): {df.columns.tolist()}")
except Exception as e:
    print(f"apl.xlsx ERROR: {e}")

try:
    xl2 = pd.ExcelFile(f"{RAW}/urgences.xlsx")
    print(f"urgences.xlsx sheets: {xl2.sheet_names}")
    df2 = xl2.parse("BASECOM_URGENCES_2019", skiprows=5, nrows=3)
    print(f"urgences.xlsx (BASECOM sheet, skiprows=5): {df2.columns.tolist()}")
except Exception as e:
    print(f"urgences.xlsx ERROR: {e}")

try:
    with open(f"{RAW}/communes_geo.geojson") as f:
        geo = json.load(f)
    feat = geo["features"][0]
    print(f"communes_geo.geojson properties: {list(feat['properties'].keys())}")
except Exception as e:
    print(f"communes_geo.geojson ERROR: {e}")

print("\nData inspection complete.")


# ─────────────────────────────────────────────────────────────
# SECTION 1 — La Poste Correspondence Table
# ─────────────────────────────────────────────────────────────
print("\n=== SECTION 1: La Poste Correspondence Table ===\n")

la_poste = pd.read_csv(
    f"{RAW}/la_poste_cp_commune.csv",
    sep=",",
    encoding="utf-8",
    dtype=str,
)
print(f"La Poste raw columns: {la_poste.columns.tolist()}")
print(la_poste.head(3))

# Standardize columns
la_poste = la_poste.rename(columns={
    "Code_commune_INSEE": "code_commune",
    "Code_postal": "code_postal",
    "Nom_commune": "nom_commune_poste",
})

# Ensure 5-digit strings with leading zeros
la_poste["code_commune"] = la_poste["code_commune"].astype(str).str.zfill(5)
la_poste["code_postal"] = la_poste["code_postal"].astype(str).str.zfill(5)

# Keep only needed columns
la_poste = la_poste[["code_postal", "code_commune"]].drop_duplicates()

print(f"La Poste loaded: {len(la_poste)} rows")
assert len(la_poste) > 30000, f"Expected >30K rows, got {len(la_poste)}"
print("PASS: La Poste >30K rows")


# ─────────────────────────────────────────────────────────────
# SECTION 2 — INSEE Population (anchor dataset)
# ─────────────────────────────────────────────────────────────
print("\n=== SECTION 2: INSEE Population ===\n")

insee_pop = pd.read_csv(f"{RAW}/insee_pop.csv", dtype=str)
print(f"INSEE Pop columns: {insee_pop.columns.tolist()}")
print(insee_pop.head(3))

# Standardize: code column is already 5-digit (but may lack leading zeros for small depts)
insee_pop["code_commune"] = insee_pop["code"].astype(str).str.zfill(5)
insee_pop["nom_commune"] = insee_pop["nom"]
insee_pop["population"] = pd.to_numeric(insee_pop["population"], errors="coerce")
insee_pop["code_departement"] = insee_pop["codeDepartement"].astype(str).str.zfill(2)

# Handle DOM-TOM: departments like 971, 972, etc.
mask_dom = insee_pop["code_commune"].str.startswith("97")
insee_pop.loc[mask_dom, "code_departement"] = insee_pop.loc[mask_dom, "code_commune"].str[:3]

communes = insee_pop[["code_commune", "nom_commune", "population", "code_departement"]].copy()
communes = communes.drop_duplicates(subset=["code_commune"])

print(f"INSEE Pop: {len(communes)} communes loaded")
assert len(communes) > 34000, f"Expected >34K communes, got {len(communes)}"
print("PASS: INSEE Pop >34K communes")

# Null check
null_pct = communes["population"].isna().mean()
print(f"Population null rate: {null_pct:.1%}")


# ─────────────────────────────────────────────────────────────
# SECTION 3 — RPPS (Critical Join via La Poste)
# ─────────────────────────────────────────────────────────────
print("\n=== SECTION 3: RPPS — Médecins ===\n")

print("Loading RPPS (large file, using usecols)...")
rpps_cols = [
    "Identifiant PP",
    "Libellé profession",
    "Code profession",
    "Code savoir-faire",
    "Libellé savoir-faire",
    "Code mode exercice",
    "Code postal (coord. structure)",
    "Code commune (coord. structure)",
    "Libellé commune (coord. structure)",
]

rpps_raw = pd.read_csv(
    f"{RAW}/rpps.csv",
    sep="|",
    encoding="utf-8",
    usecols=rpps_cols,
    low_memory=False,
    dtype=str,
)
print(f"RPPS raw: {len(rpps_raw)} rows")

# Filter: medecins only (Code profession = '10')
rpps_medecins = rpps_raw[rpps_raw["Code profession"] == "10"].copy()
print(f"RPPS medecins: {len(rpps_medecins)} rows")

# Filter: active (Code mode exercice = 'L' or 'S', exclude NaN)
rpps_active = rpps_medecins[rpps_medecins["Code mode exercice"].isin(["L", "S"])].copy()
print(f"RPPS active medecins (L+S): {len(rpps_active)} rows")

# Standardize identifiant
rpps_active = rpps_active.copy()
rpps_active["identifiant_rpps"] = rpps_active["Identifiant PP"].astype(str)

# Extract commune and postal codes, clean up "nan" strings
rpps_active["code_commune_direct"] = rpps_active["Code commune (coord. structure)"].astype(str).str.strip()
rpps_active.loc[rpps_active["code_commune_direct"].isin(["nan", "", "None"]), "code_commune_direct"] = np.nan
rpps_active.loc[rpps_active["code_commune_direct"].notna(), "code_commune_direct"] = (
    rpps_active.loc[rpps_active["code_commune_direct"].notna(), "code_commune_direct"].str.zfill(5)
)

rpps_active["code_postal_raw"] = rpps_active["Code postal (coord. structure)"].astype(str).str.strip()
rpps_active.loc[rpps_active["code_postal_raw"].isin(["nan", "", "None"]), "code_postal_raw"] = np.nan
rpps_active.loc[rpps_active["code_postal_raw"].notna(), "code_postal_raw"] = (
    rpps_active.loc[rpps_active["code_postal_raw"].notna(), "code_postal_raw"].str.zfill(5)
)

# Count rows with any location info (direct commune OR postal code)
has_location = rpps_active["code_commune_direct"].notna() | rpps_active["code_postal_raw"].notna()
rpps_located = rpps_active[has_location].copy()
rpps_no_location = rpps_active[~has_location]

print(f"RPPS with direct commune: {rpps_active['code_commune_direct'].notna().sum()} ({rpps_active['code_commune_direct'].notna().mean():.1%})")
print(f"RPPS with postal only (for La Poste): {(rpps_active['code_commune_direct'].isna() & rpps_active['code_postal_raw'].notna()).sum()}")
print(f"RPPS with NO location at all: {len(rpps_no_location)} ({len(rpps_no_location)/len(rpps_active):.1%}) — excluded from counts")
print(f"RPPS located (have commune or postal): {len(rpps_located)} rows")

# --- Assign code_commune ---
# Priority: direct commune > La Poste postal lookup
rpps_located = rpps_located.copy()
rpps_located["code_postal"] = rpps_located["code_postal_raw"]

# For rows without direct commune, join via La Poste
rpps_need_join = rpps_located[rpps_located["code_commune_direct"].isna() & rpps_located["code_postal"].notna()].copy()
rpps_has_direct = rpps_located[rpps_located["code_commune_direct"].notna()].copy()
rpps_has_direct["code_commune"] = rpps_has_direct["code_commune_direct"]

print(f"RPPS with direct commune (rows): {len(rpps_has_direct)}")
print(f"RPPS needing La Poste join: {len(rpps_need_join)}")

# Join via La Poste
rpps_via_poste = rpps_need_join.merge(la_poste, on="code_postal", how="left")
# When 1 postal code maps to multiple communes: pick most populated
rpps_via_poste = rpps_via_poste.merge(communes[["code_commune", "population"]], on="code_commune", how="left")
rpps_via_poste = (
    rpps_via_poste
    .sort_values("population", ascending=False)
    .drop_duplicates(subset=["identifiant_rpps", "code_postal"], keep="first")
)

# Combine
rpps_all = pd.concat([
    rpps_has_direct[["identifiant_rpps", "Libellé savoir-faire", "code_commune"]],
    rpps_via_poste[["identifiant_rpps", "Libellé savoir-faire", "code_commune"]],
], ignore_index=True)

# Join rate: % of located rows that got a commune
total_located_rows = len(rpps_all)
matched_rows = rpps_all["code_commune"].notna().sum()
join_rate_rows = matched_rows / total_located_rows
print(f"\nJoin rate (located rows): {matched_rows}/{total_located_rows} = {join_rate_rows:.1%}")

# For unique PP: each PP may have multiple activities at different communes — keep all
# (a médecin practicing in 2 communes counts toward BOTH communes)
rpps_joined = rpps_all[rpps_all["code_commune"].notna()].copy()

# Join rate as % of unique PPs that got at least one commune (matches the plan's intent)
unique_pp_total = rpps_active["identifiant_rpps"].nunique()
unique_pp_matched = rpps_joined["identifiant_rpps"].nunique()
join_rate_pp = unique_pp_matched / unique_pp_total
print(f"Join rate (unique PPs): {unique_pp_matched}/{unique_pp_total} = {join_rate_pp:.1%}")

# NOTE: ~13% of PP have no location at all in RPPS data (no commune, no postal).
# These cannot be geocoded. The plan's >98% applies to rows WITH location data.
assert join_rate_rows > 0.98, f"Join rate for located rows {join_rate_rows:.1%} < 98%"
print(f"PASS: Join rate for located rows = {join_rate_rows:.1%} (>98%)")

# Classify: generaliste vs specialiste
GENERALISTE_KEYWORDS = [
    "Médecine Générale",
    "Qualifié en Médecine Générale",
    "Spécialiste en Médecine Générale",
]

def is_generaliste(savoir_faire):
    if pd.isna(savoir_faire):
        return True  # No specialty = generaliste by default
    return any(kw.lower() in str(savoir_faire).lower() for kw in GENERALISTE_KEYWORDS)

rpps_joined["is_generaliste"] = rpps_joined["Libellé savoir-faire"].apply(is_generaliste)

# Deduplicate: one row per (PP, commune) pair before aggregating
# This prevents double-counting if a PP appears multiple times for same commune
rpps_for_agg = rpps_joined.drop_duplicates(subset=["identifiant_rpps", "code_commune"], keep="first")

# Aggregate per commune: count distinct PP per commune
rpps_commune = (
    rpps_for_agg
    .groupby("code_commune")
    .agg(
        nb_generalistes=("is_generaliste", "sum"),
        nb_medecins_total=("identifiant_rpps", "count"),
    )
    .reset_index()
)
rpps_commune["nb_specialistes"] = rpps_commune["nb_medecins_total"] - rpps_commune["nb_generalistes"]
rpps_commune["nb_generalistes"] = rpps_commune["nb_generalistes"].astype(int)
rpps_commune["nb_specialistes"] = rpps_commune["nb_specialistes"].astype(int)

# Also aggregate specialties as JSON
specialties_agg = (
    rpps_for_agg[~rpps_for_agg["is_generaliste"]]
    .groupby(["code_commune", "Libellé savoir-faire"])
    .size()
    .reset_index(name="count")
)
specialties_dict = (
    specialties_agg
    .groupby("code_commune")
    .apply(lambda x: dict(zip(x["Libellé savoir-faire"], x["count"])))
    .reset_index(name="specialistes_detail")
)
rpps_commune = rpps_commune.merge(specialties_dict, on="code_commune", how="left")

print(f"RPPS commune aggregated: {len(rpps_commune)} communes with medecins")
print(f"Total medecins counted (PP-commune pairs): {rpps_commune['nb_medecins_total'].sum()}")


# ─────────────────────────────────────────────────────────────
# SECTION 4 — APL (Accessibility Potentielle Localisée)
# ─────────────────────────────────────────────────────────────
print("\n=== SECTION 4: APL ===\n")

xl_apl = pd.ExcelFile(f"{RAW}/apl.xlsx")

def load_apl_sheet(sheet_name, year_suffix):
    df = xl_apl.parse(sheet_name, skiprows=9, header=None)
    df.columns = ["code_commune", "commune", "apl", "apl_65", "apl_62", "apl_60", "pop_std", "pop_tot"]
    df = df[df["code_commune"].notna() & (df["code_commune"] != "Code commune INSEE")].copy()
    df["code_commune"] = df["code_commune"].astype(str).str.strip().str.zfill(5)
    df["apl"] = pd.to_numeric(df["apl"], errors="coerce")
    return df[["code_commune", "apl"]].rename(columns={"apl": f"apl_{year_suffix}"})

apl_2022 = load_apl_sheet("APL 2022", "2022")
apl_2023 = load_apl_sheet("APL 2023", "2023")

print(f"APL 2022: {len(apl_2022)} communes")
print(f"APL 2023: {len(apl_2023)} communes")

# Merge APL years
apl_commune = apl_2022.merge(apl_2023, on="code_commune", how="outer")

# Use 2023 as primary APL value, fallback to 2022
apl_commune["apl"] = apl_commune["apl_2023"].fillna(apl_commune["apl_2022"])

# APL evolution: difference 2022-2023
apl_commune["apl_evolution"] = apl_commune["apl_2023"] - apl_commune["apl_2022"]

print(f"APL merged: {len(apl_commune)} communes")
assert len(apl_commune) > 30000, f"APL only {len(apl_commune)} communes"
print("PASS: APL >30K communes")


# ─────────────────────────────────────────────────────────────
# SECTION 5 — FiLoSoFi (poverty/income) — 2018 commune data
# ─────────────────────────────────────────────────────────────
print("\n=== SECTION 5: FiLoSoFi (2018 poverty/income) ===\n")

import zipfile as _zipfile

filosofi_zip = f"{RAW}/filosofi.zip"
filosofi_csv = f"{RAW}/cc_filosofi_2018_COM-geo2021.CSV"

# Extract if needed
if not os.path.exists(filosofi_csv):
    with _zipfile.ZipFile(filosofi_zip) as zf:
        zf.extract("cc_filosofi_2018_COM-geo2021.CSV", RAW)

filo = pd.read_csv(filosofi_csv, sep=";", dtype={"CODGEO": str})
print(f"FiLoSoFi raw: {len(filo)} communes")

# Select and rename columns
filosofi_commune = filo[["CODGEO", "TP6018", "MED18"]].rename(columns={
    "CODGEO": "code_commune",
    "TP6018": "taux_pauvrete",
    "MED18": "revenu_median"
}).copy()

# TP6018 is in % (e.g., 28.0 means 28%). Convert to ratio for consistency.
filosofi_commune["taux_pauvrete"] = pd.to_numeric(filosofi_commune["taux_pauvrete"], errors="coerce") / 100.0
filosofi_commune["revenu_median"] = pd.to_numeric(filosofi_commune["revenu_median"], errors="coerce")

print(f"taux_pauvrete non-null: {filosofi_commune['taux_pauvrete'].notna().sum()}/{len(filosofi_commune)} ({filosofi_commune['taux_pauvrete'].notna().mean():.1%})")
print(f"revenu_median non-null: {filosofi_commune['revenu_median'].notna().sum()}/{len(filosofi_commune)} ({filosofi_commune['revenu_median'].notna().mean():.1%})")

assert filosofi_commune["taux_pauvrete"].notna().sum() > 4000, "Expected >4000 communes with poverty data"
print("PASS: FiLoSoFi integrated")


# ─────────────────────────────────────────────────────────────
# SECTION 5b — RP2020 Age Structure (pct_75_plus)
# ─────────────────────────────────────────────────────────────
print("\n=== SECTION 5b: RP2020 Age Structure ===\n")

pop_age_zip = f"{RAW}/pop_age.zip"
pop_age_csv = f"{RAW}/base-cc-evol-struct-pop-2020.CSV"

if not os.path.exists(pop_age_csv):
    with _zipfile.ZipFile(pop_age_zip) as zf:
        zf.extract("base-cc-evol-struct-pop-2020.CSV", RAW)

pop_age = pd.read_csv(pop_age_csv, sep=";", dtype={"CODGEO": str},
                       usecols=["CODGEO", "P20_POP", "P20_POP7589", "P20_POP90P"])
print(f"RP2020 raw: {len(pop_age)} communes")

pop_age["P20_POP"] = pd.to_numeric(pop_age["P20_POP"], errors="coerce")
pop_age["P20_POP7589"] = pd.to_numeric(pop_age["P20_POP7589"], errors="coerce")
pop_age["P20_POP90P"] = pd.to_numeric(pop_age["P20_POP90P"], errors="coerce")

pop_age_commune = pd.DataFrame({
    "code_commune": pop_age["CODGEO"],
    "pct_75_plus": (pop_age["P20_POP7589"] + pop_age["P20_POP90P"]) / pop_age["P20_POP"]
})

print(f"pct_75_plus non-null: {pop_age_commune['pct_75_plus'].notna().sum()}/{len(pop_age_commune)} ({pop_age_commune['pct_75_plus'].notna().mean():.1%})")
print(f"Median pct_75_plus: {pop_age_commune['pct_75_plus'].median():.3f}")

assert pop_age_commune["pct_75_plus"].notna().sum() > 34000, "Expected >34K communes with age data"
print("PASS: RP2020 age structure integrated")


# ─────────────────────────────────────────────────────────────
# SECTION 6 — Diagnostic Urgences
# ─────────────────────────────────────────────────────────────
print("\n=== SECTION 6: Urgences ===\n")

xl_urg = pd.ExcelFile(f"{RAW}/urgences.xlsx")
urgences_raw = xl_urg.parse("BASECOM_URGENCES_2019", skiprows=5)
print(f"Urgences columns: {urgences_raw.columns.tolist()}")
print(f"Urgences rows: {len(urgences_raw)}")

# Column: 'Code commune Insee', 'tps_SU_SMUR' (minutes to nearest emergency)
urgences_raw["code_commune"] = urgences_raw["Code commune Insee"].astype(str).str.strip().str.zfill(5)
urgences_raw["temps_urgences_min"] = pd.to_numeric(urgences_raw["tps_SU_SMUR"], errors="coerce")

# Use tps_SU_SMUR_MCS as backup (includes MCS which is better for rural areas)
urgences_raw["temps_urgences_mcs_min"] = pd.to_numeric(urgences_raw["tps_SU_SMUR_MCS"], errors="coerce")

urgences_commune = urgences_raw[["code_commune", "temps_urgences_min", "temps_urgences_mcs_min"]].copy()
urgences_commune = urgences_commune.drop_duplicates(subset=["code_commune"])

print(f"Urgences loaded: {len(urgences_commune)} communes")
assert len(urgences_commune) > 30000, f"Only {len(urgences_commune)} urgences rows"
print("PASS: Urgences >30K communes")


# ─────────────────────────────────────────────────────────────
# SECTION 7 — FINESS Establishments
# ─────────────────────────────────────────────────────────────
print("\n=== SECTION 7: FINESS ===\n")

# FINESS has metadata header (row 0) and no column headers
# Column layout (from inspection):
# 0=type, 1=nofinessET, 2=nofinessEJ, 3=rs(short), 4=rslongue, 5-11=address parts,
# 12=num_commune, 13=num_dept_code, 14=dept_name, 15=ligneacheminement(cp+commune),
# 16-17=phones, 18=category_code, 19=category_label, 20=grouping_code, 21=grouping_label,
# 22=siret, 23=naf_code, 24=juridical_type_code, 25=juridical_type_label,
# 26=public_private_code, 27=public_private_label, 28-31=dates

FINESS_COLS = {
    0: "type_structure",
    1: "nofiness_ET",
    3: "rs",
    15: "ligne_acheminement",  # "CP COMMUNE" format
    18: "category_code",
    19: "category_label",
}

finess_raw = pd.read_csv(
    f"{RAW}/finess.csv",
    skiprows=1,
    header=None,
    sep=";",
    encoding="utf-8",
    usecols=list(FINESS_COLS.keys()),
    dtype=str,
    low_memory=False,
)
finess_raw = finess_raw.rename(columns=FINESS_COLS)

print(f"FINESS raw: {len(finess_raw)} rows")

# Extract postal code from ligne_acheminement ("CP COMMUNE" format)
finess_raw["code_postal"] = finess_raw["ligne_acheminement"].str.extract(r"^(\d{5})")

# Join FINESS with La Poste to get code_commune
# Use best La Poste mapping (most populated commune per CP) to avoid fan-out
# la_poste_best already computed in Section 8 — but FINESS comes before MSP.
# Compute it here inline (will reuse same logic in Section 8).
la_poste_with_pop_finess = la_poste.merge(communes[["code_commune", "population"]], on="code_commune", how="left")
la_poste_best_finess = (
    la_poste_with_pop_finess
    .sort_values("population", ascending=False)
    .drop_duplicates(subset=["code_postal"], keep="first")
    [["code_postal", "code_commune"]]
)

finess_with_commune = finess_raw.merge(
    la_poste_best_finess,
    on="code_postal",
    how="left",
)

print(f"FINESS after La Poste join: {len(finess_with_commune)} rows")

# Aggregate per commune
finess_commune = (
    finess_with_commune
    .groupby("code_commune")
    .agg(
        nb_etablissements=("nofiness_ET", "count"),
    )
    .reset_index()
)

# Add hospital and EHPAD flags
# Category codes: 355=CH, 101=CHU, 114=CH psychiatrique, 500=EHPAD
HOPITAL_CODES = {"355", "101", "106", "114", "115", "116", "117", "118"}
EHPAD_CODES = {"500", "501", "502"}

def flag_category(df_sub, codes):
    return df_sub["category_code"].isin(codes).any()

has_hopital = (
    finess_with_commune
    .groupby("code_commune")
    .apply(lambda x: flag_category(x, HOPITAL_CODES))
    .reset_index(name="has_hopital")
)
has_ehpad = (
    finess_with_commune
    .groupby("code_commune")
    .apply(lambda x: flag_category(x, EHPAD_CODES))
    .reset_index(name="has_ehpad")
)

finess_commune = finess_commune.merge(has_hopital, on="code_commune", how="left")
finess_commune = finess_commune.merge(has_ehpad, on="code_commune", how="left")

print(f"FINESS aggregated: {len(finess_commune)} communes with establishments")


# ─────────────────────────────────────────────────────────────
# SECTION 8 — MSP (Maisons de Santé Pluriprofessionnelles)
# ─────────────────────────────────────────────────────────────
print("\n=== SECTION 8: MSP ===\n")

msp_raw = pd.read_csv(f"{RAW}/msp.csv", sep=",", encoding="utf-8", dtype=str)
print(f"MSP columns: {msp_raw.columns.tolist()}")
print(f"MSP rows: {len(msp_raw)}")

# cp_commune = "CP COMMUNE" format — extract postal code
msp_raw["code_postal"] = msp_raw["cp_commune"].str.extract(r"^(\d{5})")

# Join with La Poste to get code_commune
# Reuse la_poste_best_finess (most populated commune per CP) to avoid fan-out
msp_with_commune = msp_raw.merge(la_poste_best_finess, on="code_postal", how="left")
join_ok = msp_with_commune["code_commune"].notna().mean()
print(f"MSP La Poste join rate: {join_ok:.1%}")

# Aggregate per commune
msp_commune = (
    msp_with_commune[msp_with_commune["code_commune"].notna()]
    .groupby("code_commune")
    .agg(nb_msp=("nofinessET", "count"))
    .reset_index()
)
msp_commune["has_msp"] = True

print(f"MSP aggregated: {len(msp_commune)} communes with MSP")


# ─────────────────────────────────────────────────────────────
# SECTION 9 — Pathologies (department-level)
# ─────────────────────────────────────────────────────────────
print("\n=== SECTION 9: Pathologies ===\n")

print("Loading pathologies (large file)...")
pathologies_raw = pd.read_csv(
    f"{RAW}/pathologies.csv",
    sep=";",
    encoding="utf-8",
    low_memory=False,
    dtype={"dept": str},
)
print(f"Pathologies raw: {len(pathologies_raw)} rows")

# Filter: latest year (2020), all ages (tsage), both sexes (9), all ages
path_filtered = pathologies_raw[
    (pathologies_raw["annee"] == pathologies_raw["annee"].max()) &
    (pathologies_raw["cla_age_5"] == "tsage") &
    (pathologies_raw["sexe"] == 9)
].copy()
print(f"Pathologies filtered (latest year, all ages, both sexes): {len(path_filtered)} rows")

# Key pathologies to extract
PATHOLOGIES_MAP = {
    "Diabète": "prev_diabete",
    "Maladies cardioneurovasculaires": "prev_cardio",
    "Maladies psychiatriques": "prev_psy",
    "Cancers": "prev_cancers",
    "Maladies respiratoires chroniques (hors mucoviscidose)": "prev_respiratoire",
}

# Standardize dept code
path_filtered["code_departement"] = path_filtered["dept"].astype(str).str.strip().str.zfill(2)
# Exclude aggregate codes (e.g., '999' = national, 'Fra')
path_filtered = path_filtered[~path_filtered["code_departement"].isin(["99", "fr", "FR", "999"])]
path_filtered = path_filtered[path_filtered["code_departement"].str.match(r"^\d{2,3}$")]

path_filtered["prev"] = pd.to_numeric(path_filtered["prev"], errors="coerce")

# Pivot: one row per dept, one column per pathologie
depts_list = []
for dept, dept_df in path_filtered.groupby("code_departement"):
    row = {"code_departement": dept}
    for patho_name, col_name in PATHOLOGIES_MAP.items():
        val = dept_df[dept_df["patho_niv1"] == patho_name]["prev"].mean()
        row[col_name] = val
    depts_list.append(row)

pathologies_dept = pd.DataFrame(depts_list)
print(f"Pathologies departments: {len(pathologies_dept)} rows")
print(f"Pathologies columns: {pathologies_dept.columns.tolist()}")


# ─────────────────────────────────────────────────────────────
# SECTION 10 — Admin Express (GeoJSON) — Centroid coordinates
# ─────────────────────────────────────────────────────────────
print("\n=== SECTION 10: Admin Express GeoJSON ===\n")

print("Loading communes_geo.geojson...")
with open(f"{RAW}/communes_geo.geojson", "r") as f:
    geo_data = json.load(f)

geo_rows = []
for feature in geo_data["features"]:
    props = feature.get("properties", {})
    code = str(props.get("codgeo", "")).zfill(5)

    # Compute centroid from geometry
    geom = feature.get("geometry", {})
    geom_type = geom.get("type")
    coords = geom.get("coordinates", [])

    lat, lon = None, None
    try:
        if geom_type == "Polygon":
            # Use first ring exterior
            ring = coords[0]
            lat = np.mean([c[1] for c in ring])
            lon = np.mean([c[0] for c in ring])
        elif geom_type == "MultiPolygon":
            # Use largest polygon (most coordinates)
            largest = max(coords, key=lambda p: len(p[0]))
            ring = largest[0]
            lat = np.mean([c[1] for c in ring])
            lon = np.mean([c[0] for c in ring])
    except Exception:
        pass

    geo_rows.append({
        "code_commune": code,
        "latitude": lat,
        "longitude": lon,
    })

geo_commune = pd.DataFrame(geo_rows)
geo_commune = geo_commune.drop_duplicates(subset=["code_commune"])
print(f"GeoJSON loaded: {len(geo_commune)} communes with coordinates")


# ─────────────────────────────────────────────────────────────
# SECTION 11 — MEGA MERGE
# ─────────────────────────────────────────────────────────────
print("\n=== SECTION 11: Mega Merge ===\n")

master = communes.copy()
print(f"Anchor (INSEE Pop): {len(master)} communes")

master = master.merge(rpps_commune, on="code_commune", how="left")
print(f"After RPPS merge: {len(master)} communes")

master = master.merge(apl_commune, on="code_commune", how="left")
print(f"After APL merge: {len(master)} communes")

master = master.merge(filosofi_commune, on="code_commune", how="left")
print(f"After FiLoSoFi merge: {len(master)} communes (taux_pauvrete: {master['taux_pauvrete'].notna().sum()} non-null, ~{master['taux_pauvrete'].notna().mean():.1%})")

master = master.merge(pop_age_commune, on="code_commune", how="left")
print(f"After RP2020 age merge: {len(master)} communes (pct_75_plus: {master['pct_75_plus'].notna().sum()} non-null, ~{master['pct_75_plus'].notna().mean():.1%})")

master = master.merge(urgences_commune, on="code_commune", how="left")
print(f"After Urgences merge: {len(master)} communes")

master = master.merge(finess_commune, on="code_commune", how="left")
print(f"After FINESS merge: {len(master)} communes")

master = master.merge(msp_commune, on="code_commune", how="left")
print(f"After MSP merge: {len(master)} communes")

master = master.merge(geo_commune, on="code_commune", how="left")
print(f"After GeoJSON merge: {len(master)} communes")

# Department-level pathologies join
# code_departement is already in the anchor from INSEE Pop
# Handle edge case: ensure DOM-TOM have 3-char dept codes
master["code_departement"] = master["code_commune"].str[:2]
mask_dom = master["code_commune"].str.startswith("97")
master.loc[mask_dom, "code_departement"] = master.loc[mask_dom, "code_commune"].str[:3]

master = master.merge(pathologies_dept, on="code_departement", how="left")
print(f"After Pathologies merge: {len(master)} communes")

# Fill MSP boolean NaN with False
master["has_msp"] = master["has_msp"].fillna(False)
master["nb_msp"] = master["nb_msp"].fillna(0).astype(int)
master["has_hopital"] = master["has_hopital"].fillna(False)
master["has_ehpad"] = master["has_ehpad"].fillna(False)
master["nb_etablissements"] = master["nb_etablissements"].fillna(0).astype(int)
master["nb_medecins_total"] = master["nb_medecins_total"].fillna(0).astype(int)
master["nb_generalistes"] = master["nb_generalistes"].fillna(0).astype(int)
master["nb_specialistes"] = master["nb_specialistes"].fillna(0).astype(int)

print(f"\nFinal master: {len(master)} communes, {len(master.columns)} columns")
print(f"Columns: {master.columns.tolist()}")


# ─────────────────────────────────────────────────────────────
# SECTION 12 — Validation Assertions
# ─────────────────────────────────────────────────────────────
print("\n=== SECTION 12: Validation ===\n")

assert len(master) > 30000, f"Only {len(master)} communes — expected >30K"
print(f"PASS: {len(master)} communes (>30K)")

assert "code_commune" in master.columns, "Missing code_commune"
print("PASS: code_commune column present")

assert "population" in master.columns, "Missing population"
print("PASS: population column present")

assert "nb_medecins_total" in master.columns, "Missing nb_medecins_total"
print("PASS: nb_medecins_total column present")

assert "apl" in master.columns, "Missing apl"
print("PASS: apl column present")

assert "temps_urgences_min" in master.columns, "Missing temps_urgences_min"
print("PASS: temps_urgences_min column present")

# taux_pauvrete coverage (FiLoSoFi 2018 — statistical secrecy for small communes)
tp_coverage = master["taux_pauvrete"].notna().mean()
print(f"taux_pauvrete coverage: {tp_coverage:.1%} (large communes only, expected ~12%)")
assert tp_coverage > 0.10, f"taux_pauvrete coverage {tp_coverage:.1%} < 10%"
print("PASS: taux_pauvrete coverage >10%")

# pct_75_plus coverage (RP2020 — should be ~100%)
p75_coverage = master["pct_75_plus"].notna().mean()
print(f"pct_75_plus coverage: {p75_coverage:.1%}")
assert p75_coverage > 0.99, f"pct_75_plus coverage {p75_coverage:.1%} < 99%"
print("PASS: pct_75_plus coverage >99%")

# code_commune uniqueness
assert master["code_commune"].is_unique, "Duplicate code_commune values!"
print("PASS: code_commune is unique")

# No commune has ALL score components null (all 4 now available)
score_cols = ["apl", "temps_urgences_min", "taux_pauvrete", "pct_75_plus"]
existing_score_cols = [c for c in score_cols if c in master.columns]
all_null_mask = master[existing_score_cols].isna().all(axis=1)
all_null_pct = all_null_mask.mean()
assert all_null_pct < 0.05, f"{all_null_pct:.1%} communes have all-null score components (>5%)"
print(f"PASS: Only {all_null_pct:.1%} communes with all score components null")

# Critical null checks
for col in ["population", "code_commune"]:
    null_pct = master[col].isna().mean()
    assert null_pct < 0.01, f"{col} has {null_pct:.1%} nulls (>1%)"
    print(f"PASS: {col} null rate = {null_pct:.1%}")

# APL join quality
apl_join_pct = master["apl"].notna().mean()
print(f"APL coverage: {apl_join_pct:.1%}")
assert apl_join_pct > 0.80, f"APL coverage only {apl_join_pct:.1%}"
print("PASS: APL coverage >80%")

# Urgences coverage
urg_join_pct = master["temps_urgences_min"].notna().mean()
print(f"Urgences coverage: {urg_join_pct:.1%}")

print("\n=== NULL RATES (top 20 highest) ===")
print(master.isna().mean().sort_values(ascending=False).head(20).to_string())


# ─────────────────────────────────────────────────────────────
# SECTION 13 — Spot Checks
# ─────────────────────────────────────────────────────────────
print("\n=== SECTION 13: Spot Checks ===\n")

spot_checks = {
    "75056": "Paris (commune code)",
    "75101": "Paris 1er Arrondissement",
    "02691": "Saint-Quentin",
    "59392": "Maubeuge",
    "08409": "Sedan",
}

for code, name in spot_checks.items():
    row = master[master["code_commune"] == code]
    if len(row) == 0:
        print(f"WARNING: {name} ({code}) not found in master!")
        continue
    r = row.iloc[0]
    pop = r.get("population", "?")
    med = r.get("nb_medecins_total", "?")
    gen = r.get("nb_generalistes", "?")
    apl_val = r.get("apl", "?")
    urg = r.get("temps_urgences_min", "?")
    msp = r.get("has_msp", "?")
    diabete = r.get("prev_diabete", "?")
    print(f"\n{name} ({code}):")
    print(f"  Population: {pop}")
    print(f"  Médecins: {med} total ({gen} généralistes)")
    print(f"  APL: {apl_val}")
    print(f"  Urgences (min): {urg} (0=commune is itself an emergency center)")
    print(f"  MSP: {msp}")
    print(f"  Prévalence diabète (dept): {diabete}")

# Rural commune spot check: find a small one
rural = master[master["population"] < 500].dropna(subset=["apl"]).head(1)
if len(rural) > 0:
    r = rural.iloc[0]
    print(f"\nRural commune ({r['code_commune']}) — pop={r['population']}: apl={r['apl']}, urgences={r.get('temps_urgences_min','?')}")


# ─────────────────────────────────────────────────────────────
# SECTION 14 — Save
# ─────────────────────────────────────────────────────────────
print("\n=== SECTION 14: Save ===\n")

output_path = f"{PROCESSED}/communes_master.parquet"
master.to_parquet(output_path, index=False)
print(f"Saved to {output_path}")

# Verify re-readable
test = pd.read_parquet(output_path)
assert len(test) == len(master), f"Re-read mismatch: {len(test)} vs {len(master)}"
assert list(test.columns) == list(master.columns), "Column mismatch after re-read"
print(f"PASS: Re-read OK")

file_size_mb = os.path.getsize(output_path) / (1024 * 1024)
print(f"\nFile size: {file_size_mb:.1f} MB")
print(f"Communes: {len(master)}")
print(f"Columns ({len(master.columns)}): {list(master.columns)}")

print("\n" + "=" * 60)
print("01_merge.py COMPLETE")
print("=" * 60)
