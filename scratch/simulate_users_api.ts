import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// We can't easily call the API with a real session from a script
// So let's simulate the API logic in a script to see where it fails.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function simulateApi() {
  console.log('Simulating /api/admin/users GET...');
  
  try {
    const { data: profiles, count, error: pError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, phone, photo_url, created_at', { count: 'exact' });

    if (pError) {
      console.error('Profiles Fetch Error:', pError.message);
      return;
    }

    console.log('Profiles fetched:', profiles?.length, 'Total count:', count);

    const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) {
      console.error('Auth Users Error:', authError.message);
    } else {
      console.log('Auth users fetched:', authUsers.length);
    }

    const userIds = profiles?.map(p => p.id) || [];

    const [subsRes] = await Promise.all([
      supabaseAdmin.from('subscriptions')
        .select('user_id, plan, status, expires_at')
        .in('user_id', userIds),
    ]);

    if (subsRes.error) {
      console.error('Subscriptions Fetch Error:', subsRes.error.message);
    } else {
      console.log('Subscriptions fetched:', subsRes.data.length);
    }

    console.log('Simulation successful. Data seems available.');
  } catch (err: any) {
    console.error('Simulation crashed:', err.message);
  }
}

simulateApi();
