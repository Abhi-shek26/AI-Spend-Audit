import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import type { AuditResult } from '@/lib/audit/types';

const STORE_PATH = path.join(process.cwd(), 'shared_results.json');

async function readStore(): Promise<Record<string, AuditResult>> {
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf-8');
    return JSON.parse(raw) as Record<string, AuditResult>;
  } catch {
    return {};
  }
}

export async function GET(request: Request, { params }: { params: { id?: string } }) {
  try {
    const id = params?.id;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const store = await readStore();
    const result = store[id];
    if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: result });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to read store' }, { status: 500 });
  }
}
