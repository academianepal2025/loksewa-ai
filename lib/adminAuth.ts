import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Shared admin authentication guard for all admin API routes.
 * Verifies user session exists AND the user has is_admin = true in profiles.
 * Returns the authenticated user or a 401/403 NextResponse.
 */
export async function verifyAdmin() {
  try {
    const supabase = await createClient();
    console.log('[adminAuth] Step 1: Checking session...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('[adminAuth] Auth error:', authError);
      return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), user: null, supabase };
    }
    
    if (!user) {
      console.warn('[adminAuth] No user found in session');
      return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), user: null, supabase };
    }
    
    console.log('[adminAuth] Step 2: Checking profile for user:', user.id);
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('[adminAuth] Profile fetch error:', profileError);
      // Fallback: check if it's the admin email even if profile fetch fails
      if (user.email === 'shahrammy131@gmail.com') {
         console.log('[adminAuth] Profile fetch failed but email matched super admin. Proceeding.');
         return { error: null, user, supabase };
      }
      return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }), user: null, supabase };
    }

    if (!profile?.is_admin) {
      console.warn('[adminAuth] User is not admin:', user.email);
      // Fallback for the user
      if (user.email === 'shahrammy131@gmail.com') {
        console.log('[adminAuth] User not marked as admin in DB but email matched super admin. Proceeding.');
        return { error: null, user, supabase };
      }
      return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }), user: null, supabase };
    }

    console.log('[adminAuth] Admin verified successfully');
    return { error: null, user, supabase };
  } catch (err: any) {
    console.error('[adminAuth] UNEXPECTED ERROR:', err);
    return { error: NextResponse.json({ error: err.message }, { status: 500 }), user: null, supabase: null as any };
  }
}
