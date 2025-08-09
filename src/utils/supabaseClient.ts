import { createClient } from '@supabase/supabase-js';

// The supabase client is created with the public URL and anon key. These values
// should be provided via environment variables at build time.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
