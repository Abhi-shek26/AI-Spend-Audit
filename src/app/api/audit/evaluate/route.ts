import { NextRequest, NextResponse } from 'next/server';
import { evaluate } from '@/lib/audit/engine';
import { AuditInput } from '@/lib/audit/types';

/**
 * POST /api/audit/evaluate
 * Evaluates an audit input and returns recommendations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    if (!body.tools || !Array.isArray(body.tools)) {
      return NextResponse.json(
        { error: 'Invalid input: tools array required' },
        { status: 400 }
      );
    }

    const auditInput: AuditInput = body;

    // Run evaluation
    const result = evaluate(auditInput);

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Audit evaluation error:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/audit/evaluate
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json(
    {
      success: true,
      message: 'Audit engine is ready',
    },
    { status: 200 }
  );
}
