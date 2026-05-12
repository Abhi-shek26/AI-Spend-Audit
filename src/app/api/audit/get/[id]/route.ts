import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { AuditResult } from '@/lib/audit/types';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    try {
      // Try to fetch from Supabase
      const { data, error } = await supabase
        .from('audit_results')
        .select('data')
        .eq('audit_id', id)
        .single();

      if (data && !error) {
        const result = data.data as AuditResult;
        return NextResponse.json({ success: true, data: result });
      }
    } catch (supabaseErr) {
      console.error('Supabase query failed:', supabaseErr);
      // Fall through to return "not found" since we can't access Supabase from server
    }

    // Return 404 - client-side localStorage is checked in the component
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to read store';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
