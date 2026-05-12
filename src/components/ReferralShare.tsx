'use client';

import { useState } from 'react';
import { calculateReferralRewards } from '@/lib/audit/referrals';

interface ReferralShareProps {
  referralCode: string;
  shareUrl: string;
}

export default function ReferralShare({ referralCode, shareUrl }: ReferralShareProps) {
  const [copied, setCopied] = useState(false);
  
  // TODO: In production, fetch actual conversion count from API
  const conversions = 0;

  const rewards = calculateReferralRewards(conversions);
  const referralUrl = `${shareUrl}?ref=${referralCode}`;
  const shareText = `Check out my AI spending audit: ${referralUrl} (Ref: ${referralCode})`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShareTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      `Just ran an AI spending audit 💰 Found potential savings in ${new Date().getFullYear()}! Check it out: ${referralUrl}`
    )}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  const handleShareLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`;
    window.open(linkedInUrl, '_blank', 'width=550,height=420');
  };

  return (
    <section className="bg-white p-6 rounded-md border mb-6">
      <h2 className="text-lg font-semibold mb-4">Share & Earn Rewards 🎁</h2>

      {/* Referral Code Display */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-md mb-6">
        <p className="text-sm text-blue-700 mb-2">Your Referral Code</p>
        <div className="flex gap-2">
          <code className="flex-1 bg-white border border-blue-300 px-3 py-2 rounded-md font-mono text-lg font-bold text-center">
            {referralCode}
          </code>
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            {copied ? '✓ Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>

      {/* Share Options */}
      <div className="mb-6">
        <p className="text-sm font-medium text-slate-900 mb-3">Share on social media:</p>
        <div className="flex gap-3">
          <button
            onClick={handleShareTwitter}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-400 text-white rounded-md hover:bg-blue-500 font-medium text-sm"
          >
            𝕏 Twitter
          </button>
          <button
            onClick={handleShareLinkedIn}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 font-medium text-sm"
          >
            in LinkedIn
          </button>
          <button
            onClick={() => {
              const mailtoLink = `mailto:?subject=Check%20out%20my%20AI%20Spending%20Audit&body=${encodeURIComponent(shareText)}`;
              window.location.href = mailtoLink;
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800 font-medium text-sm"
          >
            ✉️ Email
          </button>
        </div>
      </div>

      {/* Rewards Tier */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 p-4 rounded-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900">Referral Rewards</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            rewards.level === 'Gold' ? 'bg-yellow-400 text-yellow-900' :
            rewards.level === 'Silver' ? 'bg-slate-300 text-slate-900' :
            rewards.level === 'Bronze' ? 'bg-amber-600 text-white' :
            'bg-slate-200 text-slate-900'
          }`}>
            {rewards.level} • {conversions} conversions
          </span>
        </div>

        <p className="text-slate-700 font-medium mb-3">{rewards.reward}</p>

        {rewards.nextThreshold && (
          <div className="bg-white p-3 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-600">Progress to next level</span>
              <span className="text-sm font-semibold text-slate-900">
                {conversions}/{rewards.nextThreshold}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(conversions / rewards.nextThreshold) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* How It Works */}
      <div className="mt-6 pt-6 border-t">
        <h3 className="font-semibold text-slate-900 mb-3">How it works</h3>
        <ol className="space-y-2 text-sm text-slate-700">
          <li><span className="font-semibold">1.</span> Share your referral link with colleagues</li>
          <li><span className="font-semibold">2.</span> When they complete an audit, you get a conversion</li>
          <li><span className="font-semibold">3.</span> Unlock rewards at each tier</li>
          <li><span className="font-semibold">4.</span> Cash out or apply credits to your account</li>
        </ol>
      </div>
    </section>
  );
}
