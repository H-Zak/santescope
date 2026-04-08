---
phase: 03-frontend-app
plan: "03"
subsystem: ui
tags: [nextjs, react, compare, pdf, html2canvas, typescript, shadcn]

requires:
  - phase: 03-02
    provides: [CommuneView, useCommuneData, DoublePanelLayout, diagnostic components, ScoreBadge, DpeStrip, ScoreGauge, ScoreDetail, DominoAlert, MissingDoctors]
  - phase: 03-01
    provides: [SearchBar, useSearchIndex, filterIndex, DPE_COLORS, DPE_LABELS, types.ts]
provides:
  - /comparer/[a]/[b] shareable comparison route
  - CompareView client component (free comparison mode, both communes side-by-side)
  - CommuneView Comparer avec... button with inline search
  - PdfExportContent dark-themed off-screen diagnostic component
  - PdfDownloadButton html2canvas capture and PNG download
affects: [04-integration-deploy]

tech-stack:
  added: [html2canvas (dynamic import, already installed)]
  patterns: [dynamic import to avoid SSR crash, off-screen DOM capture with visibility:hidden]

key-files:
  created:
    - santescope/src/app/comparer/[a]/[b]/page.tsx
    - santescope/src/components/compare/CompareView.tsx
    - santescope/src/components/pdf/PdfExportContent.tsx
    - santescope/src/components/pdf/PdfDownloadButton.tsx
  modified:
    - santescope/src/components/commune/CommuneView.tsx

key-decisions:
  - "CompareView calls useCommuneData twice (once per commune) — each in its own CommunePanel sub-component to keep error/loading states independent"
  - "PdfExportContent uses visibility:hidden (not display:none) — html2canvas cannot capture display:none elements"
  - "html2canvas imported dynamically (await import) to avoid SSR window-is-not-defined crash"
  - "Inline compare search in CommuneView uses same filterIndex + useSearchIndex as main SearchBar, no modal"
  - "PdfExportContent adapts mockup 12-dimension model to our 4 components (APL, pauvrete, pct_75_seuls, urgences)"

patterns-established:
  - "Dynamic import for browser-only libs: const lib = (await import('lib')).default"
  - "Off-screen DOM for capture: position:absolute; left:-9999px; visibility:hidden — NOT display:none"
  - "Independent per-commune data fetching in comparison mode (CommunePanel pattern)"

requirements-completed: [UI-06, UI-07]

duration: "~20min"
completed: "2026-04-08"
---

# Phase 03 Plan 03: Free Comparison Mode & PDF Export Summary

**Free comparison via /comparer/[a]/[b] shareable route + dark-themed html2canvas PDF export matching mockup.html (teal header, DPE badge, résumé exécutif, 4-dimension bars, points forts/alertes, sources footer)**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-04-08
- **Completed:** 2026-04-08
- **Tasks:** 2
- **Files modified:** 5 (3 created + 2 updated = 5 total, counting new files in pdf/ and compare/)

## Accomplishments

- Free comparison mode: "Comparer avec..." button opens inline commune search in right panel; on select navigates to /comparer/[a]/[b] via router.push
- /comparer/[a]/[b] server component with generateMetadata, renders CompareView client component with two independent full diagnostics side-by-side
- PDF export: PdfExportContent renders off-screen dark-themed diagnostic matching mockup.html exactly; PdfDownloadButton captures at 2x scale with html2canvas and downloads as PNG

## Task Commits

1. **Task 1: Free comparison mode** - `4ca3afe` (feat)
2. **Task 2: PDF export** - `5b8789f` (feat)

## Files Created/Modified

- `santescope/src/app/comparer/[a]/[b]/page.tsx` — Server component, generateMetadata, renders CompareView
- `santescope/src/components/compare/CompareView.tsx` — "use client", useCommuneData x2, DoublePanelLayout, "Mode comparaison libre" badge
- `santescope/src/components/pdf/PdfExportContent.tsx` — Hidden dark-themed component: id=pdf-export-root, teal header, DPE badge, résumé exécutif, indicateurs clés, 4 score bars, points forts/alertes, footer sources
- `santescope/src/components/pdf/PdfDownloadButton.tsx` — Dynamic html2canvas import, scale:2 capture, santescope-{code}-{date}.png, loading spinner
- `santescope/src/components/commune/CommuneView.tsx` — Added Comparer avec... inline search + PdfDownloadButton + PdfExportContent wiring

## Decisions Made

1. **CommunePanel pattern** — CompareView delegates to a CommunePanel sub-component that calls useCommuneData independently; each side has its own loading/error state without coupling
2. **visibility:hidden not display:none** — html2canvas requires element to be in the render tree; display:none removes it. Using position:absolute+left:-9999px+visibility:hidden keeps it off-screen but capturable
3. **Dynamic import html2canvas** — SSR would crash on `window is not defined`; dynamic `await import("html2canvas")` runs only in browser at click time
4. **Inline compare search reuses filterIndex** — No modal, no new component library; same filterIndex + useSearchIndex pattern as SearchBar, rendered inline below the button

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## Known Stubs

None — all features fully wired with real data.

## Self-Check: PASSED

- santescope/src/app/comparer/[a]/[b]/page.tsx: EXISTS
- santescope/src/components/compare/CompareView.tsx: EXISTS
- santescope/src/components/pdf/PdfExportContent.tsx: EXISTS
- santescope/src/components/pdf/PdfDownloadButton.tsx: EXISTS
- santescope/src/components/commune/CommuneView.tsx: UPDATED
- Commit 4ca3afe: EXISTS
- Commit 5b8789f: EXISTS
- npm run build: PASSED (4 routes: /, /_not-found, /commune/[code], /comparer/[a]/[b])

## Next Phase Readiness

- Phase 03 complete — all UI requirements (UI-01 through UI-08) satisfied
- Phase 04 (Integration & Deploy) can begin: Vercel deployment, final data wiring, and production checks

---
*Phase: 03-frontend-app*
*Completed: 2026-04-08*
