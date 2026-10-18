import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { ENV } from './env.js';

export const isSupabaseConfigured = Boolean(
  ENV.SUPABASE_URL && 
  ENV.SUPABASE_URL !== 'https://demo-placeholder.supabase.co' &&
  ENV.SUPABASE_ANON_KEY &&
  ENV.SUPABASE_ANON_KEY !== 'demo-anon-key'
);

let _supabaseClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabaseClient) {
    _supabaseClient = createClient(
      ENV.SUPABASE_URL,
      ENV.SUPABASE_SERVICE_ROLE_KEY || ENV.SUPABASE_ANON_KEY,
      {
        auth: { persistSession: false },
        // Hindari dependensi WebSocket native Node 22 pada Node 20 LTS
        realtime: {
          createWebSocket: () => null
        } as any
      }
    );
  }
  return _supabaseClient;
}

// Proxy aman untuk SupabaseClient
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabase();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
});
