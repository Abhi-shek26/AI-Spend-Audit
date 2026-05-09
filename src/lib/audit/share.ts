import { AuditResult } from './types';

const SHARE_STORAGE_KEY = 'audit-shared-results';

type SharedResultsMap = Record<string, AuditResult>;

function readSharedResults(): SharedResultsMap {
  try {
    const raw = localStorage.getItem(SHARE_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as SharedResultsMap;
  } catch {
    return {};
  }
}

function writeSharedResults(results: SharedResultsMap): void {
  try {
    localStorage.setItem(SHARE_STORAGE_KEY, JSON.stringify(results));
  } catch {
    // ignore storage errors
  }
}

export function saveSharedAuditResult(result: AuditResult): void {
  const current = readSharedResults();
  current[result.id] = result;
  writeSharedResults(current);
}

export function getSharedAuditResult(id: string): AuditResult | null {
  const current = readSharedResults();
  return current[id] ?? null;
}
