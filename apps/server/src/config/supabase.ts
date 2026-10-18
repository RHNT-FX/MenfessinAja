import { createClient } from '@supabase/supabase-js';
import { ENV } from './env.js';

export const isSupabaseConfigured = Boolean(
  ENV.SUPABASE_URL && 
  ENV.SUPABASE_URL !== 'https://demo-placeholder.supabase.co' &&
  ENV.SUPABASE_ANON_KEY &&
  ENV.SUPABASE_ANON_KEY !== 'demo-anon-key'
);

// Supabase client instance (menggunakan service role key untuk operasi backend & moderasi)
export const supabase = createClient(
  ENV.SUPABASE_URL,
  ENV.SUPABASE_SERVICE_ROLE_KEY || ENV.SUPABASE_ANON_KEY
);
