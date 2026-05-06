/**
 * Core audit engine types
 * These are the domain models for the audit system
 */

export interface AITool {
  id: string;
  name: string;
  monthlySpend: number; // in USD
  currentPlan: 'free' | 'pro' | 'enterprise';
  usageFrequency: 'daily' | 'weekly' | 'monthly' | 'rare'; // How often the team uses it
}

export interface AuditInput {
  tools: AITool[];
  teamSize: 'solo' | 'small' | 'medium' | 'large';
  useCases: string[];
  totalMonthlySpend: number;
}

export interface Recommendation {
  toolId: string;
  toolName: string;
  type: 'downgrade' | 'switch' | 'consolidate' | 'eliminate';
  reason: string;
  estimatedSavings: number; // monthly savings in USD
  nextPlan?: string;
  alternative?: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface AuditResult {
  id: string;
  timestamp: string;
  input: AuditInput;
  recommendations: Recommendation[];
  totalMonthlySavings: number;
  savingsPercentage: number;
  summary: string; // AI-generated summary
  shareableUrl?: string;
}

export interface AuditError {
  code: string;
  message: string;
  details?: unknown;
}
