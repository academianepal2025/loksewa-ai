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
      .maybeSingle();

    if (profileError) {
      console.error('[adminAuth] Profile fetch error:', profileError);
      return { error: NextResponse.json({ error: `Database error: ${profileError.message}` }, { status: 500 }), user: null, supabase };
    }

    if (!profile) {
      console.warn('[adminAuth] Profile not found for user:', user.id);
      return { error: NextResponse.json({ error: 'User profile not found' }, { status: 403 }), user: null, supabase };
    }

    if (!profile.is_admin) {
      console.warn('[adminAuth] User is not admin:', user.email);
      return { error: NextResponse.json({ error: 'Access denied: Admin privileges required' }, { status: 403 }), user: null, supabase };
    }

    console.log('[adminAuth] Admin verified successfully');
    return { error: null, user, supabase };
  } catch (err: any) {
    console.error('[adminAuth] UNEXPECTED ERROR:', err);
    return { error: NextResponse.json({ error: err.message }, { status: 500 }), user: null, supabase: null as any };
  }
}
