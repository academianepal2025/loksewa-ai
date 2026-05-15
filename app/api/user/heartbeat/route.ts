import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Insert a new activity log for today. 
    // ON CONFLICT DO NOTHING because we have a UNIQUE(user_id, activity_date) constraint.
    const { error } = await supabase.from('activity_logs').insert({
      user_id: user.id
      // activity_date defaults to CURRENT_DATE in DB
    });

    // We ignore the error if it's a unique constraint violation (code 23505)
    if (error && error.code !== '23505') {
      console.error('Heartbeat log error:', error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Heartbeat Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
