import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { AuditResult } from '@/lib/audit/types';

export async function GET(request: Request, { params }: { params: { id?: string } }) {
  try {
    const id = params?.id;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const { data, error } = await supabase
      .from('audit_results')
      .select('data')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const result = data.data as AuditResult;
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to read store';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
