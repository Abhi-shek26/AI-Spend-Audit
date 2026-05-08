/**
 * Initial unit test for audit engine
 * Run with: npm test
 */

import { describe, it, expect } from 'vitest';
import { evaluate } from '@/lib/audit/engine';
import { AuditInput } from '@/lib/audit/types';

describe('Audit Engine', () => {
  const mockInput: AuditInput = {
    tools: [
      {
        id: 'chatgpt-1',
        name: 'ChatGPT',
        monthlySpend: 20,
        currentPlan: 'pro',
        usageFrequency: 'daily',
      },
    ],
    teamSize: 'solo',
    useCases: ['Development'],
    totalMonthlySpend: 20,
  };

  it('should evaluate a valid audit input', () => {
    const result = evaluate(mockInput);

    expect(result).toBeDefined();
    expect(result.id).toMatch(/^audit_/);
    expect(result.input).toEqual(mockInput);
    expect(result.savingsPercentage).toBeGreaterThanOrEqual(0);
  });

  it('should throw error with empty tools array', () => {
    const invalidInput: AuditInput = {
      ...mockInput,
      tools: [],
    };

    expect(() => evaluate(invalidInput)).toThrow();
  });

  it('should be deterministic - same input produces same results', () => {
    const result1 = evaluate(mockInput);
    const result2 = evaluate(mockInput);

    // IDs will differ, so compare other fields
    expect(result1.savingsPercentage).toEqual(result2.savingsPercentage);
    expect(result1.recommendations.length).toEqual(
      result2.recommendations.length
    );
  });
});
