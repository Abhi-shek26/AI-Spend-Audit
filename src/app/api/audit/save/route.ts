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

async function writeStore(data: Record<string, AuditResult>) {
  await fs.writeFile(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = body as AuditResult;

    if (!result || !result.id) {
      return NextResponse.json({ error: 'Invalid audit result' }, { status: 400 });
    }

    const store = await readStore();
    store[result.id] = result;
    await writeStore(store);

    const url = `${process.env.NEXT_PUBLIC_APP_URL || ''}/audit/results/${result.id}`;

    return NextResponse.json({ success: true, id: result.id, url });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to save result' }, { status: 500 });
  }
}
