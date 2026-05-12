import { NextResponse } from 'next/server';
import { env } from '@/env';
import { supabase } from '@/lib/supabase';
import type { AuditResult } from '@/lib/audit/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = body as AuditResult;

    if (!result || !result.id) {
      return NextResponse.json({ error: 'Invalid audit result' }, { status: 400 });
    }

    try {
      // Try to save to Supabase
      // Note: If RLS (Row Level Security) is enabled on the audit_results table,
      // you need to either:
      // 1. Disable RLS for development
      // 2. Create an RLS policy that allows public inserts: 
      //    CREATE POLICY "Allow public inserts" ON audit_results FOR INSERT WITH CHECK (true);
      // 3. Or use a service role key instead of anon key
      const { error } = await supabase
        .from('audit_results')
        .insert([{ audit_id: result.id, data: result }]);

      if (error) {
        console.error('Supabase insert error (audit_results):', error);
        if (error.code === '42501') {
          console.log('[Info] RLS policy blocking insert. Create policy to allow public inserts.');
        }
        // Don't fail, just log and continue
      } else {
        console.log(`[Supabase] Audit result ${result.id} saved successfully`);
      }
    } catch (supabaseErr) {
      console.error('Supabase connection error:', supabaseErr);
      // Supabase is optional; we can still return a shareable URL
    }

    // Return success with share URL regardless of Supabase status
    const url = `${env.appUrl}/audit/results/${result.id}`;

    return NextResponse.json({ success: true, id: result.id, url });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to save result';
    console.error('Save error:', errorMsg);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
