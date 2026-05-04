import { verifyAdmin } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 1. Verify Admin Access
    console.log('[verify-payment] Verifying admin...');
    const { error, user } = await verifyAdmin();
    if (error) return error;

    const supabaseAdmin = createAdminClient();
    const { paymentRequestId, action, adminNotes } = await request.json();

    if (!paymentRequestId || !action) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // 2. Fetch the request
    const { data: paymentRequest, error: fetchError } = await supabaseAdmin
      .from('payment_requests')
      .select('*')
      .eq('id', paymentRequestId)
      .single();

    if (fetchError || !paymentRequest) {
      console.error('[verify-payment] Fetch error:', fetchError);
      throw new Error('Payment request not found');
    }

    const now = new Date().toISOString();

    if (action === 'approved') {
      const expiresAt = new Date();
      if (paymentRequest.plan === 'pro_monthly') expiresAt.setDate(expiresAt.getDate() + 30);
      else if (paymentRequest.plan === 'pro_quarterly') expiresAt.setDate(expiresAt.getDate() + 90);
      else if (paymentRequest.plan === 'cycle_pack') expiresAt.setDate(expiresAt.getDate() + 180);

      console.log('[verify-payment] Activating plan for user:', paymentRequest.user_id);

      // 4. Update/Insert Subscription
      const { error: subError } = await supabaseAdmin
        .from('subscriptions')
        .upsert({
          user_id: paymentRequest.user_id,
          plan: paymentRequest.plan,
          status: 'active',
          expires_at: expiresAt.toISOString()
        }, { onConflict: 'user_id' });

      if (subError) {
        console.error('[verify-payment] Subscription Error:', subError);
        throw subError;
      }

      // 5. Update Request Status
      const { error: reqError } = await supabaseAdmin
        .from('payment_requests')
        .update({
          status: 'approved',
          admin_notes: adminNotes || null,
          reviewed_at: now
        })
        .eq('id', paymentRequestId);

      if (reqError) {
        console.error('[verify-payment] Request Update Error:', reqError);
        throw reqError;
      }

    } else if (action === 'rejected') {
      if (!adminNotes) return NextResponse.json({ error: 'Rejection reason is mandatory' }, { status: 400 });

      const { error: reqError } = await supabaseAdmin
        .from('payment_requests')
        .update({
          status: 'rejected',
          admin_notes: adminNotes,
          reviewed_at: now
        })
        .eq('id', paymentRequestId);

      if (reqError) throw reqError;
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('[verify-payment] 500 Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
