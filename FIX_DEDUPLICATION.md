## Fix Summary: Duplicate Recommendation Deduplication

### Issue
The audit engine was generating duplicate recommendations when the same AI tool matched multiple recommendation rules, resulting in:
- **Duplicated recommendations**: Similar tools could appear multiple times with different reasons
- **Double-counted savings**: Total savings were incorrectly calculated when a tool matched multiple rules

**Example**: A tool with rare usage AND paying for a pro plan as a solo user could generate multiple downgrade recommendations, double-counting the savings.

### Root Cause
The `evaluate()` function in `src/lib/audit/engine.ts` combined recommendations from three separate rule functions without deduplicating overlapping results:
- `checkUnderutilization()` - detects underutilized paid tools
- `checkTeamSizeMismatch()` - detects tools wrong for team size
- `detectConsolidationOpportunities()` - detects redundant tools

### Solution
Added a `deduplicateRecommendations()` function that:

1. **Groups** recommendations by `toolId:type` key
2. **Selects** the best recommendation from duplicates using:
   - Primary sort: Confidence level (high > medium > low)
   - Tiebreaker: Estimated savings (highest first)
3. **Returns** deduplicated array before calculating totals

### Changes Made
- **File**: `src/lib/audit/engine.ts`
  - Added `deduplicateRecommendations()` helper function (lines 11-41)
  - Integrated deduplication into `evaluate()` (lines 66-67)
  - Updated import to include `Recommendation` type

- **File**: `tests/unit/deduplication.test.ts` (NEW)
  - Test: No duplicate downgrade recommendations for single tool
  - Test: Savings not double-counted for overlapping rules
  - Test: Unique consolidation recommendations preserved

### Verification
All tests pass (23 total):
- ✅ 3 new deduplication tests
- ✅ 20 existing unit tests (no regressions)

### Impact
- Users now see accurate recommendation counts
- Savings calculations are correct and not inflated
- Multiple rule matches handled gracefully without duplication
