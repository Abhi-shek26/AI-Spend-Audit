import { describe, it, expect } from 'vitest';
import { evaluate } from '@/lib/audit/engine';
import { AuditInput } from '@/lib/audit/types';

describe('Audit Engine - additional engine-level tests', () => {
  it('should include underutilization and team-size recommendations for combined scenarios', () => {
    const input: AuditInput = {
      tools: [
        {
          id: 'cursor-rare',
          name: 'Cursor',
          monthlySpend: 20,
          currentPlan: 'pro',
          usageFrequency: 'rare',
        },
        {
          id: 'chatgpt-ent',
          name: 'ChatGPT',
          monthlySpend: 60,
          currentPlan: 'enterprise',
          usageFrequency: 'daily',
        },
      ],
      teamSize: 'small',
      useCases: ['docs', 'codegen'],
      totalMonthlySpend: 80,
    };

    const result = evaluate(input);

    // Expect at least two recommendations (one underutilization + one team-size)
    expect(result.recommendations.length).toBeGreaterThanOrEqual(2);

    const types = result.recommendations.map((r) => r.type);
    expect(types).toContain('downgrade');

    // Ensure totalMonthlySavings is a positive number
    expect(result.totalMonthlySavings).toBeGreaterThan(0);
  });

  it('should compute savingsPercentage correctly for known pricing-scenarios', () => {
    // Cursor pro (20 -> free 0) savings 20
    // ChatGPT enterprise (60 -> pro 20) savings 40
    // total spend = 20 + 60 = 80, total savings = 60 => 75%
    const input: AuditInput = {
      tools: [
        {
          id: 'cursor-rare',
          name: 'Cursor',
          monthlySpend: 20,
          currentPlan: 'pro',
          usageFrequency: 'rare',
        },
        {
          id: 'chatgpt-ent',
          name: 'ChatGPT',
          monthlySpend: 60,
          currentPlan: 'enterprise',
          usageFrequency: 'daily',
        },
      ],
      teamSize: 'small',
      useCases: ['docs', 'codegen'],
      totalMonthlySpend: 80,
    };

    const result = evaluate(input);

    expect(result.totalMonthlySavings).toEqual(60);
    expect(result.savingsPercentage).toEqual(75);
  });
});
