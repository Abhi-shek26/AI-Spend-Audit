/**
 * Database schema types for Supabase
 * Used to define row types and query results
 */

import { AuditResult } from '@/lib/audit/types';

export interface AuditResultRow extends AuditResult {
  created_at: string;
  updated_at: string;
}

export interface UserLeadRow {
  id: string;
  email: string;
  company?: string;
  created_at: string;
}
