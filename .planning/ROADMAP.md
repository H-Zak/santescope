# Roadmap: SanteScope

## Overview

SanteScope ships in 4 phases over 6 days. Phase 1 builds the data foundation (download, clean, merge). Phase 2 computes all derived features (scores, domino, twins). Phase 3 builds the frontend. Phase 4 integrates real data, polishes, and deploys. Phases 1-2 (notebooks) and Phase 3 (frontend with mock data) run in parallel lanes.

## Phases

- [x] **Phase 1: Data Foundation** — Download 9 datasets, clean, merge into master parquet (Days 1-2) (completed 2026-04-07)
- [ ] **Phase 2: Scoring & Clustering** — Vulnerability score, domino, twins, JSON export (Days 2-3)
- [ ] **Phase 3: Frontend App** — Next.js with search, double-panel, twins list, PDF (Days 1-5, mock data first)
- [ ] **Phase 4: Integration & Deploy** — Wire real JSONs, polish, deploy Vercel, submit (Days 5-6)

## Phase Details

### Phase 1: Data Foundation
**Goal**: Produce communes_master.parquet with all 9 datasets joined on code_commune
**Depends on**: Nothing (first phase)
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04
**Success Criteria** (what must be TRUE):
  1. 9 CSVs downloaded and validated (row counts, encoding, no corruption)
  2. RPPS code_postal converted to code_commune with >98% join success (located practitioners)
  3. communes_master.parquet exists with >30K communes and columns from all datasets
  4. All inline assertions pass (null rates, join rates, row counts)
  5. All 4 score components have real data (APL, urgences, taux_pauvrete, pct_75_plus)
**Plans**: 3 plans

Plans:
- [x] 01-01: Download and validate all 9 source datasets + La Poste table
- [x] 01-02: Clean, normalize, and merge into communes_master.parquet
- [x] 01-03: Gap closure — integrate FiLoSoFi 2018 + RP2020 age data, clarify DATA-03

### Phase 2: Scoring & Clustering
**Goal**: Compute vulnerability score, domino projection, twin matching, and export all to JSON
**Depends on**: Phase 1
**Requirements**: SCORE-01..04, DOC-01..03, DOM-01..03, TWIN-01..04, DATA-05, DATA-06
**Success Criteria** (what must be TRUE):
  1. Vulnerability score computed for >90% of communes (others marked null)
  2. Missing specialties identified for communes with RPPS data
  3. Domino projection computed for communes with >3 doctors
  4. Each commune has 0-5 twin communes with similarity score and detected actions
  5. index.json and per-commune JSONs exported matching the frozen schema
  6. >30K commune JSON files generated in public/data/communes/
**Plans**: 2 plans

Plans:
- [x] 02-01-PLAN.md — Score + domino + missing doctors + GeoJSON enrichment (notebooks 02_score + 03_domino)
- [ ] 02-02-PLAN.md — Twin matching + JSON export (notebooks 04_jumelles + 05_export_json)

### Phase 3: Frontend App
**Goal**: Next.js app with search, double-panel results, twins list, comparison, PDF export
**Depends on**: Nothing for setup (uses mock data Days 1-3), Phase 2 for real data (Day 4+)
**Requirements**: UI-01..08
**Success Criteria** (what must be TRUE):
  1. Search bar filters 35K communes with <100ms response
  2. Results page shows double panel (my commune diagnostic | twin actions)
  3. Alternative twins listed, clickable to swap
  4. Free comparison mode works (pick any 2 communes)
  5. PDF download produces a readable comparison report
  6. Mini map renders commune location
**Plans**: 3 plans

Plans:
- [ ] 03-01: Next.js setup, project structure, mock data, search with autocomplete
- [ ] 03-02: Results page: double-panel layout, score display, domino, missing doctors, twins list
- [ ] 03-03: Comparison mode, PDF export, map component

### Phase 4: Integration & Deploy
**Goal**: Wire real JSON data, polish UX, deploy to Vercel, submit to hackathon
**Depends on**: Phase 2, Phase 3
**Requirements**: DEP-01..03
**Success Criteria** (what must be TRUE):
  1. Real JSON data loaded from public/data/ (not mock)
  2. App deployed on Vercel at public URL
  3. 5 demo communes tested manually (Paris, Saint-Quentin, Maubeuge, Sedan, rural commune)
  4. Project submitted to hackathon
**Plans**: 2 plans

Plans:
- [ ] 04-01: Replace mock data with real JSONs, end-to-end smoke test
- [ ] 04-02: Vercel deploy, final polish, hackathon submission

## Parallel Execution

```
Day 1    Day 2    Day 3    Day 4    Day 5    Day 6    Day 7
─────────────────────────────────────────────────────────────
Lane A (notebooks):
[Phase 1 ][Phase 2          ]
 download  score+domino+twins+export

Lane B (frontend):
[Phase 3 with mock data     ][Phase 3 cont.]
 setup+search  panels+twins   pdf+map

                              [Phase 4        ][ buffer ]
                               integrate+deploy  submit
```

---
*Roadmap defined: 2026-04-07*
*Last updated: 2026-04-08 after Phase 2 planning*
