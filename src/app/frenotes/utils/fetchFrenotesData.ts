// src/app/frenotes/utils/fetchFrenotesData.ts
// import { createClient } from '@supabase/supabase-js' // REMOVE this line
import { supabase } from './supabaseClient'; // <-- ADD this line, adjust path if needed
import { FrenotesItem } from '@/app/frenotes/types/frenotes'

// REMOVE these lines (they are now in supabaseClient.ts)
// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// )

export async function fetchFrenotesData(): Promise<FrenotesItem[]> {
  // Add a defensive check, though 'supabase' should now always be initialized
  if (!supabase) {
      console.error("Supabase client not initialized in fetchFrenotesData.");
      return [];
  }

  const { data, error } = await supabase
    .from('frenotes_materials')
    .select('*')
    .order('added_time', { ascending: false })

  if (error) {
    console.error('❌ Failed to fetch Frenotes data:', error.message)
    return []
  }

  return data as FrenotesItem[]
}