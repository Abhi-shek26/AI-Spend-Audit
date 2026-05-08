'use client';

import { useRouter } from 'next/navigation';
import AuditForm from '@/components/AuditForm';
import { evaluate } from '@/lib/audit/engine';
import { AuditInput } from '@/lib/audit/types';

export default function AuditPage() {
  const router = useRouter();

  const handleAuditSubmit = (data: {
    tools: AuditInput['tools'];
    teamSize: AuditInput['teamSize'];
    useCases: string;
  }) => {
    // Prepare audit input
    const auditInput: AuditInput = {
      tools: data.tools,
      teamSize: data.teamSize,
      useCases: data.useCases.split(',').map((s: string) => s.trim()).filter((s: string) => s),
      totalMonthlySpend: data.tools.reduce((sum: number, tool: { monthlySpend: number }) => sum + tool.monthlySpend, 0),
    };

    // Run audit
    const result = evaluate(auditInput);

    // Store result and navigate to results page
    sessionStorage.setItem('audit-result', JSON.stringify(result));
    router.push('/audit/results');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">AI Spending Audit</h1>
          <p className="text-lg text-slate-600">
            Analyze your AI tool spending and get personalized recommendations
          </p>
        </header>

        <AuditForm onSubmit={handleAuditSubmit} />
      </div>
    </div>
  );
}
