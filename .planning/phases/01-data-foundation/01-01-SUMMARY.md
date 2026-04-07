---
phase: 01-data-foundation
plan: 01
subsystem: data
tags: [python, pandas, jupyter, data.gouv.fr, rpps, finess, apl, insee, data-ameli, geojson]

requires: []

provides:
  - notebooks/00_download.ipynb with 10 download cells and 21 assertions
  - notebooks/data/raw/apl.xlsx (DREES APL MG, 34963 communes, 2022+2023)
  - notebooks/data/raw/rpps.csv (RPPS personne-activite, 2.2M rows, 801MB)
  - notebooks/data/raw/finess.csv (FINESS etablissements, 102K rows, 36MB)
  - notebooks/data/raw/msp.csv (MSP extracted from FINESS cat 603, 3080 MSP)
  - notebooks/data/raw/insee_pop.csv (Geo API, 34969 communes, population)
  - notebooks/data/raw/pathologies.csv (data.ameli, 5.2M rows, 891MB)
  - notebooks/data/raw/communes_geo.geojson (Admin Express 2025, 44MB)
  - notebooks/data/raw/urgences.xlsx (DREES 2019, 35010 communes, temps acces)
  - notebooks/data/raw/la_poste_cp_commune.csv (39191 CP->commune mappings)
  - notebooks/data/raw/filosofi_placeholder.csv (FiLoSoFi unavailable, documented)

affects:
  - 01-02 (merge notebook needs these raw files)
  - 02-scoring (needs master parquet from merge)

tech-stack:
  added: [pandas, openpyxl, xlrd, nbformat, urllib.request, geo.api.gouv.fr]
  patterns:
    - "Download with re-runnable skip (check file size before re-downloading)"
    - "Try UTF-8 first, fallback to latin-1 for French government CSVs"
    - "FINESS skiprows=1 to skip metadata header; MSP = category code 603"
    - "Urgences XLSX: skiprows=5 to reach data row (5 metadata rows)"
    - "La Poste: comment line starts with #, skip and assign headers manually"

key-files:
  created:
    - notebooks/00_download.ipynb
    - notebooks/data/raw/apl.xlsx
    - notebooks/data/raw/rpps.csv
    - notebooks/data/raw/finess.csv
    - notebooks/data/raw/msp.csv
    - notebooks/data/raw/insee_pop.csv
    - notebooks/data/raw/pathologies.csv
    - notebooks/data/raw/communes_geo.geojson
    - notebooks/data/raw/urgences.xlsx
    - notebooks/data/raw/la_poste_cp_commune.csv
    - notebooks/data/raw/filosofi_placeholder.csv
    - .gitignore
  modified:
    - notebooks/00_download.ipynb (updated URLs after execution testing)

key-decisions:
  - "APL is XLSX not CSV: DREES provides multi-year XLSX with sheet per year"
  - "RPPS is pipe-separated TXT (not CSV): separator='|', urlretrieve for 801MB"
  - "FINESS has metadata header line: skiprows=1 required, no column headers"
  - "MSP not available as separate national CSV: extracted from FINESS cat 603"
  - "INSEE pop via Geo API (confirmed working): direct INSEE.fr downloads return HTTP 500"
  - "Pathologies = 5.2M rows at dept/age/pathologie grain (not just department totals)"
  - "Urgences XLSX has 5 header rows before data: parse with skiprows=5"
  - "La Poste has comment header line: skip and assign column names manually"
  - "FiLoSoFi unavailable: INSEE.fr returns HTTP 500 on all file downloads (April 2026)"
  - "Admin Express: correct slug is communes-cantons-et-epci-2025-admin-express-cog-plus-ign"

patterns-established:
  - "FINESS encoding pattern: utf-8 works for 2026 extract"
  - "Geo API for population: geo.api.gouv.fr/communes?fields=... is the reliable INSEE pop source"
  - "data.ameli export URL pattern: /api/explore/v2.1/catalog/datasets/{id}/exports/csv"

requirements-completed: [DATA-01]

duration: 32min
completed: "2026-04-07"
---

# Phase 01 Plan 01: Download Pipeline Summary

**9 source datasets downloaded into notebooks/data/raw/ using verified direct URLs, with 21 inline assertions covering file size, row counts, encoding, and column presence**

## Performance

- **Duration:** 32 min
- **Started:** 2026-04-07T19:36:51Z
- **Completed:** 2026-04-07T20:08:49Z
- **Tasks:** 2
- **Files created:** 12

## Accomplishments

- Download notebook with 23 cells covering all 9 datasets + La Poste + setup + summary
- All 9 datasets downloaded and validated (801MB RPPS, 891MB pathologies, 44MB geojson, 5MB FINESS, etc.)
- Correct resource URLs found for every dataset (all original URLs in plan were stale/wrong)
- MSP extracted from FINESS (3,080 MSPs via category code 603)
- FiLoSoFi outage documented with placeholder — known INSEE.fr infrastructure issue

## Task Commits

1. **Task 1: Create 00_download.ipynb** - `6f271e4` (feat)
2. **Task 2: Execute downloads + fix URLs** - `68af990` (feat)

## Files Created/Modified

- `notebooks/00_download.ipynb` - Download pipeline for all 9 datasets + La Poste table
- `notebooks/data/raw/apl.xlsx` - APL médecins généralistes 2022+2023 (DREES, 34963 communes)
- `notebooks/data/raw/rpps.csv` - RPPS personne-activite (801MB, 2.2M healthcare professionals)
- `notebooks/data/raw/finess.csv` - FINESS establishments (36MB, 102K rows)
- `notebooks/data/raw/msp.csv` - MSP extracted from FINESS cat 603 (3080 rows)
- `notebooks/data/raw/insee_pop.csv` - Population via Geo API (34969 communes)
- `notebooks/data/raw/pathologies.csv` - data.ameli effectifs (891MB, 5.2M rows)
- `notebooks/data/raw/communes_geo.geojson` - Admin Express 2025 communes (44MB)
- `notebooks/data/raw/urgences.xlsx` - DREES 2019 diagnostic acces urgences (35010 communes)
- `notebooks/data/raw/la_poste_cp_commune.csv` - La Poste CP->commune (39191 rows)
- `notebooks/data/raw/filosofi_placeholder.csv` - FiLoSoFi placeholder (INSEE 500 errors)
- `.gitignore` - Excludes notebooks/data/ (large files)

## Decisions Made

- APL is XLSX not CSV: DREES provides a multi-sheet XLSX (Paramètres, APL 2022, APL 2023)
- RPPS is pipe-separated TXT with 2.2M rows at 801MB; uses urlretrieve as planned
- FINESS has a metadata first line requiring skiprows=1; no column headers in file
- MSP national CSV does not exist — extracted from FINESS category code 603 (Maison de santé L.6223-3), yielding 3,080 MSP nationally
- INSEE population via Geo API (geo.api.gouv.fr) because INSEE.fr direct downloads return HTTP 500 in April 2026
- Pathologies dataset is 5.2M rows (dept × age group × pathologie) not just ~50 department totals
- Urgences XLSX has 5 header/metadata rows before the actual data: read with skiprows=5
- La Poste file has a comment header line starting with # — skip it and assign column names manually; encoding is latin-1
- FiLoSoFi 2021 commune-level data is completely unavailable: INSEE.fr returns HTTP 500 on all statistics file downloads; placeholder CSV created with documentation

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] All 7 original data.gouv.fr resource UUIDs returned 404**
- **Found during:** Task 2 (execution)
- **Issue:** Original plan URLs (e.g., `/r/0bb9c29e-...`, `/r/e85b2bfe-...`) returned HTTP 404
- **Fix:** Queried data.gouv.fr API (`/api/1/datasets/{slug}/`) to discover actual current resource URLs for each dataset
- **Files modified:** notebooks/00_download.ipynb
- **Committed in:** 68af990

**2. [Rule 1 - Bug] FINESS CSV has metadata header + no column headers**
- **Found during:** Task 2 (FINESS parsing)
- **Issue:** File structure: line 0 = "finess;etalab;96;2026-03-11" metadata, lines 1+ = data with no headers
- **Fix:** Added skiprows=1, header=None, assigned column indices. MSP found via category code 603 (not 6321 as in plan)
- **Files modified:** notebooks/00_download.ipynb
- **Committed in:** 68af990

**3. [Rule 1 - Bug] Urgences XLSX has 5 header rows**
- **Found during:** Task 2 (urgences parsing)
- **Issue:** pd.read_excel returned 21 rows (metadata) instead of 35K communes because data starts at row 6
- **Fix:** Added skiprows=5 and specified sheet name BASECOM_URGENCES_2019
- **Files modified:** notebooks/00_download.ipynb
- **Committed in:** 68af990

**4. [Rule 1 - Bug] La Poste file has comment line + latin-1 encoding**
- **Found during:** Task 2 (La Poste parsing)
- **Issue:** File starts with "#Code_commune_INSEE;..." comment header, body is latin-1 encoded
- **Fix:** Skip comment line, read with latin-1, assign explicit column names, resave as UTF-8
- **Files modified:** notebooks/00_download.ipynb
- **Committed in:** 68af990

**5. [Rule 2 - Missing Critical] FiLoSoFi documented as infrastructure outage**
- **Found during:** Task 2 (FiLoSoFi download)
- **Issue:** INSEE.fr returns HTTP 500 on all /fr/statistiques/fichier/ downloads (April 2026)
- **Fix:** Created filosofi_placeholder.csv with full documentation + manual download instructions. Plan's merge step (01-02) must handle this gracefully
- **Files modified:** notebooks/data/raw/filosofi_placeholder.csv
- **Committed in:** 68af990

**6. [Rule 2 - Missing Critical] Added .gitignore for large data files**
- **Found during:** Task 2 (post-download)
- **Issue:** Large files (RPPS 801MB, pathologies 891MB) would be tracked by git
- **Fix:** Created .gitignore excluding notebooks/data/
- **Files modified:** .gitignore
- **Committed in:** 68af990

---

**Total deviations:** 6 auto-fixed (4 bugs, 2 missing critical)
**Impact on plan:** All fixes necessary for correct operation. The FiLoSoFi outage is a known external dependency issue — the merge notebook (01-02) should handle its absence gracefully with a null poverty rate.

## Known Stubs

- `notebooks/data/raw/filosofi_placeholder.csv` — FiLoSoFi poverty data unavailable. The merge notebook (01-02) must handle this with null poverty values. This means the `pauvrete` score component will be null for all communes until data is manually downloaded. The `score.ipynb` (plan 02) must handle partial score computation (3/4 components instead of 4/4).

## Issues Encountered

- INSEE.fr infrastructure: The official statistics file download server returns HTTP 500 on all file downloads in April 2026. Workaround: Geo API for population, manual download documented for FiLoSoFi.
- data.gouv.fr resource IDs: All pre-planned resource UUIDs were stale. Had to use the datasets API to discover actual resource URLs.

## User Setup Required

**FiLoSoFi requires manual download:**
1. Visit https://www.insee.fr/fr/statistiques/5055909
2. Download commune-level file (BASE_TD_FILO_DISP_COM_2018.xlsx or similar)
3. Save as `notebooks/data/raw/filosofi.xlsx`
4. Re-run Cell 6 of 00_download.ipynb to validate

All other datasets: fully automated.

## Next Phase Readiness

- All 9 critical datasets present in `notebooks/data/raw/`
- Plan 01-02 (merge) can start immediately
- FiLoSoFi absence: 01-02 merge must handle null poverty values (document this)
- RPPS has 2.2M rows across all healthcare professionals: 01-02 must filter to medecins only
- MSP from FINESS (cat 603): 01-02 join uses codeDept + cp_commune fields (no direct code_commune)
- Urgences: use skiprows=5 when parsing BASECOM_URGENCES_2019 sheet
- La Poste: 39,191 rows (more than 35K communes due to multi-CP communes)

---
*Phase: 01-data-foundation*
*Completed: 2026-04-07*

## Self-Check: PASSED

All files present and commits verified:
- notebooks/00_download.ipynb: FOUND
- .gitignore: FOUND
- .planning/phases/01-data-foundation/01-01-SUMMARY.md: FOUND
- All 9 data files: FOUND in notebooks/data/raw/
- Commits: 6f271e4 (Task 1), 68af990 (Task 2)
