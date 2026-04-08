# Phase 4: Integration & Deploy - Context

**Gathered:** 2026-04-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire real JSON data (already in public/data/), polish UX with targeted fixes, deploy to Vercel, prepare hackathon submission dossier (README + video demo + HTML pitch slides), and smoke test 5 demo communes.

Note: Real data is ALREADY wired — frontend fetches from `/data/index.json` and `/data/communes/{code}.json` directly. No mock→real swap needed. The "integration" is verification, not implementation.

</domain>

<decisions>
## Implementation Decisions

### Polish UX
- **D-01:** Polish ciblé — smoke test + corrections visuelles ciblées (alignements, textes tronqués, edge cases données manquantes). Pas de micro-interactions.
- **D-02:** Découvrir les bugs pendant le smoke test, pas de bugs connus à ce stade.
- **D-03:** Vérifier tout — données manquantes, visuel ET impact jury. Pas de compromis ni de priorisation partielle.

### Stratégie de déploiement
- **D-04:** Fichiers JSON statiques dans `public/data/` — Vercel les sert directement via CDN. Pas d'API route ni de bundle.
- **D-05:** URL Vercel par défaut (santescope.vercel.app ou similaire). Pas de domaine personnalisé.
- **D-06:** Commit les 35K JSONs dans git (~40Mo) pour que Vercel déploie depuis le repo. Retirer l'exclusion de `public/data/` du .gitignore.

### Soumission hackathon
- **D-07:** Dossier complet : README propre + vidéo démo (screen recording 2-3min) + slides de pitch.
- **D-08:** Slides HTML/Reveal.js dans le repo (page standalone ou route /pitch). Codé par Claude, versionné.
- **D-09:** Préparer le minimum standard en attendant les règles de soumission exactes. README : description, stack, lancement, screenshots, URL déployée, sources données.

### Smoke test & démo
- **D-10:** 5 communes de test : Paris (75056), Saint-Quentin (02691), Maubeuge (59392), Sedan (08409), + une petite commune rurale.
- **D-11:** Vérification automatisée + manuelle : script qui fetch les 5 JSONs et vérifie les champs, puis navigation manuelle pour le visuel (search → diagnostic → jumelle → comparer → PDF).

### Claude's Discretion
- Choix de la commune rurale pour le 5e test (petite commune avec données complètes)
- Configuration Vercel (vercel.json si nécessaire, settings de build)
- Exact Reveal.js setup et structure des slides
- Outil de screen recording pour la vidéo démo
- Ordre des corrections polish (tant que tout est couvert)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Data contract
- `.planning/phases/01-data-foundation/01-CONTEXT.md` — Frozen JSON schema (index.json + per-commune JSON), field names and types
- `.planning/phases/02-scoring-clustering/02-CONTEXT.md` — Score computation, twin matching, JSON export format

### Frontend implementation
- `.planning/phases/03-frontend-app/03-CONTEXT.md` — Visual identity (D-01..D-29), component decisions, PDF export setup

### Requirements & project
- `.planning/REQUIREMENTS.md` — DEP-01..03 acceptance criteria
- `.planning/ROADMAP.md` — Phase 4 success criteria and plan breakdown
- `.planning/PROJECT.md` — Core value, constraints, free-tier hosting

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `santescope/src/hooks/useSearchIndex.ts` — Fetches `/data/index.json`, already wired to real data
- `santescope/src/hooks/useCommuneData.ts` — Fetches `/data/communes/{code}.json`, already wired
- `santescope/src/components/commune/` — 14 diagnostic components (ScoreBadge, DpeStrip, ScoreGauge, etc.)
- `santescope/src/components/pdf/` — PdfDownloadButton + PdfExportContent (html2canvas)
- `santescope/src/components/compare/CompareView.tsx` — Free comparison mode
- `santescope/src/components/search/SearchBar.tsx` — Autocomplete search

### Established Patterns
- Client-side data fetching (fetch from public/data/, no API routes)
- Tailwind CSS + shadcn/ui components
- App Router: server page.tsx + client CommuneView/CompareView components
- Dynamic import for html2canvas (SSR safety)

### Integration Points
- `santescope/public/data/` — 34969 commune JSONs + index.json (2.9MB) already present
- `santescope/next.config.ts` — Empty/default, may need Vercel-specific config
- No `vercel.json` exists yet
- `.gitignore` currently excludes `public/data/` — must be removed for deploy

</code_context>

<specifics>
## Specific Ideas

- Paris (75056) is a critical edge case: APL is null (only arrondissements have APL data), score may be partial
- Les 5 communes couvrent : grande ville (Paris), zones vulnérables (Saint-Quentin, Maubeuge, Sedan), et rural — bon échantillon des edge cases
- Slides HTML dans le repo = le jury peut les voir en ligne, pas besoin de PowerPoint
- Screen recording du parcours utilisateur complet : landing → search → diagnostic → jumelle → comparer → PDF

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-integration-deploy*
*Context gathered: 2026-04-08*
