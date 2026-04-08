---
phase: 04-integration-deploy
plan: 02
subsystem: deploy
status: partial — paused at checkpoint (Task 3: Vercel deploy)
tags: [github, vercel, readme, pitch-slides, reveal.js, deploy]

# Dependency graph
requires:
  - phase: 04-01
    provides: null-safe CommuneData, smoke-test.js, gitignore unblocked
provides:
  - santescope/README.md (D-09)
  - santescope/public/pitch/index.html (D-08, accessible at /pitch/)
  - GitHub repo: https://github.com/H-Zak/santescope (DEP-03)
  - 34969 commune JSONs committed and tracked in git (D-06)
affects: [vercel-deploy, submission-dossier]

# Tech tracking
tech-stack:
  added:
    - Reveal.js 5.2.1 (CDN, no npm install)
    - Google Fonts Inter (CDN)
  patterns:
    - Standalone HTML pitch slide with CDN-only dependencies
    - HTTPS git remote with gh token for auth (no SSH key setup needed)

key-files:
  created:
    - santescope/public/pitch/index.html
    - santescope/public/data/ (34969 commune JSONs + index.json, first commit)
  modified:
    - santescope/README.md

key-decisions:
  - "GitHub remote uses HTTPS + gh token (SSH key not configured for H-Zak)"
  - "Pushed master branch first, then worktree branch — data files and README on worktree-agent-af7fe62c branch"
  - "Reveal.js 5.2.1 via JSDelivr CDN — esm module import, not UMD"
  - "rsync to copy 155MB data files from main repo to worktree before staging"

requirements-completed: [DEP-03]

# Metrics
duration: ~20min (Tasks 1-2 only; Tasks 3-4 pending human action)
completed: 2026-04-08
---

# Phase 04 Plan 02: GitHub + Vercel Deploy + Submission Dossier Summary

**README, pitch slides, 35K JSON files committed to GitHub — waiting for Vercel deploy (human checkpoint)**

## Status

**PAUSED at Task 3 (checkpoint:human-verify)** — Tasks 1-2 complete, Tasks 3-4 require human action.

## Performance

- **Duration:** ~20 min (Tasks 1-2)
- **Completed:** 2026-04-08
- **Tasks completed:** 2/4
- **Files modified:** 34972 (README + pitch/index.html + 34969 commune JSONs + index.json)

## Accomplishments

### Task 1: GitHub repo + README (commit: e388b5d)

- Wrote `santescope/README.md` replacing the default Next.js template — includes SanteScope description, Vercel URL, all 9 data sources table, methodology, and local launch instructions
- Staged and committed 34969 commune JSON files + index.json (155MB) — previously gitignored
- Created GitHub repo: https://github.com/H-Zak/santescope (DEP-03)
- Pushed master branch + worktree branch to GitHub

### Task 2: Reveal.js pitch slides (commit: eecd800)

- Created `santescope/public/pitch/index.html` — 10-slide Reveal.js 5.2.1 presentation
- Slides: Title, Problem, Solution, Demo, Data (table), Methodology, Impact, Stack, Team, Merci+Links
- Custom CSS: brand teal #0F766E, Inter font, clean minimal design, stat grids, data table
- Standalone HTML — CDN only (no npm install required)
- Pushed to GitHub

## Task Commits

1. **Task 1: GitHub repo + Vercel deploy + README** — `e388b5d`
2. **Task 2: Reveal.js pitch slides** — `eecd800`

## Files Created/Modified

- `santescope/README.md` — Project documentation with SanteScope description, stack, data sources, npm run dev instructions, Vercel URL
- `santescope/public/pitch/index.html` — 10-slide Reveal.js presentation (10 sections, CDN 5.2.1, #0F766E brand color)
- `santescope/public/data/communes/*.json` — 34969 commune data files (first commit to git)
- `santescope/public/data/index.json` — Search index (2.9MB)

## Decisions Made

- Used `gh auth token` for HTTPS push (SSH key not set up for H-Zak account)
- Data files copied via rsync from main repo to worktree (worktree doesn't share working directory with main repo)
- Pushed both `master` (existing history) and `worktree-agent-af7fe62c` (new commits) branches to GitHub
- Reveal.js uses ESM module import (`type="module"`) — required for `reveal.esm.js`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Data files not present in worktree**

- **Found during:** Task 1 (staging step)
- **Issue:** The 35K JSON files exist at `/Users/zakariyahamdouchi/Dev/Hackathon/santescope/public/data/` but git worktrees share the git history, not the working directory. Files were untracked in both the worktree and main repo.
- **Fix:** Used `rsync` to copy 155MB of JSON files from main repo working directory to worktree directory, then staged with `git add`
- **Files modified:** N/A (working directory operation)
- **Commit:** e388b5d (Task 1)

**2. [Rule 3 - Blocking] SSH key not configured for GitHub push**

- **Found during:** Task 1 (git push attempt)
- **Issue:** `git push` via SSH failed with `Permission denied (publickey)` — no SSH key registered for H-Zak
- **Fix:** Changed remote URL to HTTPS and used `gh auth token` for credential authentication
- **Commit:** N/A (infrastructure fix, not committed)

---

**Total deviations:** 2 auto-fixed (2 blocking infrastructure issues)

## Pending Tasks

### Task 3: Deploy to Vercel (checkpoint:human-verify)

Human action required in Vercel dashboard:
1. Go to https://vercel.com/new
2. Import GitHub repo `H-Zak/santescope`
3. CRITICAL: Set Root Directory to `santescope`
4. Deploy — wait for build (2-5 min)
5. Verify the live URL loads, pitch at /pitch/, test 5 demo communes

### Task 4: Record video demo (checkpoint:human-verify)

Screen recording (2-3min) of the deployed app covering the full user journey.

## GitHub Repository

**URL:** https://github.com/H-Zak/santescope
**Branch with latest commits:** `worktree-agent-af7fe62c` (to be merged to master after Vercel deploy)
**Default branch:** `master`

## Next Steps (after human actions)

After Vercel deploy confirmed working:
1. Merge worktree branch to master: `git merge worktree-agent-af7fe62c`
2. Run smoke test: `BASE_URL=https://santescope.vercel.app node santescope/scripts/smoke-test.js`
3. Record video demo

---
*Phase: 04-integration-deploy*
*Partial — paused at Task 3 checkpoint*
*Last updated: 2026-04-08*
