import { createClient } from '@supabase/supabase-js';

const FALLBACK_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6aHlzanFkd2dvYW1hdHBtY3diIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODg5Njg5NiwiZXhwIjoyMTA0NDcyODk2fQ.XS_RQD9BNoZXGg9BNEwFWJ2dPTqm6WnIv6LzpZF5lm0';

export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kzhysjqdwgoamatpmcwb.supabase.co';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || FALLBACK_SERVICE_ROLE_KEY;

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
