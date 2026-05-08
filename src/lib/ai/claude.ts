/**
 * Core AI integration with Claude API for summary generation
 * Used ONLY for generating human-readable summaries
 * All audit logic remains deterministic
 */

import { AuditResult } from '@/lib/audit/types';
import { env } from '@/env';

export interface SummaryGenerationOptions {
  tone?: 'professional' | 'casual' | 'urgent';
  includeRecommendations?: boolean;
}

/**
 * Generate an AI summary of the audit results
 * This is the ONLY place where non-deterministic AI is used
 */
export async function generateAuditSummary(
  result: AuditResult,
  _options: SummaryGenerationOptions = {}
): Promise<string> {
  if (!env.anthropicApiKey) {
    throw new Error('ANTHROPIC_API_KEY not set');
  }

  // Mark _options as used to satisfy lint rules
  void _options;

  // TODO: Implement Claude API call
  // For now, return a placeholder
  return generatePlaceholderSummary(result);
}

/**
 * Placeholder summary for when Claude API is not available
 */
function generatePlaceholderSummary(result: AuditResult): string {
  const { recommendations, totalMonthlySavings, savingsPercentage } = result;

  if (recommendations.length === 0) {
    return `Your AI tool spending is well-optimized. No immediate changes recommended.`;
  }

  const topRec = recommendations[0];

  return `
  Your AI spending audit found ${recommendations.length} optimization opportunities.
  
  Top recommendation: ${topRec.reason}
  
  Potential monthly savings: $${totalMonthlySavings} (${savingsPercentage}% of current spend)
  `.trim();
}
