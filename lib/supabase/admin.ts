import { createClient } from '@supabase/supabase-js';

export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('[createAdminClient] SUPABASE_SERVICE_ROLE_KEY is missing. Falling back to NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  return createClient(
    supabaseUrl,
    serviceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};
