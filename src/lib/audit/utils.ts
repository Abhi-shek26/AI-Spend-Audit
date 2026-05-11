/**
 * Utility functions for the audit engine
 */

import { AITool, AuditInput } from './types';

/**
 * Validate audit input before processing
 */
export function validateAuditInput(input: unknown): input is AuditInput {
  if (!input || typeof input !== 'object') return false;

  const obj = input as Record<string, unknown>;

  return (
    Array.isArray(obj.tools) &&
    obj.tools.length > 0 &&
    typeof obj.totalMonthlySpend === 'number' &&
    typeof obj.teamSize === 'string' &&
    Array.isArray(obj.useCases)
  );
}

/**
 * Calculate total monthly spend across all tools
 */
export function calculateTotalSpend(tools: AITool[]): number {
  return tools.reduce((sum, tool) => sum + tool.monthlySpend, 0);
}

/**
 * Sort recommendations by potential savings (highest first)
 */
export function sortByPotentialSavings(
  recommendations: Array<{ estimatedSavings: number }>
) {
  return recommendations.sort(
    (a, b) => b.estimatedSavings - a.estimatedSavings
  );
}

/**
 * Filter recommendations by confidence level
 */
export function filterByConfidence(
  recommendations: Array<{ confidence: 'high' | 'medium' | 'low' }>,
  minConfidence: 'high' | 'medium' | 'low' = 'medium'
) {
  const confidenceLevels = { high: 3, medium: 2, low: 1 };
  const min = confidenceLevels[minConfidence];

  return recommendations.filter(
    (rec) => confidenceLevels[rec.confidence] >= min
  );
}
