import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAllTables() {
  const tables = [
    'profiles',
    'subscriptions',
    'payment_requests',
    'daily_usage',
    'documents',
    'study_notes',
    'study_plans',
    'user_exams',
    'quiz_attempts',
    'chat_messages',
    'mock_test_submissions'
  ];
  
  for (const t of tables) {
    const { error } = await supabase.from(t).select('*').limit(0);
    if (error) {
      console.log(`[MISSING] ${t}: ${error.message}`);
    } else {
      console.log(`[EXISTS ] ${t}`);
    }
  }
}

checkAllTables();
