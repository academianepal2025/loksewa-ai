import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const { error } = await verifyAdmin();
    if (error) return error;

    const supabaseAdmin = createAdminClient();
    const { data, error: fetchError } = await supabaseAdmin
      .from('payment_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;

    const headers = ['ID', 'User Email', 'Payer Name', 'Payer Phone', 'Plan', 'Amount (NPR)', 'Status', 'Admin Notes', 'Reviewed By', 'Reviewed At', 'Created At'];
    const rows = (data || []).map((r: any) => [
      r.id,
      r.user_email || '',
      r.payer_name || '',
      r.payer_phone || '',
      r.plan || '',
      r.plan_amount || 0,
      r.status || '',
      (r.admin_notes || '').replace(/,/g, ';').replace(/\n/g, ' '),
      r.reviewed_by || '',
      r.reviewed_at || '',
      r.created_at || ''
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const now = new Date().toISOString().split('T')[0];

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="payment_requests_${now}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Export Payments Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
