import { verifyAdmin } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { sendPaymentApprovedEmail, sendPaymentRejectedEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    // 1. Verify Admin Access
    console.log('[verify-payment] Verifying admin...');
    const { error: authError, user: adminUser } = await verifyAdmin();
    if (authError) {
      console.warn('[verify-payment] Admin verification failed');
      return authError;
    }

    const supabaseAdmin = createAdminClient();
    const body = await request.json();
    const { paymentRequestId, action, adminNotes } = body;

    console.log(`[verify-payment] Action: ${action}, RequestID: ${paymentRequestId}`);

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
      return NextResponse.json({ error: 'Payment request not found' }, { status: 404 });
    }

    const now = new Date().toISOString();

    if (action === 'approved') {
      const expiresAt = new Date();
      if (paymentRequest.plan === 'pro_monthly') {
        expiresAt.setDate(expiresAt.getDate() + 30);
      } else if (paymentRequest.plan === 'pro_quarterly') {
        expiresAt.setDate(expiresAt.getDate() + 90);
      } else if (paymentRequest.plan === 'cycle_pack') {
        expiresAt.setDate(expiresAt.getDate() + 180);
      } else {
        // Default to 30 days if plan is unknown but approved
        console.warn(`[verify-payment] Unknown plan type: ${paymentRequest.plan}, defaulting to 30 days`);
        expiresAt.setDate(expiresAt.getDate() + 30);
      }

      console.log(`[verify-payment] Activating plan "${paymentRequest.plan}" for user: ${paymentRequest.user_id}`);

      // 4. Update/Insert Subscription (Robust approach)
      // First, check if a subscription record already exists
      const { data: existingSub } = await supabaseAdmin
        .from('subscriptions')
        .select('id')
        .eq('user_id', paymentRequest.user_id)
        .maybeSingle();

      let subError;
      if (existingSub) {
        console.log('[verify-payment] Updating existing subscription...');
        const { error } = await supabaseAdmin
          .from('subscriptions')
          .update({
            plan: paymentRequest.plan,
            status: 'active',
            expires_at: expiresAt.toISOString()
          })
          .eq('user_id', paymentRequest.user_id);
        subError = error;
      } else {
        console.log('[verify-payment] Creating new subscription...');
        const { error } = await supabaseAdmin
          .from('subscriptions')
          .insert({
            user_id: paymentRequest.user_id,
            plan: paymentRequest.plan,
            status: 'active',
            expires_at: expiresAt.toISOString()
          });
        subError = error;
      }

      if (subError) {
        console.error('[verify-payment] Subscription DB Error:', subError);
        return NextResponse.json({ error: `Subscription update failed: ${subError.message}` }, { status: 500 });
      }

      // 5. Update Request Status
      console.log('[verify-payment] Finalizing payment request status...');
      const { error: reqError } = await supabaseAdmin
        .from('payment_requests')
        .update({
          status: 'approved',
          admin_notes: adminNotes || 'Approved by admin',
          reviewed_at: now
        })
        .eq('id', paymentRequestId);

      if (reqError) {
        console.error('[verify-payment] Request Status Update Error:', reqError);
        return NextResponse.json({ error: `Final status update failed: ${reqError.message}` }, { status: 500 });
      }

      // 6. Send Approval Email
      console.log('[verify-payment] Sending approval email...');
      sendPaymentApprovedEmail(
        paymentRequest.user_email,
        paymentRequest.payer_name || 'Loksewa Student',
        paymentRequest.plan,
        paymentRequest.plan_amount
      ).catch(e => console.error('[verify-payment] Email error:', e));

    } else if (action === 'rejected') {
      console.log('[verify-payment] Rejecting payment request...');
      if (!adminNotes) return NextResponse.json({ error: 'Rejection reason is mandatory' }, { status: 400 });

      const { error: reqError } = await supabaseAdmin
        .from('payment_requests')
        .update({
          status: 'rejected',
          admin_notes: adminNotes,
          reviewed_at: now
        })
        .eq('id', paymentRequestId);

      if (reqError) {
        console.error('[verify-payment] Rejection Update Error:', reqError);
        return NextResponse.json({ error: `Rejection failed: ${reqError.message}` }, { status: 500 });
      }

      // Send Rejection Email
      console.log('[verify-payment] Sending rejection email...');
      sendPaymentRejectedEmail(
        paymentRequest.user_email,
        paymentRequest.payer_name || 'Loksewa Student',
        paymentRequest.plan,
        adminNotes
      ).catch(e => console.error('[verify-payment] Email error:', e));
    }

    console.log('[verify-payment] Operation completed successfully');
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('[verify-payment] UNEXPECTED CRASH:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
