import { NextResponse } from 'next/server';
import { env } from '@/env';
import type { AuditResult } from '@/lib/audit/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = body as AuditResult;

    // If no API key, return a placeholder summary
    if (!env.anthropicApiKey) {
      return NextResponse.json({ summary: `Summary unavailable (API key not set). Found ${result.recommendations.length} recommendations.` });
    }

    const prompt = `Provide a concise human-friendly summary (2-4 sentences) of the following AI spending audit result. Include the top recommendation and potential monthly savings.\n\n${JSON.stringify(result)}`;

    try {
      const resp = await fetch('https://api.anthropic.com/v1/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.anthropicApiKey}`,
        },
        body: JSON.stringify({
          model: 'claude-2',
          prompt,
          max_tokens_to_sample: 300,
          temperature: 0.2,
        }),
      });

      if (!resp.ok) {
        const text = await resp.text();
        return NextResponse.json({ summary: `Summary generation failed: ${resp.status}` });
      }

      const data = await resp.json();
      const summary = data.completion || data.completion?.[0] || data.output || '';

      return NextResponse.json({ summary: summary || `Summary unavailable` });
    } catch (e) {
      return NextResponse.json({ summary: `Summary generation error` });
    }
  } catch (e) {
    return NextResponse.json({ summary: 'Invalid request' }, { status: 400 });
  }
}
