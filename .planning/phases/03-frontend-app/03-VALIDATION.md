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
| **Framework** | Next.js build (type-check + bundle) |
| **Config file** | `next.config.ts` (exists from bootstrap) |
| **Quick run command** | `cd santescope && npm run build` |
| **Full suite command** | `cd santescope && npm run build` |
| **Estimated runtime** | ~20 seconds |

> Formal unit test suite is out-of-scope per REQUIREMENTS.md (hackathon context). Build verification catches type errors, missing imports, and SSR/CSR mismatches.

---

## Sampling Rate

- **After every task commit:** Run `cd santescope && npm run build`
- **After every plan wave:** Run `cd santescope && npm run build`
- **Before `/gsd:verify-work`:** Build must succeed (exit 0)
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | UI-01 | build | `cd santescope && npm run build` | ✅ | ⬜ pending |
| 03-01-02 | 01 | 1 | UI-01 | build | `cd santescope && npm run build` | ✅ | ⬜ pending |
| 03-02-01 | 02 | 2 | UI-02,UI-03 | build | `cd santescope && npm run build` | ✅ | ⬜ pending |
| 03-02-02 | 02 | 2 | UI-04,UI-05,UI-08 | build | `cd santescope && npm run build` | ✅ | ⬜ pending |
| 03-03-01 | 03 | 3 | UI-06 | build | `cd santescope && npm run build` | ✅ | ⬜ pending |
| 03-03-02 | 03 | 3 | UI-07 | build | `cd santescope && npm run build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. Next.js build is the automated verification — no additional test framework needed.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Search <100ms response | UI-01 | Performance depends on runtime | Open search, type 3 chars, verify results appear instantly |
| PDF readability | UI-07 | Visual quality check | Download PDF, verify text legible, layout intact |
| Mini map renders correctly | UI-08 | Visual rendering check | Open commune page, verify map shows correct location |
| Double-panel layout responsive | UI-02 | Visual layout check | Resize to mobile, verify flex-col stacking |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify (npm run build)
- [ ] Sampling continuity: every task has automated verify
- [ ] No Wave 0 setup needed (build already available)
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
