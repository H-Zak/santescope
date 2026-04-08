---
phase: 04-integration-deploy
plan: 01
subsystem: ui
tags: [typescript, nextjs, react, null-safety, smoke-test, gitignore]

# Dependency graph
requires:
  - phase: 03-frontend-app
    provides: CommuneData types, ScoreDetail, TwinPanel, CommuneEquipments, ActionPathways, PdfExportContent components
provides:
  - Null-safe CommuneData types (apl, temps_urgences_min, has_hopital, has_ehpad, nb_etablissements, apl_evolution all nullable)
  - Crash-free rendering for Paris (75056) and all communes with null score_detail fields
  - Automated smoke test script for 5 demo communes
  - public/data/ unblocked from gitignore (ready to track 35K JSON files)
affects: [04-02-deploy, vercel-deploy, smoke-test]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Null-coalescing for optional evolution data: apl_evolution ?? {}"
    - "Explicit boolean check: === false instead of !d.has_ehpad for nullable booleans"
    - "Null guard pattern: value != null ? value.toFixed(1) : 'Non disponible'"
    - "Unknown data section in equipment list for null present values"

key-files:
  created:
    - santescope/scripts/smoke-test.js
  modified:
    - santescope/src/lib/types.ts
    - santescope/src/components/commune/ScoreDetail.tsx
    - santescope/src/components/commune/TwinPanel.tsx
    - santescope/src/components/commune/CommuneEquipments.tsx
    - santescope/src/components/commune/ActionPathways.tsx
    - santescope/src/components/commune/CommuneView.tsx
    - santescope/src/components/pdf/PdfExportContent.tsx
    - santescope/.gitignore

key-decisions:
  - "apl_evolution ?? {} passed at usage site (CommuneView, TwinPanel) rather than changing component signatures"
  - "CommuneEquipments adds 3rd 'Donnees non disponibles' gray section for null present values"
  - "smoke-test.js uses native fetch (Node 18+) with no external dependencies"
  - "gitignore: removed /public/data/communes/ and /public/data/index.json per decision D-06"

requirements-completed: [DEP-02]

# Metrics
duration: 15min
completed: 2026-04-08
---

# Phase 04 Plan 01: Null-Safety Fix & Smoke Test Summary

**Null-safe CommuneData types across 7 files + smoke test script + gitignore unblocked for 35K JSON data files**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-04-08T00:30:00Z
- **Completed:** 2026-04-08T00:45:00Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- Fixed 6 null-safety bugs in types.ts — Paris (75056) and any commune with null APL/urgences/equipments now renders without crash
- Updated 7 component files (ScoreDetail, TwinPanel, CommuneEquipments, ActionPathways, CommuneView, PdfExportContent) with null guards showing "Non disponible" or "N/D" fallback
- Created smoke-test.js: validates 5 demo communes (Paris null assertions + 4 scored communes), index.json length > 30000, native fetch, no dependencies
- Removed public/data/ exclusion from .gitignore — Vercel can now serve the 35K pre-computed commune JSONs

## Task Commits

1. **Task 1: Fix null-safety types and component guards** - `32cd658` (fix)
2. **Task 2: Smoke test script + gitignore surgery** - `2773df2` (feat)

## Files Created/Modified

- `santescope/src/lib/types.ts` - apl/temps_urgences_min/has_hopital/has_ehpad/nb_etablissements/apl_evolution now nullable
- `santescope/src/components/commune/ScoreDetail.tsx` - null guards for APL and urgences rows
- `santescope/src/components/commune/TwinPanel.tsx` - null guards for APL display and CompareValue, apl_evolution ?? {}
- `santescope/src/components/commune/CommuneEquipments.tsx` - separate "Donnees non disponibles" section for null equipment data
- `santescope/src/components/commune/ActionPathways.tsx` - === false checks instead of ! for nullable booleans
- `santescope/src/components/commune/CommuneView.tsx` - apl_evolution ?? {} passed to ScoreDetail
- `santescope/src/components/pdf/PdfExportContent.tsx` - null guards for apl/urgences comparisons and display
- `santescope/.gitignore` - removed /public/data/ exclusion lines
- `santescope/scripts/smoke-test.js` - new smoke test validating 5 demo communes

## Decisions Made

- Used `?? {}` at call sites rather than changing AplSparkline/AplEvolutionPanel signatures (minimal change, already handles empty objects)
- PdfExportContent apl comparison omitted from pointsForts/alertes when null (data unavailable, not misleadingly classified)
- Smoke test exits code 1 on any failure — suitable for CI integration

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Fixed PdfExportContent.tsx null guards for apl and temps_urgences_min**

- **Found during:** Task 1 (TypeScript compilation verification)
- **Issue:** PdfExportContent.tsx used `sd.apl > sd.apl_national` and `sd.temps_urgences_min < sd.temps_urgences_national` without null checks — TypeScript TS18047 errors after types.ts was updated
- **Fix:** Added `sd.apl != null &&` / `sd.temps_urgences_min != null &&` guards, display falls back to "N/D"
- **Files modified:** santescope/src/components/pdf/PdfExportContent.tsx
- **Verification:** `tsc --noEmit` exits 0
- **Committed in:** 32cd658 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical — cascading null propagation from types.ts change)
**Impact on plan:** Essential for TypeScript compliance. PdfExportContent was not in the plan's file list but was a direct consequence of the types.ts change.

## Issues Encountered

- node_modules not present in git worktree — installed via `npm install --prefer-offline` before running tsc verification. No impact on output files.

## Next Phase Readiness

- All null-safety bugs fixed; TypeScript compiles clean
- public/data/ unblocked from gitignore — next step is `git add santescope/public/data/` to stage 35K JSON files
- Smoke test ready to run against dev server or Vercel deploy URL
- Ready for 04-02: Vercel deploy and video demo

---
*Phase: 04-integration-deploy*
*Completed: 2026-04-08*
