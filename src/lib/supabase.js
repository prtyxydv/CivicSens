import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// This check will tell us if the keys are actually missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("🔥 SYSTEM ALERT: Supabase keys are missing from .env.local!");
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
)