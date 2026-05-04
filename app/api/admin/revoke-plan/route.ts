import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const { error } = await verifyAdmin();
    if (error) return error;

    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const supabaseAdmin = createAdminClient();
    const { error: updateError } = await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'expired', updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (updateError) throw updateError;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Revoke Plan Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
