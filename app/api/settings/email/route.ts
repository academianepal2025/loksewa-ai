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
    const { newEmail, currentPassword } = body;

    if (!newEmail || !currentPassword) {
      return NextResponse.json({ error: 'New email and current password are required' }, { status: 400 });
    }

    // 1. Re-authenticate by signing in with password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (signInError) {
      return NextResponse.json({ error: 'Invalid current password' }, { status: 401 });
    }

    // 2. Update Email (Supabase handles confirmation email flow)
    const { error: updateEmailError } = await supabase.auth.updateUser({
      email: newEmail,
    });

    if (updateEmailError) {
      console.error('Email update error:', updateEmailError.message);
      return NextResponse.json({ error: updateEmailError.message }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Check your new email address for a confirmation link to complete the change.' 
    });

  } catch (error: any) {
    console.error('Settings Email API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
