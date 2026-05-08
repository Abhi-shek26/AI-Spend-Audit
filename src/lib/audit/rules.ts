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
  // TODO: Implement consolidation logic
  // This would check if there are similar tools in different use cases
  // that could be consolidated into one
): Recommendation[] {
  return [];
}

/**
 * Rule: Check for team-size mismatches
 * Solo user paying for team plans should downgrade
 */
export function checkTeamSizeMismatch(
  tool: AITool,
  teamSize: 'solo' | 'small' | 'medium' | 'large'
): Recommendation[] {
  const pricing = getPricingForTool(tool.name);

  if (!pricing || tool.currentPlan === 'free') {
    return [];
  }

  // Solo users should never use enterprise/team plans
  if (teamSize === 'solo' && (tool.currentPlan === 'enterprise' || tool.currentPlan === 'pro')) {
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
        reason: `Solo user paying for ${tool.currentPlan} plan; free plan recommended`,
        estimatedSavings,
        nextPlan: 'free',
        confidence: 'high',
      },
    ];
  }

  // Small teams should not use enterprise plans if not needed
  if (teamSize === 'small' && tool.currentPlan === 'enterprise') {
    const enterpriseCost = pricing.enterprise?.cost ?? tool.monthlySpend;
    const proCost = pricing.pro?.cost ?? enterpriseCost;
    const estimatedSavings = Math.max(enterpriseCost - proCost, 0);

    if (estimatedSavings <= 0) {
      return [];
    }

    return [
      {
        toolId: tool.id,
        toolName: tool.name,
        type: 'downgrade',
        reason: `Small team on enterprise plan; pro plan may be sufficient`,
        estimatedSavings,
        nextPlan: 'pro',
        confidence: 'medium',
      },
    ];
  }

  return [];
}

