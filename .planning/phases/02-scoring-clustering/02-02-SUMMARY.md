---
phase: 02-scoring-clustering
plan: 02
subsystem: data-pipeline
tags: [sklearn, knn, json-export, twin-matching, jsonschema, nearest-neighbors]

requires:
  - phase: 02-scoring-clustering/01
    provides: "communes_master.parquet with score, classe, domino, region, density columns"
provides:
  - "jumelles column in parquet (0-5 twin communes per commune with similarity + actions)"
  - "public/data/index.json (34969 entries: code, nom, dept, score, classe, pop)"
  - "public/data/communes/*.json (34969 per-commune JSON files matching frozen schema)"
  - "notebooks/04_jumelles.ipynb (KNN twin matching pipeline)"
  - "notebooks/05_export_json.ipynb (JSON export pipeline)"
affects: [03-frontend, 04-integration]

tech-stack:
  added: [sklearn.neighbors.NearestNeighbors, sklearn.preprocessing.MinMaxScaler, jsonschema]
  patterns: [KNN-twin-matching, region-priority-search, per-commune-json-export]

key-files:
  created:
    - notebooks/04_jumelles.ipynb
    - notebooks/05_export_json.ipynb
    - public/data/index.json
    - public/data/communes/*.json
  modified:
    - notebooks/data/processed/communes_master.parquet

key-decisions:
  - "Twin features use raw indicators (APL, poverty, age, log_pop, density) not compressed vulnerability score"
  - "Similarity = 1 - (euclidean_distance / sqrt(5)), clamped to [0, 1]"
  - "Parquet stores lists as numpy arrays — export notebook converts to native Python"
  - "data_quality classification: complete (4/4), partial (3/4), minimal (<3)"

patterns-established:
  - "Twin matching: region-priority then national expansion for improved communes"
  - "JSON export: per-commune files with jsonschema validation on every file"
  - "Path-agnostic notebook detection: works from project root or notebooks/ dir"

requirements-completed: [TWIN-01, TWIN-02, TWIN-03, TWIN-04, DATA-05, DATA-06]

duration: 7min
completed: 2026-04-08
---

# Phase 2 Plan 02: Twin Matching & JSON Export Summary

**KNN twin matching (5 features, region priority, improvement signals) + 34969 schema-validated per-commune JSON files for frontend consumption**

## Performance

- **Duration:** 7 min
- **Started:** 2026-04-07T23:05:48Z
- **Completed:** 2026-04-07T23:13:44Z
- **Tasks:** 2
- **Files modified:** 3 (2 notebooks + parquet)

## Accomplishments
- KNN twin matching for all 34969 communes using 5 normalized features with region-priority search
- 34969 per-commune JSON files exported to public/data/communes/, all passing jsonschema validation
- index.json with 34969 entries (code, nom, dept, score, classe, pop) for frontend search
- Improvement signals detected: MSP installation and APL increase > 0.3

## Task Commits

1. **Task 1: 04_jumelles.ipynb — twin commune matching** - `b7ed7cf` (feat)
2. **Task 2: 05_export_json.ipynb — index.json + per-commune JSON** - `1c0c50d` (feat)

## Files Created/Modified
- `notebooks/04_jumelles.ipynb` - KNN twin matching with NearestNeighbors (ball_tree, 5 features, region priority)
- `notebooks/05_export_json.ipynb` - JSON export with jsonschema validation on every commune
- `public/data/index.json` - Lightweight index for frontend search (34969 entries)
- `public/data/communes/*.json` - Per-commune JSON files (34969 files)
- `notebooks/data/processed/communes_master.parquet` - Added jumelles column (list of twin dicts)

## Decisions Made
- Twin features: APL, taux_pauvrete, pct_75_plus, log(population), densite_hab_km2 (raw indicators, not vulnerability score — score too compressed at 1.0-6.1)
- Similarity formula: 1 - (euclidean_distance / sqrt(5)), max possible distance in 5D normalized space
- Region-priority twin selection: same-region improved twins first, then national, then best-match non-improved if <3
- Parquet stores Python lists as numpy arrays on round-trip — export notebook handles conversion to native types
- data_quality field: complete/partial/minimal based on n_score_components

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Parquet numpy array serialization for jumelles column**
- **Found during:** Task 1 (twin matching)
- **Issue:** Parquet round-trips convert Python lists to numpy arrays, breaking isinstance(x, list) checks
- **Fix:** Added ensure_native() conversion before saving to parquet, and numpy-aware conversion in export notebook
- **Files modified:** notebooks/04_jumelles.ipynb, notebooks/05_export_json.ipynb
- **Verification:** All 34969 communes export with correct list/dict types
- **Committed in:** b7ed7cf, 1c0c50d

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Essential fix for data integrity. No scope creep.

## Issues Encountered
- Parquet stores nested Python lists as numpy arrays on read — required explicit conversion to native types in both notebooks. This is a known parquet behavior, not a bug.

## User Setup Required
None - no external service configuration required.

## Known Stubs
None - all data is wired end-to-end from parquet to JSON.

## Next Phase Readiness
- public/data/ directory ready for Phase 3 frontend consumption
- index.json available for commune search/autocomplete
- Per-commune JSON files available at public/data/communes/{code}.json
- Saint-Quentin (02691): score=3.8, classe=D, 5 twins, domino active, manques=[endocrinologue, pneumologue]

---
*Phase: 02-scoring-clustering*
*Completed: 2026-04-08*
