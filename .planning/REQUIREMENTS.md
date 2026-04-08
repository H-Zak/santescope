# Requirements: SanteScope

**Defined:** 2026-04-07
**Core Value:** Show a commune its health problems AND what a similar commune did to fix them

## v1 Requirements (MVP — Hackathon)

### Data Pipeline

- [x] **DATA-01**: Download and validate 9 source CSVs with integrity checks
- [x] **DATA-02**: Join all datasets on code_commune (INSEE COG 5-digit)
- [x] **DATA-03**: RPPS code_postal converted to code_commune via La Poste table (>98% of located practitioners; 14.3% excluded — no location in RPPS source data)
- [x] **DATA-04**: Master parquet produced with all commune indicators merged
- [x] **DATA-05**: Export index.json (~500Ko, 35K entries: code, nom, dept, score, pop)
- [x] **DATA-06**: Export per-commune JSON files (~2Ko each) matching the frozen JSON schema

### Vulnerability Score

- [x] **SCORE-01**: 4-component score (APL inverse, poverty rate, % 75+ alone, urgent-care access time)
- [x] **SCORE-02**: Min-max normalization across all communes, final score 0-10
- [x] **SCORE-03**: Communes with <3 of 4 components get score = null ("Donnees insuffisantes")
- [x] **SCORE-04**: Each component value + national average exposed in JSON for comparison

### Missing Doctors

- [x] **DOC-01**: Count specialists per commune from RPPS grouped by specialty
- [x] **DOC-02**: Cross with department pathology rates to identify specialty gaps
- [x] **DOC-03**: Display top missing specialties per commune

### Retirement Domino

- [x] **DOM-01**: Estimate % doctors aged 55+ per commune using DREES department stats applied to RPPS commune counts
- [x] **DOM-02**: Project approximate medecin loss by 2030
- [x] **DOM-03**: Display domino alert when % 55+ exceeds department average

### Twin Communes

- [x] **TWIN-01**: Cluster communes on normalized indicators (APL, poverty, age structure, population, density)
- [x] **TWIN-02**: For each commune, find top 3-5 similar communes that improved (MSP installed or APL increased >0.3)
- [x] **TWIN-03**: Store similarity score and detected actions per twin
- [x] **TWIN-04**: Expose APL evolution timeline (multi-year) for twins that improved

### Frontend

- [x] **UI-01**: Search bar with client-side autocomplete on commune name/code
- [ ] **UI-02**: Results page with double-panel layout (my commune | twin commune)
- [ ] **UI-03**: My commune panel shows: score, score detail, missing doctors, domino alert
- [ ] **UI-04**: Twin commune panel shows: similarity %, actions taken, APL before/after
- [ ] **UI-05**: List of alternative twins with click-to-swap
- [ ] **UI-06**: Free comparison mode (user picks any 2 communes)
- [ ] **UI-07**: Basic PDF export of comparison report
- [ ] **UI-08**: Mini map showing commune location

### Deployment

- [ ] **DEP-01**: App deployed on Vercel with public URL
- [ ] **DEP-02**: JSONs served from public/data/ directory (no backend)
- [ ] **DEP-03**: Code on GitHub repository

## v2 Requirements (Post-Hackathon)

- **V2-01**: CartoSante API integration for 300+ indicators + zonage ZIP/ZAC
- **V2-02**: Attractiveness layer (DVF immobilier + BPE equipements)
- **V2-03**: CPTS/CLS detection when national file available
- **V2-04**: FastAPI backend for dynamic calculations
- **V2-05**: Responsive mobile layout
- **V2-06**: Styled PDF export with branding
- **V2-07**: EPCI-level (intercommunalite) comparison
- **V2-08**: Data Ameli enrichments (patientele, primo-installations, passages urgences)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-time data | Static pre-computed data sufficient for hackathon |
| User accounts | No auth needed |
| Delais d'attente RDV | No open data exists at commune level |
| Telemedecine geoloc | No open data exists |
| Formal test suite | Inline assertions in notebooks suffice |
| ML-learned score weights | Loses explainability for jury |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DATA-01..06 | Phase 1 | Pending |
| SCORE-01..04 | Phase 2 | Pending |
| DOC-01..03 | Phase 2 | Pending |
| DOM-01..03 | Phase 2 | Pending |
| TWIN-01..04 | Phase 2 | Pending |
| UI-01..08 | Phase 3 | Pending |
| DEP-01..03 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 27 total
- Mapped to phases: 27
- Unmapped: 0

---
*Requirements defined: 2026-04-07*
*Last updated: 2026-04-07 after /plan-eng-review*
