import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { error: authError } = await verifyAdmin();
    if (authError) return authError;

    const supabaseAdmin = createAdminClient();
    const { count, error } = await supabaseAdmin
      .from('payment_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (error) {
      console.error('[admin/pending-count] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: count || 0
    });
  } catch (err: any) {
    console.error('[admin/pending-count] Unexpected error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
