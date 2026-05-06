import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log('Using URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
  const { data: profiles, error: pError } = await supabase.from('profiles').select('id').limit(1);
  if (pError) {
    console.error('Profiles error:', pError.message);
  } else {
    console.log('Successfully connected to profiles. Row count:', profiles.length);
  }

  const tables = ['subscriptions', 'subscription', 'user_subscriptions', 'user_subscription'];
  for (const t of tables) {
    const { error } = await supabase.from(t).select('*').limit(0);
    if (!error) {
      console.log(`FOUND TABLE: ${t}`);
    } else {
      console.log(`Table ${t} error: ${error.message}`);
    }
  }
}

check();
