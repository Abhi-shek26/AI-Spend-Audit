import { describe, it, expect } from 'vitest';
import { checkTeamSizeMismatch } from '../../src/lib/audit/rules';
import { AITool } from '../../src/lib/audit/types';

describe('checkTeamSizeMismatch', () => {
  it('should recommend downgrade for solo user on pro plan', () => {
    const tool: AITool = {
      id: 'cursor-1',
      name: 'Cursor',
      monthlySpend: 20,
      currentPlan: 'pro',
      usageFrequency: 'daily',
    };

    const recommendations = checkTeamSizeMismatch(tool, 'solo');

    expect(recommendations).toHaveLength(1);
    expect(recommendations[0]).toMatchObject({
      toolId: 'cursor-1',
      toolName: 'Cursor',
      type: 'downgrade',
      nextPlan: 'free',
      confidence: 'high',
    });
    expect(recommendations[0].estimatedSavings).toBeGreaterThan(0);
  });

  it('should recommend downgrade for solo user on enterprise plan', () => {
    const tool: AITool = {
      id: 'github-copilot-1',
      name: 'GitHub Copilot',
      monthlySpend: 39,
      currentPlan: 'enterprise',
      usageFrequency: 'daily',
    };

    const recommendations = checkTeamSizeMismatch(tool, 'solo');

    expect(recommendations).toHaveLength(1);
    expect(recommendations[0]).toMatchObject({
      type: 'downgrade',
      nextPlan: 'free',
      confidence: 'high',
    });
    expect(recommendations[0].estimatedSavings).toBeGreaterThan(0);
  });

  it('should not recommend downgrade for solo user on free plan', () => {
    const tool: AITool = {
      id: 'chatgpt-1',
      name: 'ChatGPT',
      monthlySpend: 0,
      currentPlan: 'free',
      usageFrequency: 'daily',
    };

    const recommendations = checkTeamSizeMismatch(tool, 'solo');

    expect(recommendations).toHaveLength(0);
  });

  it('should not recommend for small team on pro plan', () => {
    const tool: AITool = {
      id: 'cursor-1',
      name: 'Cursor',
      monthlySpend: 20,
      currentPlan: 'pro',
      usageFrequency: 'daily',
    };

    const recommendations = checkTeamSizeMismatch(tool, 'small');

    expect(recommendations).toHaveLength(0);
  });

  it('should recommend downgrade for small team on enterprise plan', () => {
    const tool: AITool = {
      id: 'claude-1',
      name: 'Claude',
      monthlySpend: 30,
      currentPlan: 'enterprise',
      usageFrequency: 'daily',
    };

    const recommendations = checkTeamSizeMismatch(tool, 'small');

    expect(recommendations).toHaveLength(1);
    expect(recommendations[0]).toMatchObject({
      type: 'downgrade',
      nextPlan: 'pro',
      confidence: 'medium',
    });
    expect(recommendations[0].estimatedSavings).toBeGreaterThanOrEqual(0);
  });

  it('should not recommend for medium team on enterprise plan', () => {
    const tool: AITool = {
      id: 'claude-1',
      name: 'Claude',
      monthlySpend: 30,
      currentPlan: 'enterprise',
      usageFrequency: 'daily',
    };

    const recommendations = checkTeamSizeMismatch(tool, 'medium');

    expect(recommendations).toHaveLength(0);
  });

  it('should not recommend for large team on enterprise plan', () => {
    const tool: AITool = {
      id: 'github-copilot-1',
      name: 'GitHub Copilot',
      monthlySpend: 39,
      currentPlan: 'enterprise',
      usageFrequency: 'daily',
    };

    const recommendations = checkTeamSizeMismatch(tool, 'large');

    expect(recommendations).toHaveLength(0);
  });

  it('should handle unknown tool gracefully', () => {
    const tool: AITool = {
      id: 'unknown-1',
      name: 'UnknownTool',
      monthlySpend: 50,
      currentPlan: 'pro',
      usageFrequency: 'daily',
    };

    const recommendations = checkTeamSizeMismatch(tool, 'solo');

    expect(recommendations).toHaveLength(0);
  });
});
