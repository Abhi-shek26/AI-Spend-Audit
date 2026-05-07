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
