import type { Metadata } from 'next';
import { env } from '@/env';
import { getSharedAuditResult } from '@/lib/audit/share';

interface SharePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { id } = await params;
  
  // Try to get the result to generate metadata
  const result = getSharedAuditResult(id);

  if (!result) {
    return {
      title: 'Audit Result | Credex AI Spend Audit',
      description: 'View AI spending audit results and recommendations.',
    };
  }

  const totalSavings = result.totalMonthlySavings;
  const recommendationCount = result.recommendations.length;

  return {
    title: `$${totalSavings}${recommendationCount > 0 ? ` in Monthly Savings` : ''} | Credex AI Audit`,
    description: `AI spending audit found ${recommendationCount} optimization opportunity(ies) worth $${totalSavings}/month in potential savings.`,
    openGraph: {
      title: `$${totalSavings} in Monthly Savings - Credex AI Audit`,
      description: `AI spending audit with ${recommendationCount} recommendations to save $${totalSavings}/month.`,
      type: 'website',
      url: `${env.appUrl}/audit/results/${id}`,
      images: [
        {
          url: `${env.appUrl}/og-image.svg`,
          width: 1200,
          height: 630,
          alt: 'Credex AI Spend Audit Results',
          type: 'image/svg+xml',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `$${totalSavings} in Monthly Savings - Credex AI Audit`,
      description: `AI spending audit with ${recommendationCount} recommendations to save $${totalSavings}/month.`,
      images: [`${env.appUrl}/og-image.svg`],
    },
  };
}
