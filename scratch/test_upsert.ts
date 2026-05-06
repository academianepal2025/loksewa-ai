import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testUpsert() {
  console.log('Testing upsert on subscriptions table...');
  
  // Try to find a real user id to test with (or just use a random uuid)
  const testUserId = '00000000-0000-0000-0000-000000000000';
  
  const { data, error } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: testUserId,
      plan: 'pro_monthly',
      status: 'active',
      expires_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

  if (error) {
    console.error('Upsert failed:', error.message);
    console.error('Error details:', error);
  } else {
    console.log('Upsert successful:', data);
    // Cleanup
    await supabase.from('subscriptions').delete().eq('user_id', testUserId);
  }
}

testUpsert();
