# Phase 4: Integration & Deploy - Research

**Researched:** 2026-04-08
**Domain:** Next.js 16 deployment on Vercel, smoke testing, hackathon submission assets
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Polish ciblé — smoke test + corrections visuelles ciblées (alignements, textes tronqués, edge cases données manquantes). Pas de micro-interactions.
- **D-02:** Découvrir les bugs pendant le smoke test, pas de bugs connus à ce stade.
- **D-03:** Vérifier tout — données manquantes, visuel ET impact jury. Pas de compromis ni de priorisation partielle.
- **D-04:** Fichiers JSON statiques dans `public/data/` — Vercel les sert directement via CDN. Pas d'API route ni de bundle.
- **D-05:** URL Vercel par défaut (santescope.vercel.app ou similaire). Pas de domaine personnalisé.
- **D-06:** Commit les 35K JSONs dans git (~40Mo) pour que Vercel déploie depuis le repo. Retirer l'exclusion de `public/data/` du .gitignore.
- **D-07:** Dossier complet : README propre + vidéo démo (screen recording 2-3min) + slides de pitch.
- **D-08:** Slides HTML/Reveal.js dans le repo (page standalone ou route /pitch). Codé par Claude, versionné.
- **D-09:** Préparer le minimum standard en attendant les règles de soumission exactes. README : description, stack, lancement, screenshots, URL déployée, sources données.
- **D-10:** 5 communes de test : Paris (75056), Saint-Quentin (02691), Maubeuge (59392), Sedan (08409), + une petite commune rurale.
- **D-11:** Vérification automatisée + manuelle : script qui fetch les 5 JSONs et vérifie les champs, puis navigation manuelle pour le visuel (search → diagnostic → jumelle → comparer → PDF).

### Claude's Discretion

- Choix de la commune rurale pour le 5e test (petite commune avec données complètes)
- Configuration Vercel (vercel.json si nécessaire, settings de build)
- Exact Reveal.js setup et structure des slides
- Outil de screen recording pour la vidéo démo
- Ordre des corrections polish (tant que tout est couvert)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DEP-01 | App deployed on Vercel with public URL | D-04/D-05 locked: git-based deploy from GitHub. Build confirmed clean. gitignore edit required. |
| DEP-02 | JSONs served from public/data/ directory (no backend) | Data already in public/data/ (34969 files, 155MB). Served as static CDN assets by Vercel. |
| DEP-03 | Code on GitHub repository | No GitHub remote configured yet. Need `gh repo create` + push. |

</phase_requirements>

## Summary

Phase 4 is a deployment and polish phase, not an implementation phase. The core integration point (real data) is already live — `useSearchIndex` fetches `/data/index.json` and `useCommuneData` fetches per-commune JSONs, both pointing to real data already present in `public/data/`. The "integration" work is: (1) fix a confirmed critical null-safety bug that will crash the Paris page, (2) remove the `.gitignore` exclusion for `public/data/`, (3) create a GitHub repo, (4) deploy to Vercel from GitHub, and (5) produce hackathon submission assets.

**Critical bug found during research:** `scoreDetail.apl.toFixed(1)` (ScoreDetail line 124) and `scoreDetail.temps_urgences_min.toFixed(0)` (line 146) will crash when `apl` or `temps_urgences_min` is null. Paris (75056) has both as null. Same pattern in TwinPanel lines 241 and 273. TypeScript misses this because the types declare `apl: number` but the real data has `null`. This MUST be fixed in Plan 04-01 before any smoke test.

**Rural commune for 5th test:** Chevillon (52123) — 1244 pop, classe D, score 5.2, 5 jumelles, data_quality=complete. Good edge case for a high-vulnerability rural commune.

**Primary recommendation:** Fix null-safety bugs first, then gitignore + GitHub + Vercel deploy as a single pipeline. Reveal.js slides via CDN (no npm install needed).

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.2 (already installed) | App framework | Already in project |
| Vercel | latest | Hosting | Locked decision D-05 |
| reveal.js | 6.0.0 (CDN) | Pitch slides | Standalone HTML, no npm install |
| gh CLI | 2.89.0 (installed) | GitHub repo creation | Available on machine |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vercel CLI | 50.42.0 (npm) | CLI deploy if needed | Fallback if git deploy fails |
| html2canvas | 1.4.1 (already installed) | PDF export | Already in project |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Reveal.js CDN | npm install reveal.js | CDN is simpler for standalone HTML pitch page; no build step |
| GitHub + Vercel integration | Vercel CLI `vercel --prod` | CLI works without GitHub; git-based deploy is the standard path |

**Installation:**
```bash
# Only if git-based deploy fails:
npm install -g vercel@latest
```

Reveal.js slides use CDN — no install needed:
```html
<script src="https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/dist/reveal.esm.js"></script>
```

## Architecture Patterns

### Recommended Project Structure

No structural changes needed. Additions:

```
santescope/
├── public/
│   ├── data/          # Remove from .gitignore — commit 155MB of JSONs
│   │   ├── index.json          # 2.9MB, 34969 entries
│   │   └── communes/           # 34969 files, ~8KB avg
│   └── pitch/                  # New: static pitch slides
│       └── index.html          # Standalone Reveal.js HTML
├── vercel.json                 # New: optional, only if build config needed
README.md                       # Rewrite from create-next-app default
scripts/
└── smoke-test.js               # New: automated smoke test for 5 communes
```

### Pattern 1: Gitignore Surgery

**What:** Remove the `public/data/` exclusion from `.gitignore` so Vercel can access the JSON files during build/deploy.

**When to use:** Required for D-06.

**File to edit:** `santescope/.gitignore`

**Lines to remove:**
```
# Data files (large, generated by notebooks — not versioned)
/public/data/communes/
/public/data/index.json
```

**Caution:** The git history will grow by ~155MB in the commit that adds these files. This is expected and within GitHub's limits (5GB hard limit). The current repo without data is 2.37MB.

### Pattern 2: Vercel Git-Based Deploy

**What:** Connect GitHub repo to Vercel via dashboard. No `vercel.json` needed for standard Next.js deploys.

**Steps:**
1. `gh repo create santescope --public --source=. --remote=origin --push`
2. Go to vercel.com → New Project → Import GitHub repo
3. Framework: Next.js (auto-detected)
4. Root directory: `santescope/` (monorepo — must set this)
5. Build command: `npm run build` (default)
6. Output directory: `.next` (default for Next.js)

**Critical:** The project root is `santescope/`, not the repo root. Vercel must be told this.

**Vercel limits verified (official docs):**
- Source file CLI upload limit: 100MB (Hobby) — **does NOT apply to git-based deploys**
- Git-based deploys clone from GitHub — no 100MB limit
- Output file count: no hard limit (45min build time limit applies)
- 34969 JSON files in output: allowed, build time expected to be fast (static assets, no SSR)

### Pattern 3: Reveal.js Standalone HTML

**What:** A single `public/pitch/index.html` file using Reveal.js via CDN. Accessible at `https://santescope.vercel.app/pitch/` without any Next.js routing.

**Why standalone:** Files in `public/` are served directly by Next.js/Vercel as static assets. No route needed.

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/dist/reveal.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/dist/theme/white.css">
</head>
<body>
  <div class="reveal">
    <div class="slides">
      <section><!-- slide content --></section>
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/dist/reveal.esm.js" type="module"></script>
  <script type="module">
    import Reveal from 'https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/dist/reveal.esm.js';
    Reveal.initialize();
  </script>
</body>
</html>
```

**Note:** Reveal.js latest is 6.0.0 per npm, but JSDelivr has 5.2.1 as latest stable. Use JSDelivr URL with exact version.

### Pattern 4: Automated Smoke Test Script

**What:** A Node.js script that fetches the 5 commune JSONs and validates key fields.

```javascript
// scripts/smoke-test.js
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const COMMUNES = [
  { code: '75056', name: 'Paris', expectNullScore: true },
  { code: '02691', name: 'Saint-Quentin', expectNullScore: false },
  { code: '59392', name: 'Maubeuge', expectNullScore: false },
  { code: '08409', name: 'Sedan', expectNullScore: false },
  { code: '52123', name: 'Chevillon', expectNullScore: false },
];

for (const c of COMMUNES) {
  const res = await fetch(`${BASE}/data/communes/${c.code}.json`);
  const data = await res.json();
  // Assert: code, nom, dept, data_quality, jumelles array, coords
  // For Paris: assert score=null, apl=null without crash
}
```

**Run against dev server:** `node scripts/smoke-test.js`
**Run against prod:** `BASE_URL=https://santescope.vercel.app node scripts/smoke-test.js`

### Anti-Patterns to Avoid

- **Don't use `vercel --prod` CLI for first deploy:** Git-based deploy is more reliable and enables auto-deploys on push. CLI should be fallback only.
- **Don't commit node_modules or .next:** Already in .gitignore — verify before push.
- **Don't use Reveal.js npm package inside Next.js app:** SSR issues with DOM-dependent code. Standalone HTML in `public/` sidesteps this entirely.
- **Don't skip the null guard fix:** Visiting Paris (/commune/75056) will crash the app before any polish can be evaluated.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Pitch slides | Custom React component | Reveal.js CDN in static HTML | Zero dependencies, accessible URL, offline-capable |
| Deploy pipeline | Manual file upload | Vercel GitHub integration | Auto-deploy on push, preview URLs, rollback |
| Smoke test HTTP | curl/bash scripts | Node fetch script | JSON parsing, structured assertions, reusable |

**Key insight:** Public/pitch slides via `public/pitch/index.html` are served as static assets — no Next.js page needed, no routing, no SSR concerns.

## Common Pitfalls

### Pitfall 1: Paris Null Crash (CONFIRMED BUG)

**What goes wrong:** Visiting `/commune/75056` crashes with `Cannot read properties of null (reading 'toFixed')`.

**Why it happens:** `scoreDetail.apl` is `null` for Paris (APL only available for arrondissements 75101-75120, not the city code 75056). Same for `temps_urgences_min`. The TypeScript types say `apl: number` (not `number | null`), so the compiler doesn't catch this — but the real JSON has `null`.

**Crash sites confirmed:**
- `ScoreDetail.tsx:124` — `scoreDetail.apl.toFixed(1)`
- `ScoreDetail.tsx:146` — `scoreDetail.temps_urgences_min.toFixed(0)`
- `TwinPanel.tsx:241` — `commune.score_detail.apl.toFixed(1)` (when commune has null apl)
- `TwinPanel.tsx:273` — `commune.score_detail.temps_urgences_min.toFixed(0)`

**How to avoid:** Fix types to `apl: number | null` and `temps_urgences_min: number | null`, then add null guards: `scoreDetail.apl?.toFixed(1) ?? 'N/D'`.

**Warning signs:** Any commune with `data_quality: "minimal"` is likely to have null score components.

### Pitfall 2: Vercel Root Directory Not Set

**What goes wrong:** Vercel deploys from repo root, can't find `package.json`, build fails.

**Why it happens:** This is a monorepo (notebooks + santescope in same git repo). Vercel auto-detects Next.js only if the root directory is set to `santescope/`.

**How to avoid:** In Vercel project settings, set Root Directory to `santescope`. Verify in `vercel.json` if using config file.

**Warning signs:** Build step errors about missing `package.json` or framework not detected.

### Pitfall 3: Git Push Timeout for 155MB Data

**What goes wrong:** `git push` is slow or times out when adding 34969 JSON files.

**Why it happens:** GitHub has rate limits and large initial pushes can be slow. 155MB of files is within GitHub limits but will take time.

**How to avoid:** Push with `--verbose` to monitor progress. If it fails, retry — GitHub handles partial pushes gracefully. Consider pushing in a terminal (not inside a subprocess with timeout).

**Warning signs:** Progress stalls at a percentage, SSH timeout errors.

### Pitfall 4: Fields Missing in Paris JSON

**What goes wrong:** `has_hopital`, `has_ehpad`, `nb_etablissements`, `apl_evolution` are `null` for Paris (75056). Components using these without null guards will crash silently or throw.

**Confirmed null fields in Paris:**
- `has_hopital: null` (type says `boolean`)
- `has_ehpad: null` (type says `boolean`)
- `nb_etablissements: null` (type says `number`)
- `apl_evolution: null` (type says `Record<string, number>`)
- `score: null`, `classe: null` (already typed as nullable)

**How to avoid:** Fix type definitions to include `| null` where applicable, add null guards in CommuneEquipments and AplSparkline.

**Warning signs:** `CommuneEquipments` renders Paris as "missing all equipment" when data is simply unavailable.

### Pitfall 5: Reveal.js CDN Version Mismatch

**What goes wrong:** Using `reveal.js@latest` from CDN which might change API between versions.

**How to avoid:** Pin exact version in CDN URL (e.g., `reveal.js@5.2.1`). JSDelivr syntax: `https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/dist/...`.

## Code Examples

### Null-Safe APL Display

```typescript
// Source: pattern based on existing pauvrete null guard in ScoreDetail.tsx:131
{
  label: "Accès aux soins (APL)",
  value: scoreDetail.apl != null
    ? scoreDetail.apl.toFixed(1)
    : "Non disponible",
  national: scoreDetail.apl_national.toFixed(1),
  higherIsBetter: true,
  unavailable: scoreDetail.apl == null,
}
```

### Null-Safe Urgences Display

```typescript
// Same pattern for temps_urgences_min
{
  label: "Temps d'accès urgences",
  value: scoreDetail.temps_urgences_min != null
    ? scoreDetail.temps_urgences_min.toFixed(0) + " min"
    : "Non disponible",
  national: scoreDetail.temps_urgences_national.toFixed(0) + " min",
  higherIsBetter: false,
  unavailable: scoreDetail.temps_urgences_min == null,
}
```

### Updated TypeScript Types

```typescript
// src/lib/types.ts — score_detail nullable fields
score_detail: {
  apl: number | null;           // null for Paris and large cities
  apl_national: number;
  pauvrete: number | null;      // already nullable
  pauvrete_national: number;
  pct_75_seuls: number;
  pct_75_seuls_national: number;
  temps_urgences_min: number | null;  // null for Paris
  temps_urgences_national: number;
};
// Additional nullable fields found in real data
has_hopital: boolean | null;
has_ehpad: boolean | null;
nb_etablissements: number | null;
apl_evolution: Record<string, number> | null;
```

### TwinPanel APL Guard

```typescript
// TwinPanel.tsx line 241 — guard against null apl
<span style={{ fontWeight: 600, fontSize: 14, marginRight: 6 }}>
  {commune.score_detail.apl != null
    ? commune.score_detail.apl.toFixed(1)
    : "N/D"}
</span>
```

### Vercel Config (if needed)

```json
// santescope/vercel.json — only needed if root directory can't be set in UI
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next"
}
```

### README Template Structure

```markdown
# SanteScope

Jumeau numérique territorial pour la santé des communes françaises.
[Description 2-3 phrases]

## Demo

URL : https://santescope.vercel.app
[screenshot]

## Stack

Next.js 16 · TypeScript · Tailwind CSS · shadcn/ui · html2canvas

## Données

[Tableau sources : APL/DREES, RPPS, FiLoSoFi INSEE, RP2020, FINESS, etc.]

## Lancement local

git clone ... && cd santescope && npm install && npm run dev

## Méthodologie

Voir notebooks/ pour le pipeline de données.
```

## 5th Commune: Chevillon (52123)

**Selected:** Chevillon (code 52123) — verified from data.

| Field | Value |
|-------|-------|
| Population | 1 244 hab |
| Score | 5.2 / 10 |
| Classe | D (vulnérable) |
| Jumelles | 5 communes |
| data_quality | complete |
| APL | 2.866 |
| Coords | [48.53, 5.14] |

Good rural edge case: small population, real vulnerability score, full jumelles data, complete data quality.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `pages/` router | App Router | Next.js 13+ | Server components default, `await params` required |
| Static HTML pitch | Reveal.js 5+ ESM | 2023 | ES module import, no global Reveal object |

**Deprecated/outdated:**
- Reveal.js `window.Reveal`: Use ESM `import Reveal from '...'` in type="module" script.

## Open Questions

1. **Reveal.js version on JSDelivr**
   - What we know: npm registry shows 6.0.0 as latest, JSDelivr typically mirrors npm
   - What's unclear: JSDelivr availability for 6.0.0 vs 5.2.1 CDN path differences
   - Recommendation: Use `https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/` (confirmed stable) or test 6.0.0 CDN URL before writing slides

2. **Vercel hobby plan vs pro for git-based deploy**
   - What we know: 100MB CLI limit does NOT apply to git-based deploys. No file count hard limit on output. Build time limit is 45min.
   - What's unclear: Whether Vercel clones the full 155MB repo on every build (slow builds?)
   - Recommendation: Proceed with Hobby plan. If builds time out, switch to Pro ($20/month).

3. **GitHub large file push performance**
   - What we know: 155MB over SSH is within GitHub limits (5GB hard limit)
   - What's unclear: Push time on the current network connection
   - Recommendation: Allow 5-10 minutes for initial push; retry if timeout.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build, smoke test | ✓ | v25.2.1 | — |
| npm | Package management | ✓ | 11.6.2 | — |
| gh CLI | GitHub repo creation | ✓ | 2.89.0 | Manual GitHub UI |
| git | Version control | ✓ | (system) | — |
| vercel CLI | Deploy fallback | ✗ | — | Git-based deploy (primary) |
| Vercel account | Hosting | assumed ✓ | — | Requires signup if not |

**Missing dependencies with no fallback:**
- Vercel account: must exist or be created at vercel.com before deploy

**Missing dependencies with fallback:**
- vercel CLI: not installed; git-based deploy is the primary (preferred) path anyway

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None (no formal test suite — out of scope per REQUIREMENTS.md) |
| Config file | N/A |
| Quick run command | `node santescope/scripts/smoke-test.js` |
| Full suite command | `node santescope/scripts/smoke-test.js BASE_URL=https://santescope.vercel.app` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DEP-01 | App accessible at public Vercel URL | smoke | `curl -s https://santescope.vercel.app | grep SanteScope` | ❌ Wave 0 |
| DEP-02 | JSONs served from /data/ path | smoke | `node scripts/smoke-test.js BASE_URL=https://santescope.vercel.app` | ❌ Wave 0 |
| DEP-03 | Code on GitHub | manual | `gh repo view H-Zak/santescope` | N/A |

### Sampling Rate

- **Per task commit:** `node santescope/scripts/smoke-test.js` (local dev server)
- **Per wave merge:** `node santescope/scripts/smoke-test.js` with BASE_URL pointing to Vercel preview
- **Phase gate:** All 5 communes load without crash + DEP-01/02/03 green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `santescope/scripts/smoke-test.js` — covers DEP-01, DEP-02 (5 communes, field validation)

## Sources

### Primary (HIGH confidence)

- Vercel official limits docs (https://vercel.com/docs/limits) — confirmed: 100MB limit is CLI-only, git-based deploys clone from GitHub, no output file count hard limit, 45min build time limit
- Direct inspection of `santescope/public/data/` — 34969 files, 155MB, all present
- Direct inspection of `santescope/src/lib/types.ts` and component source — null crash bugs confirmed
- Direct inspection of `santescope/public/data/communes/75056.json` — Paris null fields confirmed
- `npm run build` passes clean — no TypeScript or build errors in current code

### Secondary (MEDIUM confidence)

- JSDelivr CDN for Reveal.js — standard CDN, widely used, version 5.x confirmed available
- GitHub large file limits — 5GB hard limit documented, 155MB well within range

### Tertiary (LOW confidence)

- Vercel git-based deploy clone behavior for large repos — 45min timeout is the only confirmed constraint; actual build time for 34969 static JSON files untested

## Metadata

**Confidence breakdown:**
- Bugs found: HIGH — directly verified in source code and real JSON data
- Standard stack: HIGH — verified in existing project + official Vercel docs
- Architecture: HIGH — based on direct code inspection
- Vercel limits: HIGH — verified from official Vercel docs
- Pitch slides: MEDIUM — Reveal.js CDN pattern is standard, exact version needs confirmation

**Research date:** 2026-04-08
**Valid until:** 2026-04-13 (hackathon deadline)
