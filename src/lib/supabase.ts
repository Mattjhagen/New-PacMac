import { createClient } from '@supabase/supabase-js'

// Use the correct Supabase URL format
const supabaseUrl = 'https://tvikatcdfnkwvjjpaxbu.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client-side Supabase client
export const createClientComponentClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey)
}
