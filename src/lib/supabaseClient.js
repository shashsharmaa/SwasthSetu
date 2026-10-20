import { createClient } from '@supabase/supabase-js';

const configuredSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const configuredSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const dummyUrl = 'https://placeholder.supabase.co';
const dummyAnonKey = 'placeholder-anon-key';

if (!configuredSupabaseUrl) {
  console.error('VITE_SUPABASE_URL is missing. Check .env.local');
}

if (!configuredSupabaseAnonKey) {
  console.error('VITE_SUPABASE_ANON_KEY is missing. Check .env.local');
}

const supabaseUrl = configuredSupabaseUrl || dummyUrl;
const supabaseAnonKey = configuredSupabaseAnonKey || dummyAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
