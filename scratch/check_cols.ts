import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
  const { data, error } = await supabase.from('profiles').select('*').limit(0);
  if (error) {
    console.log('Error:', error.message);
  } else {
    // This is the trick to get column names from an empty select if possible
    // Actually, select * limit 0 might not return columns in some clients.
    // Let's select 1 row.
    const { data: row } = await supabase.from('profiles').select('*').limit(1);
    if (row && row.length > 0) {
        console.log('Columns:', Object.keys(row[0]));
    } else {
        console.log('No rows found to check columns.');
    }
  }
}

check();
