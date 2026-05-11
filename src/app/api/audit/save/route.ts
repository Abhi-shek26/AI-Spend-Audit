import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { AuditResult } from '@/lib/audit/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = body as AuditResult;

    if (!result || !result.id) {
      return NextResponse.json({ error: 'Invalid audit result' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('audit_results')
      .insert([{ data: result }])
      .select('id')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const url = `${process.env.NEXT_PUBLIC_APP_URL || ''}/audit/results/${result.id}`;

    return NextResponse.json({ success: true, id: result.id, url });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to save result';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
