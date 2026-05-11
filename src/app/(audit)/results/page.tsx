"use client";

import { useEffect, useState } from 'react';
import { AuditResult, Recommendation } from '@/lib/audit/types';
import { saveSharedAuditResult } from '@/lib/audit/share';

export default function ResultsPage() {
  const [result] = useState<AuditResult | null>(() => {
    try {
      const raw = sessionStorage.getItem('audit-result');
      if (raw) return JSON.parse(raw) as AuditResult;
    } catch {
      // ignore
    }
    return null;
  });
  const [summary, setSummary] = useState<string>('');
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (result) {
      fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      })
        .then((r) => r.json())
        .then((data) => {
          if (mounted) setSummary(data.summary || 'Summary unavailable');
        })
        .catch(() => {
          if (mounted) setSummary('Summary unavailable');
        });
    }

    return () => {
      mounted = false;
    };
  }, [result]);

  const handleCreateShareLink = async () => {
    if (!result) return;

    try {
      const resp = await fetch('/api/audit/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });
      const payload = await resp.json();
      if (payload?.url) {
        setShareUrl(payload.url);
        try {
          await navigator.clipboard.writeText(payload.url);
        } catch {
          // ignore
        }
      }
    } catch {
      // fallback to local share
      saveSharedAuditResult(result);
      const url = `${window.location.origin}/audit/results/${result.id}`;
      setShareUrl(url);
    }
  };

  if (!result) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold">No result found</h2>
        <p className="mt-2 text-slate-600">Run an audit from the form first.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Audit Results</h1>
        <p className="text-sm text-slate-600">ID: {result.id} • {new Date(result.timestamp).toLocaleString()}</p>
      </header>

      <section className="mb-6 bg-white p-6 rounded-md border">
        <h2 className="text-lg font-semibold">Summary</h2>
        <p className="mt-2 text-slate-700">{summary || 'Generating summary...'}</p>
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleCreateShareLink}
            className="w-fit rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Create Share Link
          </button>
          {shareUrl && (
            <p className="text-xs text-slate-500 break-all">
              Share URL: {shareUrl}
            </p>
          )}
        </div>
      </section>

      <section className="mb-6 bg-white p-6 rounded-md border">
        <h2 className="text-lg font-semibold">Recommendations ({result.recommendations.length})</h2>
        <ul className="mt-3 space-y-3">
          {result.recommendations.map((rec: Recommendation) => (
            <li key={rec.toolId} className="p-3 border rounded-md">
              <p className="font-medium">{rec.toolName} — {rec.type}</p>
              <p className="text-sm text-slate-600">{rec.reason}</p>
              <p className="text-sm text-slate-700 mt-1">Estimated savings: ${rec.estimatedSavings}/mo • Confidence: {rec.confidence}</p>
              {rec.alternative && <p className="text-sm text-slate-500 mt-1">Alternative: {rec.alternative}</p>}
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-white p-6 rounded-md border">
        <h2 className="text-lg font-semibold">Totals</h2>
        <p className="mt-2">Total monthly savings: ${result.totalMonthlySavings}</p>
        <p>Savings percentage: {result.savingsPercentage}%</p>
      </section>
    </div>
  );
}
