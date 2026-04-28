const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value) env[key.trim()] = value.join('=').trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  const payload = {
    plan_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
    day_number: 999,
    is_completed: true,
    feedback_status: 'finished',
    difficulty: 'easy',
    user_notes: 'Test note'
  };
  const { data, error } = await supabase.from('study_progress').insert(payload);
  if (error) {
    console.error('Insert error:', error);
  } else {
    console.log('Insert success:', data);
  }
}

testInsert();
