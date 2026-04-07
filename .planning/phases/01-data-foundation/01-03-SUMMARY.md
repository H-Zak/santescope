---
phase: 01-data-foundation
plan: 03
subsystem: data
tags: [python, pandas, jupyter, insee, filosofi, rp2020, poverty, age-structure]

requires:
  - notebooks/data/raw/filosofi.zip (FiLoSoFi 2018 commune data)
  - notebooks/data/raw/pop_age.zip (RP2020 age structure)
  - notebooks/data/processed/communes_master.parquet (from 01-02)

provides:
  - notebooks/data/raw/filosofi.zip (1MB, FiLoSoFi 2018 commune-level poverty data)
  - notebooks/data/raw/pop_age.zip (39MB, RP2020 population by age structure)
  - notebooks/data/processed/communes_master.parquet (updated: taux_pauvrete + pct_75_plus filled)
  - .planning/REQUIREMENTS.md (DATA-03 criteria clarified)

affects:
  - 02-scoring (all 4 score components now available in master parquet)
  - 01-VERIFICATION.md (Gap 2 resolved: FiLoSoFi + pct_75_plus no longer null)

tech-stack:
  added: [zipfile (stdlib), urllib.request.urlretrieve for large zip files]
  patterns:
    - "FiLoSoFi 2018: TP6018 is in % units — divide by 100 to get ratio"
    - "RP2020 targeted column loading: usecols=['CODGEO','P20_POP','P20_POP7589','P20_POP90P'] saves memory"
    - "pct_75_plus = (P20_POP7589 + P20_POP90P) / P20_POP — age 75-89 + 90+"
    - "Statistical secrecy: taux_pauvrete only available for ~12% of communes (large ones)"

key-files:
  created:
    - notebooks/data/raw/filosofi.zip
    - notebooks/data/raw/pop_age.zip
    - notebooks/data/raw/cc_filosofi_2018_COM-geo2021.CSV (extracted from zip)
    - notebooks/data/raw/base-cc-evol-struct-pop-2020.CSV (extracted from zip)
  modified:
    - notebooks/00_download.ipynb (replaced placeholder FiLoSoFi cell with real download + added RP2020 section 6b)
    - notebooks/01_merge.py (Section 5 FiLoSoFi integration, Section 5b RP2020, mega merge, Section 12 validation)
    - notebooks/01_merge.ipynb (synced with 01_merge.py changes)
    - notebooks/data/processed/communes_master.parquet (regenerated with taux_pauvrete + pct_75_plus)
    - .planning/REQUIREMENTS.md (DATA-03 clarification)
    - .planning/STATE.md (blockers resolved, decisions logged)
  deleted:
    - notebooks/data/raw/filosofi_placeholder.csv (no longer needed)

key-decisions:
  - "FiLoSoFi 2018 (not 2021) chosen — INSEE provides 2018 commune-level ZIP at /fichier/5009236/"
  - "TP6018 coverage is ~12% by design — statistical secrecy hides small-commune poverty data"
  - "RP2020 full CSV is 117MB — use usecols to load only 4 of 100+ columns"
  - "DATA-03 threshold clarified to apply only to located practitioners (14.3% have no RPPS location)"

requirements: [DATA-01, DATA-02, DATA-03, DATA-04]

duration: ~20min
completed: "2026-04-07"
---

# Phase 01 Plan 03: Gap Closure — FiLoSoFi + RP2020 Age Data Summary

**FiLoSoFi 2018 commune poverty data and RP2020 age structure integrated into communes_master.parquet, filling the final 2 of 4 vulnerability score components and resolving both Phase 1 verification gaps**

## Performance

- **Duration:** ~20 min
- **Completed:** 2026-04-07
- **Tasks:** 3
- **Files created:** 4 (2 zips + 2 extracted CSVs)
- **Files modified:** 6

## Accomplishments

- Downloaded FiLoSoFi 2018 ZIP (1MB compressed) from INSEE — infrastructure restored April 2026
- Downloaded RP2020 age structure ZIP (39MB compressed, 117MB unzipped) from INSEE
- Updated `00_download.ipynb`: replaced placeholder FiLoSoFi cell with real download + validation, added new Section 6b for RP2020
- Updated merge pipeline (both `.py` and `.ipynb`): Section 5 now loads real FiLoSoFi data, Section 5b added for RP2020 age structure computation
- Regenerated `communes_master.parquet`: 34969 communes, `taux_pauvrete` now 12.2% non-null, `pct_75_plus` now 99.6% non-null
- Verified Saint-Quentin (02691): `taux_pauvrete=0.28` (28% poverty rate), `pct_75_plus=0.106` (10.6% aged 75+)
- Clarified DATA-03 requirement: 98% threshold applies to located practitioners only (14.3% excluded from source)

## Task Commits

1. **Task 1: Download FiLoSoFi 2018 + RP2020** - `df8808e` (feat)
2. **Task 2: Integrate into merge pipeline** - `480f67a` (feat)
3. **Task 3: Update REQUIREMENTS.md + STATE.md** - `902bb46` (chore)

## Score Components Coverage (before → after)

| Component | Column | Before 01-03 | After 01-03 |
|-----------|--------|-------------|-------------|
| APL médecins | `apl` | 99.6% | 99.6% |
| Urgences access | `temps_urgences_min` | 99.6% | 99.6% |
| Poverty rate | `taux_pauvrete` | **0%** (placeholder) | **12.2%** (large communes) |
| Age 75+ | `pct_75_plus` | **0%** (null stub) | **99.6%** |

## Deviations from Plan

None — plan executed exactly as written. FiLoSoFi URL was correct (INSEE infrastructure confirmed restored). TP6018 coverage of 12.2% matches expected ~12.4%.

## Known Stubs

None. All 4 score components are now wired to real data sources:
- `taux_pauvrete` at ~12% coverage is by design (statistical secrecy for small communes — FiLoSoFi only publishes for municipalities above a population threshold)
- `pct_75_plus` at ~99.6% coverage is expected (~0.4% coverage gap is communes present in INSEE Pop but not in RP2020)

## Next Phase Readiness

Phase 2 scoring can now compute all 4 vulnerability score components:
- APL (inverse): 99.6% coverage
- Urgences access time: 99.6% coverage
- Poverty rate: 12.2% coverage (large communes only)
- Age 75+ share: 99.6% coverage

SCORE-03 (null score when <3 components) will flag communes missing `taux_pauvrete` — this is expected and correct for small rural communes.

---
*Phase: 01-data-foundation*
*Completed: 2026-04-07*

## Self-Check: PASSED

All files present and commits verified:
- notebooks/data/raw/filosofi.zip: FOUND (1,031,118 bytes)
- notebooks/data/raw/pop_age.zip: FOUND (39,621,383 bytes)
- notebooks/00_download.ipynb: FOUND (modified)
- notebooks/01_merge.py: FOUND (modified)
- notebooks/01_merge.ipynb: FOUND (modified)
- .planning/REQUIREMENTS.md: DATA-03 contains "located practitioners" and "14.3%"
- .planning/STATE.md: Blockers section = "None — all Phase 1 blockers resolved"
- Commits: df8808e (Task 1), 480f67a (Task 2), 902bb46 (Task 3)
