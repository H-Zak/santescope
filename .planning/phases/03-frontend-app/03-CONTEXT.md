# Phase 3: Frontend App - Context

**Gathered:** 2026-04-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the Next.js frontend application with commune search, double-panel diagnostic/twin display, alternative twins list, free comparison mode, PDF export, and mini map. Uses mock data initially (real JSONs wired in Phase 4).

Routes: `/` (landing), `/commune/[code]` (diagnostic), `/comparer/[a]/[b]` (free comparison).

</domain>

<decisions>
## Implementation Decisions

### Visual Identity
- **D-01:** Santé DPE-coloré theme — teal primary (#0F766E), sky accent (#0EA5E9), DPE A-E scale (A=#22C55E, B=#A3E635, C=#FACC15, D=#F97316, E=#EF4444)
- **D-02:** Typography: Inter 400/600/700. Cards: border-radius 8px. Neutral backgrounds: #F0FDF4 / #1E293B
- **D-03:** UI framework: Tailwind CSS + shadcn/ui components
- **D-04:** Interface entirely in French (labels, texts, tooltips). Code variables/components in English. No i18n.
- **D-05:** App is light theme. PDF export uses separate dark theme (see D-20).

### Search Experience
- **D-06:** Landing page: full-screen search hero with centered search bar + tagline ("Le diagnostic sante de votre commune") + stats (35K communes, 200K medecins, 9 sources open data)
- **D-07:** Autocomplete dropdown shows: commune name + department + score badge A-E colored. Ex: "Saint-Quentin (02) [E]"
- **D-08:** Client-side filter on index.json with 150ms debounce. No fuzzy search library — simple startsWith/includes matching.
- **D-09:** index.json (~500Ko) loaded at app mount. Skeleton search bar while loading. localStorage cache.

### Double-Panel Layout
- **D-10:** Side-by-side 50/50 layout. Left panel = "Ma commune" (diagnostic). Right panel = "Commune jumelle" (actions).
- **D-11:** Score displayed as DPE badge + horizontal gauge bar + numeric value (7.2/10) + classification label ("Tres vulnerable")
- **D-12:** Score detail: 4 components (APL, pauvrete, 75+ isoles, urgences) each with value + national median comparison (dots or mini bars)
- **D-13:** Alternative twins displayed as horizontal card row below the double-panel. 3 shown, "+N" button for remaining. Click swaps the active twin in the right panel.

### Domino & Alerts
- **D-14:** Domino alert: colored callout block (orange-50 background, orange-400 border). Content: "N/M medecins ont 55+ ans (X% — moy dept: Y%)" + "Estimation 2030: -N medecins". Red background if % > 50%.
- **D-15:** Missing specialties: bullet list with pathology context. Ex: "Endocrinologue — Diabete: 1.35x moy. nat."

### Data Quality Handling
- **D-16:** Communes with data_quality "partial"/"minimal": yellow warning banner at top + missing sections grayed out with "Non disponible". Score null → "Donnees insuffisantes" (no badge).

### Free Comparison Mode
- **D-17:** Triggered by "Comparer avec..." button on the results page. Opens a second search field. Selected commune replaces the twin in the right panel.
- **D-18:** URL: `/comparer/[code1]/[code2]` — shareable.

### Map
- **D-19:** Static image pre-generated in notebooks (matplotlib), served as PNG from public/data/. No JavaScript map library. Simplifies frontend significantly.

### PDF Export
- **D-20:** ORS/ARS institutional style with dark background — follows mockup.html template exactly
- **D-21:** Structure: teal header (SanteScope + commune/dept/date) → DPE badge + A-E scale → Resume executif (3 lines) → Indicateurs cles (cards with comparison arrows) → Scores par dimension (horizontal A-E bars for 4 components) → Points forts / Alertes (two columns) → Footer sources
- **D-22:** html2canvas to capture the PDF component as image, then download. The PDF component is a hidden DOM element styled differently from the app (dark theme).
- **D-23:** Adapt mockup from 12 dimensions to our 4 components (APL, pauvrete, 75+ isoles, urgences)

### Routing & Navigation
- **D-24:** Next.js App Router. Routes: `/` (landing), `/commune/[code]` (dynamic), `/comparer/[a]/[b]` (dynamic)
- **D-25:** Header on all pages (except landing hero): logo (→ home) + persistent search bar
- **D-26:** URLs shareable and SEO-friendly

### Responsive
- **D-27:** Desktop-first. Mobile (<768px): panels stack vertically (diagnostic on top, twin below). Minimal effort — Tailwind flex-col breakpoint.

### Performance & Loading
- **D-28:** index.json fetched at mount, cached in localStorage. Commune JSON (~2Ko) fetched on navigation.
- **D-29:** Skeleton loading for search bar (during index fetch) and panels (during commune fetch).

### Claude's Discretion
- Exact shadcn/ui components to use (Card, Dialog, Command, etc.)
- Search filtering algorithm details (startsWith priority over includes, etc.)
- Skeleton component design
- Mock data structure (3-5 hardcoded communes matching frozen JSON schema)
- Exact responsive breakpoints beyond the 768px mobile threshold
- html2canvas configuration and PDF quality settings

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Data contract
- `.planning/phases/01-data-foundation/01-CONTEXT.md` — Frozen JSON schema (index.json + per-commune JSON), field names and types
- `datasets-santescope.md` — Dataset descriptions and field meanings

### PDF mockup
- `mockup.html` — ORS-inspired PDF template with exact HTML/CSS. Adapt 12 dimensions → 4 components.

### Prior phase context
- `.planning/phases/02-scoring-clustering/02-CONTEXT.md` — Score computation decisions (A-E classification, data_quality field, twin matching details, JSON export format)

### Requirements
- `.planning/REQUIREMENTS.md` — UI-01..08 acceptance criteria

### Project
- `.planning/ROADMAP.md` — Phase 3 success criteria and plan breakdown
- `.planning/PROJECT.md` — Core value, constraints, out-of-scope items

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `mockup.html` — Complete HTML/CSS for PDF export component, directly reusable as React component
- `notebooks/` — Pipeline exists but no frontend code yet (greenfield)

### Established Patterns
- No frontend patterns established yet — Phase 3 defines them
- Data contract frozen in Phase 1 CONTEXT.md (JSON schema)
- Phase 2 adds `data_quality` and `classe` fields to the schema

### Integration Points
- Input: `public/data/index.json` (search) + `public/data/communes/{code}.json` (detail) — mock data for Phase 3, real data wired in Phase 4
- Output: Running Next.js app with all UI features working on mock data

</code_context>

<specifics>
## Specific Ideas

- DPE A-E classification inspired by Diagnostic de Performance Energetique — immediately familiar to French elected officials and jury
- PDF follows ORS/ARS institutional fiche format — recognized by target users (ARS, mairies, CPTS)
- "Points forts / Alertes" two-column format in PDF — decisional, not analytical
- Resume executif in PDF: 3 lines that an elected official can read in 10 seconds
- Static map images from notebooks avoid all JS map library complexity
- Missing specialties linked to department pathology rates gives actionable context ("Endocrinologue needed because diabetes rate is 1.35x national average")

</specifics>

<deferred>
## Deferred Ideas

- Interactive Leaflet/Mapbox map — V2 (static images sufficient for MVP)
- Fuzzy search with Fuse.js — V2 (startsWith/includes sufficient for correct commune names)
- Dark mode for the app — V2 (app stays light, only PDF is dark)
- Styled/branded PDF with proper PDF library (jsPDF, react-pdf) — V2

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-frontend-app*
*Context gathered: 2026-04-08*
