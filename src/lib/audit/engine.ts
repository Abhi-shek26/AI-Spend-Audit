/**
 * Audit engine - deterministic business logic for evaluating AI spending
 * This is the core of the application and must produce consistent results
 */

import { checkUnderutilization, checkTeamSizeMismatch, detectConsolidationOpportunities } from './rules';
import { AuditInput, AuditResult } from './types';

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

  const recommendations = [...underutilizationRecs, ...teamSizeRecs, ...consolidationRecs];

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
