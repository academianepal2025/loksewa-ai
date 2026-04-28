import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envFile = fs.readFileSync('.env.local', 'utf8');
const envVars = Object.fromEntries(
  envFile.split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => line.split('=').map(part => part.trim()))
);

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listBuckets() {
  const { data, error } = await supabase.storage.listBuckets();
  console.log("Buckets:", data?.map(b => b.name));
  console.log("Error:", error);
}

listBuckets();
