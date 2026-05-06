import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSync() {
  console.log('Checking user counts...');
  
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) console.error('Auth users error:', authError.message);
  else console.log('Total users in auth.users:', users.length);

  const { count: profileCount, error: pError } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  if (pError) console.error('Profiles error:', pError.message);
  else console.log('Total profiles in public.profiles:', profileCount);

  if (users && users.length > 0) {
    console.log('Sample auth user email:', users[0].email);
  }
}

checkSync();
