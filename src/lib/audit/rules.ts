/**
 * Audit recommendation rules
 * Each rule is a pure function that takes audit input and returns recommendations
 */

import { AITool, Recommendation } from './types';
import { getPricingForTool } from './pricing';

/**
 * Rule: Detect underutilized paid tools
 * If someone rarely uses a tool but pays for a paid plan, recommend a downgrade.
 */
export function checkUnderutilization(tool: AITool): Recommendation[] {
  const pricing = getPricingForTool(tool.name);

  if (!pricing || tool.currentPlan === 'free') {
    return [];
  }

  const isUnderutilized = tool.usageFrequency === 'rare' || tool.usageFrequency === 'monthly';

  if (!isUnderutilized) {
    return [];
  }

  const currentPlanCost = pricing[tool.currentPlan]?.cost ?? tool.monthlySpend;
  const freePlanCost = pricing.free?.cost ?? 0;
  const estimatedSavings = Math.max(currentPlanCost - freePlanCost, 0);

  if (estimatedSavings <= 0) {
    return [];
  }

  return [
    {
      toolId: tool.id,
      toolName: tool.name,
      type: 'downgrade',
      reason: `Used ${tool.usageFrequency} but paying for ${tool.currentPlan} plan`,
      estimatedSavings,
      nextPlan: 'free',
      confidence: 'high',
    },
  ];
}

/**
 * Backwards-compatible wrapper used by the existing engine/tests until wiring is updated.
 */
export function detectUnderutilizedTools(tools: AITool[]): Recommendation[] {
  return tools.flatMap((tool) => checkUnderutilization(tool));
}

/**
 * Rule: Detect tools that might be consolidated with alternatives
 * Example: Having both ChatGPT Pro and Claude Pro when usage is light
 */
export function detectConsolidationOpportunities(
  _tools: AITool[],
  _useCase: string
): Recommendation[] {
  // TODO: Implement consolidation logic
  // This would check if there are similar tools in different use cases
  // that could be consolidated into one
  return [];
}

/**
 * Rule: Check for team-size mismatches
 * Solo user paying for team plans, or large teams with individual plans
 */
export function detectTeamSizeMismatch(
  _tools: AITool[],
  _teamSize: string
): Recommendation[] {
  // TODO: Implement team size logic
  return [];
}

