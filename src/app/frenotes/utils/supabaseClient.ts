// src/app/frenotes/utils/supabaseClient.ts (Recommended path)
import { createClient } from '@supabase/supabase-js';

// Declare a global variable to hold the Supabase client instance.
// This helps in development mode with Next.js Fast Refresh.
// In production, each import usually resolves to the same instance.
declare global {
  var _supabase: ReturnType<typeof createClient> | undefined;
}

let supabase: ReturnType<typeof createClient>;

// Check if we are in a browser environment and if a client already exists
if (typeof window !== 'undefined') {
  if (!global._supabase) {
    global._supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  supabase = global._supabase;
} else {
  // For SSR/API routes, you might create a new client per request
  // or use a different caching mechanism if stateful operations are involved.
  // For simple data fetching, creating one per module load is often fine.
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export { supabase };