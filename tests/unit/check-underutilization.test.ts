import { describe, expect, it } from 'vitest';

import { checkUnderutilization } from '../../src/lib/audit/rules';
import type { AITool } from '../../src/lib/audit/types';

describe('checkUnderutilization', () => {
  it('returns a downgrade recommendation for rare usage on paid plan', () => {
    const tool: AITool = {
      id: 'cursor-1',
      name: 'Cursor',
      monthlySpend: 20,
      currentPlan: 'pro',
      usageFrequency: 'rare',
    };

    const result = checkUnderutilization(tool);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      toolId: 'cursor-1',
      type: 'downgrade',
      nextPlan: 'free',
      confidence: 'high',
      estimatedSavings: 20,
    });
  });

  it('returns no recommendation for daily usage on paid plan', () => {
    const tool: AITool = {
      id: 'chatgpt-1',
      name: 'ChatGPT',
      monthlySpend: 20,
      currentPlan: 'pro',
      usageFrequency: 'daily',
    };

    expect(checkUnderutilization(tool)).toEqual([]);
  });

  it('returns no recommendation for free plan even if rare usage', () => {
    const tool: AITool = {
      id: 'claude-1',
      name: 'Claude',
      monthlySpend: 0,
      currentPlan: 'free',
      usageFrequency: 'rare',
    };

    expect(checkUnderutilization(tool)).toEqual([]);
  });

  it('returns no recommendation for unknown tools without pricing data', () => {
    const tool: AITool = {
      id: 'custom-1',
      name: 'SomeUnknownTool',
      monthlySpend: 50,
      currentPlan: 'pro',
      usageFrequency: 'monthly',
    };

    expect(checkUnderutilization(tool)).toEqual([]);
  });

  it('never returns negative savings', () => {
    const tool: AITool = {
      id: 'copilot-1',
      name: 'GitHub Copilot',
      monthlySpend: 0,
      currentPlan: 'enterprise',
      usageFrequency: 'monthly',
    };

    const result = checkUnderutilization(tool);
    expect(result).toHaveLength(1);
    expect(result[0].estimatedSavings).toBeGreaterThanOrEqual(0);
  });
});