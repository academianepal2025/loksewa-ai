import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspectSubscriptions() {
  console.log('Inspecting subscriptions table...');
  
  // Try to insert a dummy record with only user_id to see what Postgres complains about
  const dummyId = '00000000-0000-0000-0000-000000000001';
  const { data, error } = await supabase
    .from('subscriptions')
    .insert({ user_id: dummyId });

  if (error) {
    console.log('Postgres Error Message:', error.message);
    console.log('Postgres Error Hint:', error.hint);
    console.log('Postgres Error Details:', error.details);
  } else {
    console.log('Insert successful? (Unexpected if columns are missing)');
    await supabase.from('subscriptions').delete().eq('user_id', dummyId);
  }
}

inspectSubscriptions();
