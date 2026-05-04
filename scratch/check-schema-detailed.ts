import { createAdminClient } from '../lib/supabase/admin';

async function checkDetailedSchema() {
  const supabase = createAdminClient();
  
  console.log('--- Checking Profiles Table ---');
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching profiles:', error);
  } else if (data && data.length > 0) {
    console.log('Columns found:', Object.keys(data[0]).join(', '));
  } else {
    console.log('No data found in profiles table to check columns.');
  }

  console.log('\n--- Checking Subscriptions Table ---');
  const { data: subData, error: subError } = await supabase
    .from('subscriptions')
    .select('*')
    .limit(1);

  if (subError) {
    console.error('Error fetching subscriptions:', subError);
  } else if (subData && subData.length > 0) {
    console.log('Columns found:', Object.keys(subData[0]).join(', '));
  }
}

checkDetailedSchema();
