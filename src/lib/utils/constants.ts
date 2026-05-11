/**
 * Application constants
 */

export const AI_TOOLS = [
  'ChatGPT',
  'Claude',
  'Cursor',
  'GitHub Copilot',
  'Gemini',
  'Perplexity',
  'Other',
] as const;

export const PLAN_TYPES = ['free', 'pro', 'enterprise'] as const;

export const TEAM_SIZES = {
  solo: '1 person',
  small: '2-5 people',
  medium: '6-20 people',
  large: '20+ people',
} as const;

export const USE_CASES = [
  'Development',
  'Content Creation',
  'Research',
  'Business Analytics',
  'Other',
] as const;
