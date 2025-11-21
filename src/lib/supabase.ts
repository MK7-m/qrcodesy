import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    const errorMessage = `Missing Supabase environment variables. 
Please create a .env file in the root directory with:
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

Current values:
VITE_SUPABASE_URL: ${supabaseUrl ? 'Set' : 'Missing'}
VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'Set' : 'Missing'}`;
    
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }

  return supabaseInstance;
}

// Export a getter that will throw if env vars are missing
export const supabase = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = client[prop as keyof typeof client];
    return typeof value === 'function' ? value.bind(client) : value;
  }
});
