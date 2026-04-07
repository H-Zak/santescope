# SanteScope

## What This Is

SanteScope is a territorial health diagnostic tool for French communes. A user searches for their commune and gets a vulnerability score, a list of missing specialist doctors, a retirement domino projection, and a recommended "twin commune" that solved similar problems with concrete actions (MSP installation, APL improvement). Built for the Open Data University hackathon (7-13 April 2026), challenge "Sante et Territoires" (partner: Fondation Roche).

## Core Value

Show a commune its health problems AND what a similar commune did to fix them. The value is synthesis (score + twin + actions), not raw data display.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Commune search with autocomplete across ~35K communes
- [ ] Vulnerability score (4 components: APL, poverty, isolation 75+, urgent-care access time)
- [ ] Missing doctors by specialty (department pathologies x commune RPPS)
- [ ] Retirement domino projection (% doctors 55+ with 2030 estimate)
- [ ] Twin commune matching via clustering with "what they did" actions
- [ ] Double-panel comparison (my commune diagnostic / twin commune actions)
- [ ] Alternative twins list with click-to-swap
- [ ] Free comparison between any 2 communes
- [ ] PDF export of comparison report
- [ ] Documented Jupyter notebooks showing methodology

### Out of Scope

- CartoSante API integration — unknown API stability, APL + our 9 datasets suffice for MVP
- Zonage ARS (ZIP/ZAC) — no national CSV, requires CartoSante API
- Attractiveness layer (DVF, BPE) — not core diagnostic, V2
- CPTS/CLS detection — fragmentary data, no national CSV
- FastAPI backend — not needed for static JSON architecture
- Formal test suite — inline notebook assertions suffice for hackathon
- Styled PDF export — basic html2canvas OK for MVP
- Responsive mobile polish — desktop-first for demo day
- Data Ameli enrichments #14-20 — each costs 1-3h for marginal value
- Real-time data updates — static pre-computed data is fine for hackathon
- User accounts / saved comparisons — no auth needed

## Context

- Greenfield project, no existing codebase
- Competing visual tools exist (CartoSante, Geodes, AtlaSante, ORS-IdF, APUR DataPortraits) but NONE combine diagnostic + prediction + twin-matching + actionable recommendations
- 0 reutilisations submitted for this challenge — terrain is completely open
- Evaluation criteria: technical excellence, UX, originality (blind spots)
- Demo day: 8-9 June 2026, best projects pitch to jury

## Constraints

- **Timeline**: 6 days (7-13 April 2026), rendu le 13
- **Budget**: 0 euros, all free-tier hosting
- **Team**: 1 developer + Claude Code
- **Stack**: Python notebooks (data) + Next.js (frontend) + Vercel (deploy)
- **Data**: open data only (data.gouv.fr, data.ameli.fr, INSEE, DREES)
- **Datasets**: 9 frozen for MVP (see datasets-santescope.md)
- **Architecture**: static JSON pre-computed by notebooks, no backend

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 9 datasets only for MVP | 22 available but each costs 1-3h. 9 cover all 5 features. | — Pending |
| RPPS join via La Poste table | 99% coverage in 10 lines of pandas, vs hours of BAN API geocoding | — Pending |
| Static JSON + Vercel, no backend | Zero cost, CDN-fast, simpler to build. Backend addable in V2 | — Pending |
| 4-component equal-weight score | Transparent, explicable in 10s to jury. ML-learned weights harder to explain | — Pending |
| Hybrid JSON (index + per-commune files) | 500Ko index for search + ~2Ko per commune loaded on demand | — Pending |
| Dynamic route, not next export | Avoids 35K static page generation. JSONs in public/data/, single [code].tsx route | — Pending |

---
*Last updated: 2026-04-07 after /office-hours + /plan-eng-review*
