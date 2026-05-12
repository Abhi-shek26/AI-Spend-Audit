"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { AuditResult, Recommendation } from '@/lib/audit/types';
import { getSharedAuditResult } from '@/lib/audit/share';
import { downloadAuditPDF } from '@/lib/pdf/exporter';
import { calculateBenchmarkComparison } from '@/lib/audit/benchmarks';
import { createReferral } from '@/lib/audit/referrals';
import BenchmarkDisplay from '@/components/BenchmarkDisplay';
import ReferralShare from '@/components/ReferralShare';

function getDisplayTotals(result: AuditResult) {
  const derivedMonthlySavings = result.recommendations.reduce(
    (sum, rec) => sum + rec.estimatedSavings,
    0
  );
  const totalMonthlySavings =
    result.totalMonthlySavings > 0 ? result.totalMonthlySavings : derivedMonthlySavings;
  const savingsPercentage =
    result.savingsPercentage > 0
      ? result.savingsPercentage
      : result.input.totalMonthlySpend > 0
        ? Math.round((totalMonthlySavings / result.input.totalMonthlySpend) * 100)
        : 0;

  return { totalMonthlySavings, savingsPercentage };
}

export default function SharedResultsPage() {
  const params = useParams<{ id: string }>();
  const [result, setResult] = useState<AuditResult | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);

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

  useEffect(() => {
    let mounted = true;
    if (result) {
      fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      })
        .then((r) => {
          if (!r.ok) throw new Error(`Summary API error: ${r.status}`);
          return r.json();
        })
        .then((data) => {
          if (mounted) setSummary(data.summary || 'Summary unavailable');
        })
        .catch((err) => {
          console.error('Summary generation failed', err);
          if (mounted) setSummary('Summary unavailable');
        });
    }

    return () => {
      mounted = false;
    };
  }, [result]);

  const handleDownloadPDF = async () => {
    if (!result || !summary) return;

    setIsDownloadingPDF(true);
    try {
      await downloadAuditPDF(result, summary);
    } catch (error) {
      console.error('PDF download failed:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  // Generate referral code when result is available
  useEffect(() => {
    if (result && !referralCode) {
      createReferral(result.id)
        .then((referral) => {
          if (referral) {
            setReferralCode(referral.code);
          }
        })
        .catch((err) => console.error('Failed to create referral:', err));
    }
  }, [result, referralCode]);

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

  const displayTotals = getDisplayTotals(result);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Shared Audit Result</h1>
        <p className="mt-1 text-sm text-slate-600">ID: {result.id} • {new Date(result.timestamp).toLocaleString()}</p>
      </header>

      <section className="mb-6 bg-white p-6 rounded-md border">
        <h2 className="text-lg font-semibold">Summary</h2>
        <div className="mt-4 text-slate-700 space-y-4">
          {summary ? (
            <>
              {summary.split('\n\n').map((section, idx) => {
                const lines = section.trim().split('\n');
                const header = lines[0];
                const isHeader = header.match(/^[A-Z\s]+:$/);

                if (isHeader) {
                  return (
                    <div key={idx}>
                      <h3 className="font-semibold text-slate-900 mb-2">{header}</h3>
                      <div className="ml-2 text-sm text-slate-700 space-y-1">
                        {lines.slice(1).map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    </div>
                  );
                }
                return <p key={idx}>{section}</p>;
              })}
            </>
          ) : (
            'Generating summary...'
          )}
        </div>
        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isDownloadingPDF || !summary}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {isDownloadingPDF ? 'Generating PDF...' : 'Download PDF'}
          </button>
        </div>
      </section>

      {result && (
        <BenchmarkDisplay
          comparison={calculateBenchmarkComparison(
            result.input.tools.length,
            result.input.totalMonthlySpend,
            result.input.teamSize,
            result.input.teamSize === 'solo' ? 1 : result.input.teamSize === 'small' ? 5 : result.input.teamSize === 'medium' ? 15 : 30
          )}
        />
      )}

      <section className="mb-6 rounded-md border bg-white p-5">
        <h2 className="text-lg font-semibold">Totals</h2>
        <p className="mt-2">Total monthly savings: ${displayTotals.totalMonthlySavings}</p>
        <p>Savings percentage: {displayTotals.savingsPercentage}%</p>
      </section>

      {result && referralCode && (
        <ReferralShare
          referralCode={referralCode}
          shareUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/audit/results/${result.id}`}
        />
      )}

      <section className="rounded-md border bg-white p-5">
        <h2 className="text-lg font-semibold">Recommendations ({result.recommendations.length})</h2>
        <ul className="mt-3 space-y-2">
          {result.recommendations.map((rec: Recommendation) => (
            <li key={`${rec.toolId}-${rec.type}`} className="rounded-md border p-3">
              <p className="font-medium">{rec.toolName} — {rec.type}</p>
              <p className="text-sm text-slate-600">{rec.reason}</p>
              <p className="text-sm text-slate-700 mt-1">Estimated savings: ${rec.estimatedSavings}/mo • Confidence: {rec.confidence}</p>
              {rec.alternative && <p className="text-sm text-slate-500 mt-1">Alternative: {rec.alternative}</p>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
