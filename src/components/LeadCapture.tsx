'use client';

import { useEffect, useRef, useState } from 'react';

interface LeadCaptureProps {
  auditId: string;
  savings: number;
  onSuccess?: () => void;
}

declare global {
  interface Window {
    hcaptcha?: {
      render: (elementId: string, options: Record<string, unknown>) => void;
      reset: () => void;
      getResponse: () => string;
    };
  }
}

export default function LeadCapture({ auditId, savings, onSuccess }: LeadCaptureProps) {
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [, setCaptchaReady] = useState(false);
  const captchaRef = useRef<HTMLDivElement>(null);
  const captchaRenderedRef = useRef(false);

  useEffect(() => {
    // Prevent double-rendering in strict mode
    if (captchaRenderedRef.current) {
      return;
    }

    // Define global callback for hCaptcha onload
    const onHcaptchaLoad = () => {
      if (captchaRenderedRef.current || !captchaRef.current) {
        return;
      }

      if (window.hcaptcha) {
        try {
          window.hcaptcha.render('hcaptcha-container', {
            sitekey: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY,
            theme: 'light',
          });
          captchaRenderedRef.current = true;
          setCaptchaReady(true);
        } catch (err) {
          console.error('hCaptcha render error:', err);
        }
      }
    };

    // Store callback on window for hCaptcha to call
    (window as any).onHcaptchaLoad = onHcaptchaLoad;

    // Check if script already exists
    if (document.querySelector('script[src*="hcaptcha"]')) {
      // Script already loaded, try to render if hCaptcha is ready
      if (window.hcaptcha && captchaRef.current) {
        // Use setTimeout to ensure DOM is ready and hCaptcha API is fully initialized
        setTimeout(() => {
          onHcaptchaLoad();
        }, 100);
      }
      return;
    }

    // Load script with onload callback
    const script = document.createElement('script');
    script.src = 'https://js.hcaptcha.com/1/api.js?render=explicit&onload=onHcaptchaLoad';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup - reset ref on unmount
      captchaRenderedRef.current = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Verify CAPTCHA
    if (!window.hcaptcha?.getResponse()) {
      setError('Please complete the CAPTCHA');
      return;
    }

    const captchaToken = window.hcaptcha.getResponse();

    setLoading(true);

    try {
      const res = await fetch('/api/leads/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          companyName,
          role,
          teamSize,
          auditId,
          savings,
          captchaToken,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Error: ${res.status}`);
      }

      setSuccess(true);
      setEmail('');
      setCompanyName('');
      setRole('');
      setTeamSize('');
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save lead');
      // Reset captcha if available
      try {
        window.hcaptcha?.reset();
      } catch {
        // Ignore reset errors
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-md bg-green-50 border border-green-200 p-4">
        <p className="text-sm text-green-800">
          ✓ Thanks for sharing your details! We&apos;ll reach out soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-slate-50 p-5 rounded-md border">
      <h3 className="font-semibold text-slate-900">Get Expert Recommendations</h3>
      <p className="text-sm text-slate-600">
        Share your email and company details to receive personalized optimization strategies.
      </p>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Company (optional)
        </label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Your Company"
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Role (optional)
          </label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g., Manager, Engineer"
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Team Size (optional)
          </label>
          <select
            value={teamSize}
            onChange={(e) => setTeamSize(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="">Select...</option>
            <option value="solo">Solo</option>
            <option value="small">Small (2-10)</option>
            <option value="medium">Medium (11-50)</option>
            <option value="large">Large (50+)</option>
          </select>
        </div>
      </div>

      {/* hCaptcha */}
      <div className="flex justify-center">
        <div
          ref={captchaRef}
          id="hcaptcha-container"
          className="h-19.5"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-slate-900 text-white py-2 rounded-md text-sm font-medium hover:bg-slate-700 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Get Recommendations"}
      </button>
    </form>
  );
}
