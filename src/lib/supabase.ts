import { createClient } from '@supabase/supabase-js';

// Read Vite-injected environment variables. They must be prefixed with `VITE_`.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (typeof supabaseUrl !== 'string' || supabaseUrl.trim() === '' || typeof supabaseAnonKey !== 'string' || supabaseAnonKey.trim() === '') {
  throw new Error(
    'Missing Supabase environment variables: please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in a .env file at the project root and restart Vite.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
