
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkColumns() {
  const { data, error } = await supabase
    .from('study_plans')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Error fetching study_plans:', error);
  } else {
    console.log('Sample data keys:', data.length > 0 ? Object.keys(data[0]) : 'No data found');
  }
}

checkColumns();
