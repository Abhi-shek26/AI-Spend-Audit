import { supabase } from '@/lib/supabase';

export interface Referral {
  id: string;
  code: string;
  createdBy: string;
  createdAt: string;
  shareUrl: string;
  clicks: number;
  conversions: number;
  isActive: boolean;
}

// Helpful SQL to create the referrals table in Supabase (run in SQL editor)
export const REFERRALS_TABLE_SQL = `
-- referrals table (example)
create table if not exists public.referrals (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  audit_id text,
  user_id text,
  share_url text,
  clicks int default 0,
  conversions int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);
`;

// Generate a unique referral code
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Create a new referral
export async function createReferral(auditId: string, userId?: string): Promise<Referral | null> {
  const code = generateReferralCode();
  const shareUrl = `/audit/results/${auditId}?ref=${code}`;

  try {
    // Try to save to Supabase, but don't fail if it's not configured
    if (supabase) {
      const { data, error } = await supabase
        .from('referrals')
        .insert({
          code,
          audit_id: auditId,
          user_id: userId,
          share_url: shareUrl,
          clicks: 0,
          conversions: 0,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        // Detect missing table (PostgREST PGRST205) and provide actionable guidance
        const isMissingTable = (error.code === 'PGRST205') || /could not find the table/i.test(String(error.message || ''));
        if (isMissingTable) {
          console.warn('Referrals table not found in Supabase. Returning local fallback referral.');
          console.warn('Run the following SQL in Supabase SQL editor to create the table:');
          console.warn(REFERRALS_TABLE_SQL);
        } else {
          console.error('Failed to create referral in database:', error);
        }

        // Still return a local referral object so UI remains functional
        return {
          id: `local-${code}`,
          code,
          createdBy: userId || 'anonymous',
          createdAt: new Date().toISOString(),
          shareUrl,
          clicks: 0,
          conversions: 0,
          isActive: true,
        };
      }

      return data as Referral;
    }
  } catch (err) {
    console.error('Error creating referral:', err);
  }

  // Fallback local referral object
  return {
    id: `local-${code}`,
    code,
    createdBy: userId || 'anonymous',
    createdAt: new Date().toISOString(),
    shareUrl,
    clicks: 0,
    conversions: 0,
    isActive: true,
  };
}

// Track a referral click
export async function trackReferralClick(code: string): Promise<void> {
  try {
    if (supabase) {
      const { error } = await supabase.rpc('increment_referral_clicks', {
        ref_code: code,
      });

      if (error) {
        const isMissingTable = (error.code === 'PGRST205') || /could not find the table/i.test(String(error.message || ''));
        if (isMissingTable) {
          console.warn('Referrals table or RPC not found. Click not tracked.');
        } else {
          console.error('Failed to track referral click:', error);
        }
      }
    }
  } catch (err) {
    console.error('Error tracking referral click:', err);
  }
}

// Track a conversion (user completed audit after clicking referral link)
export async function trackReferralConversion(code: string): Promise<void> {
  try {
    if (supabase) {
      const { error } = await supabase.rpc('increment_referral_conversions', {
        ref_code: code,
      });

      if (error) {
        const isMissingTable = (error.code === 'PGRST205') || /could not find the table/i.test(String(error.message || ''));
        if (isMissingTable) {
          console.warn('Referrals table or RPC not found. Conversion not tracked.');
        } else {
          console.error('Failed to track referral conversion:', error);
        }
      }
    }
  } catch (err) {
    console.error('Error tracking referral conversion:', err);
  }
}

// Get referral by code
export async function getReferralByCode(code: string): Promise<Referral | null> {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('code', code)
        .single();

      if (error) {
        const isMissingTable = (error.code === 'PGRST205') || /could not find the table/i.test(String(error.message || ''));
        if (isMissingTable) {
          console.warn('Referrals table not found when fetching by code. Returning null.');
        } else {
          console.error('Failed to fetch referral:', error);
        }
        return null;
      }

      return data as Referral;
    }
  } catch (err) {
    console.error('Error fetching referral:', err);
  }

  return null;
}

// Get all referrals for a user
export async function getUserReferrals(userId: string): Promise<Referral[]> {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        const isMissingTable = (error.code === 'PGRST205') || /could not find the table/i.test(String(error.message || ''));
        if (isMissingTable) {
          console.warn('Referrals table not found when fetching user referrals. Returning empty list.');
        } else {
          console.error('Failed to fetch user referrals:', error);
        }
        return [];
      }

      return data as Referral[];
    }
  } catch (err) {
    console.error('Error fetching user referrals:', err);
  }

  return [];
}

// Calculate referral rewards (simple tiered system)
export interface ReferralRewards {
  level: string;
  conversions: number;
  reward: string;
  nextThreshold?: number;
}

export function calculateReferralRewards(conversions: number): ReferralRewards {
  if (conversions >= 20) {
    return {
      level: 'Gold',
      conversions,
      reward: '3 months free + $200 credit',
    };
  }

  if (conversions >= 10) {
    return {
      level: 'Silver',
      conversions,
      reward: '2 months free + $100 credit',
      nextThreshold: 20,
    };
  }

  if (conversions >= 5) {
    return {
      level: 'Bronze',
      conversions,
      reward: '1 month free + $50 credit',
      nextThreshold: 10,
    };
  }

  return {
    level: 'Standard',
    conversions,
    reward: 'Invite friends and earn rewards',
    nextThreshold: 5,
  };
}
