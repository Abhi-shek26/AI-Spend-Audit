# REFLECTION

This file is being updated incrementally during the 7-day build.
I will finalize all 5 required answers on Day 7.

## Daily AI Usage Log (updated each day)

### Day 1 — 2026-05-06
- AI used for: setup checklist refinement, commit-message quality improvements, and folder-structure sanity checks.
- AI not trusted for: final architecture claims and pricing facts.
- Manual verification done: confirmed project setup files, reviewed git history order, and pushed in small commits.
- AI mistake caught: broad suggestions that grouped too much work in one day; corrected by splitting into realistic daily slices.

### Day 2 — 2026-05-07
- AI used for: drafting `checkUnderutilization` logic shape, identifying test edge cases, and improving wording for `DEVLOG.md` and docs.
- AI not trusted for: pricing numbers without source URLs and final savings assumptions.
- Manual verification done: sourced pricing links manually, ran focused unit tests, and integrated rules into engine in separate commits.
- AI mistake caught: over-generalized pricing assumptions across vendors; fixed by introducing a pricing module and test-backed rule behavior.

### Day 3 — 2026-05-08
- AI used for: suggesting logic for team-size condition checks, generating comprehensive test scenarios, drafting form component with React hooks patterns, and formatting DEVLOG wording.
- AI not trusted for: final business logic without manual review, form validation logic structure (manually verified for edge cases), and component structuring across pages.
- Manual verification done: reviewed all 8 test cases individually, ensured zero-savings guardrails work correctly, integrated rule by hand into engine cleanly, tested form localStorage with browser dev tools, manually routed form submission through sessionStorage.
- AI mistake caught: initially suggested overly broad team-size matching logic; refined to focus on specific downgrades (solo user + paid plans only). Also initially forgot useEffect dependencies for localStorage sync.

### Day 4 — 2026-05-09
- AI used for: proposing consolidation-rule heuristics, outlining results-page structure, drafting the `/api/summary` server route, and suggesting share-link implementation flow.
- AI not trusted for: direct savings assumptions for consolidation recommendations and final API correctness for Anthropic integration without manual checks.
- Manual verification done: ran lint and tests repeatedly after each slice, adjusted consolidation savings to avoid double-counting, validated result/share flows in code, and checked CI behavior after pushes.
- AI mistake caught: initial consolidation approach inflated `totalMonthlySavings` by counting overlapping recommendations; corrected by making consolidation savings conservative (`0`) and treating them as advisory.

### Day 5 — 2026-05-10
- AI used for: designing the server-backed share API, suggesting fallback strategies (localStorage fallback), and drafting the results-page client/server interactions.
- AI not trusted for: file-based persistence decisions and production-grade security assumptions; these are manually reviewed before merging.
- Manual verification done: implemented `POST /api/audit/save` and `GET /api/audit/get/[id]`, exercised the end-to-end share flow in browser, verified fallback behavior, and ran full test + lint cycles.
- AI mistake caught: initial reliance on purely client-side sharing (localStorage) would not work cross-device — switched to server-backed persistence with a local fallback.

### Day 5 — YYYY-MM-DD
- To be filled on Day 5.

### Day 6 — YYYY-MM-DD
- To be filled on Day 6.

### Day 7 — YYYY-MM-DD
- To be filled on Day 7.

---

## 1. The hardest bug I hit this week, and how I debugged it
To be finalized on Day 7.

## 2. A decision I reversed mid-week, and what made me reverse it
To be finalized on Day 7.

## 3. What I would build in week 2 if I had it
To be finalized on Day 7.

## 4. How I used AI tools (what I trusted and did not trust)
This section will be synthesized from the Daily AI Usage Log on Day 7.

## 5. Self-rating (discipline, code quality, design, problem-solving, entrepreneurial thinking)
To be finalized on Day 7.
