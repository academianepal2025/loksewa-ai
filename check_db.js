const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDb() {
  const { data: docs, error } = await supabase.from('documents').select('*');
  console.log('Documents:', docs);
  console.log('Error:', error);
}

checkDb();
