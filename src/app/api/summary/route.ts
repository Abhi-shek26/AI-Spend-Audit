import { NextResponse } from 'next/server';
import { env } from '@/env';
import type { AuditResult } from '@/lib/audit/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = body as AuditResult;

    // If no API key, return a placeholder summary
    if (!env.geminiApiKey) {
      return NextResponse.json({ summary: `Summary unavailable (API key not set). Found ${result.recommendations.length} recommendations.` });
    }

    const topRecs = result.recommendations?.slice(0, 3) || [];
    const recDetails = topRecs
      .map((r) => `• ${r.toolName}: ${r.reason} (~$${r.monthlySavings}/month)`)
      .join('\n');

    const prompt = `You are an AI spending optimization expert. Generate a structured summary with these exact sections (keep each section concise):

AUDIT OVERVIEW:
[2-3 sentences about the overall findings and total savings potential]

KEY FINDINGS:
[3-4 bullet points with specific tools and savings amounts]

RECOMMENDED ACTIONS:
[3 specific, actionable next steps to implement savings]

Audit Data:
- Total Recommendations: ${result.recommendations?.length || 0}
- Total Monthly Savings: $${result.totalMonthlySavings}/month
- Top Opportunities:
${recDetails}

Generate the structured summary now with clear section headers:`;

    try {
      // Use current stable Gemini API endpoints with proper header-based authentication
      // gemini-2.5-flash-lite avoids expensive thinking tokens; fallback to lite variants
      const endpoints = [
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent',
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent',
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      ];

      let resp: Response | null = null;
      let lastError: string | null = null;

      // Try each endpoint
      for (const endpoint of endpoints) {
        try {
          resp = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': env.geminiApiKey,
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: prompt }],
                },
              ],
              generationConfig: {
                maxOutputTokens: 800,
                temperature: 0.7,
              },
            }),
          });

          if (resp.ok) {
            break; // Success, exit loop
          }
          lastError = `${resp.status}`;
        } catch (err) {
          lastError = err instanceof Error ? err.message : 'Unknown error';
        }
      }

      if (!resp?.ok) {
        // Gemini API errors are expected and handled gracefully with detailed fallback
        console.log(`[Summary] Gemini API unavailable (${lastError}), using fallback`);

        // Build a detailed fallback summary
        const topThree = result.recommendations?.slice(0, 3) || [];
        let fallbackSummary = '';

        if (topThree.length > 0) {
          const topRec = topThree[0];
          fallbackSummary = `Your AI spending audit identified ${result.recommendations.length} optimization opportunities with a total potential savings of $${result.totalMonthlySavings}/month. The highest priority is ${topRec.toolName}: ${topRec.reason}, which could save approximately $${topRec.monthlySavings}/month. `;

          if (topThree.length > 1) {
            fallbackSummary += `Additional opportunities include ${topThree
              .slice(1)
              .map((r) => `${r.toolName} ($${r.monthlySavings}/month)`)
              .join(' and ')}. `;
          }

          fallbackSummary += `Review the detailed recommendations to implement these optimizations and start saving immediately.`;
        } else {
          fallbackSummary = `Your audit is complete. Total estimated savings potential: $${result.totalMonthlySavings}/month. Review your personalized recommendations to identify optimization opportunities.`;
        }

        return NextResponse.json({ summary: fallbackSummary });
      }

      let data: unknown;
      try {
        data = await resp.json();
      } catch {
        const text = await resp.text().catch(() => '');
        console.log(`[Summary] Response parse error: ${text}`);
        return NextResponse.json({ summary: `Summary generation incomplete` });
      }

      // Parse Gemini response format
      const d = data as Record<string, unknown>;
      let summary = '';

      // Gemini returns candidates[0].content.parts[0].text
      if (Array.isArray(d.candidates) && d.candidates.length > 0) {
        const candidate = d.candidates[0] as Record<string, unknown> | undefined;
        if (candidate) {
          const content = candidate.content as Record<string, unknown> | undefined;
          if (content && Array.isArray(content.parts)) {
            const part = content.parts[0] as Record<string, unknown> | undefined;
            if (part && typeof part.text === 'string') {
              summary = part.text as string;
            }
          }
        }
      }

      return NextResponse.json({ summary: summary || `Summary unavailable` });
    } catch (err) {
      console.error('Summary generation error:', err);
      // Return a minimal placeholder on any error
      return NextResponse.json({
        summary: `Audit complete. Total recommendations: ${(body as AuditResult).recommendations?.length || 0}. Estimated monthly savings: $${(body as AuditResult).totalMonthlySavings || 0}.`,
      });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ summary: `Invalid request: ${msg}` }, { status: 400 });
  }
}
