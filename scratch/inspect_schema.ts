import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspectSchema() {
  console.log('Inspecting schema...');
  
  const { data: subData, error: subError } = await supabase.from('subscriptions').select('*').limit(1);
  if (subError) console.error('Subscriptions error:', subError.message);
  else console.log('Subscriptions columns:', Object.keys(subData[0] || {}));

  const { data: payData, error: payError } = await supabase.from('payment_requests').select('*').limit(1);
  if (payError) console.error('Payment Requests error:', payError.message);
  else console.log('Payment Requests columns:', Object.keys(payData[0] || {}));
}

inspectSchema();
