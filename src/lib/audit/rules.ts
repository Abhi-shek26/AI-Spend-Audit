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
  tools: AITool[],
  _useCases: string[] = []
): Recommendation[] {
  void _useCases;
  // Simple heuristic: group known interchangeable tools (chat-style LLMs)
  const groups: Record<string, string[]> = {
    llm: ['ChatGPT', 'Claude', 'Cursor', 'Vertex AI'],
    copilots: ['GitHub Copilot', 'Cursor'],
  };

  const recs: Recommendation[] = [];

  // For each group, find matching tools
  for (const groupName of Object.keys(groups)) {
    const members = groups[groupName];
    const present = tools.filter((t) => members.includes(t.name));

    if (present.length <= 1) continue; // nothing to consolidate

    // Recommend consolidating the less-used/cheaper ones into the highest-usage or lowest-cost primary
    // Choose alternative as the tool with highest monthlySpend (common choice for continuity)
    const alternative = present.reduce((a, b) => (a.monthlySpend >= b.monthlySpend ? a : b));

    for (const t of present) {
      if (t.id === alternative.id) continue;

      // Only recommend consolidation for paid plans
      if (t.currentPlan === 'free') continue;

      recs.push({
        toolId: t.id,
        toolName: t.name,
        type: 'consolidate',
        reason: `Multiple ${groupName} tools detected. Consider consolidating into ${alternative.name}`,
        // Conservative: consolidation suggestions are low-confidence and do not assume full savings here
        estimatedSavings: 0,
        alternative: alternative.name,
        confidence: 'low',
      });
    }
  }

  return recs;
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

