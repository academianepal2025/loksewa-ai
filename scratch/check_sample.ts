import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
  const { data: profiles, error } = await supabase.from('profiles').select('*').limit(1);
  console.log('Sample profile:', profiles?.[0]);
  
  const { data: { user } } = await supabase.auth.admin.listUsers();
  console.log('Sample auth user ID:', user?.id || user?.[0]?.id);
}

check();
