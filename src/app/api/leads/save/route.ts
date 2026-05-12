import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface LeadData {
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: string;
  auditId: string;
  savings: number;
  captchaToken: string;
}

// Simple in-memory rate limiting (resets on server restart)
const rateLimitMap = new Map<string, number[]>();

function isRateLimited(email: string, maxPerHour: number = 5): boolean {
  const now = Date.now();
  const oneHourAgo = now - 3600000;
  
  const timestamps = rateLimitMap.get(email) ?? [];
  const recent = timestamps.filter((t) => t > oneHourAgo);
  
  if (recent.length >= maxPerHour) {
    return true;
  }
  
  recent.push(now);
  rateLimitMap.set(email, recent);
  return false;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const lead = body as LeadData;

    // Validate required fields
    if (!lead.email || !lead.auditId) {
      return NextResponse.json(
        { error: 'Email and audit ID required' },
        { status: 400 }
      );
    }

    // Verify hCaptcha token
    if (!lead.captchaToken) {
      return NextResponse.json(
        { error: 'CAPTCHA verification required' },
        { status: 400 }
      );
    }

    const hcaptchaSecret = process.env.HCAPTCHA_SECRET_KEY;
    if (hcaptchaSecret) {
      try {
        const verifyRes = await fetch('https://hcaptcha.com/siteverify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            secret: hcaptchaSecret,
            response: lead.captchaToken,
          }).toString(),
        });

        const verifyData = (await verifyRes.json()) as Record<string, unknown>;
        if (!verifyData.success) {
          console.log('[hCaptcha] Verification failed:', verifyData);
          return NextResponse.json(
            { error: 'CAPTCHA verification failed' },
            { status: 400 }
          );
        }
      } catch (captchaErr) {
        console.error('[hCaptcha] Verification error:', captchaErr);
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(lead.email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Rate limiting: max 5 per hour per email
    if (isRateLimited(lead.email, 5)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Try to save to Supabase
    // Note: If RLS (Row Level Security) is enabled, create a policy:
    // CREATE POLICY "Allow public inserts on leads" ON leads FOR INSERT WITH CHECK (true);
    try {
      const { error } = await supabase
        .from('leads')
        .insert([
          {
            email: lead.email,
            company_name: lead.companyName || null,
            role: lead.role || null,
            team_size: lead.teamSize || null,
            audit_id: lead.auditId,
            savings: lead.savings,
            created_at: new Date().toISOString(),
          },
        ]);

      if (error) {
        console.error('Supabase insert error (leads):', error);
        if (error.code === '42501') {
          console.log('[Info] RLS policy blocking insert on leads table.');
        }
      } else {
        console.log(`[Supabase] Lead ${lead.email} saved successfully`);
      }
    } catch (supabaseErr) {
      console.error('Supabase error:', supabaseErr);
    }

    // Try to send confirmation email
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        console.log(`[Email] Sending to ${lead.email} via Resend...`);
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'onboarding@resend.dev',
            to: lead.email,
            subject: 'Audit Complete - Credex AI Spend Analysis',
            html: `
              <h2>Your AI Spending Audit Results</h2>
              <p>Thank you for using Credex AI Spend Audit!</p>
              <p><strong>Estimated Monthly Savings:</strong> $${lead.savings}</p>
              ${
                lead.companyName
                  ? `<p><strong>Company:</strong> ${lead.companyName}</p>`
                  : ''
              }
              <p>We've analyzed your AI tool spending and identified optimization opportunities. 
              ${
                lead.savings > 100
                  ? `For high-savings cases like yours, our team will reach out to discuss implementation strategies.`
                  : `Visit your results page to see detailed recommendations.`
              }</p>
              <p>Questions? Reply to this email or visit our website.</p>
              <p>Best regards,<br>Credex AI Team</p>
            `,
          }),
        });

        if (emailRes.ok) {
          const data = await emailRes.json();
          console.log(`[Email] ✓ Sent successfully. Resend ID: ${(data as Record<string, string>).id}`);
        } else {
          const errText = await emailRes.text();
          console.error(
            `[Email] ✗ Failed with status ${emailRes.status}: ${errText}`
          );
        }
      } catch (emailErr) {
        console.error('[Email] ✗ Exception:', emailErr);
        // Don't fail the lead capture if email fails
      }
    } else {
      console.log('[Email] ⚠ RESEND_API_KEY not configured - skipping email');
    }

    return NextResponse.json({ success: true, email: lead.email });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to save lead';
    console.error('Lead save error:', errorMsg);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
