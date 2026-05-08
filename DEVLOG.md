## Day 1 — 2026-05-06
**Hours worked:** 3
**What I did:**
- Set up the project foundation with TypeScript strict mode, ESLint, Prettier, Tailwind CSS, and path aliases.
- Defined the core audit domain models for tools, input, recommendations, results, and errors.
- Established the initial app shell and configuration needed for the rest of the build.
**What I learned:**
- Keeping infrastructure setup separate from domain modeling makes the git history easier to review.
- Strict TypeScript and formatting rules catch issues early and keep the codebase consistent.
- A clean app structure will make the later audit, API, and UI work much easier to add.
**Blockers / what I'm stuck on:**
- No major blockers yet.
- Next step is implementing the first audit rule and pricing data.
**Plan for tomorrow:**
- Implement the first audit rule.
- Add pricing constants/data.
- Start writing unit tests for the audit logic.

## Day 2 — 2026-05-07
**Hours worked:** 4.5
**What I did:**
- Added a pricing module for core tools and introduced a rule-level `checkUnderutilization` function that uses pricing data.
- Wrote focused unit tests for `checkUnderutilization` to cover positive and negative paths.
- Integrated the underutilization rule into the audit engine so recommendations are now generated from deterministic rule evaluation.
- Expanded pricing documentation with official source links and verification dates.
**What I learned:**
- Smaller commits made debugging and reviewing easier than bundling rule logic, tests, and engine wiring together.
- Documentation quality (pricing sources + verification dates) is just as important as code correctness for this assignment.
- Rule functions are easier to test when designed as pure single-responsibility functions.
**Blockers / what I'm stuck on:**
- Some pricing pages are region-specific or have mixed seat/API pricing, which can create ambiguity in USD normalization.
- Need a cleaner mapping strategy for API-based pricing models before adding advanced savings logic.
**Plan for tomorrow:**
- Add at least one additional recommendation rule (team-size mismatch or consolidation).
- Expand tests to cover engine-level outputs, not only single-rule behavior.
- Continue filling required docs incrementally to avoid end-of-week rush.

## Day 3 — 2026-05-08
**Hours worked:** 3.5
**What I did:**
- Implemented `checkTeamSizeMismatch()` rule to detect and recommend plan downgrades when team size doesn't match current plan (solo users on enterprise/pro plans, small teams on enterprise, etc.).
- Wrote 8 focused unit tests for the team-size rule covering solo, small, medium, and large team scenarios and edge cases.
- Integrated the team-size rule into `engine.evaluate()` alongside the existing `checkUnderutilization()` checks so multiple rules compose deterministically.
- Set up Vitest with `vitest.config.ts` and alias resolution for `@/` imports; added `npm test` script.
- Added 2 engine-level tests (`tests/unit/engine-more.test.ts`) and created `TESTS.md` documenting all automated tests and how to run them.
- Implemented `AuditForm` UI component with comprehensive tool input, team-size selection, monthly-spend tracking, and localStorage persistence; integrated it into the audit page and wired submission to `evaluate()` with results stored in `sessionStorage`.
- Added CI workflow at `.github/workflows/ci.yml` to run `npm ci`, `npm run lint`, and `npm test` on pushes/PRs to `main`.
- Fixed ESLint/flat-config issues by adding `eslint.config.cjs` (flat CJS config), addressed lint warnings/errors across the repo, and ensured `npm run lint` completes without errors.
**What I learned:**
- Writing small, focused tests for each rule (and engine-level integration tests) makes behavior explicit and reduces regressions.
- Vitest needs explicit path-alias configuration when using TypeScript `paths` (add `vitest.config.ts`).
- ESLint v9 requires a flat config entrypoint; providing `eslint.config.cjs` that mirrors `eslint.config.mjs` resolves CI issues. Some lint findings required tightening types and avoiding setState inside effects.
- LocalStorage + sessionStorage are practical for prototype UX (persisting form state; passing results between pages) but will be replaced by a server-backed store in later days.
**Blockers / what I'm stuck on:**
- None — tests and lint are green locally; CI workflow has been added and will run on the remote.
**Plan for tomorrow:**
- Implement the results page component to display generated recommendations and a shareable summary.
- Add a `detectConsolidationOpportunities()` rule to identify overlapping tools that can be consolidated.
- Start integrating AI summary generation (Anthropic/Claude) with a placeholder flow and environment-gated calls.

