---
phase: 02-scoring-clustering
verified: 2026-04-08T12:00:00Z
status: passed
score: 6/6 must-haves verified
---

# Phase 02: Scoring & Clustering Verification Report

**Phase Goal:** Compute vulnerability score, domino projection, twin matching, and export all to JSON
**Verified:** 2026-04-08
**Status:** passed
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Vulnerability score computed for >90% of communes | VERIFIED | 34815/34969 scored (99.6%), range [1.0, 6.1], all in [0,10] |
| 2 | Missing specialties identified for communes with RPPS data | VERIFIED | 4039 communes assessed, manques column populated with specialty lists |
| 3 | Domino projection computed for communes with >3 doctors | VERIFIED | 4934 eligible communes have domino_alert, 0 leak to <=3 doctor communes |
| 4 | Each commune has 0-5 twin communes with similarity score and detected actions | VERIFIED | All 34969 communes have 3-5 twins, similarity in [0,1], actions populated for improved twins |
| 5 | index.json and per-commune JSONs exported matching frozen schema | VERIFIED | index.json has 34969 entries with all required keys; commune JSONs have all schema keys; 10-file sample: 0 issues |
| 6 | >30K commune JSON files generated in public/data/communes/ | VERIFIED | 34969 JSON files in public/data/communes/ |

**Score:** 6/6 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `notebooks/02_score.ipynb` | Vulnerability score computation | VERIFIED | 16 cells (8 code), all executed, contains score_final logic |
| `notebooks/03_domino.ipynb` | Domino projection + missing doctors | VERIFIED | 15 cells (8 code), all executed, DREES data integrated |
| `notebooks/04_jumelles.ipynb` | Twin commune matching via KNN | VERIFIED | 14 cells (7 code), all executed, NearestNeighbors used |
| `notebooks/05_export_json.ipynb` | JSON export with schema validation | VERIFIED | 14 cells (7 code), all executed, jsonschema validation on all files |
| `notebooks/data/processed/communes_master.parquet` | Enriched master with all derived columns | VERIFIED | 34969 rows, 46 columns (29 original + 17 derived) |
| `notebooks/data/processed/national_medians.json` | National medians for score detail | VERIFIED | Contains apl, pauvrete, pct_75_seuls, temps_urgences_min |
| `public/data/index.json` | Commune index for frontend search | VERIFIED | 34969 entries with code, nom, dept, score, classe, pop |
| `public/data/communes/` | Per-commune JSON files | VERIFIED | 34969 files |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| 02_score.ipynb | communes_master.parquet | read -> add score columns -> save | WIRED | score, classe, n_score_components + 4 norm columns added |
| 03_domino.ipynb | communes_master.parquet | read -> add domino/geo columns -> save | WIRED | region, densite, manques, domino_alert, projection_2030 added |
| 04_jumelles.ipynb | communes_master.parquet | read -> add jumelles column -> save | WIRED | jumelles column with list of twin dicts |
| 05_export_json.ipynb | public/data/communes/ | read final parquet -> write one JSON per commune | WIRED | 34969 files written |
| 05_export_json.ipynb | public/data/index.json | build index array -> write JSON | WIRED | 34969 entries |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|-------------------|--------|
| index.json | index entries | communes_master.parquet via 05_export | 34969 entries with real scores | FLOWING |
| commune JSONs | commune dicts | communes_master.parquet via 05_export | Real score_detail with national medians, domino, twins | FLOWING |
| Saint-Quentin 02691.json | full commune dict | parquet pipeline | score=3.8, classe=D, 5 twins with actions, domino active, manques=[endocrinologue, pneumologue] | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Score coverage >90% | Python check on parquet | 34815/34969 = 99.6% | PASS |
| Null score for <3 components | Check parquet constraint | All 154 null-score communes have <3 components | PASS |
| A-E classes all present | Unique check | {A:8921, B:9240, C:3825, D:7561, E:5268} | PASS |
| Domino no leak to <=3 docs | Parquet filter check | 0 leaks | PASS |
| Twin similarity in [0,1] | 50-commune random sample | 0 out-of-range values | PASS |
| Improved twins have actions | Sample check | 199 improved twins in 50 communes | PASS |
| Schema compliance | 10-file random sample | 0 schema issues | PASS |
| National medians in score_detail | Saint-Quentin JSON check | All 4 national medians present | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-----------|-------------|--------|----------|
| SCORE-01 | 02-01 | 4-component score (APL inverse, poverty, 75+, urgent care) | SATISFIED | 4 normalized components in parquet, APL inverted via (max-apl) |
| SCORE-02 | 02-01 | Min-max normalization, final 0-10 | SATISFIED | Score range [1.0, 6.1], all in [0,10] |
| SCORE-03 | 02-01 | <3 components = null score | SATISFIED | 154 communes with null score, all have <3 components |
| SCORE-04 | 02-01 | Component values + national averages in JSON | SATISFIED | score_detail in every commune JSON has values + *_national medians |
| DOC-01 | 02-01 | Count specialists per commune from RPPS | SATISFIED | specialistes_detail parsed, 4039 communes assessed |
| DOC-02 | 02-01 | Cross with dept pathology rates | SATISFIED | PATHO_SPECIALTY_MAP cross-referencing in 03_domino.ipynb |
| DOC-03 | 02-01 | Display top missing specialties | SATISFIED | manques list in JSON (e.g., Saint-Quentin: [endocrinologue, pneumologue]) |
| DOM-01 | 02-01 | Estimate % doctors 55+ using DREES dept stats | SATISFIED | DREES XLSX downloaded, pct_55plus_dept mapped to 34875 communes |
| DOM-02 | 02-01 | Project medecin loss by 2030 | SATISFIED | projection_2030 column for 4916 communes |
| DOM-03 | 02-01 | Domino alert when %55+ exceeds dept avg | SATISFIED | domino_alert for 4934 eligible communes |
| TWIN-01 | 02-02 | Cluster on normalized indicators | SATISFIED | KNN on 5 features (APL, poverty, age, log_pop, density) |
| TWIN-02 | 02-02 | Find 3-5 similar improved communes | SATISFIED | 3-5 twins per commune, improved twins have MSP/APL actions |
| TWIN-03 | 02-02 | Similarity score + detected actions per twin | SATISFIED | similarite in [0,1], actions list with specific improvements |
| TWIN-04 | 02-02 | APL evolution timeline for improved twins | SATISFIED | apl_avant/apl_apres in twin dicts, apl_evolution in commune JSON |
| DATA-05 | 02-02 | Export index.json | SATISFIED | 34969 entries with code, nom, dept, score, classe, pop |
| DATA-06 | 02-02 | Export per-commune JSONs matching schema | SATISFIED | 34969 files, jsonschema validated in notebook |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| (none) | - | - | - | No anti-patterns found in any notebook |

### Human Verification Required

### 1. Score Distribution Reasonableness

**Test:** Review the compressed score range [1.0, 6.1] and A-E quintile distribution
**Expected:** Distribution makes sense given 87.8% poverty data imputation pushing most communes toward neutral
**Why human:** Statistical judgment about whether the compressed range is acceptable for the hackathon jury presentation

### 2. Twin Matching Quality

**Test:** Check 5-10 communes and verify their twins are geographically and structurally sensible
**Expected:** Twins should be similar-sized communes with comparable health profiles, preferably same region
**Why human:** Semantic quality of KNN matching requires domain knowledge

### Gaps Summary

No gaps found. All 6 observable truths verified. All 16 requirements satisfied. All artifacts exist, are substantive, are wired, and have real data flowing through them. No anti-patterns detected. The phase goal -- compute vulnerability score, domino projection, twin matching, and export all to JSON -- is fully achieved.

---

_Verified: 2026-04-08_
_Verifier: Claude (gsd-verifier)_
