/**
 * Input validation utilities
 */

import { AuditInput } from '@/lib/audit/types';

export function validateMonthlySpend(value: unknown): value is number {
  return typeof value === 'number' && value >= 0;
}

export function validateTeamSize(
  value: unknown
): value is 'solo' | 'small' | 'medium' | 'large' {
  return ['solo', 'small', 'medium', 'large'].includes(value as string);
}

export function validateUseCases(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

export function sanitizeInput(input: Partial<AuditInput>): AuditInput | null {
  if (!input.tools || input.tools.length === 0) {
    return null;
  }

  if (!validateMonthlySpend(input.totalMonthlySpend)) {
    return null;
  }

  if (!validateTeamSize(input.teamSize)) {
    return null;
  }

  if (!validateUseCases(input.useCases)) {
    return null;
  }

  return input as AuditInput;
}
