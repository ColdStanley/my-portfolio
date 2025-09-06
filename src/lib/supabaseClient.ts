import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Enhanced Supabase client optimized for Vercel deployment
export const supabase = createClientComponentClient({
  options: {
    // Optimize for Vercel serverless deployment
    db: {
      schema: 'public',
    },
    global: {
      // Set headers for better performance in serverless
      headers: {
        'X-Client-Info': 'ai-card-studio-vercel',
      },
    },
  },
})