/**
 * Environment variable validation and access
 * Ensures all required env vars are present at runtime
 */

const requiredServerEnvVars = ['GEMINI_API_KEY'];
const requiredClientEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

// Validate required env vars
if (typeof window === 'undefined') {
  // Server-side validation
  requiredServerEnvVars.forEach((key) => {
    if (!process.env[key]) {
      console.warn(`Missing server env var: ${key}`);
    }
  });
}

// Client-side validation
requiredClientEnvVars.forEach((key) => {
  if (typeof process.env[key] === 'undefined') {
    console.warn(`Missing client env var: ${key}`);
  }
});

const hasAppUrl =
  !!process.env.NEXT_PUBLIC_APP_URL ||
  !!process.env.URL ||
  !!process.env.DEPLOY_PRIME_URL;

if (!hasAppUrl) {
  console.warn('Missing app URL env var: set NEXT_PUBLIC_APP_URL for previews and production');
}

export const env = {
  // Server
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',

  // Client
  appUrl:
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.URL ||
    process.env.DEPLOY_PRIME_URL ||
    'http://localhost:3000',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
};
