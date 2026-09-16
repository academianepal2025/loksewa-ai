import { createBrowserClient } from '@supabase/ssr';

const DEFAULT_SUPABASE_URL = 'https://kzhysjqdwgoamatpmcwb.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6aHlzanFkd2dvYW1hdHBtY3diIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODg5Njg5NiwiZXhwIjoyMTA0NDcyODk2fQ.XS_RQD9BNoZXGg9BNEwFWJ2dPTqm6WnIv6LzpZF5lm0';

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY
  );
