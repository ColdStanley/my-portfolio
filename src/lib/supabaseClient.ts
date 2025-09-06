import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Enhanced Supabase client optimized for Vercel deployment
export const supabase = createClientComponentClient({
  options: {
    // Optimize for Vercel serverless deployment
    db: {
      schema: 'public',
    },
    auth: {
      // Critical: Enable session persistence for production
      persistSession: true,
      autoRefreshToken: true,
      // Remove detectSessionInUrl - not needed for email/password auth
      storageKey: 'sb-ai-card-studio-auth-token',
    },
    global: {
      // Set headers for better performance in serverless
      headers: {
        'X-Client-Info': 'ai-card-studio-vercel',
      },
    },
  },
})