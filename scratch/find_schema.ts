import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findSubscriptionsSchema() {
  console.log('Searching for subscriptions table in all schemas...');
  
  // Try common schemas
  const schemas = ['public', 'auth', 'storage', 'vault'];
  for (const schema of schemas) {
    const { error } = await supabase.from(schema + '.subscriptions').select('*').limit(0);
    if (!error) {
      console.log(`FOUND TABLE in schema: ${schema}`);
      return;
    } else {
      console.log(`Schema ${schema} error: ${error.message}`);
    }
  }
  
  // If still not found, try to use a function to list all tables
  console.log('Trying to list all accessible tables...');
  const { data, error } = await supabase.rpc('get_all_tables'); // Custom RPC if it exists
  if (error) {
    console.log('No RPC get_all_tables found.');
  } else {
    console.log('Accessible tables:', data);
  }
}

findSubscriptionsSchema();
