import { AITool } from './types';

export type PricingPlan = {
  cost: number;
};

export type PricingTable = {
  free?: PricingPlan;
  pro?: PricingPlan;
  team?: PricingPlan;
  enterprise?: PricingPlan;
};

export const TOOL_PRICING: Record<string, PricingTable> = {
  ChatGPT: {
    free: { cost: 0 },
    pro: { cost: 20 },
    team: { cost: 30 },
    enterprise: { cost: 60 },
  },
  Claude: {
    free: { cost: 0 },
    pro: { cost: 20 },
    team: { cost: 30 },
    enterprise: { cost: 60 },
  },
  Cursor: {
    free: { cost: 0 },
    pro: { cost: 20 },
    team: { cost: 40 },
    enterprise: { cost: 0 },
  },
  'GitHub Copilot': {
    free: { cost: 0 },
    pro: { cost: 10 },
    team: { cost: 19 },
    enterprise: { cost: 39 },
  },
  'Vertex AI': {
    free: { cost: 0 },
    pro: { cost: 25 },
    team: { cost: 45 },
    enterprise: { cost: 80 },
  },
  'OpenAI API': {
    free: { cost: 0 },
    pro: { cost: 0 }, // Pay-per-token
    team: { cost: 0 }, // Pay-per-token
    enterprise: { cost: 0 }, // Custom pricing
  },
  Gemini: {
    free: { cost: 0 },
    pro: { cost: 20 },
    team: { cost: 0 }, // No official team plan
    enterprise: { cost: 0 }, // Custom pricing
  },
  Windsurf: {
    free: { cost: 0 },
    pro: { cost: 20 },
    team: { cost: 0 }, // No official team plan
    enterprise: { cost: 0 }, // Custom pricing
  },
};

export function getPricingForTool(toolName: AITool['name']): PricingTable | undefined {
  return TOOL_PRICING[toolName];
}