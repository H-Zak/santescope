---
phase: 03-frontend-app
verified: 2026-04-08T00:00:00Z
status: gaps_found
score: 5/6 must-haves verified
re_verification: false
gaps:
  - truth: "PDF download produces a readable comparison report"
    status: partial
    reason: "PdfExportContent has a threshold bug: domino.pct_55_plus > 50 compares a decimal (0-1 range) against 50 instead of 0.5, so the 'Alerte succession médicale critique' line in the Alertes section of the PDF is never triggered. The download itself works and produces a readable PNG."
    artifacts:
      - path: "santescope/src/components/pdf/PdfExportContent.tsx"
        issue: "Line 99: `domino.pct_55_plus > 50` should be `domino.pct_55_plus > 0.5`. Real data shows pct_55_plus = 0.5696, so this comparison always evaluates to false."
    missing:
      - "Fix threshold: change `domino.pct_55_plus > 50` to `domino.pct_55_plus > 0.5` in PdfExportContent.tsx line 99"
human_verification:
  - test: "Verify PDF visual output matches dark-theme mockup"
    expected: "PNG download has teal header, DPE badge, résumé exécutif, indicateurs clés, scores par dimension, points forts/alertes, and footer"
    why_human: "html2canvas rendering cannot be verified programmatically without a browser environment"
  - test: "Verify search autocomplete feels fast on a real device"
    expected: "Typing in search shows results in under 100ms (excluding index load time)"
    why_human: "filterIndex is 0.1ms in Python simulation, but browser JS + React re-render latency needs human confirmation"
  - test: "Verify MiniMap placeholder is acceptable UX"
    expected: "The green blob silhouette with a pin and commune name conveys location intent even without real geo positioning"
    why_human: "coords are ignored (_coords alias) — visual judgment required"
---

# Phase 3: Frontend App Verification Report

**Phase Goal:** Next.js app with search, double-panel results, twins list, comparison, PDF export
**Verified:** 2026-04-08
**Status:** gaps_found — 1 minor bug, 5/6 success criteria fully verified
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (from ROADMAP.md Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Search bar filters 35K communes with <100ms response | VERIFIED | filterIndex runs in 0.1ms on 34,969 entries (Python simulation). 150ms debounce in SearchBar. LocalStorage cache on first load. |
| 2 | Results page shows double panel (my commune diagnostic / twin actions) | VERIFIED | DoublePanelLayout + CommuneView render left panel ("Ma commune") and right panel ("Commune jumelle"). All diagnostic components wired. |
| 3 | Alternative twins listed, clickable to swap | VERIFIED | TwinsList renders 3 cards + overflow button. onClick calls onSwap(i) → setActiveTwin → TwinPanel updates. Full wiring confirmed. |
| 4 | Free comparison mode works (pick any 2 communes) | VERIFIED | "Comparer avec..." button in CommuneView triggers inline search. router.push to /comparer/${a}/${b}. CompareView renders both communes with full diagnostics. |
| 5 | PDF download produces a readable comparison report | PARTIAL | Download works (html2canvas → PNG). Dark theme implemented with all sections. One bug: domino threshold comparison uses wrong scale (> 50 instead of > 0.5), so critical domino alert never appears in PDF. |
| 6 | Mini map renders commune location | VERIFIED (placeholder) | MiniMap renders green SVG blob + pin + commune name. coords prop received but aliased to _coords (ignored). Plan explicitly states "placeholder — Phase 4 will swap to real PNG images". |

**Score:** 5/6 truths verified (1 partial due to minor bug)

### Required Artifacts

| Artifact | Status | Details |
|----------|--------|---------|
| `src/lib/types.ts` | VERIFIED | Exports IndexEntry and CommuneData. Schema matches real JSON data (pct_55_plus, medecins_55_plus, projection_2030 field names align with public/data/communes/*.json). Note: type includes "full" and "minimal" as data_quality values but real data only uses "complete" and "partial" — DataQualityBanner handles this correctly. |
| `src/lib/constants.ts` | VERIFIED | Exports DPE_COLORS, DPE_TEXT_COLORS, DPE_LABELS, BAR_W, PRIMARY, ACCENT with correct values. |
| `src/lib/search.ts` | VERIFIED | filterIndex with accent normalization (NFD), startsWith-first ordering, max 8 results. |
| `src/hooks/useSearchIndex.ts` | VERIFIED | Fetches /data/index.json, caches 24h in localStorage. |
| `src/hooks/useCommuneData.ts` | VERIFIED | Fetches /data/communes/${code}.json, handles 404 and network errors. |
| `src/components/search/SearchBar.tsx` | VERIFIED | 150ms debounce, DPE score badge per result, keyboard nav, router.push on select. |
| `src/components/layout/Header.tsx` | VERIFIED | Sticky header with SanteScope logo + compact SearchBar. |
| `src/components/layout/DoublePanelLayout.tsx` | VERIFIED | flex-col on mobile, flex-row on md+, 50/50 split. |
| `src/components/commune/CommuneView.tsx` | VERIFIED | "use client", useCommuneData, activeTwin state, DoublePanelLayout, all diagnostic components, TwinsList, PdfExportContent, PdfDownloadButton. |
| `src/components/commune/ScoreBadge.tsx` | VERIFIED | DPE_COLORS + borderRadius, size prop, null handling. |
| `src/components/commune/DpeStrip.tsx` | VERIFIED | ["A","B","C","D","E"] tiles with active highlight. |
| `src/components/commune/ScoreGauge.tsx` | VERIFIED | BAR_W, DPE_COLORS, "Données insuffisantes" fallback. |
| `src/components/commune/ScoreDetail.tsx` | VERIFIED | All 4 components: APL, poverty, 75+ isolation, urgences. National comparison with ArrowUp/ArrowDown. |
| `src/components/commune/DominoAlert.tsx` | VERIFIED | pct_55_plus threshold (> 0.5 = critical red, else orange). Uses real field names from actual JSON schema. |
| `src/components/commune/MissingDoctors.tsx` | VERIFIED | "Spécialités manquantes" section with pathology context mapping. |
| `src/components/commune/MiniMap.tsx` | VERIFIED (placeholder) | coords prop present but unused (aliased _coords). SVG blob + pin + nom. Plan-documented placeholder. |
| `src/components/commune/DataQualityBanner.tsx` | VERIFIED | Returns null for "complete" or "full". Yellow banner for "partial"/"minimal". Handles real data correctly. |
| `src/components/commune/TwinPanel.tsx` | VERIFIED | similarite badge, "Actions réalisées" list, APL before/after with arrow, has_msp badge. |
| `src/components/commune/TwinsList.tsx` | VERIFIED | onSwap + activeTwinIndex + overflow "+N communes jumelées" button. |
| `src/components/compare/CompareView.tsx` | VERIFIED | "use client", useCommuneData called for codeA and codeB, "Mode comparaison libre" badge, DoublePanelLayout. |
| `src/app/page.tsx` | VERIFIED | Landing page with SearchBar fullScreen, hero layout, stats row "35 000 communes". |
| `src/app/commune/[code]/page.tsx` | VERIFIED | Server component, generateMetadata, renders CommuneView. No "use client" conflict. |
| `src/app/comparer/[a]/[b]/page.tsx` | VERIFIED | Server component, generateMetadata, renders CompareView. Shareable URL. |
| `src/components/pdf/PdfExportContent.tsx` | PARTIAL | id="pdf-export-root", visibility:hidden (not display:none), dark theme #232323, teal header #0F766E, all sections present. Bug: domino threshold at line 99 uses > 50 instead of > 0.5. |
| `src/components/pdf/PdfDownloadButton.tsx` | VERIFIED | Dynamic import("html2canvas"), scale:2, filename "santescope-{code}-{date}.png", loading spinner. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/app/page.tsx` | `SearchBar.tsx` | import and render | WIRED | `import { SearchBar }` + `<SearchBar fullScreen />` |
| `SearchBar.tsx` | `useSearchIndex.ts` | hook call | WIRED | `const { index, loading } = useSearchIndex()` |
| `useSearchIndex.ts` | `/data/index.json` | fetch at mount | WIRED | `fetch("/data/index.json")` with localStorage cache |
| `src/app/commune/[code]/page.tsx` | `CommuneView.tsx` | server renders client | WIRED | `import { CommuneView }` + `<CommuneView code={code} />` |
| `CommuneView.tsx` | `/data/communes/{code}.json` | useCommuneData | WIRED | `const { data, loading, error } = useCommuneData(code)` |
| `TwinsList.tsx` | `TwinPanel.tsx` | activeTwin state | WIRED | `activeTwinIndex={activeTwin}` + `onSwap={setActiveTwin}` → `activeTwinData = data.jumelles[activeTwin]` → `<TwinPanel twin={activeTwinData} />` |
| `ScoreBadge.tsx` | `constants.ts` | DPE_COLORS import | WIRED | `import { DPE_COLORS, DPE_TEXT_COLORS }` |
| `CommuneView.tsx` | `/comparer/[a]/[b]` | router.push on compare | WIRED | `router.push(\`/comparer/${currentCode}/${entry.code}\`)` at line 118 |
| `src/app/comparer/[a]/[b]/page.tsx` | `CompareView.tsx` | server renders client | WIRED | `import { CompareView }` + `<CompareView codeA={a} codeB={b} />` |
| `PdfDownloadButton.tsx` | `PdfExportContent.tsx` | html2canvas captures DOM element | WIRED | `document.getElementById("pdf-export-root")` matches `id="pdf-export-root"` in PdfExportContent |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `SearchBar.tsx` | `index` (IndexEntry[]) | `useSearchIndex` → `fetch("/data/index.json")` | Yes — 34,969 entries from real file | FLOWING |
| `CommuneView.tsx` | `data` (CommuneData) | `useCommuneData` → `fetch(/data/communes/${code}.json)` | Yes — real per-commune JSON files exist | FLOWING |
| `TwinPanel.tsx` | `twin` (jumelle) | Prop from CommuneView `data.jumelles[activeTwin]` | Yes — real jumelles array from commune JSON | FLOWING |
| `CompareView.tsx` | `data` (CommuneData x2) | `useCommuneData(codeA)` + `useCommuneData(codeB)` | Yes — both fetched from real JSON files | FLOWING |
| `PdfExportContent.tsx` | `commune` (CommuneData) | Prop from CommuneView when `data` loaded | Yes — same data object as display | FLOWING |
| `MiniMap.tsx` | `coords` | Prop from CommuneView `data.coords` | Received but ignored (_coords alias) | STATIC (documented placeholder) |

### Behavioral Spot-Checks

| Behavior | Check | Result | Status |
|----------|-------|--------|--------|
| index.json exists and has 34,969 entries | `python3 -c "import json; d=json.load(open('public/data/index.json')); print(len(d))"` | 34969 | PASS |
| filterIndex performance on 35K entries | Simulated in Python: query "saint" on 34969 entries | 0.1ms | PASS |
| Build compiles cleanly | `npm run build` | 4 routes compiled, TypeScript passed | PASS |
| Per-commune JSON files exist | `ls public/data/communes/*.json \| wc -l` | multiple files present | PASS |
| Real data has required fields | Sampled 51041.json | All CommuneData fields present | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| UI-01 | 03-01 | Search bar with client-side autocomplete on commune name/code | SATISFIED | SearchBar with filterIndex, 150ms debounce, localStorage cache |
| UI-02 | 03-02 | Results page with double-panel layout (my commune / twin commune) | SATISFIED | DoublePanelLayout + CommuneView |
| UI-03 | 03-02 | My commune panel: score, score detail, missing doctors, domino alert | SATISFIED | ScoreBadge, ScoreGauge, ScoreDetail, DominoAlert, MissingDoctors all rendered in left panel |
| UI-04 | 03-02 | Twin commune panel: similarity %, actions taken, APL before/after | SATISFIED | TwinPanel renders similarite, actions[], apl_avant, apl_apres, has_msp |
| UI-05 | 03-02 | List of alternative twins with click-to-swap | SATISFIED | TwinsList with onSwap handler wired to setActiveTwin |
| UI-06 | 03-03 | Free comparison mode (user picks any 2 communes) | SATISFIED | "Comparer avec..." inline search → /comparer/[a]/[b] → CompareView |
| UI-07 | 03-03 | Basic PDF export of comparison report | PARTIAL | Download works and produces readable PNG. Domino critical threshold bug in Alertes section. |
| UI-08 | 03-02 | Mini map showing commune location | SATISFIED (placeholder) | MiniMap renders SVG placeholder with commune name. Phase 4 will add real geo. |

All 8 UI requirements (UI-01 through UI-08) claimed by plans 03-01, 03-02, 03-03 are accounted for. No orphaned requirements.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `PdfExportContent.tsx` | 99 | `domino.pct_55_plus > 50` — wrong scale for decimal field | Warning | Critical domino alert never appears in PDF Alertes section (real values are 0.0-1.0, never > 50) |
| `MiniMap.tsx` | 6 | `coords: _coords` — prop received but unused | Info | No actual geo positioning. Documented as placeholder. |

No TODO/FIXME/placeholder comments found in production code. No empty implementations (return null/[]/{}). No stubs blocking core flows.

### Schema Alignment Note

The TypeScript `CommuneData.domino` type in `src/lib/types.ts` uses field names `medecins_55_plus`, `pct_55_plus`, `pct_55_plus_dept`, `projection_2030` — these match the real JSON data exactly (verified against `public/data/communes/47195.json`). The plan document (03-02) referenced an older schema (`pct_55plus`, `dept_avg`, `pertes_2030`) but the implementation correctly updated to the real field names.

`data_quality` in real data uses `"complete"` and `"partial"`. The type definition also allows `"full"` and `"minimal"`, which are unused. DataQualityBanner checks `quality === "complete" || quality === "full"` — correctly handles real data.

### Human Verification Required

**1. PDF visual output**
Test: Navigate to any commune page (e.g. /commune/59392), click "Télécharger le rapport", open the downloaded PNG.
Expected: Dark-themed card with teal header, DPE badge, résumé exécutif with 3 auto-generated lines, indicateurs clés grid, scores par dimension bars, points forts/alertes columns, source footer.
Why human: html2canvas rendering cannot be asserted programmatically without a browser.

**2. Search autocomplete responsiveness**
Test: Load landing page, wait for index to load, type "saint".
Expected: Dropdown appears with results showing DPE-colored badges, commune name, department, population within ~200ms of typing.
Why human: Browser JS event loop + React render latency cannot be measured from static analysis.

**3. MiniMap placeholder acceptability**
Test: Check the green blob + pin + commune name on any commune page.
Expected: Conveys geographic identity well enough for a hackathon demo. coords are ignored but Phase 4 will add real geo.
Why human: UX judgment call on whether placeholder is "good enough" for demo purposes.

### Gaps Summary

One gap found: a minor threshold bug in PdfExportContent (line 99) where `domino.pct_55_plus > 50` should be `> 0.5`. This means communes with critical medical succession risk (55+ doctors proportion) never show the "Alerte succession médicale critique" line in the PDF Alertes section. The download still works and all other PDF sections are correct.

The bug is isolated to one line and does not affect the main app UI (DominoAlert.tsx uses the correct threshold `> 0.5`).

---

_Verified: 2026-04-08_
_Verifier: Claude (gsd-verifier)_
