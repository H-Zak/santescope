# Phase 3: Frontend App - Research

**Researched:** 2026-04-08
**Domain:** Next.js 15 App Router, Tailwind CSS, shadcn/ui, html2canvas
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Santé DPE-coloré theme — teal primary (#0F766E), sky accent (#0EA5E9), DPE A-E scale (A=#22C55E, B=#A3E635, C=#FACC15, D=#F97316, E=#EF4444)
- **D-02:** Typography: Inter 400/600/700. Cards: border-radius 8px. Neutral backgrounds: #F0FDF4 / #1E293B
- **D-03:** UI framework: Tailwind CSS + shadcn/ui components
- **D-04:** Interface entirely in French (labels, texts, tooltips). Code variables/components in English. No i18n.
- **D-05:** App is light theme. PDF export uses separate dark theme (see D-20).
- **D-06:** Landing page: full-screen search hero with centered search bar + tagline ("Le diagnostic sante de votre commune") + stats (35K communes, 200K medecins, 9 sources open data)
- **D-07:** Autocomplete dropdown shows: commune name + department + score badge A-E colored. Ex: "Saint-Quentin (02) [E]"
- **D-08:** Client-side filter on index.json with 150ms debounce. No fuzzy search library — simple startsWith/includes matching.
- **D-09:** index.json (~500Ko) loaded at app mount. Skeleton search bar while loading. localStorage cache.
- **D-10:** Side-by-side 50/50 layout. Left panel = "Ma commune" (diagnostic). Right panel = "Commune jumelle" (actions).
- **D-11:** Score displayed as DPE badge + horizontal gauge bar + numeric value (7.2/10) + classification label ("Tres vulnerable")
- **D-12:** Score detail: 4 components (APL, pauvrete, 75+ isoles, urgences) each with value + national median comparison (dots or mini bars)
- **D-13:** Alternative twins displayed as horizontal card row below the double-panel. 3 shown, "+N" button for remaining. Click swaps the active twin in the right panel.
- **D-14:** Domino alert: colored callout block (orange-50 background, orange-400 border). Content: "N/M medecins ont 55+ ans (X% — moy dept: Y%)" + "Estimation 2030: -N medecins". Red background if % > 50%.
- **D-15:** Missing specialties: bullet list with pathology context. Ex: "Endocrinologue — Diabete: 1.35x moy. nat."
- **D-16:** Communes with data_quality "partial"/"minimal": yellow warning banner at top + missing sections grayed out with "Non disponible". Score null → "Donnees insuffisantes" (no badge).
- **D-17:** "Comparer avec..." button opens a second search field. Selected commune replaces the twin in right panel.
- **D-18:** URL: `/comparer/[code1]/[code2]` — shareable.
- **D-19:** Static image pre-generated in notebooks (matplotlib), served as PNG from public/data/. No JavaScript map library.
- **D-20:** ORS/ARS institutional style with dark background — follows mockup.html template exactly.
- **D-21:** PDF structure: teal header → DPE badge + A-E scale → Resume executif → Indicateurs cles → Scores par dimension → Points forts / Alertes → Footer sources
- **D-22:** html2canvas to capture the PDF component as image, then download. PDF component is a hidden DOM element styled differently from the app (dark theme).
- **D-23:** Adapt mockup from 12 dimensions to our 4 components (APL, pauvrete, 75+ isoles, urgences)
- **D-24:** Next.js App Router. Routes: `/` (landing), `/commune/[code]` (dynamic), `/comparer/[a]/[b]` (dynamic)
- **D-25:** Header on all pages (except landing hero): logo (→ home) + persistent search bar
- **D-26:** URLs shareable and SEO-friendly
- **D-27:** Desktop-first. Mobile (<768px): panels stack vertically. Minimal effort — Tailwind flex-col breakpoint.
- **D-28:** index.json fetched at mount, cached in localStorage. Commune JSON (~2Ko) fetched on navigation.
- **D-29:** Skeleton loading for search bar (during index fetch) and panels (during commune fetch).

### Claude's Discretion

- Exact shadcn/ui components to use (Card, Dialog, Command, etc.)
- Search filtering algorithm details (startsWith priority over includes, etc.)
- Skeleton component design
- Mock data structure (3-5 hardcoded communes matching frozen JSON schema)
- Exact responsive breakpoints beyond the 768px mobile threshold
- html2canvas configuration and PDF quality settings

### Deferred Ideas (OUT OF SCOPE)

- Interactive Leaflet/Mapbox map — V2
- Fuzzy search with Fuse.js — V2
- Dark mode for the app — V2
- Styled/branded PDF with proper PDF library (jsPDF, react-pdf) — V2
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| UI-01 | Search bar with client-side autocomplete on commune name/code | D-08/D-09: index.json loaded at mount, 150ms debounce, startsWith/includes |
| UI-02 | Results page with double-panel layout (my commune | twin commune) | D-10: 50/50 side-by-side, Tailwind flex layout |
| UI-03 | My commune panel: score, score detail, missing doctors, domino alert | D-11/D-12/D-14/D-15: DPE badge + gauge + 4 components + domino callout |
| UI-04 | Twin commune panel: similarity %, actions taken, APL before/after | D-10: right panel, jumelles[0] data from JSON |
| UI-05 | List of alternative twins with click-to-swap | D-13: horizontal card row, 3 shown, "+N" button |
| UI-06 | Free comparison mode (user picks any 2 communes) | D-17/D-18: "Comparer avec..." button, /comparer/[a]/[b] URL |
| UI-07 | Basic PDF export of comparison report | D-22: html2canvas capture of hidden dark-themed DOM element |
| UI-08 | Mini map showing commune location | D-19: static PNG from public/data/, served as img tag |
</phase_requirements>

---

## Summary

Phase 3 is a greenfield Next.js 15 App Router application. The data layer is already complete — 34,969 per-commune JSON files and a 500KB index.json are deployed in `public/data/`. No mock data needs to be created; real data is already available and matches the frozen schema documented below.

The tech stack is fully locked: Next.js App Router, Tailwind CSS v4, shadcn/ui for components, html2canvas for PDF export, and static PNG images for the map (no JS map library). The JSX mockup at `mockup/santescope-app.jsx` provides directly reusable React components (ScoreBadge, DpeStrip, MetricCard, DimensionBars) that implement the correct design system. The PDF mockup at `mockup/santescope-mockup-pdf.html` provides exact HTML/CSS to port to a hidden React component.

The critical implementation challenge is the search experience: loading a 500KB JSON at mount with localStorage caching, rendering a debounced autocomplete dropdown, and managing client/server boundary correctly (the index must be loaded in a client component). The second challenge is html2canvas for PDF — it requires `scale` config for quality and `useCORS: true` for any external assets.

**Primary recommendation:** Bootstrap with `npx create-next-app@latest`, install Tailwind v4 + shadcn/ui via CLI, then copy-adapt the existing mockup JSX as the foundation for components — do not rewrite what already exists.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 15.2.4 | App Router framework, SSR/static routes | Locked decision D-24 |
| react | 19.x | UI runtime | Bundled with Next.js 15 |
| tailwindcss | 4.2.2 | Utility CSS | Locked decision D-03 |
| shadcn/ui | latest CLI | Pre-built accessible components | Locked decision D-03 |
| html2canvas | 1.4.1 | Capture DOM as canvas for PDF download | Locked decision D-22 |
| lucide-react | 1.7.0 | Icon set (shadcn default, consistent with design) | shadcn/ui default |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| clsx | 2.1.1 | Conditional className merging | Component className logic |
| class-variance-authority | 0.7.1 | Variant-based component styles | shadcn/ui internals |
| @radix-ui/react-dialog | 1.1.15 | Accessible modal (comparison picker) | UI-06 comparison mode |
| cmdk | 1.1.1 | Command palette/combobox base | Used by shadcn Command — autocomplete |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| html2canvas | jsPDF + react-pdf | V2 decision — html2canvas simpler for pixel-perfect dark template |
| static PNG maps | Leaflet/Mapbox | Deferred to V2 — no JS map library in scope |
| startsWith/includes | Fuse.js | Deferred to V2 — sufficient for exact commune names |

**Installation:**

```bash
npx create-next-app@latest santescope --typescript --tailwind --app --src-dir --import-alias "@/*"
cd santescope
npx shadcn@latest init
npx shadcn@latest add card button input command dialog skeleton badge
npm install html2canvas lucide-react clsx
```

**Version verification (confirmed 2026-04-08):**
- `next`: 16.2.2 (latest published, confirmed via `npm view next version`)
- `tailwindcss`: 4.2.2 (confirmed)
- `html2canvas`: 1.4.1 (confirmed)
- `lucide-react`: 1.7.0 (confirmed)
- Note: `shadcn` CLI is 4.2.0; `shadcn-ui` package (deprecated) is 0.9.5 — use `npx shadcn@latest`

---

## Real Data Contract (Already Available)

**Critical finding:** No mock data needed. Real JSON files are already deployed.

### index.json — Search Index

Location: `public/data/index.json`
Size: ~500KB, 34,969 entries

```typescript
// Each entry in the array:
interface IndexEntry {
  code: string;       // "01001" — INSEE 5-digit code
  nom: string;        // "L'Abergement-Clémenciat"
  dept: string;       // "01"
  score: number;      // 3.6 — may be null for insuffisantes
  classe: string;     // "A"|"B"|"C"|"D"|"E"
  pop: number;        // 860
}
```

### Per-commune JSON — Full Detail

Location: `public/data/communes/{code}.json`
Size: ~2KB each

```typescript
interface CommuneData {
  code: string;
  nom: string;
  dept: string;
  region: string;
  pop: number;
  score: number | null;          // null = "Donnees insuffisantes"
  classe: "A"|"B"|"C"|"D"|"E" | null;
  data_quality: "full" | "partial" | "minimal";
  score_detail: {
    apl: number;
    apl_national: number;
    pauvrete: number | null;     // null for small communes (statistical secrecy)
    pauvrete_national: number;
    pct_75_seuls: number;
    pct_75_seuls_national: number;
    temps_urgences_min: number;
    temps_urgences_national: number;
  };
  medecins: {
    generalistes: number;
    specialistes: Record<string, number>;
    total: number;
  };
  manques: string[] | null;      // e.g. ["Endocrinologue", "Cardiologue"]
  domino: {
    pct_55plus: number;
    dept_avg: number;
    pertes_2030: number;
  } | null;
  jumelles: Array<{
    code: string;
    nom: string;
    similarite: number;          // 0-1
    actions: string[];           // e.g. ["APL: 1.5 -> 1.9", "MSP installee (1 MSP)"]
    apl_avant: number;
    apl_apres: number;
    has_msp: boolean;
  }>;
  msp_presente: boolean;
  apl_evolution: Record<string, number>;  // year: value, e.g. {"2022": 1.9, "2023": 1.9}
  pathologies_dept: {
    diabete: number;
    cardiovasculaire: number;
    psychiatrique: number;
    cancers: number;
    respiratoire: number;
  };
  coords: [number, number];      // [lat, lng] — for mini map placement
}
```

**Important nullability:**
- `score` and `classe` can be null (score_quality rule: <3/4 components → null)
- `pauvrete` is null for ~88% of communes (statistical secrecy for small populations)
- `domino` can be null (no domino alert for this commune)
- `manques` can be null (no missing specialties identified)
- `pathologies_dept` maps specialty gaps to pathology rates — use these to display "Endocrinologue — Diabete: 1.35x moy. nat." but the calculation must be done in frontend (ratio = pathologies_dept.diabete / national_reference)

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── page.tsx                     # Landing — search hero
│   ├── commune/
│   │   └── [code]/
│   │       └── page.tsx             # Results double-panel
│   ├── comparer/
│   │   └── [a]/
│   │       └── [b]/
│   │           └── page.tsx         # Free comparison mode
│   ├── layout.tsx                   # Root layout (Inter font, metadata)
│   └── globals.css                  # Tailwind base + CSS vars
├── components/
│   ├── search/
│   │   ├── SearchBar.tsx            # Autocomplete input (client)
│   │   └── SearchDropdown.tsx       # Results dropdown
│   ├── commune/
│   │   ├── CommunePanel.tsx         # Left (diagnostic) or right (twin) panel
│   │   ├── ScoreBadge.tsx           # DPE-colored A-E badge
│   │   ├── DpeStrip.tsx             # A-E strip with active highlight
│   │   ├── ScoreGauge.tsx           # Horizontal gauge bar
│   │   ├── ScoreDetail.tsx          # 4 components with national comparison
│   │   ├── DominoAlert.tsx          # Orange/red callout block
│   │   ├── MissingDoctors.tsx       # Bullet list of manques with pathology
│   │   ├── TwinsList.tsx            # Horizontal card row of alternatives
│   │   └── MiniMap.tsx              # Static PNG image
│   ├── layout/
│   │   ├── Header.tsx               # Logo + persistent search bar
│   │   └── DoublePanelLayout.tsx    # 50/50 flex container
│   ├── pdf/
│   │   └── PdfExport.tsx            # Hidden dark-theme DOM component
│   └── ui/                          # shadcn generated components
├── lib/
│   ├── search.ts                    # Index loading, debounce, filter logic
│   ├── constants.ts                 # DPE colors, score thresholds, labels
│   └── types.ts                     # TypeScript interfaces for JSON schema
└── hooks/
    ├── useSearchIndex.ts            # Loads index.json with localStorage cache
    └── useCommuneData.ts            # Fetches commune JSON by code
```

### Pattern 1: Client-Side Search Index with localStorage Cache

**What:** Load index.json once at app mount in a client component, cache in localStorage with a TTL, filter in memory with debounce.

**When to use:** Any time the search bar is rendered.

```typescript
// hooks/useSearchIndex.ts
"use client";
import { useState, useEffect } from "react";
import type { IndexEntry } from "@/lib/types";

const CACHE_KEY = "santescope_index";
const CACHE_TTL = 86400000; // 24h

export function useSearchIndex() {
  const [index, setIndex] = useState<IndexEntry[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, ts } = JSON.parse(cached);
      if (Date.now() - ts < CACHE_TTL) {
        setIndex(data);
        setLoading(false);
        return;
      }
    }
    fetch("/data/index.json")
      .then(r => r.json())
      .then((data: IndexEntry[]) => {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
        setIndex(data);
      })
      .finally(() => setLoading(false));
  }, []);

  return { index, loading };
}
```

### Pattern 2: Debounced Search Filter

**What:** Two-pass filter — startsWith results ranked before includes results.

```typescript
// lib/search.ts
export function filterIndex(index: IndexEntry[], query: string): IndexEntry[] {
  const q = query.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
  const starts: IndexEntry[] = [];
  const includes: IndexEntry[] = [];
  for (const entry of index) {
    const name = entry.nom.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
    if (name.startsWith(q) || entry.code.startsWith(query)) starts.push(entry);
    else if (name.includes(q)) includes.push(entry);
    if (starts.length + includes.length >= 8) break;
  }
  return [...starts, ...includes].slice(0, 8);
}
```

**Note:** Normalization strips accents for matching — "saint" matches "Saint-Quentin". This is essential for correct French commune name search.

### Pattern 3: Next.js Dynamic Route + Commune Fetch

```typescript
// app/commune/[code]/page.tsx — server component
export default async function CommunePage({ params }: { params: { code: string } }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/data/communes/${params.code}.json`);
  if (!res.ok) notFound();
  const commune: CommuneData = await res.json();
  return <CommuneView data={commune} />;
}

export async function generateMetadata({ params }: { params: { code: string } }) {
  // SEO: D-26
  return { title: `SanteScope — Commune ${params.code}` };
}
```

**Alternative for static export (Vercel):** Since all files are in `public/`, they can also be fetched client-side. Server-side fetch works for SSR; client-side works for static export. Recommend server-side for SEO (D-26).

### Pattern 4: html2canvas PDF Export

**What:** Hidden div with dark-themed component rendered off-screen, captured as PNG, downloaded via anchor tag.

```typescript
// components/pdf/PdfExport.tsx
"use client";
import html2canvas from "html2canvas";

export function downloadPdf(elementId: string, filename: string) {
  const el = document.getElementById(elementId);
  if (!el) return;
  html2canvas(el, {
    scale: 2,          // 2x for retina quality
    useCORS: true,     // required if any external assets (fonts loaded from Google)
    backgroundColor: "#1a1a1a",  // matches mockup dark background
    logging: false,
  }).then(canvas => {
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}
```

**Pitfall:** The hidden component must be rendered in the DOM (not conditionally removed). Use `visibility: hidden` + `position: absolute` + `pointer-events: none`, not `display: none`. html2canvas cannot capture elements with `display: none`.

### Pattern 5: Twin Swap State Management

**What:** URL-driven state. Active twin index stored as URL search param or derived from route.

```typescript
// On /commune/[code] page
// jumelles[0] = default active twin
// Twin swap: update URL or use local state
const [activeTwin, setActiveTwin] = useState(0);
// On swap: setActiveTwin(idx) — no navigation needed
// On "Comparer avec...": router.push(`/comparer/${code}/${selectedCode}`)
```

### Anti-Patterns to Avoid

- **Server Component with localStorage:** `useEffect` and localStorage only in `"use client"` components. Search index MUST be client-side.
- **Fetching index.json on every keystroke:** Load once at mount, filter in memory.
- **display:none on PDF component:** Use `visibility:hidden` + `position:absolute` instead — html2canvas requires DOM rendering.
- **Importing html2canvas at module level in SSR:** Must be dynamically imported client-side only (`import("html2canvas")`).
- **Missing accent normalization in search:** French commune names have accents — normalize both query and index entry before comparison.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Accessible dropdown | Custom div-based dropdown | shadcn Command component (cmdk) | Keyboard navigation, ARIA, focus trap |
| Accessible modal (comparison picker) | div overlay | shadcn Dialog (@radix-ui) | Focus trap, escape key, screen reader |
| Skeleton loading | CSS animation from scratch | shadcn Skeleton component | Consistent pulse animation |
| Score badge color mapping | Inline style logic everywhere | `constants.ts` color map + clsx | Single source of truth for D-01 colors |
| Debounce | `setTimeout` manual implementation | `useCallback` + `useRef` pattern | Avoid stale closure bugs |

**Key insight:** The existing `mockup/santescope-app.jsx` already implements ScoreBadge, DpeStrip, MetricCard, DimensionBars, MiniMap as self-contained React components with correct colors. Port these directly, don't rewrite.

---

## Common Pitfalls

### Pitfall 1: localStorage Not Available During SSR

**What goes wrong:** `useSearchIndex` hook calls `localStorage.getItem` on server — throws ReferenceError.

**Why it happens:** Next.js App Router runs server components by default. Even client components' module-level code may be evaluated during SSR.

**How to avoid:** Wrap localStorage access in `useEffect` (already shown in Pattern 1). Never access localStorage outside `useEffect` or event handlers.

### Pitfall 2: html2canvas Fails on display:none Elements

**What goes wrong:** PDF download produces blank canvas or zero-size image.

**Why it happens:** html2canvas measures element dimensions — display:none collapses them to 0.

**How to avoid:** Style the hidden PDF component with:
```css
position: absolute;
left: -9999px;
top: 0;
visibility: hidden;
pointer-events: none;
width: 620px;  /* match mockup max-width */
```

### Pitfall 3: html2canvas SSR Import Error

**What goes wrong:** Build fails with "window is not defined" or "document is not defined".

**Why it happens:** html2canvas accesses browser globals at import time.

**How to avoid:** Always import dynamically inside the event handler:
```typescript
const html2canvas = (await import("html2canvas")).default;
```

### Pitfall 4: Search Performance on 34,969 Entries

**What goes wrong:** Filtering 35K entries on every keystroke causes visible lag.

**Why it happens:** JavaScript string operations on 35K objects × 150ms debounce can still exceed frame budget if not early-exited.

**How to avoid:** The filter in Pattern 2 breaks early once 8 results are found. This ensures O(K) not O(N) in practice for popular prefixes.

### Pitfall 5: Null Score Handling

**What goes wrong:** Score badge renders "null" or crashes on communes with null score.

**Why it happens:** 14+ communes with <3/4 components have `score: null` and `classe: null`.

**How to avoid:** Guard every score/classe render:
```typescript
{commune.score !== null ? <ScoreBadge classe={commune.classe} /> : <span>Données insuffisantes</span>}
```

### Pitfall 6: data_quality Banner Missing

**What goes wrong:** Partial-data communes show same UI as full-data, misleading users.

**Why it happens:** D-16 requires yellow warning banner — easy to forget in initial implementation.

**How to avoid:** Add banner at top of CommunePanel when `data_quality !== "full"`. Gray out null sections.

### Pitfall 7: Static Map Images Not Yet Generated

**What goes wrong:** MiniMap component references PNGs that don't exist in `public/data/`.

**Why it happens:** D-19 requires static images pre-generated by notebooks (Phase 2/4). No map images exist yet — only commune JSONs include `coords: [lat, lng]`.

**How to avoid for Plan 03-01/03-02:** Implement MiniMap as a placeholder SVG (as in the existing `santescope-app.jsx`) using the `coords` field to show lat/lng. Real PNG images will be wired in Phase 4. The component interface should accept `coords: [number, number]` and `nom: string` — swap to `<img src={...}>` in Phase 4 without changing props.

---

## Code Examples

### DPE Color Constants (from confirmed design decisions)

```typescript
// lib/constants.ts
export const DPE_COLORS: Record<string, string> = {
  A: "#22C55E",
  B: "#A3E635",
  C: "#FACC15",
  D: "#F97316",
  E: "#EF4444",
};

export const DPE_TEXT_COLORS: Record<string, string> = {
  A: "#fff",
  B: "#1a2e05",
  C: "#412402",
  D: "#fff",
  E: "#fff",
};

export const DPE_LABELS: Record<string, string> = {
  A: "Très favorable",
  B: "Favorable",
  C: "Modéré",
  D: "Vulnérable",
  E: "Très vulnérable",
};

export const PRIMARY = "#0F766E";   // teal
export const ACCENT  = "#0EA5E9";   // sky
```

### Score Gauge Bar

```typescript
// BAR_W maps from existing mockup
const BAR_W: Record<string, string> = { A: "90%", B: "75%", C: "55%", D: "42%", E: "28%" };

function ScoreGauge({ classe }: { classe: string }) {
  return (
    <div className="w-full bg-slate-100 rounded h-3 overflow-hidden">
      <div
        className="h-full rounded transition-all"
        style={{ width: BAR_W[classe], background: DPE_COLORS[classe] }}
      />
    </div>
  );
}
```

### Domino Alert (D-14)

```typescript
function DominoAlert({ domino }: { domino: NonNullable<CommuneData["domino"]> }) {
  const isCritical = domino.pct_55plus > 0.5;
  return (
    <div className={`rounded-lg border p-4 ${isCritical ? "bg-red-50 border-red-400" : "bg-orange-50 border-orange-400"}`}>
      <p className="text-sm font-medium text-orange-900">
        {Math.round(domino.pct_55plus * 100)}% des médecins ont 55+ ans
        <span className="text-orange-600 ml-1">(moy. dept: {Math.round(domino.dept_avg * 100)}%)</span>
      </p>
      <p className="text-sm text-orange-800 mt-1">
        Estimation 2030 : -{domino.pertes_2030} médecins
      </p>
    </div>
  );
}
```

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js runtime | ✓ | 25.2.1 | — |
| npm | Package install | ✓ | 11.6.2 | — |
| Next.js (global) | Dev server | ✓ | 16.2.2 | — |
| Static JSON data | UI-01..08 | ✓ | 34,969 communes | — |
| Static map PNGs | UI-08 | ✗ | — | SVG placeholder using coords field |

**Missing dependencies with fallback:**
- Static map PNGs: Use coord-based SVG placeholder in Plans 03-01/03-02. Wire real PNGs in Phase 4 (generated by Phase 2 notebooks). Component API stays identical — swap `<svg>` for `<img>` without prop changes.

---

## Validation Architecture

nyquist_validation is enabled per `.planning/config.json`.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected — greenfield Next.js |
| Config file | None — create in Wave 0 |
| Quick run command | `npm run build` (type-check + build validation) |
| Full suite command | `npm run build && npm run lint` |

**Note:** REQUIREMENTS.md explicitly marks "Formal test suite" as out-of-scope. No test files are expected. Validation = TypeScript type-check + build success + manual browser verification.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| UI-01 | Search bar loads index, filters with autocomplete | Manual | `npm run build` (type safety) | ❌ Wave 0 |
| UI-02 | Double-panel layout renders on /commune/[code] | Manual | `npm run build` | ❌ Wave 0 |
| UI-03 | My commune panel shows score, domino, manques | Manual | `npm run build` | ❌ Wave 0 |
| UI-04 | Twin panel shows similarity %, actions, APL before/after | Manual | `npm run build` | ❌ Wave 0 |
| UI-05 | Alternative twins row, click-to-swap | Manual | `npm run build` | ❌ Wave 0 |
| UI-06 | Comparison mode, shareable URL /comparer/[a]/[b] | Manual | `npm run build` | ❌ Wave 0 |
| UI-07 | PDF download produces readable PNG | Manual | `npm run build` | ❌ Wave 0 |
| UI-08 | Mini map shows commune location | Manual | `npm run build` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npm run build` (catches TypeScript errors)
- **Per wave merge:** `npm run build && npm run lint`
- **Phase gate:** Manual browser verification against success criteria before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/lib/types.ts` — TypeScript interfaces matching frozen JSON schema
- [ ] `src/lib/constants.ts` — DPE colors, labels, thresholds
- [ ] `next.config.ts` — output settings for Vercel static export
- [ ] `.eslintrc.json` — Next.js ESLint config (created by `create-next-app`)

*(No test framework files needed — formal test suite is explicitly out-of-scope per REQUIREMENTS.md)*

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Next.js Pages Router | App Router | Next.js 13 (2022) | Server components, layouts, nested routes |
| tailwindcss + PostCSS config | Tailwind v4 CSS-first config | Tailwind v4 (2025) | No `tailwind.config.js` needed, configure via `@theme` in CSS |
| `npx create-next-app` + manual shadcn | `npx shadcn@latest init` | shadcn 2024 | CLI handles component installation |

**Tailwind v4 critical change:** No `tailwind.config.js`. Configuration is done in `globals.css` via `@theme {}`. The `@apply` directive still works. This affects Plan 03-01 — do not create a `tailwind.config.js`.

**Deprecated/outdated:**
- `shadcn-ui` package: replaced by `shadcn` CLI — do NOT install `shadcn-ui` (version 0.9.5 on npm, deprecated)
- `pages/` directory pattern: use `app/` directory exclusively (App Router, D-24)

---

## Open Questions

1. **pathologies_dept ratio calculation for missing doctors display**
   - What we know: `pathologies_dept.diabete = 5.86` (prevalence rate, not a ratio)
   - What's unclear: What is the national reference to compute "1.35x moy. nat." as shown in D-15?
   - Recommendation: Display raw pathologies_dept values with dept label, not as a ratio, until Phase 2 CONTEXT.md clarifies the national baseline. Or use a hardcoded national reference from datasets-santescope.md.

2. **Static map PNG path convention**
   - What we know: D-19 says serve from `public/data/`. Commune `coords: [lat, lng]` exists.
   - What's unclear: When notebooks generate PNGs, what will the filename pattern be? `{code}.png`?
   - Recommendation: Implement MiniMap with `src={/data/maps/${code}.png}` and an SVG fallback for missing files. Wire up once Phase 4 generates images.

3. **Score display value — 0-10 numeric**
   - What we know: D-11 says display "7.2/10". But actual scores are in range [1.0, 6.1] (per STATE.md decisions log).
   - What's unclear: Should the displayed value be the raw score (e.g., "3.6/10") or rescaled?
   - Recommendation: Display raw score from JSON (e.g., "3.6/10") — don't rescale. The A-E badge provides the intuitive classification.

---

## Sources

### Primary (HIGH confidence)

- Direct inspection of `public/data/communes/01001.json` and `public/data/index.json` — actual schema
- `mockup/santescope-app.jsx` — reusable React components with correct design system
- `mockup/santescope-mockup-pdf.html` — exact HTML/CSS for PDF component
- `.planning/phases/03-frontend-app/03-CONTEXT.md` — all locked decisions
- `npm view next version` — confirmed 16.2.2 (2026-04-08)
- `npm view tailwindcss version` — confirmed 4.2.2
- `npm view html2canvas version` — confirmed 1.4.1

### Secondary (MEDIUM confidence)

- html2canvas known behavior re: `display:none` — verified against html2canvas GitHub issues and documentation patterns
- Next.js App Router server/client boundary behavior — well-documented pattern

### Tertiary (LOW confidence)

- Tailwind v4 "no tailwind.config.js" behavior — training knowledge, verify against official docs at setup time

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — versions confirmed via npm registry live check
- Architecture: HIGH — based on frozen JSON schema confirmed from actual deployed files
- Pitfalls: HIGH — html2canvas and localStorage patterns are well-known, confirmed against actual data nullability
- Open questions: MEDIUM — require Phase 2 CONTEXT.md and datasets-santescope.md to resolve fully

**Research date:** 2026-04-08
**Valid until:** 2026-04-15 (7 days — fast-moving hackathon context)
