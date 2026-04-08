---
phase: 4
slug: integration-deploy
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-08
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Custom smoke test script (Node.js) |
| **Config file** | none — Wave 0 creates `santescope/scripts/smoke-test.js` |
| **Quick run command** | `node santescope/scripts/smoke-test.js` |
| **Full suite command** | `node santescope/scripts/smoke-test.js BASE_URL=https://santescope.vercel.app` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `node santescope/scripts/smoke-test.js`
- **After every plan wave:** Run `node santescope/scripts/smoke-test.js BASE_URL=https://santescope.vercel.app`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | DEP-02 | smoke | `node santescope/scripts/smoke-test.js` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | DEP-02 | smoke | `node santescope/scripts/smoke-test.js` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 2 | DEP-03 | manual | `gh repo view H-Zak/santescope` | N/A | ⬜ pending |
| 04-02-02 | 02 | 2 | DEP-01 | smoke | `curl -s https://santescope.vercel.app \| grep SanteScope` | ❌ W0 | ⬜ pending |
| 04-02-03 | 02 | 2 | DEP-01 | manual | Visual navigation of 5 communes | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `santescope/scripts/smoke-test.js` — Fetches 5 commune JSONs (75056, 02691, 59392, 08409, 52123), validates required fields present, checks for null crashes on critical paths

*Smoke test script is the only Wave 0 artifact — no formal test framework needed for this deploy/polish phase.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Visual polish (alignements, textes tronqués) | D-01 | CSS rendering judgment | Navigate 5 communes: search → diagnostic → jumelle → comparer |
| PDF export produces readable output | DEP-02 | Requires browser rendering | Click PDF download on Paris diagnostic page |
| Reveal.js pitch slides render | D-08 | Visual layout judgment | Open /pitch/ route, check all slides navigate |
| Video demo quality | D-07 | Requires human review | Watch recorded screen capture |
| Hackathon submission completeness | D-09 | Platform-specific | Verify README, URL, video, slides all present |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
