/**
 * Data formatting utilities
 */

/**
 * Format currency value as USD string
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value);
}

/**
 * Format savings percentage
 */
export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

/**
 * Format date in readable format
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format monthly savings projection
 */
export function formatSavingsProjection(
  monthlySavings: number,
  months: number = 12
): string {
  const annual = monthlySavings * months;
  return `Save ${formatCurrency(monthlySavings)}/month (${formatCurrency(annual)}/year)`;
}
