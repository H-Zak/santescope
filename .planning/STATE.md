---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: in-progress
last_updated: "2026-04-07T20:10:00Z"
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 2
  completed_plans: 1
---

# State: SanteScope

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-07)

**Core value:** Show a commune its health problems AND what a similar commune did to fix them
**Current focus:** Phase 01 — data-foundation (Plan 01 complete, Plan 02 next)

## Current Phase

**Phase 1: Data Foundation**

- Status: IN PROGRESS
- Plans: 2 (01-01 DONE, 01-02 PENDING)
- Next action: Execute 01-02-PLAN.md (merge + clean data)
- Progress: [█████░░░░░] 50%

## Phase Progress

| Phase | Name | Status | Plans |
|-------|------|--------|-------|
| 1 | Data Foundation | In Progress | 1/2 complete |
| 2 | Scoring & Clustering | Blocked by Phase 1 | 0/3 planned |
| 3 | Frontend App | Ready (mock data) | 0/3 planned |
| 4 | Integration & Deploy | Blocked by 2+3 | 0/2 planned |

## Completed Plans

### 01-01: Download Pipeline (2026-04-07, 32min)
- All 9 datasets downloaded into notebooks/data/raw/
- Key commits: 6f271e4 (notebook), 68af990 (downloads + URL fixes)
- FiLoSoFi BLOCKER: INSEE.fr HTTP 500 — placeholder only

## Decisions Log

- APL is XLSX not CSV (DREES multi-year Excel with sheet per year)
- RPPS is pipe-separated TXT (sep='|'), 2.2M rows, 801MB
- MSP extracted from FINESS category code 603 (national, 3080 MSP)
- INSEE population via Geo API (direct INSEE.fr downloads broken in April 2026)
- FiLoSoFi 2021 unavailable: INSEE.fr infrastructure returning HTTP 500 errors
- FINESS: skiprows=1 to skip metadata header; no column names in file
- Urgences XLSX: skiprows=5 on sheet BASECOM_URGENCES_2019
- La Poste: comment header (start with #), encoding latin-1

## Blockers

- **FiLoSoFi**: INSEE.fr HTTP 500 on all file downloads. Manual download required. URL: https://www.insee.fr/fr/statistiques/5055909 → save as notebooks/data/raw/filosofi.xlsx

## Milestone

**v1.0 — Hackathon MVP**

- Deadline: 2026-04-13
- Demo day: 2026-06-08
- Progress: 1/27 requirements complete (DATA-01 done)

## Notes

- Phase 1 (notebooks) and Phase 3 (frontend with mock data) can start in parallel
- Phase 3 switches from mock data to real JSON after Phase 2 completes
- Day 7 (April 13) is buffer + submission day
- FiLoSoFi absence: 01-02 merge must handle null poverty values gracefully

## Performance Metrics

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| 01-01 | 32min | 2 | 12 |

---
*Last updated: 2026-04-07 — after 01-01 execution*
