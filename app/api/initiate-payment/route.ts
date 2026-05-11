import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const PLAN_AMOUNTS: Record<string, number> = {
  pro_monthly: 499,
  pro_quarterly: 1299,
  cycle_pack: 1999
};

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payerName, payerPhone, plan, receiptUrl } = await request.json();

    if (!payerName || !payerPhone || !plan) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!PLAN_AMOUNTS[plan]) {
      return NextResponse.json({ error: 'Invalid plan selection' }, { status: 400 });
    }

    // Check for existing pending request to prevent duplicates
    const { data: existingRequest } = await supabase
      .from('payment_requests')
      .select('id')
      .eq('user_id', user.id)
      .eq('plan', plan)
      .eq('status', 'pending')
      .maybeSingle();

    if (existingRequest) {
      return NextResponse.json({ 
        error: 'You already have a pending payment request for this plan. Please wait for admin review or contact support.',
        existingId: existingRequest.id
      }, { status: 409 });
    }

    // Insert payment request
    const { data, error } = await supabase
      .from('payment_requests')
      .insert({
        user_id: user.id,
        user_email: user.email,
        payer_name: payerName,
        payer_phone: payerPhone,
        plan: plan,
        plan_amount: PLAN_AMOUNTS[plan],
        receipt_url: receiptUrl,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, id: data.id });

  } catch (error: any) {
    console.error('Initiate Payment Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
