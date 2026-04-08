---
phase: 03-frontend-app
plan: "02"
subsystem: frontend
tags: [nextjs, react, commune-diagnostic, twin-panel, score-components, typescript]
dependency_graph:
  requires: [public/data/communes/{code}.json, src/lib/types.ts, src/lib/constants.ts, src/components/layout/Header.tsx]
  provides: [/commune/[code] page, CommuneView, ScoreBadge, DpeStrip, ScoreGauge, ScoreDetail, DominoAlert, MissingDoctors, MiniMap, DataQualityBanner, TwinPanel, TwinsList, DoublePanelLayout, useCommuneData]
  affects: [03-03]
tech_stack:
  added: [lucide-react (ArrowUp, ArrowDown, ArrowRight, AlertTriangle)]
  patterns: [App Router server/client split, useState for activeTwin, useEffect fetch with cancellation, skeleton loading]
key_files:
  created:
    - santescope/src/components/commune/ScoreBadge.tsx
    - santescope/src/components/commune/DpeStrip.tsx
    - santescope/src/components/commune/ScoreGauge.tsx
    - santescope/src/components/commune/ScoreDetail.tsx
    - santescope/src/components/commune/DominoAlert.tsx
    - santescope/src/components/commune/MissingDoctors.tsx
    - santescope/src/components/commune/MiniMap.tsx
    - santescope/src/components/commune/DataQualityBanner.tsx
    - santescope/src/hooks/useCommuneData.ts
    - santescope/src/components/commune/TwinPanel.tsx
    - santescope/src/components/commune/TwinsList.tsx
    - santescope/src/components/layout/DoublePanelLayout.tsx
    - santescope/src/components/commune/CommuneView.tsx
  modified:
    - santescope/src/app/commune/[code]/page.tsx
    - santescope/src/lib/types.ts
decisions:
  - "domino type updated to match real JSON schema: pct_55_plus, pct_55_plus_dept, projection_2030 (string)"
  - "data_quality type extended with complete (actual value from JSON export)"
  - "DominoAlert reads projection_2030 as string directly — no math transform needed"
  - "DataQualityBanner renders nothing for both complete and full quality values"
  - "CommuneView disabled PDF download button — Plan 03 implements export"
metrics:
  duration: "~20min"
  completed: "2026-04-08"
  tasks_completed: 2
  files_created: 13
  files_modified: 2
requirements_satisfied: [UI-02, UI-03, UI-04, UI-05, UI-08]
---

# Phase 03 Plan 02: Results Page — Diagnostic & Twin Display Summary

Full /commune/[code] results page with double-panel 50/50 layout: left panel shows DPE badge, gauge, score detail (4 indicators with national comparison), domino alert, and missing specialty list; right panel shows best twin commune with similarity %, actions taken, and APL before/after; bottom row allows click-to-swap between alternative twins.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Score components, domino alert, missing doctors, mini map, data quality banner | 2fec5c3 | ScoreBadge, DpeStrip, ScoreGauge, ScoreDetail, DominoAlert, MissingDoctors, MiniMap, DataQualityBanner |
| 2 | Results page — double panel layout, twin panel, twins row, server/client split wiring | a43e9f7 | useCommuneData, TwinPanel, TwinsList, DoublePanelLayout, CommuneView, page.tsx |

## Decisions Made

1. **domino JSON schema mismatch auto-fixed** — real JSON uses `pct_55_plus`/`pct_55_plus_dept`/`projection_2030` (string), not plan's `pct_55plus`/`dept_avg`/`pertes_2030` (number). Updated types.ts to match actual data.
2. **data_quality: "complete" added** — actual JSON export uses "complete" not "full". Extended union type to cover both.
3. **DominoAlert projection rendered as-is** — `projection_2030` is already a human-readable string ("-89 medecins (estimation)"), no formatting needed.
4. **DataQualityBanner guards both "complete" and "full"** — prevents banner from showing on fully-covered communes regardless of which value the export uses.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] domino interface mismatch vs actual JSON**
- **Found during:** Task 1
- **Issue:** Plan spec had `domino.pct_55plus`, `domino.dept_avg`, `domino.pertes_2030: number` but real commune JSON exports `pct_55_plus`, `pct_55_plus_dept`, `projection_2030: string`
- **Fix:** Updated `CommuneData.domino` in `types.ts` to match actual schema; adapted `DominoAlert` to use real field names and render projection_2030 directly
- **Files modified:** `santescope/src/lib/types.ts`, `santescope/src/components/commune/DominoAlert.tsx`
- **Commit:** 2fec5c3

**2. [Rule 1 - Bug] data_quality value mismatch**
- **Found during:** Task 1
- **Issue:** Real JSON has `data_quality: "complete"` but types.ts only had `"full" | "partial" | "minimal"`, causing TypeScript warnings
- **Fix:** Extended union type to `"complete" | "full" | "partial" | "minimal"`
- **Files modified:** `santescope/src/lib/types.ts`
- **Commit:** 2fec5c3

## Known Stubs

- `MiniMap` — France silhouette SVG placeholder at center; Phase 4 will swap to real commune-positioned PNG/tile images. Props interface (nom, coords) is stable.
- `TwinPanel` "Comparer avec..." button — disabled placeholder; Plan 03 implements full comparison mode.
- `CommuneView` "Télécharger le rapport" button — disabled placeholder; Plan 03 implements PDF export.

## Self-Check: PASSED

- santescope/src/components/commune/ScoreBadge.tsx: EXISTS
- santescope/src/components/commune/DpeStrip.tsx: EXISTS
- santescope/src/components/commune/ScoreGauge.tsx: EXISTS
- santescope/src/components/commune/ScoreDetail.tsx: EXISTS
- santescope/src/components/commune/DominoAlert.tsx: EXISTS
- santescope/src/components/commune/MissingDoctors.tsx: EXISTS
- santescope/src/components/commune/MiniMap.tsx: EXISTS
- santescope/src/components/commune/DataQualityBanner.tsx: EXISTS
- santescope/src/hooks/useCommuneData.ts: EXISTS
- santescope/src/components/commune/TwinPanel.tsx: EXISTS
- santescope/src/components/commune/TwinsList.tsx: EXISTS
- santescope/src/components/layout/DoublePanelLayout.tsx: EXISTS
- santescope/src/components/commune/CommuneView.tsx: EXISTS
- santescope/src/app/commune/[code]/page.tsx: UPDATED (server component, no "use client")
- Commit 2fec5c3: EXISTS
- Commit a43e9f7: EXISTS
- npm run build: PASSED (3 routes: /, /_not-found, /commune/[code])
