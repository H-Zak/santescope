---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: in-progress
last_updated: "2026-04-07T20:28:19.615Z"
progress:
  total_phases: 4
  completed_phases: 1
  total_plans: 2
  completed_plans: 2
---

# State: SanteScope

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-07)

**Core value:** Show a commune its health problems AND what a similar commune did to fix them
**Current focus:** Phase 02 — scoring-clustering (Phase 01 complete)

## Current Phase

**Phase 1: Data Foundation — COMPLETE**

- Status: COMPLETE
- Plans: 2/2 done
- Progress: [██████████] 100%

## Phase Progress

| Phase | Name | Status | Plans |
|-------|------|--------|-------|
| 1 | Data Foundation | **COMPLETE** | 2/2 complete |
| 2 | Scoring & Clustering | Ready (communes_master.parquet ready) | 0/3 planned |
| 3 | Frontend App | Ready (mock data) | 0/3 planned |
| 4 | Integration & Deploy | Blocked by 2+3 | 0/2 planned |

## Completed Plans

### 01-01: Download Pipeline (2026-04-07, 32min)
- All 9 datasets downloaded into notebooks/data/raw/
- Key commits: 6f271e4 (notebook), 68af990 (downloads + URL fixes)
- FiLoSoFi BLOCKER: INSEE.fr HTTP 500 — placeholder only

### 01-02: Merge Pipeline (2026-04-07, 12min)
- communes_master.parquet: 34969 communes, 29 columns, 2.4MB
- RPPS: 100% join for located rows (353K rows). 14.3% excluded (no location in RPPS source).
- APL 99.6%, urgences 99.6%, pathologies at dept level
- FiLoSoFi null (INSEE outage), pct_75_plus null (no age data)
- Key commit: 25286f3

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

## Blockers

- **FiLoSoFi**: INSEE.fr HTTP 500 on all file downloads. Manual download required. URL: https://www.insee.fr/fr/statistiques/5055909 → save as notebooks/data/raw/filosofi.xlsx
- **pct_75_plus**: No age breakdown data available. INSEE Geo API returns total population only.

## Milestone

**v1.0 — Hackathon MVP**

- Deadline: 2026-04-13
- Demo day: 2026-06-08
- Progress: Phase 01 complete (DATA-01, DATA-02, DATA-03, DATA-04 done)

## Notes

- Phase 1 complete — communes_master.parquet ready for Phase 2
- Phase 2 scoring must handle 2/4 score components (APL + urgences available; poverty + isolation 75+ null)
- Phase 3 (frontend with mock data) can start immediately in parallel with Phase 2
- Day 7 (April 13) is buffer + submission day

## Performance Metrics

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| 01-01 | 32min | 2 | 12 |
| 01-02 | 12min | 2 | 3 |

---
*Last updated: 2026-04-07 — after 01-02 execution*
