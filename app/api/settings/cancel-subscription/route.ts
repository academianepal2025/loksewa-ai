import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update the subscription status to 'cancelled'
    // This allows the user to keep access until the original 'expires_at' date
    const { data: subscription, error: updateError } = await supabase
      .from('subscriptions')
      .update({ 
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('status', 'active')
      .select('expires_at')
      .maybeSingle();

    if (updateError) {
      console.error('Subscription cancellation error:', updateError);
      return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Your subscription has been cancelled. You will retain access until your current period ends.',
      expiresAt: subscription?.expires_at
    });

  } catch (error: any) {
    console.error('Settings Cancel Subscription API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
