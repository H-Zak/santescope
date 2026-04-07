---
phase: 02-scoring-clustering
plan: 01
subsystem: scoring-domino
tags: [vulnerability-score, domino-projection, missing-doctors, geojson-enrichment]
dependency_graph:
  requires: [communes_master.parquet from phase-01]
  provides: [score, classe, domino_alert, manques, region, densite_hab_km2]
  affects: [04_jumelles.ipynb, 05_export_json.ipynb]
tech_stack:
  added: [DREES XLSX age data]
  patterns: [min-max normalization, quintile classification, dept-level proxy estimation]
key_files:
  created:
    - notebooks/02_score.ipynb
    - notebooks/03_domino.ipynb
    - notebooks/data/processed/national_medians.json
  modified:
    - notebooks/data/processed/communes_master.parquet
decisions:
  - "APL inversion via (max - apl): avoids div-by-zero for 517 APL=0 communes"
  - "Quintile A-E thresholds: equal ~20% per class, robust to compressed score distribution"
  - "Dept code zero-padding for DREES join: 01-09 format matches parquet convention"
  - "domino_alert as object dtype: supports None for <=3 doctor communes"
metrics:
  duration: 7min
  completed: "2026-04-07T23:02:00Z"
---

# Phase 02 Plan 01: Vulnerability Score & Domino Projection Summary

4-component vulnerability score (0-10) with A-E quintile classification for 34815 communes, domino retirement projection from DREES age data, missing specialty detection via RPPS x pathology cross, GeoJSON region+density enrichment for twin matching.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Vulnerability score computation | b801956 | notebooks/02_score.ipynb |
| 2 | Domino projection + missing doctors + GeoJSON enrichment | cd73080 | notebooks/03_domino.ipynb |

## Key Results

### Vulnerability Score (02_score.ipynb)
- **34815 / 34969** communes scored (99.6%)
- Score range: **[1.0, 6.1]** — compressed due to 87.8% poverty data imputation (expected, documented)
- A-E quintile thresholds applied: each class ~20% of scored communes
- Distribution: A=8921, B=9240, C=3825, D=7561, E=5268
- 154 communes with score=null (<3 of 4 components available)
- National medians exported to `national_medians.json`

### Domino Projection (03_domino.ipynb)
- DREES XLSX downloaded (71.2 MB): dept-level %55+ doctors, national avg 43.3%
- **34875 / 34969** communes mapped to dept %55+ (99.7%)
- Only 4 overseas dept codes missing (975, 977, 978, 98)
- **1813** communes with domino alert (>3 doctors AND dept %55+ above national avg or >50%)
- **4622** communes with projection text

### Missing Specialties
- **4039** communes with RPPS detail assessed
- **2756** communes with at least 1 missing specialty identified
- Pathology-specialty mapping: diabete->endocrinologue, cardio->cardiologue, psy->psychiatre, cancers->oncologue, respiratoire->pneumologue

### GeoJSON Enrichment
- Region: 34877 / 34969 (99.7%)
- Density: 34876 / 34969 (99.7%)
- Surface from Admin Express GeoJSON `superf` field

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed DREES dept code format mismatch**
- **Found during:** Task 2, first execution
- **Issue:** DREES dept labels like `'001 -Ain'` were stripped to `'1'` but parquet uses `'01'`. Departments 01-09 (3229 communes) had no domino data.
- **Fix:** Zero-pad extracted numeric codes to 2 digits (`f"{num:02d}"`). Coverage improved from 31740 to 34875.
- **Files modified:** notebooks/03_domino.ipynb
- **Commit:** cd73080

## Decisions Made

1. **APL inversion method:** `(max - apl)` reversal chosen over `1/apl` to avoid division-by-zero for 517 APL=0 communes. Linear, preserves rank ordering.
2. **A-E classification:** Quintile thresholds (20th/40th/60th/80th percentiles) produce equal-count classes. Linear thresholds would produce highly unequal sizes given compressed distribution.
3. **Score compression documented:** Range [1.0, 6.1] is expected given 87.8% poverty data imputation. Quintile A-E classification remains meaningful regardless of absolute spread.
4. **Domino alert object dtype:** Used `astype('object')` to support None values for <=3 doctor communes without pandas FutureWarning.

## Known Stubs

None — all data is wired and computed from real sources.

## Parquet State

**44 columns** (29 original + 7 score + 8 domino/geo):
- Score: `score`, `classe`, `n_score_components`, `score_apl_norm`, `score_pauvrete_norm`, `score_pct75_norm`, `score_urgences_norm`
- Domino/Geo: `region`, `surface_ha`, `densite_hab_km2`, `manques`, `pct_55plus_dept`, `medecins_55plus_est`, `domino_alert`, `projection_2030`
