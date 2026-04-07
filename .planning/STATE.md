---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: In progress
last_updated: "2026-04-08T23:02:00Z"
progress:
  total_phases: 4
  completed_phases: 1
  total_plans: 6
  completed_plans: 4
---

# State: SanteScope

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-07)

**Core value:** Show a commune its health problems AND what a similar commune did to fix them
**Current focus:** Phase 02 — scoring-clustering

## Current Phase

**Phase 2: Scoring & Clustering — IN PROGRESS**

- Status: IN PROGRESS
- Plans: 1/3 done
- Current Plan: 02
- Progress: [███░░░░░░░] 33%

## Phase Progress

| Phase | Name | Status | Plans |
|-------|------|--------|-------|
| 1 | Data Foundation | **COMPLETE** | 3/3 complete |
| 2 | Scoring & Clustering | **IN PROGRESS** | 1/3 complete |
| 3 | Frontend App | Ready (mock data) | 0/3 planned |
| 4 | Integration & Deploy | Blocked by 2+3 | 0/2 planned |

## Completed Plans

### 01-01: Download Pipeline (2026-04-07, 32min)

- All 9 datasets downloaded into notebooks/data/raw/
- Key commits: 6f271e4 (notebook), 68af990 (downloads + URL fixes)
- FiLoSoFi BLOCKER resolved in 01-03 (INSEE infrastructure restored April 2026)

### 01-02: Merge Pipeline (2026-04-07, 12min)

- communes_master.parquet: 34969 communes, 29 columns, 2.4MB
- RPPS: 100% join for located rows (353K rows). 14.3% excluded (no location in RPPS source).
- APL 99.6%, urgences 99.6%, pathologies at dept level
- FiLoSoFi null (INSEE outage) and pct_75_plus null — resolved in 01-03
- Key commit: 25286f3

### 01-03: Gap Closure — FiLoSoFi + RP2020 Age Data (2026-04-07)

- FiLoSoFi 2018 downloaded from INSEE (infrastructure restored April 2026)
- RP2020 age structure downloaded and integrated: pct_75_plus = (P20_POP7589 + P20_POP90P) / P20_POP
- communes_master.parquet regenerated: taux_pauvrete 12.2%, pct_75_plus 99.6%
- DATA-03 criteria clarified: 98% applies to located practitioners only (14.3% excluded from RPPS source)
- Key commits: df8808e (download), 480f67a (merge pipeline)

## Decisions Log

- APL is XLSX not CSV (DREES multi-year Excel with sheet per year)
- RPPS is pipe-separated TXT (sep='|'), 2.2M rows, 801MB
- MSP extracted from FINESS category code 603 (national, 3080 MSP)
- INSEE population via Geo API (direct INSEE.fr downloads broken in April 2026)
- FiLoSoFi 2021 unavailable: INSEE.fr infrastructure returning HTTP 500 errors
- FINESS: skiprows=1 to skip metadata header; no column names in file
- Urgences XLSX: skiprows=5 on sheet BASECOM_URGENCES_2019
- La Poste: comment header (start with #), encoding latin-1
- RPPS 14.3% no-location rows excluded — 100% join for located rows
- La Poste best-commune strategy: most-populated commune per postal code avoids fan-out
- Paris APL null in master: APL only has arrondissements (75101-75120), not city code 75056
- FiLoSoFi 2018 downloaded from INSEE (infrastructure restored April 2026): cc_filosofi_2018_COM-geo2021.CSV, taux_pauvrete for ~12% of communes (statistical secrecy for small communes)
- pct_75_plus computed from RP2020 age structure: (P20_POP7589 + P20_POP90P) / P20_POP, ~100% coverage
- DATA-03 threshold clarified: 98% applies to located practitioners only (14.3% excluded from RPPS source -- no SIRET/address)
- APL inversion via (max - apl): avoids div-by-zero for 517 APL=0 communes
- Quintile A-E thresholds: equal ~20% per class, robust to compressed score distribution [1.0, 6.1]
- DREES dept code zero-padded (01-09) to match parquet format
- Score range compressed to [1.0, 6.1] due to 87.8% poverty imputation -- expected, A-E classification compensates

### 02-01: Vulnerability Score & Domino Projection (2026-04-08, 7min)

- Vulnerability score 0-10 for 34815 communes (99.6%), A-E quintile classification
- Domino projection: DREES dept-level %55+ doctors, 1813 alerts, 4622 projections
- Missing specialties: 2756 communes with gaps via RPPS x pathology cross
- GeoJSON enrichment: region + density for twin matching
- Dept code format bug fixed (01-09 zero-padding)
- Key commits: b801956 (score), cd73080 (domino)

## Blockers

None.

## Milestone

**v1.0 — Hackathon MVP**

- Deadline: 2026-04-13
- Demo day: 2026-06-08
- Progress: Phase 01 complete (DATA-01, DATA-02, DATA-03, DATA-04 done)

## Notes

- Phase 1 complete — communes_master.parquet ready for Phase 2
- 4/4 score components available (taux_pauvrete ~12% partial coverage, pct_75_plus ~100%, APL ~99.6%, urgences ~99.6%)
- Phase 2 scoring can now compute vulnerability score with 3-4 components for most communes
- Phase 3 (frontend with mock data) can start immediately in parallel with Phase 2
- Day 7 (April 13) is buffer + submission day

## Performance Metrics

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| 01-01 | 32min | 2 | 12 |
| 01-02 | 12min | 2 | 3 |
| 01-03 | ~20min | 3 | 5 |

| 02-01 | 7min | 2 | 4 |

---
*Last updated: 2026-04-08 -- after 02-01 execution (vulnerability score + domino projection)*
