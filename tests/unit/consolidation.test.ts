import { describe, it, expect } from 'vitest';
import { detectConsolidationOpportunities } from '@/lib/audit/rules';
import { AITool } from '@/lib/audit/types';

describe('detectConsolidationOpportunities', () => {
  it('recommends consolidation when multiple LLMs present and paid', () => {
    const tools: AITool[] = [
      { id: 't1', name: 'ChatGPT', monthlySpend: 20, currentPlan: 'pro', usageFrequency: 'monthly' },
      { id: 't2', name: 'Claude', monthlySpend: 15, currentPlan: 'pro', usageFrequency: 'monthly' },
    ];

    const recs = detectConsolidationOpportunities(tools, []);
    expect(recs.length).toBeGreaterThanOrEqual(1);
    expect(recs[0].type).toBe('consolidate');
  });

  it('does not recommend consolidation for single tool', () => {
    const tools: AITool[] = [
      { id: 't1', name: 'ChatGPT', monthlySpend: 20, currentPlan: 'pro', usageFrequency: 'daily' },
    ];

    const recs = detectConsolidationOpportunities(tools, []);
    expect(recs).toHaveLength(0);
  });
});
