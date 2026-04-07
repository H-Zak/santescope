---
phase: 3
slug: frontend-app
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-08
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.x + @testing-library/react |
| **Config file** | `vitest.config.ts` (Wave 0 installs) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | UI-01 | unit | `npx vitest run src/__tests__/search.test.tsx` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | UI-01 | unit | `npx vitest run src/__tests__/autocomplete.test.tsx` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 2 | UI-02,UI-03 | unit | `npx vitest run src/__tests__/results-panel.test.tsx` | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 2 | UI-04 | unit | `npx vitest run src/__tests__/twins-list.test.tsx` | ❌ W0 | ⬜ pending |
| 03-03-01 | 03 | 3 | UI-05 | unit | `npx vitest run src/__tests__/comparison.test.tsx` | ❌ W0 | ⬜ pending |
| 03-03-02 | 03 | 3 | UI-06 | unit | `npx vitest run src/__tests__/pdf-export.test.tsx` | ❌ W0 | ⬜ pending |
| 03-03-03 | 03 | 3 | UI-07,UI-08 | unit | `npx vitest run src/__tests__/map.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest` + `@testing-library/react` + `jsdom` — install test framework
- [ ] `vitest.config.ts` — configure with jsdom environment
- [ ] `src/__tests__/` — create test directory with stubs for all task tests

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Search <100ms response | UI-01 | Performance depends on runtime | Open search, type 3 chars, verify results appear instantly |
| PDF readability | UI-06 | Visual quality check | Download PDF, verify text legible, layout intact |
| Mini map renders correctly | UI-07 | Visual rendering check | Open commune page, verify map shows correct location |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
