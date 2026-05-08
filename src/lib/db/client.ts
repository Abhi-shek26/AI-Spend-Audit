/**
 * Database layer - Supabase integration
 * Currently a stub, will be expanded when Supabase is configured
 */

import { AuditResult } from '@/lib/audit/types';

/**
 * Save audit result to database
 */
export async function saveAuditResult(result: AuditResult): Promise<string> {
  // TODO: Implement Supabase insert
  // return supabase.from('audit_results').insert(result);
  return result.id;
}

/**
 * Retrieve audit result by ID
 */
export async function getAuditResult(_id: string): Promise<AuditResult | null> {
  // TODO: Implement Supabase query
  void _id;
  return null;
}

/**
 * List all saved audits for a user
 */
export async function listUserAudits(_userId: string): Promise<AuditResult[]> {
  // TODO: Implement Supabase query
  void _userId;
  return [];
}
