// Benchmark data for AI/ML tool spending by company size and industry
// Based on aggregated survey data and market research

export interface BenchmarkMetrics {
  companySize: string;
  avgToolsSubscribed: number;
  avgMonthlySpend: number;
  avgSpendPerDeveloper: number;
  avgToolDiversity: number;
  commonTools: string[];
  savingsPotential: number; // percentage
}

export interface BenchmarkComparison {
  yourMetrics: {
    toolCount: number;
    monthlySpend: number;
    spendPerDeveloper: number;
  };
  benchmark: BenchmarkMetrics;
  comparison: {
    toolCountDifference: number;
    spendDifference: number;
    percentageAboveAverage: number;
    savingsOpportunity: number;
  };
}

// Benchmark data by company size (based on 2024-2025 market data)
export const BENCHMARKS_BY_SIZE: Record<string, BenchmarkMetrics> = {
  'solo': {
    companySize: '1 developer',
    avgToolsSubscribed: 4,
    avgMonthlySpend: 350,
    avgSpendPerDeveloper: 350,
    avgToolDiversity: 3,
    commonTools: ['ChatGPT Pro', 'Claude+', 'GitHub Copilot'],
    savingsPotential: 25,
  },
  '1-5': {
    companySize: '1-5 developers',
    avgToolsSubscribed: 8,
    avgMonthlySpend: 1200,
    avgSpendPerDeveloper: 240,
    avgToolDiversity: 5,
    commonTools: ['GitHub Copilot', 'ChatGPT Team', 'Claude', 'Cursor', 'Gemini API'],
    savingsPotential: 30,
  },
  '6-20': {
    companySize: '6-20 developers',
    avgToolsSubscribed: 12,
    avgMonthlySpend: 3500,
    avgSpendPerDeveloper: 233,
    avgToolDiversity: 7,
    commonTools: [
      'GitHub Copilot Business',
      'Claude API',
      'OpenAI API',
      'Vertex AI',
      'Azure AI',
      'Cursor Enterprise',
    ],
    savingsPotential: 35,
  },
  '21-50': {
    companySize: '21-50 developers',
    avgToolsSubscribed: 16,
    avgMonthlySpend: 7200,
    avgSpendPerDeveloper: 240,
    avgToolDiversity: 9,
    commonTools: [
      'GitHub Copilot Enterprise',
      'OpenAI API',
      'Claude API',
      'Vertex AI',
      'Azure OpenAI',
      'DataRobot',
      'Databricks',
    ],
    savingsPotential: 38,
  },
  '50+': {
    companySize: '50+ developers',
    avgToolsSubscribed: 20,
    avgMonthlySpend: 12000,
    avgSpendPerDeveloper: 200,
    avgToolDiversity: 11,
    commonTools: [
      'GitHub Copilot Enterprise',
      'OpenAI Enterprise',
      'Claude API + Custom',
      'Vertex AI',
      'Azure OpenAI',
      'DataRobot',
      'Databricks',
      'H2O',
    ],
    savingsPotential: 40,
  },
};

export function getBenchmarkForTeamSize(
  teamSize: 'solo' | 'small' | 'medium' | 'large'
): BenchmarkMetrics {
  const sizeMap: Record<string, string> = {
    solo: 'solo',
    small: '1-5',
    medium: '6-20',
    large: '21-50',
  };

  return BENCHMARKS_BY_SIZE[sizeMap[teamSize]] || BENCHMARKS_BY_SIZE['6-20'];
}

export function calculateBenchmarkComparison(
  toolCount: number,
  monthlySpend: number,
  teamSize: 'solo' | 'small' | 'medium' | 'large',
  teamSizeNumber: number = 10
): BenchmarkComparison {
  const benchmark = getBenchmarkForTeamSize(teamSize);
  const spendPerDeveloper = teamSizeNumber > 0 ? monthlySpend / teamSizeNumber : monthlySpend;

  const toolCountDifference = toolCount - benchmark.avgToolsSubscribed;
  const spendDifference = monthlySpend - benchmark.avgMonthlySpend;
  const percentageAboveAverage =
    benchmark.avgMonthlySpend > 0
      ? Math.round((spendDifference / benchmark.avgMonthlySpend) * 100)
      : 0;

  // Estimate savings opportunity based on benchmark potential
  const savingsOpportunity = Math.round(
    monthlySpend * (benchmark.savingsPotential / 100)
  );

  return {
    yourMetrics: {
      toolCount,
      monthlySpend,
      spendPerDeveloper,
    },
    benchmark,
    comparison: {
      toolCountDifference,
      spendDifference,
      percentageAboveAverage,
      savingsOpportunity,
    },
  };
}

// Industry-specific spending patterns
export const INDUSTRY_PATTERNS: Record<string, { name: string; avgSpend: number; focus: string[] }> = {
  startup: {
    name: 'Early-stage Startup',
    avgSpend: 500,
    focus: ['ChatGPT', 'GitHub Copilot', 'Claude'],
  },
  scaleup: {
    name: 'Growth-stage Startup',
    avgSpend: 3000,
    focus: ['GitHub Copilot', 'Claude API', 'OpenAI API', 'Vertex AI'],
  },
  enterprise: {
    name: 'Enterprise',
    avgSpend: 8000,
    focus: [
      'GitHub Copilot Enterprise',
      'OpenAI Enterprise',
      'Azure OpenAI',
      'Vertex AI',
      'Custom models',
    ],
  },
  agency: {
    name: 'Digital Agency',
    avgSpend: 2000,
    focus: ['ChatGPT Team', 'Cursor', 'Claude', 'GitHub Copilot'],
  },
};

// Spending breakdown by tool category
export const SPENDING_BY_CATEGORY = {
  'Large Language Models': { percentage: 45, tools: ['ChatGPT', 'Claude', 'Gemini'] },
  'Code Assistants': { percentage: 30, tools: ['GitHub Copilot', 'Cursor', 'Windsurf'] },
  'Search & Research': { percentage: 15, tools: ['Perplexity', 'Google Scholar', 'SciSpace'] },
  'Specialized AI': { percentage: 10, tools: ['Midjourney', 'Stable Diffusion', 'Runway'] },
};
