/**
 * Test for duplicate recommendation detection and deduplication
 */

import { describe, it, expect } from 'vitest';
import { evaluate } from '@/lib/audit/engine';
import { AuditInput } from '@/lib/audit/types';

describe('Recommendation Deduplication', () => {
  it('should not generate duplicate recommendations for same tool', () => {
    // Scenario: A tool that matches multiple rules
    // - Rare usage + paid plan = underutilization recommendation
    // - Solo user + pro plan = team size mismatch recommendation (both suggest downgrade)
    // This could generate 2 downgrade recommendations for same tool
    const input: AuditInput = {
      tools: [
        {
          id: 'cursor-1',
          name: 'Cursor',
          monthlySpend: 20,
          currentPlan: 'pro',
          usageFrequency: 'rare',
        },
      ],
      teamSize: 'solo',
      useCases: ['development'],
      totalMonthlySpend: 20,
    };

    const result = evaluate(input);

    // Count recommendations for this tool
    const cursorRecs = result.recommendations.filter(r => r.toolId === 'cursor-1');
    
    // Should have exactly one downgrade recommendation, not duplicates
    const downgradeRecs = cursorRecs.filter(r => r.type === 'downgrade');
    expect(downgradeRecs.length).toBe(1, 'Should have exactly one downgrade recommendation for Cursor');
    
    // If there are multiple downgrade recs for same tool, they should not have identical reasons
    const reasons = downgradeRecs.map(r => r.reason);
    const uniqueReasons = new Set(reasons);
    expect(uniqueReasons.size).toBe(reasons.length, 'All reasons should be unique');
  });

  it('should deduplicate when same recommendation applies from multiple rules', () => {
    // Scenario: Tool that is both underutilized AND mismatched for team size
    // Should not double-count the savings
    const input: AuditInput = {
      tools: [
        {
          id: 'chatgpt-pro',
          name: 'ChatGPT',
          monthlySpend: 20,
          currentPlan: 'pro',
          usageFrequency: 'rare',
        },
      ],
      teamSize: 'solo',
      useCases: [],
      totalMonthlySpend: 20,
    };

    const result = evaluate(input);

    // Ensure total savings is calculated correctly
    // ChatGPT pro ($20) -> free ($0) = $20 savings
    expect(result.totalMonthlySavings).toBeLessThanOrEqual(20, 'Savings should not be double-counted');
    
    // Check that recommendation count is reasonable
    const chatgptRecs = result.recommendations.filter(r => r.toolId === 'chatgpt-pro');
    expect(chatgptRecs.length).toBeLessThanOrEqual(2, 'Should not have many duplicates for single tool');
  });

  it('should preserve unique consolidation recommendations', () => {
    // Scenario: Multiple LLM tools that could be consolidated
    const input: AuditInput = {
      tools: [
        {
          id: 'chatgpt-pro',
          name: 'ChatGPT',
          monthlySpend: 20,
          currentPlan: 'pro',
          usageFrequency: 'weekly',
        },
        {
          id: 'claude-pro',
          name: 'Claude',
          monthlySpend: 25,
          currentPlan: 'pro',
          usageFrequency: 'weekly',
        },
      ],
      teamSize: 'solo',
      useCases: ['content creation'],
      totalMonthlySpend: 45,
    };

    const result = evaluate(input);

    // Find consolidation recommendations
    const consolidationRecs = result.recommendations.filter(r => r.type === 'consolidate');
    
    // Should have at most one consolidation rec per tool (not duplicates)
    const toolIds = consolidationRecs.map(r => r.toolId);
    const uniqueToolIds = new Set(toolIds);
    expect(uniqueToolIds.size).toBe(toolIds.length, 'Each tool should have at most one consolidation recommendation');
  });
});
