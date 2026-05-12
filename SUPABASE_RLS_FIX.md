# Fixing Supabase RLS Policy Error (42501)

## Issue
You're seeing this error when trying to save audit results and leads:
```
Supabase insert error: {
  code: '42501',
  message: 'new row violates row-level security policy for table "audit_results"'
}
```

## Root Cause
The `audit_results` and `leads` tables have **Row Level Security (RLS)** enabled, which prevents anonymous public inserts by default.

## Solutions

### Option 1: Disable RLS (Fastest for Development)
If this is for development, disable RLS on both tables:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Authentication → Policies**
4. Find `audit_results` table → Click options → **Disable RLS**
5. Find `leads` table → Click options → **Disable RLS**

### Option 2: Create RLS Policies (Recommended for Production)
If you want to keep RLS enabled, create policies to allow public inserts.

Run these SQL commands in Supabase **SQL Editor**:

```sql
-- Enable RLS on audit_results table
ALTER TABLE audit_results ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public inserts
CREATE POLICY "Allow public inserts on audit_results" 
  ON audit_results 
  FOR INSERT 
  WITH CHECK (true);

-- Enable RLS on leads table
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public inserts on leads
CREATE POLICY "Allow public inserts on leads" 
  ON leads 
  FOR INSERT 
  WITH CHECK (true);
```

### Option 3: Use Service Role Key (Most Secure)
Replace your anon key with a service role key in `.env.local`:

```bash
# Get service role key from:
# Supabase Dashboard → Settings → API keys → Service role key

NEXT_PUBLIC_SUPABASE_ANON_KEY=<service-role-key>
```

## Verification
After implementing a solution:
1. Restart the development server: `npm run dev`
2. Run an audit and create a share link
3. Check terminal for success: `[Supabase] Audit result ... saved successfully`

## Note
- The app works fine without Supabase (graceful fallback)
- Email confirmations still work via Resend (separate service)
- Share links are stored in localStorage if Supabase fails
