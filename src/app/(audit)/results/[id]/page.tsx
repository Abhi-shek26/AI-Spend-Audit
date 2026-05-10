"use client";

import { useState } from 'react';
import { useParams } from 'next/navigation';
import type { AuditResult } from '@/lib/audit/types';
import { getSharedAuditResult } from '@/lib/audit/share';

export default function SharedResultsPage() {
  const params = useParams<{ id: string }>();
  const [result, setResult] = useState<AuditResult | null>(null);

  useEffect(() => {
    const id = params?.id;
    if (!id) return;

    fetch(`/api/audit/get/${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((payload) => {
        if (payload?.success && payload.data) {
          setResult(payload.data as AuditResult);
        } else {
          // fallback to local shared results when server-side copy is not available
          const local = getSharedAuditResult(id);
          if (local) setResult(local);
        }
      })
      .catch(() => {
        const local = getSharedAuditResult(id);
        if (local) setResult(local);
      });
  }, [params]);

  if (!result) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold">Shared result not found</h1>
        <p className="mt-2 text-slate-600">
          This local share link is only available in the browser where it was created.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Shared Audit Result</h1>
      <p className="mt-1 text-sm text-slate-600">ID: {result.id}</p>

      <section className="mt-6 rounded-md border bg-white p-5">
        <h2 className="text-lg font-semibold">Totals</h2>
        <p className="mt-2">Total monthly savings: ${result.totalMonthlySavings}</p>
        <p>Savings percentage: {result.savingsPercentage}%</p>
      </section>

      <section className="mt-6 rounded-md border bg-white p-5">
        <h2 className="text-lg font-semibold">Recommendations ({result.recommendations.length})</h2>
        <ul className="mt-3 space-y-2">
          {result.recommendations.map((rec) => (
            <li key={`${rec.toolId}-${rec.type}`} className="rounded-md border p-3">
              <p className="font-medium">{rec.toolName} - {rec.type}</p>
              <p className="text-sm text-slate-600">{rec.reason}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
