/**
 * Audit engine - deterministic business logic for evaluating AI spending
 * This is the core of the application and must produce consistent results
 */

import { checkUnderutilization, checkTeamSizeMismatch, detectConsolidationOpportunities } from './rules';
import { AuditInput, AuditResult, Recommendation } from './types';

/**
 * Deduplicates recommendations by grouping on toolId + type
 * Keeps the highest confidence/savings version of duplicates
 * @param recs Array of recommendations that may contain duplicates
 * @returns Array of deduplicated recommendations
 */
function deduplicateRecommendations(recs: Recommendation[]): Recommendation[] {
  const grouped = new Map<string, Recommendation[]>();

  // Group by toolId + type
  for (const rec of recs) {
    const key = `${rec.toolId}:${rec.type}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(rec);
  }

  // For each group, keep the best recommendation (highest confidence, then highest savings)
  const deduplicated: Recommendation[] = [];
  for (const recGroup of grouped.values()) {
    if (recGroup.length === 1) {
      deduplicated.push(recGroup[0]);
    } else {
      // Sort by confidence (high > medium > low) then by savings (descending)
      const confidenceOrder = { high: 0, medium: 1, low: 2 };
      const best = recGroup.sort((a, b) => {
        const confDiff = confidenceOrder[a.confidence] - confidenceOrder[b.confidence];
        if (confDiff !== 0) return confDiff;
        return b.estimatedSavings - a.estimatedSavings;
      })[0];
      deduplicated.push(best);
    }
  }

  return deduplicated;
}

/**
 * Evaluate an audit input and generate recommendations
 * Pure function - deterministic output for given input
 */
export function evaluate(input: AuditInput): AuditResult {
  // Validate input
  if (!input.tools || input.tools.length === 0) {
    throw new Error('At least one AI tool is required for audit');
  }

  // Generate recommendations using deterministic rule checks.
  const underutilizationRecs = input.tools.flatMap((tool) =>
    checkUnderutilization(tool)
  );

  const teamSizeRecs = input.tools.flatMap((tool) =>
    checkTeamSizeMismatch(tool, input.teamSize)
  );

  const consolidationRecs = detectConsolidationOpportunities(input.tools, input.useCases);

  // Combine and deduplicate recommendations
  const allRecs = [...underutilizationRecs, ...teamSizeRecs, ...consolidationRecs];
  const recommendations = deduplicateRecommendations(allRecs);

  const totalMonthlySavings = recommendations.reduce(
    (sum, rec) => sum + rec.estimatedSavings,
    0
  );

  const savingsPercentage =
    input.totalMonthlySpend > 0
      ? Math.round((totalMonthlySavings / input.totalMonthlySpend) * 100)
      : 0;

  const result: AuditResult = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    input,
    recommendations,
    totalMonthlySavings,
    savingsPercentage,
    summary: '', // Will be filled by AI summary generation
  };

  return result;
}

/**
 * Generate a simple ID for audit results
 * Format: audit_[timestamp]_[random]
 */
function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `audit_${timestamp}_${random}`;
}

export * from './types';
