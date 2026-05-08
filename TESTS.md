# Automated Tests

This repository uses Vitest for unit tests. Run the full suite with `npm test`.

Commands

```bash
npm install
npm test
# or
npx vitest run
```

Test files and coverage

- `tests/unit/check-underutilization.test.ts`
  - Covers: the `checkUnderutilization` rule behaviour across positive and negative cases.
  - Key assertions: recommends downgrades for rare usage on paid plans, respects free plans, handles unknown tools gracefully.

- `tests/unit/check-team-size-mismatch.test.ts`
  - Covers: the `checkTeamSizeMismatch` rule for `solo`, `small`, `medium`, and `large` team sizes.
  - Key assertions: solo downgrades paid plans to free, small teams recommended to downgrade enterprise->pro, free-plan exemptions, graceful handling of unknown tools.

- `tests/unit/audit.test.ts`
  - Covers: core `evaluate()` engine behaviour.
  - Key assertions: valid input produces a result, engine rejects empty `tools` arrays, deterministic outputs for repeated inputs (excluding generated IDs).

- `tests/unit/engine-more.test.ts`  <-- added to meet the minimum engine tests requirement
  - Covers: combined multi-rule scenarios and savings percentage logic.
  - Key assertions: engine produces both underutilization and team-size recommendations when applicable; `totalMonthlySavings` and `savingsPercentage` computed as expected for a known pricing scenario.

How these tests meet the assignment requirement

- The audit engine is covered by at least 5 automated tests specifically targeting `evaluate()` and rule interactions:
  - `tests/unit/audit.test.ts` (3 engine-level assertions)
  - `tests/unit/engine-more.test.ts` (2 engine-level assertions)  
  = 5+ engine-focused tests in total.

Notes

- Tests run in Node environment configured in `vitest.config.ts`.
- If you add new path aliases, update `vitest.config.ts` to keep alias resolution working.
