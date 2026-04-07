# Phase 2: Scoring & Clustering — Research

**Researched:** 2026-04-08
**Domain:** Python data pipeline — scoring, KNN clustering, JSON export
**Confidence:** HIGH (all findings verified against actual data in the repo)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Vulnerability Score**
- D-01: Equal weights (25% each) for 4 components: APL inverse, poverty rate, % 75+ alone, urgent-care access time.
- D-02: Min-max normalization across all communes, final score 0-10, rounded to 1 decimal.
- D-03: Score = null ("Donnees insuffisantes") if commune has <3 of 4 components available.
- D-04: National average = median across communes (robust to outliers).
- D-05: Classification A-E (DPE-style): A = least vulnerable, E = most vulnerable. Thresholds by Claude. Document rationale.
- D-06: Each component value + national median exposed in JSON.

**Missing Doctors**
- D-07: Count specialists per commune from RPPS grouped by specialty.
- D-08: Cross with department pathology rates to identify specialty gaps.
- D-09: Display top missing specialties per commune as `manques` array in JSON.

**Domino Projection**
- D-10: Estimate % doctors 55+ per commune by applying department-level DREES stats to commune RPPS counts.
- D-11: Domino alert triggers when commune % 55+ exceeds department average OR exceeds 50% (double threshold).
- D-12: Projection format: simple text "-N medecins (estimation)". No false precision.
- D-13: Only compute domino for communes with >3 doctors.

**Twin Matching**
- D-14: Euclidean distance on min-max normalized indicators (APL, poverty, age structure, population, density).
- D-15: Same-region priority: first search within region, then expand nationally if fewer than 5 twins with improvement found.
- D-16: Store top 5 twins per commune in JSON; frontend shows 3 by default.
- D-17: Similarity score exposed as 0-1 (1 = identical profile).

**JSON Export**
- D-18: Export ALL communes (>35K files), including those with null/incomplete data.
- D-19: Add `data_quality` field: "complete" | "partial" | "minimal".
- D-20: index.json includes both score AND classification (A-E) per commune.
- D-21: JSON Schema validation (jsonschema.validate()) on ALL exported files.
- D-22: JSON schema matches the frozen contract from Phase 1 CONTEXT.md exactly (with addition of `data_quality` and `classe` fields).

### Claude's Discretion

- APL inversion method (1/APL vs (max - APL) vs reverse normalization)
- A-E classification thresholds (linear, quintile, or hybrid) — must document choice and rationale in notebook markdown
- Improvement detection signals for twins (MSP presence + APL increase >0.3 as base, Claude may add other detectable signals)
- Clustering algorithm (KNN-based or direct distance computation)

### Deferred Ideas (OUT OF SCOPE)

- Custom score weighting with domain expert input — v2
- Population-weighted national average — v2
- ML-learned score weights — explicitly out of scope (loses explainability)
- CartoSante API integration — v2 (V2-01)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SCORE-01 | 4-component score (APL inverse, poverty rate, % 75+ alone, urgent-care access time) | All 4 components confirmed in parquet; see APL inversion analysis below |
| SCORE-02 | Min-max normalization across all communes, final score 0-10 | sklearn MinMaxScaler or manual minmax; verified fast on 35K rows |
| SCORE-03 | Communes with <3 of 4 components get score = null | 154 communes will get null (confirmed by actual component coverage audit) |
| SCORE-04 | Each component value + national average exposed in JSON | National median = median of each component computed over scoring subset |
| DOC-01 | Count specialists per commune from RPPS grouped by specialty | `specialistes_detail` dict already in parquet for 4,039 communes |
| DOC-02 | Cross with dept pathology rates to identify specialty gaps | 5 `prev_*` columns already in parquet; fixed pathology->specialty mapping table |
| DOC-03 | Display top missing specialties per commune as `manques` array | Computed from specialistes_detail + pathology cross; null for communes without RPPS data |
| DOM-01 | Estimate % doctors 55+ per commune using DREES dept stats applied to RPPS commune counts | DREES file downloadable; dept % 55+ ranges 28-59%, national avg 43% |
| DOM-02 | Project approximate medecin loss by 2030 | N_55plus = round(nb_medecins_total * dept_pct_55plus); 65+ by 2030 = 5yr cohort approximation |
| DOM-03 | Display domino alert when % 55+ exceeds dept average | Double threshold per D-11; only for communes with >3 doctors |
| TWIN-01 | Cluster communes on normalized indicators (APL, poverty, age structure, population, density) | sklearn NearestNeighbors; 35K x 5 matrix in 0.57s; density requires GeoJSON superf join |
| TWIN-02 | Find top 3-5 similar communes that improved (MSP installed or APL increased >0.3) | 3,129 communes with APL increase >0.3; 2,358 with MSP; 224 overlap |
| TWIN-03 | Store similarity score and detected actions per twin | Euclidean distance converted to 0-1 similarity |
| TWIN-04 | Expose APL evolution timeline for twins | ONLY 2022-2023 available (APL XLSX has 2 sheets only); schema must adapt |
| DATA-05 | Export index.json (~500Ko, 35K entries) | ~34KB estimated; trivial to generate |
| DATA-06 | Export per-commune JSON files (~2Ko each) matching frozen schema | 35K files in 3 seconds confirmed |
</phase_requirements>

---

## Summary

Phase 2 reads `communes_master.parquet` (34,969 communes, 29 columns) produced by Phase 1 and computes all derived features across 4 Jupyter notebooks (`02_score`, `03_domino`, `04_jumelles`, `05_export_json`). The data is in good shape: 99.6% of communes have at least 3 of 4 score components. Only 154 communes will receive score = null.

One external file must be downloaded at the start of Phase 2: the DREES "Medecins RPPS 2012-2025" XLSX (71 MB) from the DREES open data portal. This file provides age-by-tranche-by-dept data needed for DOM-01. It is confirmed downloadable via direct URL with User-Agent header.

Two schema adjustments are needed relative to the frozen Phase 1 contract: (1) `apl_evolution` can only expose 2 years (`{"2022": x, "2023": y}`) not 3, since the APL XLSX has only 2 sheets; (2) `score_avant`/`score_apres` for twins cannot be historical scores (no historical data) — expose `apl_avant`/`apl_apres` instead.

**Primary recommendation:** Use `(max_apl - apl) / (max_apl - min_apl)` for APL inversion (avoids division-by-zero for 517 APL=0 communes). Use quintile thresholds for A-E classification (equal-count buckets). Use sklearn NearestNeighbors with ball_tree for twin matching. Export JSONs to `public/data/` at project root (Next.js will reference this path in Phase 3).

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| pandas | 2.2.3 | DataFrame operations, parquet I/O | Already used in Phase 1 |
| numpy | 2.1.1 | Vectorized math for scoring | Already used in Phase 1 |
| scikit-learn | 1.5.2 | NearestNeighbors KNN for twin matching | Available, 0.57s for 35K communes |
| jsonschema | 4.26.0 | Schema validation per D-21 | Already installed |
| openpyxl | 3.1.5 | Read DREES XLSX for domino data | Already used for APL/urgences |
| nbformat | 5.10.4 | Notebook creation pattern | Already used |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| json (stdlib) | — | JSON serialization | All export operations |
| pathlib (stdlib) | — | Directory creation, path handling | Creating public/data/communes/ |
| urllib.request (stdlib) | — | Download DREES file | Notebook 03 setup cell |

**Installation:** All libraries already installed. No new `pip install` required.

---

## Architecture Patterns

### Notebook Pipeline Structure (established in Phase 1)

```
notebooks/
├── 02_score.ipynb       reads communes_master.parquet → adds score columns → saves back
├── 03_domino.ipynb      reads communes_master.parquet → adds domino columns → saves back
├── 04_jumelles.ipynb    reads communes_master.parquet → adds jumelles column → saves back
└── 05_export_json.ipynb reads communes_master.parquet → writes public/data/
```

Each notebook: (1) reads the master parquet, (2) adds new columns, (3) saves back to the same path. Linear chain, no cross-notebook state except via parquet.

### Pattern: Component-wise Min-Max Normalization

```python
# Source: verified against parquet data
def minmax_normalize(series, global_min=None, global_max=None):
    """Normalize over all communes (incl. those with missing values)."""
    mn = series.min() if global_min is None else global_min
    mx = series.max() if global_max is None else global_max
    if mx == mn:
        return pd.Series(0.5, index=series.index)
    return (series - mn) / (mx - mn)

# APL inversion: high APL = low vulnerability
# Use (max - apl) reversal, NOT 1/apl (avoids div-by-zero for 517 APL=0 communes)
apl_inv = df['apl'].max() - df['apl']
apl_inv_norm = minmax_normalize(apl_inv)

# For communes missing a component: impute with national median BEFORE normalizing
# (so they land near 0.5 = neutral), then weight equally
```

### Pattern: Score Computation with Null Handling

```python
# Source: verified against actual null rates in parquet
components = {
    'apl_inv': apl_inv_norm,
    'pauvrete': minmax_normalize(df['taux_pauvrete'].fillna(df['taux_pauvrete'].median())),
    'pct_75': minmax_normalize(df['pct_75_plus'].fillna(df['pct_75_plus'].median())),
    'urgences': minmax_normalize(df['temps_urgences_min'].fillna(df['temps_urgences_min'].median())),
}
n_available = pd.DataFrame({k: df[k.replace('_inv','')].notna() for k, _ in components.items()
                             # adapt key names to parquet columns
                            }).sum(axis=1)

score_raw = sum(components.values()) / 4  # always divide by 4 (equal 25% weights)
score_final = (score_raw * 10).round(1)
score_final[n_available < 3] = np.nan  # D-03: null if < 3 components
```

### Pattern: A-E Classification (Quintile Approach)

```python
# Quintile thresholds computed from observed score distribution
# A = P0-P20 (least vulnerable), E = P80-P100 (most vulnerable)
# Must be computed AFTER scoring, documented in notebook markdown
thresholds = np.percentile(score_final.dropna(), [20, 40, 60, 80])
# Example from data simulation: [3.2, 3.4, 3.5, 3.8]
# Note: actual thresholds will be computed from real scores

def classify(score, thresholds):
    if pd.isna(score):
        return None
    if score <= thresholds[0]: return 'A'
    if score <= thresholds[1]: return 'B'
    if score <= thresholds[2]: return 'C'
    if score <= thresholds[3]: return 'D'
    return 'E'
```

### Pattern: DREES Age Data Download (Domino)

```python
# Source: verified — DREES API confirmed downloadable in testing
DREES_MEDECINS_URL = (
    "https://data.drees.solidarites-sante.gouv.fr/api/explore/v2.1/catalog/datasets/"
    "la-demographie-des-professionnels-de-sante-depuis-2012/attachments/"
    "medecins_rpps_2012_2025_xlsx"
)

import urllib.request, io, pandas as pd
req = urllib.request.Request(DREES_MEDECINS_URL, headers={"User-Agent": "Mozilla/5.0"})
data = urllib.request.urlopen(req, timeout=60).read()
df_age = pd.read_excel(io.BytesIO(data), sheet_name='Effectifs', header=0)
# First row is actual header — use df_age.iloc[0] for column names
```

### Pattern: Dept-level % 55+ Computation

```python
# Source: verified against DREES file structure
# Columns after rename: territoire, region, departement, specialites_agregees,
#   specialites, exercice, tranche_age, sexe, effectif_2012..effectif_2025

filtered = df_age[
    (df_age['sexe'] == '0-Ensemble') &
    (df_age['specialites_agregees'] == '00-Ensemble') &
    (df_age['exercice'] == '0-Ensemble') &
    (df_age['departement'] != '000-Ensemble')
]
total_by_dept = filtered[filtered['tranche_age'] == '00-Ensemble'].set_index('departement')['effectif_2025']
aged_55plus = filtered[
    filtered['tranche_age'].str.startswith(('07', '08', '09', '10', '11'))
].groupby('departement')['effectif_2025'].sum()
pct_55plus_by_dept = (aged_55plus / total_by_dept).to_dict()
# dept code extraction: '075 -Paris' -> '75' (strip leading zeros)
```

### Pattern: Twin Matching with Region Priority

```python
# Source: verified — sklearn NearestNeighbors on 35K x 5 matrix: 0.57s
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import MinMaxScaler

# Features: APL, pauvrete (median-imputed), pct_75_plus, log(population), density
# Density = population / (superf_ha / 100)  — from GeoJSON superf field

# Step 1: scale all features
scaler = MinMaxScaler()
X = scaler.fit_transform(features_df[TWIN_FEATURES].fillna(features_df[TWIN_FEATURES].median()))

# Step 2: fit KNN
nbrs = NearestNeighbors(n_neighbors=51, algorithm='ball_tree', metric='euclidean')
nbrs.fit(X)
distances, indices = nbrs.kneighbors(X)  # distances[i][0] = self (=0), skip

# Step 3: for each commune, filter to region first, then expand
# Similarity = 1 - (distance / max_possible_distance)
# max_possible_distance for normalized 5D = sqrt(5) ≈ 2.236
SIMILARITY_SCALE = np.sqrt(len(TWIN_FEATURES))

# Improvement signal (D-TWIN-02):
has_improved = (df['has_msp'] == True) | (df['apl_evolution'] > 0.3)
```

### Pattern: JSON Export

```python
# Source: verified — 35K files in ~3 seconds on this machine
import json
from pathlib import Path

OUTPUT_DIR = Path("../public/data/communes")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

for _, row in df.iterrows():
    commune_dict = build_commune_dict(row)  # follows frozen schema
    output_path = OUTPUT_DIR / f"{row['code_commune']}.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(commune_dict, f, ensure_ascii=False, separators=(',', ':'))
```

### Anti-Patterns to Avoid

- **1/APL for inversion:** APL=0 (517 communes) causes ZeroDivisionError. Use `(max - apl)` reversal instead.
- **Dividing by n_available instead of 4:** Breaks equal-weight constraint (D-01). Always divide by 4; impute missing with component median.
- **Computing domino for all communes:** Only for communes with `nb_medecins_total > 3` (D-13). Others get `domino: null`.
- **Global KNN without region priority:** D-15 requires same-region search first. Only expand nationally if fewer than 5 improved twins found.
- **Blocking on DREES download failure:** Add try/except with fallback: if download fails, use hardcoded national avg (43%) for all depts and flag in notebook output.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| KNN twin search | Custom distance loop over 35K pairs | `sklearn.neighbors.NearestNeighbors` | Ball-tree is O(n log n) vs O(n²); handles 35K in 0.57s |
| Min-max scaling | Manual normalization per column | `sklearn.preprocessing.MinMaxScaler` | Handles edge cases (constant columns) |
| JSON schema validation | Custom field-by-field checks | `jsonschema.validate()` | Catches nested schema violations correctly |
| XLSX reading | Custom XML parser | `pandas.read_excel` with `openpyxl` | Already proven in Phase 1 for APL/urgences |

---

## Critical Data Facts (verified against actual parquet)

### Score Component Coverage
| Component | Coverage | Null Rate | Notes |
|-----------|----------|-----------|-------|
| APL | 99.6% | 0.4% | 517 communes have APL=0 (not null) |
| pct_75_plus | 99.6% | 0.4% | From RP2020, nearly complete |
| temps_urgences_min | 99.6% | 0.4% | 560 communes with value=0 (urgences on-site) |
| taux_pauvrete | 12.2% | 87.8% | Statistical secrecy for small communes |

**Communes with >=3 components: 34,815 / 34,969 (99.6%) — will get a score**
**Communes with <3 components: 154 — will get score = null**
**Score will be computable for >99% of communes, exceeding the 90% success criterion.**

### Domino Data
- DREES file: `medecins_rpps_2012_2025_xlsx` (71MB, confirmed downloadable)
- Dept-level % 55+ doctors (2025): national avg 43%, range 28-59%
- 4,934 communes have >3 doctors (eligible for domino)
- RPPS raw has NO individual age column — dept-level DREES stats is the only approach

### Twin Matching Data
- Region codes: in GeoJSON (`reg` field), not in parquet — needs join in notebook
- Surface area: in GeoJSON (`superf` in hectares), not in parquet — needs join for density
- GeoJSON coverage: 34,878 communes vs 34,969 in parquet (91 communes won't have geo data)
- APL evolution: ONLY 2022 and 2023 available (APL XLSX has exactly 2 data sheets)
- Communes with APL improvement >0.3: 3,129
- Communes with MSP: 2,358
- Communes with both: 224

### JSON Export
- 35,000 small JSON files: ~3 seconds to write
- `public/data/` directory doesn't exist yet — must be created by notebook 05
- `public/data/communes/` will have ~35K files (one per commune)

---

## Common Pitfalls

### Pitfall 1: APL Inversion Division by Zero
**What goes wrong:** Using `1/apl` for APL inversion hits ZeroDivisionError or inf for 517 communes where APL=0.
**Why it happens:** APL=0 means no accessible GP in that commune — valid data, not missing.
**How to avoid:** Use `(max_apl - apl)` reversal, then min-max normalize the result.
**Warning signs:** `inf` or `nan` values in the apl_inv_norm column.

### Pitfall 2: Score Compression from Missing Poverty Data
**What goes wrong:** 87.8% of communes have no `taux_pauvrete`. Imputing with the national median (0.12) normalizes to ~0.5 for all those communes — their poverty component contributes no signal.
**Why it happens:** FiLoSoFi applies statistical secrecy to small communes (<= ~5,000 inhabitants).
**How to avoid:** This is expected behavior. Document it in notebook markdown. The score will be driven primarily by APL, urgences, and pct_75 for most communes.
**Warning signs:** Score distribution extremely narrow (confirmed: P20=3.2, P80=3.8 from simulation).

### Pitfall 3: DREES File Parsing
**What goes wrong:** The DREES XLSX `Effectifs` sheet has a header row in row 0 but `pd.read_excel(header=0)` treats it as data.
**Why it happens:** The sheet structure has labels in the first row that are column names.
**How to avoid:** Read with `header=0`, then treat `df.iloc[0]` as the actual column name row and drop it: `df.columns = df.iloc[0]; df = df.iloc[1:]`.
**Warning signs:** Column names being integers (0, 1, 2...) instead of 'territoire', 'region', etc.

### Pitfall 4: Dept Code Format Mismatch
**What goes wrong:** DREES dept labels are like `'075 -Paris'`, parquet uses `'75'` (no leading zero for mainland), `'2A'`/`'2B'` for Corse.
**Why it happens:** Different source formatting conventions.
**How to avoid:** Extract numeric part from DREES dept label with `str.extract(r'(\d+)')`, then strip leading zeros for mainland, handle DOM-TOM codes separately.
**Warning signs:** Dept join produces many NaN in the domino columns.

### Pitfall 5: Twin Score Compression Causing Meaningless Clusters
**What goes wrong:** Because the vulnerability score is very compressed (1.0-6.1 range), using score directly for twin selection makes all communes appear similar.
**Why it happens:** Imputed poverty data collapses variance.
**How to avoid:** Twin features are the RAW normalized indicators (APL, pct_75, urgences, population, density), NOT the vulnerability score. This is already what D-14 specifies.

### Pitfall 6: TWIN-04 Schema Mismatch
**What goes wrong:** Frozen schema shows `apl_evolution: {"2019": x, "2021": y, "2023": z}` but only 2022-2023 data exists.
**Why it happens:** Phase 1 CONTEXT frozen schema was aspirational; APL XLSX only has 2 sheets.
**How to avoid:** Adapt to `apl_evolution: {"2022": x, "2023": y}`. Document this deviation in notebook 04 markdown. Same for twins: use `apl_avant` (apl_2022) and `apl_apres` (apl_2023), not historical vulnerability scores.

### Pitfall 7: public/data/ Path Resolution in Notebooks
**What goes wrong:** Notebooks run from `notebooks/` directory; `../public/data/` resolves correctly only if cwd is `notebooks/`.
**Why it happens:** Jupyter sets cwd to the notebook's directory.
**How to avoid:** Use `Path(__file__).parent.parent / "public" / "data"` or detect project root via `os.path.abspath('../')`. Verify with an assertion before writing.

---

## Schema Adjustments vs Frozen Contract

The following deviations from the Phase 1 frozen JSON schema are required based on actual data availability:

| Schema Field | Frozen Value | Actual Value | Reason |
|---|---|---|---| 
| `apl_evolution` | `{"2019": x, "2021": y, "2023": z}` | `{"2022": x, "2023": y}` | APL XLSX has only 2022 and 2023 sheets |
| `score_avant` / `score_apres` in jumelles | Historical scores | Omitted or replaced with `apl_avant` / `apl_apres` | No historical data for all 4 score components |
| `classe` | Not in frozen schema | Added per D-20, D-22 | A-E classification required |
| `data_quality` | Not in frozen schema | Added per D-19 | "complete"/"partial"/"minimal" |

**Compatibility note:** All additions are additive (new fields). The only breaking change is `apl_evolution` key format — document in notebook 05 markdown.

---

## APL Inversion Method Recommendation

**Recommended: `(max_apl - apl)` reversal** (Claude's discretion per D-02 context)

- `1/APL`: fails for 517 communes with APL=0; produces extreme outliers for low-APL communes
- `(max - APL)`: linear, no inf values, preserves rank ordering, normalizes cleanly to [0,1]
- Reverse normalization: equivalent to `(max - APL)` after min-max, so same result

**A-E Classification Recommendation: Quintile thresholds** (Claude's discretion per D-05)

Quintile thresholds (20th/40th/60th/80th percentiles) produce exactly 20% of communes per class, which is fair and self-documenting. Linear thresholds (2/4/6/8) would produce highly unequal class sizes given the compressed distribution. Document in notebook markdown: "Seuils quintiles: chaque classe regroupe ~20% des communes scorees."

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Python 3.11 | All notebooks | Yes | 3.11.3 | — |
| pandas | All notebooks | Yes | 2.2.3 | — |
| numpy | All notebooks | Yes | 2.1.1 | — |
| scikit-learn | 04_jumelles | Yes | 1.5.2 | — |
| jsonschema | 05_export_json | Yes | 4.26.0 | — |
| openpyxl | 03_domino (DREES) | Yes | 3.1.5 | — |
| DREES XLSX URL | 03_domino | Yes (verified) | 2025 data | Use hardcoded national avg 43% if unreachable |
| public/data/ dir | 05_export_json | No (doesn't exist) | — | Create with `Path.mkdir(parents=True)` |

**Missing dependencies with no fallback:** None — all libraries installed, all URLs verified.

**Missing dependencies with fallback:** DREES download (network failure) — fallback to national average.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Inline assertions (per project requirements: "Formal test suite out of scope") |
| Config file | None — inline `assert` statements in notebook cells |
| Quick run | Execute relevant notebook cell |
| Full suite | Run full notebook top-to-bottom |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Assertion |
|--------|----------|-----------|-------------------|
| SCORE-01 | 4 components present in output | inline | `assert all(c in df.columns for c in ['score', 'score_detail'])` |
| SCORE-02 | Score in [0, 10] range | inline | `assert df['score'].dropna().between(0, 10).all()` |
| SCORE-03 | <3 components → score null | inline | Check 154 null-score communes |
| SCORE-04 | national_* medians in score_detail | inline | Verify JSON fields post-export |
| DOM-01 | pct_55plus populated for depts | inline | `assert df['pct_55plus_dept'].notna().sum() > 4000` |
| DOM-02 | Projection for >3 doctor communes | inline | `assert (df[df['nb_medecins_total'] > 3]['domino'].notna()).all()` |
| TWIN-01 | 0-5 twins per commune | inline | `assert df['jumelles'].apply(lambda x: len(x) <= 5).all()` |
| TWIN-02 | Twins have improvement signal | inline | Check actions list is non-empty for improved twins |
| DATA-05 | index.json exists and has >30K entries | inline | `assert len(index_data) > 30000` |
| DATA-06 | JSON files count >30K | inline | `assert len(list(OUTPUT_DIR.glob('*.json'))) > 30000` |
| DATA-06 | Schema validation passes all files | inline | Per D-21: `jsonschema.validate()` on every file |

### Wave 0 Gaps
None — no test infrastructure required beyond inline assertions. Framework is already established by Phase 1 notebooks.

---

## Notebook Column Plan

### After 02_score.ipynb
New columns added to parquet:
- `score` (float, nullable): 0.0-10.0 or NaN
- `classe` (str, nullable): 'A'/'B'/'C'/'D'/'E' or None
- `score_apl_norm` (float): normalized APL inverse component
- `score_pauvrete_norm` (float): normalized poverty component
- `score_pct75_norm` (float): normalized age component
- `score_urgences_norm` (float): normalized urgences component
- `n_score_components` (int): 0-4, number of available components

### After 03_domino.ipynb
New columns added:
- `pct_55plus_dept` (float): dept-level % doctors 55+ from DREES
- `medecins_55plus_est` (float, nullable): estimated nb of 55+ doctors in commune
- `domino_alert` (bool, nullable): True if threshold exceeded
- `projection_2030` (str, nullable): "-N medecins (estimation)"
- `manques` (list of str): top missing specialties
- `region` (str): from GeoJSON reg field (needed for TWIN-01)
- `surface_ha` (float): from GeoJSON superf field (for density)
- `densite_hab_km2` (float): population / (surface_ha / 100)

### After 04_jumelles.ipynb
New column added:
- `jumelles` (list of dicts): up to 5 twin commune records

---

## Open Questions

1. **Score distribution is very compressed (1.0-6.1 in simulation)**
   - What we know: 87.8% of communes have no poverty data, leading to imputed neutral values
   - What's unclear: Will the jury find a 1-6 score range meaningful? Can we communicate this is "actual distribution" rather than a bug?
   - Recommendation: Use quintile A-E classification which remains meaningful regardless of absolute score spread. Document the distribution in notebook markdown.

2. **`score_avant` / `score_apres` for twin communes**
   - What we know: Frozen schema shows historical scores for twins; historical component data doesn't exist
   - What's unclear: The Phase 1 schema included these fields without verifying data availability
   - Recommendation: Replace with `apl_avant` (apl_2022) and `apl_apres` (apl_2023) in the jumelles array. This is verifiable improvement signal. Ensure Phase 3 frontend is aware of this adaptation.

3. **Improvement detection for TWIN-02**
   - What we know: 3,129 communes with APL increase >0.3; 2,358 with MSP; only 224 have both
   - What's unclear: Many communes near a user's profile may have no "improved" twins at all
   - Recommendation: If fewer than 3 improved twins found nationally, relax the threshold: include best-profile-match communes even without improvement signal, flagging them with `actions: []`.

---

## Sources

### Primary (HIGH confidence)
- Direct inspection of `communes_master.parquet` (34,969 rows, 29 columns) — all coverage rates verified
- Direct inspection of `notebooks/data/raw/apl.xlsx` (sheets: Paramètres, APL 2022, APL 2023)
- Direct inspection of `notebooks/data/raw/communes_geo.geojson` (properties: codgeo, reg, superf)
- DREES API catalog: `data.drees.solidarites-sante.gouv.fr/api/explore/v2.1/catalog/datasets` — live verification
- DREES XLSX download: `medecins_rpps_2012_2025_xlsx` — downloaded, parsed, confirmed structure
- sklearn NearestNeighbors: performance benchmarked on 35,000 x 5 matrix (0.57s)
- jsonschema 4.26.0: confirmed available in environment

### Secondary (MEDIUM confidence)
- 02-CONTEXT.md decisions (D-01 through D-22) — authoritative for locked choices
- Phase 1 CONTEXT.md frozen JSON schema — used as schema baseline
- pathologies.csv structure — verified column names and dept coverage

---

## Metadata

**Confidence breakdown:**
- Score algorithm: HIGH — all data verified in actual parquet
- Domino implementation: HIGH — DREES file confirmed downloadable with correct structure
- Twin matching: HIGH — sklearn confirmed, GeoJSON join confirmed
- JSON export: HIGH — timing verified, schema gaps identified and documented
- Schema adaptations: HIGH — based on actual APL XLSX content (only 2022/2023)

**Research date:** 2026-04-08
**Valid until:** 2026-04-13 (hackathon deadline — data sources stable)
