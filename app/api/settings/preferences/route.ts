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
    const { studyPreferences, uiPreferences } = body;

    // 1. Update Study Preferences in profiles (JSONB)
    if (studyPreferences) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          study_preferences: studyPreferences
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Study preferences update error:', profileError);
        return NextResponse.json({ 
          error: 'Failed to update study preferences. Please ensure your schema is up to date.',
          details: profileError.message
        }, { status: 500 });
      }
    }

    // 2. Synchronize UI Preferences (Language, Theme) in user_preferences table
    if (uiPreferences) {
      const { error: uiError } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          language: uiPreferences.language,
          brand_theme: uiPreferences.theme,
          reading_font_scale: uiPreferences.fontScale,
          updated_at: new Date().toISOString()
        });

      if (uiError) {
        console.warn('UI preferences sync failed:', uiError.message);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Preferences saved successfully' 
    });

  } catch (error: any) {
    console.error('Settings Preferences API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
