import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listTables() {
  console.log('Listing all tables in public schema...');
  
  const { data, error } = await supabase.rpc('get_tables_info');

  if (error) {
    console.log('RPC get_tables_info failed, trying generic select...');
    // Fallback: try to guess table names by trying to select from them
    const tablesToTry = ['user_subscriptions', 'user_plans', 'memberships', 'profiles'];
    for (const table of tablesToTry) {
        const { error: err } = await supabase.from(table).select('*').limit(0);
        if (!err) console.log(`Table exists: ${table}`);
        else if (err.message.includes('not found')) console.log(`Table NOT found: ${table}`);
        else console.log(`Table error on ${table}: ${err.message}`);
    }
  } else {
    console.log('Tables:', data);
  }
}

listTables();
