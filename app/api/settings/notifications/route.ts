import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { preferences } = body;

    if (!preferences) {
      return NextResponse.json({ error: 'Notification preferences are required' }, { status: 400 });
    }

    // Update the JSONB column in profiles
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        notification_preferences: preferences
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Notification update error:', updateError);
      return NextResponse.json({ 
        error: 'Failed to update notification preferences. Please ensure your schema is up to date.',
        details: updateError.message
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Notification preferences saved' 
    });

  } catch (error: any) {
    console.error('Settings Notifications API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
