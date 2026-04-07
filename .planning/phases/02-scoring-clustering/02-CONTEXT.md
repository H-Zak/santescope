# Phase 2: Scoring & Clustering - Context

**Gathered:** 2026-04-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Compute the vulnerability score, retirement domino projection, missing doctor detection, twin commune matching, and export all results to static JSON files. This phase reads `communes_master.parquet` (from Phase 1), enriches it with derived features, and produces `index.json` + per-commune JSON files matching the frozen schema.

Notebooks: `02_score.ipynb`, `03_domino.ipynb`, `04_jumelles.ipynb`, `05_export_json.ipynb`

</domain>

<decisions>
## Implementation Decisions

### Vulnerability Score
- **D-01:** Equal weights (25% each) for the 4 components: APL inverse, poverty rate, % 75+ alone, urgent-care access time. To revisit in v2 with domain-expert-informed weighting.
- **D-02:** Min-max normalization across all communes, final score 0-10, rounded to 1 decimal (e.g., 7.2)
- **D-03:** Score = null ("Donnees insuffisantes") if commune has <3 of 4 components available
- **D-04:** National average = median across communes (more robust to outliers). To revisit in v2 — may compare with population-weighted mean.
- **D-05:** Classification A-E (like energy rating DPE): A = least vulnerable, E = most vulnerable. Thresholds to be determined by Claude based on observed data distribution. Document chosen thresholds and rationale. To revisit in v2.
- **D-06:** Each component value + national median exposed in JSON for comparison (per SCORE-04)

### Claude's Discretion (Score)
- APL inversion method (1/APL vs (max - APL) vs reverse normalization)
- A-E classification thresholds (linear, quintile, or hybrid) — must document the choice and rationale in notebook markdown cells

### Missing Doctors
- **D-07:** Count specialists per commune from RPPS grouped by specialty (per DOC-01)
- **D-08:** Cross with department pathology rates to identify specialty gaps (per DOC-02)
- **D-09:** Display top missing specialties per commune as `manques` array in JSON (per DOC-03)

### Domino Projection
- **D-10:** Estimate % doctors 55+ per commune by applying department-level DREES stats to commune RPPS counts (per DOM-01)
- **D-11:** Domino alert triggers when commune % 55+ exceeds department average OR exceeds 50% (double threshold)
- **D-12:** Projection format: simple text "-N medecins (estimation)" — N = number of 55+ doctors who will be 65+ by 2030. No false precision.
- **D-13:** Only compute domino for communes with >3 doctors (per roadmap success criteria)

### Twin Matching
- **D-14:** Euclidean distance on min-max normalized indicators (APL, poverty, age structure, population, density)
- **D-15:** Same-region priority: first search within region, then expand nationally if fewer than 5 twins with improvement found
- **D-16:** Store top 5 twins per commune in JSON, frontend shows 3 by default with "Voir plus"
- **D-17:** Similarity score exposed as 0-1 (1 = identical profile)

### Claude's Discretion (Twins)
- Improvement detection method — MSP presence + APL increase >0.3 as base signals, Claude may add other detectable signals from available data
- Clustering algorithm choice (KNN-based, or direct distance computation)

### JSON Export
- **D-18:** Export ALL communes (>35K files), including those with null/incomplete data
- **D-19:** Add `data_quality` field: "complete" | "partial" | "minimal" — frontend can filter or show warning
- **D-20:** index.json includes both score AND classification (A-E) per commune — frontend doesn't recompute thresholds
- **D-21:** JSON Schema validation (jsonschema.validate()) on ALL exported files — no silent schema violations
- **D-22:** JSON schema matches the frozen contract from Phase 1 CONTEXT.md exactly (with addition of `data_quality` and `classe` fields)

### V2 Review Items
- Score component weighting (currently equal 25% each)
- National average method (currently median, compare with population-weighted mean)
- A-E classification thresholds (currently Claude's discretion)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Data contract
- `.planning/phases/01-data-foundation/01-CONTEXT.md` — Frozen JSON schema, pipeline architecture, dataset descriptions, known failure modes
- `datasets-santescope.md` — Complete dataset URLs and field descriptions

### Requirements
- `.planning/REQUIREMENTS.md` — SCORE-01..04, DOC-01..03, DOM-01..03, TWIN-01..04, DATA-05, DATA-06

### Project context
- `.planning/ROADMAP.md` — Phase 2 success criteria and plan breakdown
- `.planning/PROJECT.md` — Core value proposition and principles

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `notebooks/00_download.ipynb` — Download pipeline pattern (urllib, assertions)
- `notebooks/data/raw/` — 8 raw datasets already downloaded (APL, RPPS, FINESS, MSP, INSEE Pop, FiLoSoFi, Pathologies, Urgences, GeoJSON)
- `notebooks/data/la_poste_cp_commune.csv` — La Poste correspondence table

### Established Patterns
- Pipeline architecture: each notebook reads `communes_master.parquet`, adds columns, saves back
- Linear notebook chain: 00 -> 01 -> 02 -> 03 -> 04 -> 05
- Inline assertions for validation (not a test suite)

### Integration Points
- Input: `notebooks/data/processed/communes_master.parquet` (from Phase 1, notebook 01_merge)
- Output: `public/data/index.json` + `public/data/communes/{code}.json` (consumed by Phase 3 frontend)

</code_context>

<specifics>
## Specific Ideas

- Classification A-E inspired by DPE (Diagnostic de Performance Energetique) — familiar visual for French elected officials
- Every methodological choice (weights, thresholds, metrics) must be documented in notebook markdown cells for hackathon jury explainability
- "V2 Review Items" section tracks choices to revisit with more time/expertise

</specifics>

<deferred>
## Deferred Ideas

- Custom score weighting with domain expert input — v2
- Population-weighted national average as alternative comparison — v2
- ML-learned score weights — explicitly out of scope (loses explainability)
- CartoSante API integration for 300+ indicators — v2 (V2-01)

</deferred>

---

*Phase: 02-scoring-clustering*
*Context gathered: 2026-04-08*
