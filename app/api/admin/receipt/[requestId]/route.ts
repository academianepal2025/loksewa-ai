import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { error } = await verifyAdmin();
    if (error) return error;

    const { requestId } = await params;
    const supabaseAdmin = createAdminClient();

    const { data: paymentReq, error: fetchError } = await supabaseAdmin
      .from('payment_requests')
      .select('receipt_url')
      .eq('id', requestId)
      .single();

    if (fetchError || !paymentReq) {
      return NextResponse.json({ error: 'Payment request not found' }, { status: 404 });
    }

    if (!paymentReq.receipt_url) {
      return NextResponse.json({ error: 'No receipt uploaded', signedUrl: null });
    }

    // Generate signed URL with 1 hour expiry
    const { data: signedData, error: signError } = await supabaseAdmin
      .storage
      .from('receipts')
      .createSignedUrl(paymentReq.receipt_url, 3600);

    if (signError) {
      return NextResponse.json({ error: 'Failed to generate signed URL' }, { status: 500 });
    }

    return NextResponse.json({ success: true, signedUrl: signedData.signedUrl });
  } catch (error: any) {
    console.error('Receipt URL Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
