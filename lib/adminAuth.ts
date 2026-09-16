import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

/**
 * Shared admin authentication guard for all admin API routes.
 * Verifies user session exists AND the user has is_admin = true in profiles.
 * Returns the authenticated user or a 401/403 NextResponse.
 */
export async function verifyAdmin() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      if (authError) console.error('[adminAuth] Auth error:', authError);
      return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), user: null, supabase };
    }
    
    // Check is_admin using admin service client so RLS rules on profiles do not block reading
    const supabaseAdmin = createAdminClient();
    const { data: profile, error: profileError } = await supabaseAdmin
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

    return { error: null, user, supabase };
  } catch (err: any) {
    console.error('[adminAuth] UNEXPECTED ERROR:', err);
    return { error: NextResponse.json({ error: err.message }, { status: 500 }), user: null, supabase: null as any };
  }
}
