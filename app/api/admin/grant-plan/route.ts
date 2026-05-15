import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendPaymentApprovedEmail } from '@/lib/email';

const PLAN_DURATIONS: Record<string, number> = {
  pro_monthly: 30,
  pro_quarterly: 90,
  cycle_pack: 180
};

export async function POST(req: Request) {
  try {
    const { error, user } = await verifyAdmin();
    if (error) return error;

    const { userId, plan, expiresAt } = await req.json();
    if (!userId || !plan || !PLAN_DURATIONS[plan]) {
      return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();
    const now = new Date().toISOString();
    let expiry = expiresAt ? new Date(expiresAt) : new Date();
    if (!expiresAt) expiry.setDate(expiry.getDate() + PLAN_DURATIONS[plan]);

    const { error: subError } = await supabaseAdmin
      .from('subscriptions')
      .upsert({ user_id: userId, plan, status: 'active', expires_at: expiry.toISOString() }, { onConflict: 'user_id' });
    if (subError) throw subError;

    // Fetch user details for email
    const { data: userProfile } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single();

    const userEmail = userProfile?.email || '';
    const userName = userProfile?.full_name || 'Loksewa Student';

    // No email in profiles table initially, but we might have it now
    await supabaseAdmin.from('payment_requests').insert({
      user_id: userId, user_email: userEmail, payer_name: 'Admin Grant', payer_phone: '0000000000',
      plan, plan_amount: 0, status: 'manually_granted', admin_notes: `Granted by Admin`,
      reviewed_at: now, created_at: now
    });

    if (userEmail) {
      sendPaymentApprovedEmail(userEmail, userName, plan, 0).catch(e => console.error('Grant Email Error:', e));
    }

    return NextResponse.json({ success: true, expiresAt: expiry.toISOString() });
  } catch (error: any) {
    console.error('Grant Plan Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
