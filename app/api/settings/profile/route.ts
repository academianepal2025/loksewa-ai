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
    const { fullName, phone, photoUrl } = body;

    // Validate full name
    if (!fullName || fullName.trim().length === 0) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }

    // Validate Nepal phone format: +977 followed by 9 or 10 digits
    const phoneRegex = /^\+977\d{9,10}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ error: 'Invalid phone format. Use +977 followed by 9-10 digits.' }, { status: 400 });
    }

    // 1. Update Profile Table
    const updateData: any = {
      full_name: fullName,
      phone: phone,
    };

    if (photoUrl) updateData.photo_url = photoUrl;

    const { error: profileError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id);

    if (profileError) {
      console.error('Profile update error:', profileError);
      return NextResponse.json({ 
        error: 'Database update failed. Please ensure your schema is up to date.',
        details: profileError.message 
      }, { status: 500 });
    }

    // 2. Update Auth Metadata
    const { error: updateAuthError } = await supabase.auth.updateUser({
      data: { full_name: fullName }
    });

    if (updateAuthError) {
      console.warn('Auth metadata update failed:', updateAuthError.message);
      // We don't return error here as the main profile table was updated successfully
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully',
      profile: { fullName, phone, photoUrl }
    });

  } catch (error: any) {
    console.error('Settings Profile API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
