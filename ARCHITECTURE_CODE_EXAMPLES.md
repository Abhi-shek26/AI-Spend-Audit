# Architecture Code Examples

Concrete implementations of the architectural patterns discussed in ARCHITECTURE.md

---

## 🧩 Core Audit Engine

### `src/lib/audit/engine.ts`

```typescript
/**
 * Core audit engine - deterministic, testable, zero dependencies
 * This function is the heart of the system
 */

import {
  AuditInput,
  AuditResult,
  Recommendation,
  AITool,
} from './types';
import * as rules from './rules';
import { sortByPotentialSavings, filterByConfidence } from './utils';

/**
 * Main entry point: evaluate spending and generate recommendations
 * MUST be deterministic: same input = same output, every time
 */
export function evaluate(input: AuditInput): AuditResult {
  // 1. Validate input
  if (!input.tools || input.tools.length === 0) {
    throw new Error('At least one tool is required');
  }

  if (input.totalMonthlySpend < 0) {
    throw new Error('Monthly spend must be >= 0');
  }

  // 2. Generate recommendations from each rule
  const allRecommendations: Recommendation[] = [];

  // Run each rule independently
  for (const tool of input.tools) {
    allRecommendations.push(
      ...rules.checkUnderutilization(tool),
      ...rules.checkTeamSizeMismatch(tool, input.teamSize),
      ...rules.checkForAlternatives(tool, input.tools)
    );
  }

  // 3. Consolidation rules (need full context)
  allRecommendations.push(
    ...rules.checkDuplicateTools(input.tools),
    ...rules.checkUnusedTierFeatures(input.tools)
  );

  // 4. Post-process recommendations
  const recommendations = allRecommendations
    .filter((rec) => rec.estimatedSavings > 0) // Only positive savings
    .reduce((unique, rec) => {
      // Deduplicate: only keep highest-savings rec per tool
      const existing = unique.find((r) => r.toolId === rec.toolId);
      if (!existing || existing.estimatedSavings < rec.estimatedSavings) {
        return [...unique.filter((r) => r.toolId !== rec.toolId), rec];
      }
      return unique;
    }, [] as Recommendation[])
    .sort((a, b) => b.estimatedSavings - a.estimatedSavings) // Highest first
    .slice(0, 10) // Max 10 recommendations (avoid overwhelm)
    .map((rec) => ({
      ...rec,
      // Add confidence multiplier for sorting
      confidenceScore: getConfidenceScore(rec.confidence),
    }));

  // 5. Calculate totals
  const totalMonthlySavings = recommendations.reduce(
    (sum, rec) => sum + rec.estimatedSavings,
    0
  );

  const savingsPercentage =
    input.totalMonthlySpend > 0
      ? Math.round((totalMonthlySavings / input.totalMonthlySpend) * 100)
      : 0;

  // 6. Return result
  const result: AuditResult = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    input,
    recommendations,
    totalMonthlySavings,
    savingsPercentage,
    summary: '', // Will be filled by Claude later
    shareableUrl: '', // Will be filled by API
  };

  return result;
}

/**
 * Helper: Generate unique audit ID
 * Format: audit_[timestamp]_[random]
 */
function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 11);
  return `audit_${timestamp}_${random}`;
}

/**
 * Helper: Convert confidence to numeric score for sorting
 */
function getConfidenceScore(confidence: 'high' | 'medium' | 'low'): number {
  return { high: 3, medium: 2, low: 1 }[confidence];
}

export { type AuditInput, type AuditResult, type Recommendation };
```

---

## 📏 Recommendation Rules

### `src/lib/audit/rules.ts`

```typescript
/**
 * Audit recommendation rules
 * Each rule is a pure function that takes tool(s) and returns recommendations
 */

import { AITool, Recommendation } from './types';
import { getPricingData } from './pricing';

/**
 * Rule: Detect underutilized paid plans
 *
 * Logic:
 * - If tool is paid (pro/enterprise) but used infrequently → downgrade
 * - Example: ChatGPT Pro $20/month used only once a month
 */
export function checkUnderutilization(tool: AITool): Recommendation[] {
  const pricing = getPricingData(tool.name);
  if (!pricing || tool.currentPlan === 'free') return [];

  // Check frequency
  const underutilized =
    tool.usageFrequency === 'rare' || tool.usageFrequency === 'monthly';

  if (!underutilized) return [];

  // Estimate downgrade savings
  const currentCost = pricing[tool.currentPlan]?.cost || 0;
  const downgradeCost = pricing.free?.cost || 0;
  const savings = currentCost - downgradeCost;

  if (savings <= 0) return [];

  return [
    {
      toolId: tool.id,
      toolName: tool.name,
      type: 'downgrade',
      reason: `Used ${tool.usageFrequency} but paying for ${tool.currentPlan} plan`,
      estimatedSavings: savings,
      nextPlan: 'free',
      confidence: 'high',
    },
  ];
}

/**
 * Rule: Detect team size mismatches
 *
 * Logic:
 * - Solo developer shouldn't pay for team plan (waste)
 * - Large team might benefit from enterprise discounts
 */
export function checkTeamSizeMismatch(
  tool: AITool,
  teamSize: string
): Recommendation[] {
  const pricing = getPricingData(tool.name);
  if (!pricing) return [];

  const recommendations: Recommendation[] = [];

  // Check solo using team plan
  if (teamSize === 'solo' && tool.currentPlan === 'team') {
    const teamCost = pricing.team?.cost || 0;
    const proCost = pricing.pro?.cost || 0;
    const savings = teamCost - proCost;

    if (savings > 0) {
      recommendations.push({
        toolId: tool.id,
        toolName: tool.name,
        type: 'downgrade',
        reason: `Solo developer doesn't need team plan`,
        estimatedSavings: savings,
        nextPlan: 'pro',
        confidence: 'high',
      });
    }
  }

  // Check large team using individual plan
  if (
    (teamSize === 'large' || teamSize === 'medium') &&
    tool.currentPlan === 'pro'
  ) {
    const proCost = pricing.pro?.cost || 0;
    const teamCost = pricing.team?.cost || 0;

    // Only recommend if team plan has volume discounts
    if (teamCost < proCost * 0.8) {
      // Team plan saves 20% per user
      recommendations.push({
        toolId: tool.id,
        toolName: tool.name,
        type: 'upgrade', // Paradox: upgrade saves money!
        reason: `Large team qualifies for volume discount`,
        estimatedSavings: (proCost - teamCost) * 5, // Rough estimate
        nextPlan: 'team',
        confidence: 'medium',
      });
    }
  }

  return recommendations;
}

/**
 * Rule: Detect duplicate tool subscriptions
 *
 * Logic:
 * - Having ChatGPT Pro + Claude Pro for solo dev = consolidate
 * - Similar features at different costs = keep cheaper
 */
export function checkDuplicateTools(tools: AITool[]): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const toolPairs = [
    ['ChatGPT', 'Claude'],
    ['ChatGPT', 'Gemini'],
    ['Claude', 'Perplexity'],
  ];

  for (const [toolA, toolB] of toolPairs) {
    const subsA = tools.find((t) => t.name === toolA && t.currentPlan !== 'free');
    const subsB = tools.find((t) => t.name === toolB && t.currentPlan !== 'free');

    if (subsA && subsB) {
      // Both paid subscriptions exist
      const costA = subsA.monthlySpend;
      const costB = subsB.monthlySpend;
      const toDelete = costA > costB ? subsA : subsB;
      const savings = Math.max(costA, costB);

      recommendations.push({
        toolId: toDelete.id,
        toolName: toDelete.name,
        type: 'consolidate',
        reason: `Similar functionality to ${
          toDelete.name === toolA ? toolB : toolA
        } - consolidate`,
        estimatedSavings: savings,
        alternative: toDelete.name === toolA ? toolB : toolA,
        confidence: 'medium',
      });
    }
  }

  return recommendations;
}

/**
 * Rule: Suggest cheaper alternatives
 *
 * Logic:
 * - ChatGPT $20 → Claude $20, but Claude has better code (use case dependent)
 * - Paid alternative exists that's cheaper
 */
export function checkForAlternatives(
  tool: AITool,
  allTools: AITool[]
): Recommendation[] {
  if (tool.currentPlan === 'free') return [];

  // Define alternatives (tool -> [cheaper_alternatives])
  const alternatives: Record<string, Array<{ name: string; cost: number }>> = {
    'ChatGPT': [
      { name: 'Claude', cost: 20 },
      { name: 'Perplexity', cost: 20 },
    ],
    'GitHub Copilot': [{ name: 'Claude', cost: 20 }],
    'Cursor': [
      { name: 'VS Code', cost: 0 },
      { name: 'GitHub Copilot', cost: 10 },
    ],
  };

  const alts = alternatives[tool.name];
  if (!alts) return [];

  const currentCost = tool.monthlySpend;
  const recommendations: Recommendation[] = [];

  for (const alt of alts) {
    // Skip if already subscribed
    if (allTools.find((t) => t.name === alt.name)) continue;

    const savings = currentCost - alt.cost;
    if (savings <= 0) continue;

    recommendations.push({
      toolId: tool.id,
      toolName: tool.name,
      type: 'switch',
      reason: `${alt.name} offers similar features at potentially lower cost`,
      estimatedSavings: savings,
      alternative: alt.name,
      confidence: 'low', // Low confidence: features may differ
    });
  }

  return recommendations;
}

/**
 * Rule: Detect paid features that go unused
 *
 * Logic:
 * - Has API access ($20/month extra) but never uses API
 * - Has fine-tuning capability but never fine-tunes
 */
export function checkUnusedTierFeatures(tools: AITool[]): Recommendation[] {
  // This would need more detailed input (which features are used)
  // For MVP, skip this rule
  return [];
}
```

---

## 🔌 API Route

### `src/app/api/audit/evaluate/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { evaluate } from '@/lib/audit/engine';
import { validateAuditInput } from '@/lib/utils/validators';
import { generateSummary } from '@/lib/ai/claude';
import * as db from '@/lib/db';
import { env } from '@/env';

/**
 * POST /api/audit/evaluate
 *
 * Request Body:
 * {
 *   tools: AITool[],
 *   teamSize: string,
 *   useCases: string[],
 *   totalMonthlySpend: number
 * }
 *
 * Response:
 * {
 *   success: true,
 *   data: AuditResult,
 *   shareUrl: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate input
    const body = await request.json();

    if (!validateAuditInput(body)) {
      return NextResponse.json(
        { success: false, error: 'Invalid audit input' },
        { status: 400 }
      );
    }

    // 2. Run deterministic audit engine
    const result = evaluate(body);

    // 3. Save result to database
    const saved = await db.saveAuditResult(result);

    // 4. Generate share URL
    const shareUrl = `${env.appUrl}/reports/${result.id}?token=${saved.shareToken}`;

    // 5. Generate AI summary in background (fire and forget)
    // Don't await - return immediately for better UX
    generateSummaryInBackground(result.id, result)
      .catch((error) => console.error('Summary generation failed:', error));

    // 6. Immediate response (summary will be added later)
    return NextResponse.json(
      {
        success: true,
        data: {
          id: result.id,
          recommendations: result.recommendations,
          totalMonthlySavings: result.totalMonthlySavings,
          savingsPercentage: result.savingsPercentage,
          // Note: summary is empty, will be filled async
        },
        shareUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Audit error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Generate summary asynchronously
 * Called after immediate response, no timeout pressure
 */
async function generateSummaryInBackground(
  auditId: string,
  result: any
): Promise<void> {
  try {
    const summary = await generateSummary(result);
    await db.updateAuditResult(auditId, { summary });
  } catch (error) {
    console.error(`Failed to generate summary for ${auditId}:`, error);
    // Don't retry - operator will see empty summary and can regenerate
  }
}

/**
 * GET /api/audit/evaluate
 * Health check
 */
export async function GET() {
  return NextResponse.json(
    {
      success: true,
      message: 'Audit engine ready',
    },
    { status: 200 }
  );
}
```

---

## 📊 Public Share Page with Open Graph

### `src/app/reports/[id]/page.tsx`

```typescript
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import * as db from '@/lib/db';
import { formatCurrency, formatPercentage } from '@/lib/utils/formatters';

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const { id } = params;

  // Fetch report data for metadata
  const report = await db.getPublicReport(id);

  if (!report) {
    return {
      title: 'Report Not Found',
      description: 'This report is no longer available.',
    };
  }

  const { recommendations, totalMonthlySavings, savingsPercentage } = report;

  return {
    title: `Save ${formatCurrency(totalMonthlySavings)}/month on AI Tools`,
    description: `This AI spend audit found ${recommendations.length} ways to save ${savingsPercentage}% of monthly AI spending.`,

    // Open Graph for social sharing
    openGraph: {
      title: `Save ${formatCurrency(totalMonthlySavings)}/month on AI Tools`,
      description: `Found ${recommendations.length} optimization opportunities for AI tool spending.`,
      type: 'website',
      url: `https://app.com/reports/${id}`,
      images: [
        {
          url: `/api/og-image?id=${id}`, // Dynamic OG image
          width: 1200,
          height: 630,
          alt: 'AI Spend Audit Results',
        },
      ],
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: `Save ${formatCurrency(totalMonthlySavings)}/month on AI Tools`,
      description: `Audit found ${savingsPercentage}% in potential savings.`,
      images: [`/api/og-image?id=${id}`],
    },
  };
}

export default async function ReportPage({ params }: { params: { id: string } }) {
  const report = await db.getPublicReport(params.id);

  if (!report) {
    notFound();
  }

  const {
    recommendations,
    totalMonthlySavings,
    savingsPercentage,
    summary,
    input,
  } = report;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="mx-auto max-w-2xl px-4 py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            Your AI Spend Audit
          </h1>
          <p className="mt-2 text-xl text-gray-600">
            Potential monthly savings: <span className="font-bold text-green-600">
              {formatCurrency(totalMonthlySavings)}
            </span>
          </p>
        </div>

        {/* Summary Section */}
        {summary && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              AI Summary
            </h2>
            <p className="text-gray-700">{summary}</p>
          </div>
        )}

        {/* Current Spending */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Current Spending
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Monthly Spend</p>
              <p className="text-2xl font-bold">
                {formatCurrency(input.totalMonthlySpend)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Potential Savings</p>
              <p className="text-2xl font-bold text-green-600">
                {formatPercentage(savingsPercentage)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tools Audited</p>
              <p className="text-2xl font-bold">{input.tools.length}</p>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-6 text-lg font-semibold text-gray-900">
            Recommendations ({recommendations.length})
          </h2>

          <div className="space-y-4">
            {recommendations.map((rec, idx) => (
              <div
                key={`${rec.toolId}-${idx}`}
                className="border-l-4 border-green-500 bg-green-50 p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{rec.toolName}</h3>
                  <span className="rounded bg-green-200 px-3 py-1 text-sm font-bold text-green-800">
                    Save {formatCurrency(rec.estimatedSavings)}/mo
                  </span>
                </div>
                <p className="mb-2 text-gray-700">{rec.reason}</p>
                {rec.nextPlan && (
                  <p className="text-sm text-gray-600">
                    ➜ Recommended plan: <span className="font-semibold">{rec.nextPlan}</span>
                  </p>
                )}
                {rec.alternative && (
                  <p className="text-sm text-gray-600">
                    ➜ Alternative: <span className="font-semibold">{rec.alternative}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-12 text-center">
          <a
            href="/"
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition"
          >
            Audit Your Spending
          </a>
        </div>
      </div>
    </main>
  );
}
```

---

## ✅ Unit Tests

### `tests/unit/audit.engine.test.ts`

```typescript
import { describe, it, expect } from '@jest/globals';
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

  describe('Determinism', () => {
    it('should produce identical results for identical inputs', () => {
      const result1 = evaluate(mockInput);
      const result2 = evaluate(mockInput);

      // Different IDs (timestamps), but same analysis
      expect(result1.id).not.toBe(result2.id);

      // Same results
      expect(result1.recommendations.length).toBe(result2.recommendations.length);
      expect(result1.totalMonthlySavings).toBe(result2.totalMonthlySavings);
      expect(result1.savingsPercentage).toBe(result2.savingsPercentage);
    });
  });

  describe('Validation', () => {
    it('should throw on empty tools array', () => {
      expect(() =>
        evaluate({
          ...mockInput,
          tools: [],
        })
      ).toThrow('At least one tool is required');
    });

    it('should throw on negative spend', () => {
      expect(() =>
        evaluate({
          ...mockInput,
          totalMonthlySpend: -100,
        })
      ).toThrow('Monthly spend must be >= 0');
    });
  });

  describe('Recommendations', () => {
    it('should detect underutilized pro tools', () => {
      const input: AuditInput = {
        ...mockInput,
        tools: [
          {
            id: 'tool-1',
            name: 'ChatGPT',
            monthlySpend: 20,
            currentPlan: 'pro',
            usageFrequency: 'rare', // Rarely used
          },
        ],
      };

      const result = evaluate(input);
      expect(result.recommendations).toContainEqual(
        expect.objectContaining({
          toolId: 'tool-1',
          type: 'downgrade',
          estimatedSavings: 20,
        })
      );
    });

    it('should cap recommendations at 10', () => {
      const manyTools = Array.from({ length: 20 }, (_, i) => ({
        id: `tool-${i}`,
        name: 'Tool' + i,
        monthlySpend: 20,
        currentPlan: 'pro' as const,
        usageFrequency: 'rare' as const,
      }));

      const result = evaluate({
        ...mockInput,
        tools: manyTools,
        totalMonthlySpend: 400,
      });

      expect(result.recommendations.length).toBeLessThanOrEqual(10);
    });

    it('should sort by savings amount', () => {
      const result = evaluate(mockInput);

      for (let i = 1; i < result.recommendations.length; i++) {
        expect(result.recommendations[i - 1].estimatedSavings).toBeGreaterThanOrEqual(
          result.recommendations[i].estimatedSavings
        );
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero spend gracefully', () => {
      const result = evaluate({
        ...mockInput,
        totalMonthlySpend: 0,
      });

      expect(result.savingsPercentage).toBe(0);
    });

    it('should handle free tier tools', () => {
      const result = evaluate({
        ...mockInput,
        tools: [
          {
            id: 'free-tool',
            name: 'FreeAI',
            monthlySpend: 0,
            currentPlan: 'free',
            usageFrequency: 'daily',
          },
        ],
      });

      // Should not generate savings recommendations for free tools
      expect(result.totalMonthlySavings).toBe(0);
    });
  });
});
```

---

## 🗂️ Database Schema

### Supabase SQL

```sql
-- Store audit results
CREATE TABLE audit_results (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Input data (full audit input stored as JSONB)
  input JSONB NOT NULL,
  
  -- Output data
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_monthly_savings DECIMAL(10, 2) NOT NULL DEFAULT 0,
  savings_percentage INT NOT NULL DEFAULT 0,
  
  -- AI summary (added async)
  summary TEXT DEFAULT NULL,
  summary_generated_at TIMESTAMP DEFAULT NULL,
  
  -- Sharing & privacy
  share_token TEXT UNIQUE NOT NULL,
  public BOOLEAN DEFAULT true,
  expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '90 days',
  
  -- Analytics
  ip_address TEXT,
  user_agent TEXT,
  source_url TEXT
);

-- Store email captures
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  
  -- Link to audit
  audit_id TEXT REFERENCES audit_results(id) ON DELETE CASCADE,
  
  -- Email tracking
  email_sent_at TIMESTAMP DEFAULT NULL,
  email_opened_at TIMESTAMP DEFAULT NULL,
  link_clicked_at TIMESTAMP DEFAULT NULL
);

-- Pricing rules (admin panel updates these)
CREATE TABLE pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_name TEXT UNIQUE NOT NULL,
  
  -- Pricing data as JSONB
  -- {
  --   "free": { "cost": 0, ... },
  --   "pro": { "cost": 20, ... },
  --   "enterprise": { "cost": 100, ... }
  -- }
  pricing_data JSONB NOT NULL,
  
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES auth.users(id)
);

-- Indexes for performance
CREATE INDEX idx_audit_results_created_at ON audit_results(created_at DESC);
CREATE INDEX idx_audit_results_share_token ON audit_results(share_token);
CREATE INDEX idx_leads_audit_id ON leads(audit_id);
CREATE INDEX idx_leads_email ON leads(email);
```

This structure supports all the architectural patterns and scales to 10k+/day with simple optimizations.
