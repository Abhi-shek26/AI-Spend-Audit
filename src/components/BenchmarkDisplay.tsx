'use client';

import { BenchmarkComparison } from '@/lib/audit/benchmarks';

interface BenchmarkDisplayProps {
  comparison: BenchmarkComparison;
}

export default function BenchmarkDisplay({ comparison }: BenchmarkDisplayProps) {
  const { yourMetrics, benchmark, comparison: comp } = comparison;
  const isAboveAverage = comp.percentageAboveAverage > 0;
  const isToolsAboveAverage = comp.toolCountDifference > 0;

  return (
    <section className="bg-white p-6 rounded-md border mb-6">
      <h2 className="text-lg font-semibold mb-4">Industry Benchmark Comparison</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Your Metrics */}
        <div className="bg-slate-50 p-4 rounded-md border">
          <h3 className="font-semibold text-slate-900 mb-3">Your Metrics</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-slate-600">Tools Subscribed</p>
              <p className="text-2xl font-bold text-slate-900">{yourMetrics.toolCount}</p>
            </div>
            <div>
              <p className="text-slate-600">Monthly Spend</p>
              <p className="text-2xl font-bold text-slate-900">${yourMetrics.monthlySpend}</p>
            </div>
            <div>
              <p className="text-slate-600">Spend per Developer</p>
              <p className="text-xl font-bold text-slate-900">
                ${yourMetrics.spendPerDeveloper.toFixed(0)}
              </p>
            </div>
          </div>
        </div>

        {/* Benchmark Metrics */}
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3">
            {benchmark.companySize} Benchmark
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-blue-700">Avg Tools Subscribed</p>
              <p className="text-2xl font-bold text-blue-900">{benchmark.avgToolsSubscribed}</p>
            </div>
            <div>
              <p className="text-blue-700">Avg Monthly Spend</p>
              <p className="text-2xl font-bold text-blue-900">${benchmark.avgMonthlySpend}</p>
            </div>
            <div>
              <p className="text-blue-700">Spend per Developer</p>
              <p className="text-xl font-bold text-blue-900">
                ${benchmark.avgSpendPerDeveloper.toFixed(0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Insights */}
      <div className="mt-6 pt-6 border-t">
        <h3 className="font-semibold text-slate-900 mb-4">Comparison Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tools Comparison */}
          <div className={`p-4 rounded-md border ${isToolsAboveAverage ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
            <div className={isToolsAboveAverage ? 'text-amber-900' : 'text-green-900'}>
              <p className={`text-sm font-medium ${isToolsAboveAverage ? 'text-amber-700' : 'text-green-700'}`}>
                Tool Count
              </p>
              <p className="text-2xl font-bold">
                {comp.toolCountDifference > 0 ? '+' : ''}{comp.toolCountDifference}
              </p>
              <p className="text-xs mt-1">
                {isToolsAboveAverage
                  ? `${Math.abs(comp.toolCountDifference)} more tools than average`
                  : `${Math.abs(comp.toolCountDifference)} fewer tools than average`}
              </p>
            </div>
          </div>

          {/* Spend Comparison */}
          <div className={`p-4 rounded-md border ${isAboveAverage ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
            <div className={isAboveAverage ? 'text-amber-900' : 'text-green-900'}>
              <p className={`text-sm font-medium ${isAboveAverage ? 'text-amber-700' : 'text-green-700'}`}>
                Spend Comparison
              </p>
              <p className="text-2xl font-bold">
                {comp.percentageAboveAverage > 0 ? '+' : ''}{comp.percentageAboveAverage}%
              </p>
              <p className="text-xs mt-1">
                {isAboveAverage
                  ? `${Math.abs(comp.percentageAboveAverage)}% above industry average`
                  : `${Math.abs(comp.percentageAboveAverage)}% below industry average`}
              </p>
            </div>
          </div>

          {/* Savings Opportunity */}
          <div className="p-4 rounded-md border bg-green-50 border-green-200">
            <div className="text-green-900">
              <p className="text-sm font-medium text-green-700">Savings Potential</p>
              <p className="text-2xl font-bold">${comp.savingsOpportunity}</p>
              <p className="text-xs mt-1 text-green-700">
                {((comp.savingsOpportunity / (yourMetrics.monthlySpend || 1)) * 100).toFixed(0)}% of monthly spend
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benchmark Details */}
      <div className="mt-6 pt-6 border-t">
        <h3 className="font-semibold text-slate-900 mb-3">Common Tools in Your Size Category</h3>
        <div className="flex flex-wrap gap-2">
          {benchmark.commonTools.map((tool) => (
            <span
              key={tool}
              className="px-3 py-1 bg-slate-100 text-sm rounded-full text-slate-700"
            >
              {tool}
            </span>
          ))}
        </div>
      </div>

      {/* Actionable Insights */}
      <div className="mt-6 pt-6 border-t bg-blue-50 p-4 rounded-md">
        <h3 className="font-semibold text-blue-900 mb-2">Key Insights</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          {isAboveAverage && (
            <li>
              ✓ You're spending <strong>${Math.abs(comp.spendDifference)}</strong> more per month than similar companies
              — potential savings opportunity identified
            </li>
          )}
          {!isAboveAverage && (
            <li>
              ✓ You're spending below the industry average — good cost management
            </li>
          )}
          {isToolsAboveAverage && (
            <li>
              ✓ Check for overlapping functionality among your {comp.toolCountDifference} extra tools
            </li>
          )}
          <li>
            ✓ Our audit identified <strong>${comp.savingsOpportunity}/month</strong> in potential savings
          </li>
          <li>
            ✓ Consider consolidating redundant subscriptions to improve spend efficiency
          </li>
        </ul>
      </div>
    </section>
  );
}
