import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { error: authError } = await verifyAdmin();
    if (authError) return authError;

    const supabaseAdmin = createAdminClient();
    const url = new URL(req.url);

    const tab = url.searchParams.get('tab') || 'all';
    const search = url.searchParams.get('search') || '';
    const dateFrom = url.searchParams.get('dateFrom') || '';
    const dateTo = url.searchParams.get('dateTo') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');

    // Fetch all payment requests sorted by created_at desc
    let query = supabaseAdmin
      .from('payment_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (tab !== 'all') {
      query = query.eq('status', tab);
    }

    if (dateFrom) {
      query = query.gte('created_at', new Date(dateFrom).toISOString());
    }
    if (dateTo) {
      query = query.lte('created_at', new Date(dateTo + 'T23:59:59').toISOString());
    }

    const { data: requests, error } = await query;

    if (error) {
      console.error('[admin/payments] Fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let filtered = requests || [];
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((r: any) =>
        (r.user_email && r.user_email.toLowerCase().includes(q)) ||
        (r.payer_name && r.payer_name.toLowerCase().includes(q)) ||
        (r.payer_phone && r.payer_phone.toLowerCase().includes(q)) ||
        (r.id && r.id.toLowerCase().includes(q))
      );
    }

    // Compute stats across all requests
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const stats = {
      total: (requests || []).length,
      pending: 0,
      approved: 0,
      rejected: 0,
      monthRevenue: 0
    };

    (requests || []).forEach((r: any) => {
      if (r.status === 'pending') stats.pending++;
      else if (r.status === 'approved' || r.status === 'manually_granted') {
        stats.approved++;
        if (r.reviewed_at && new Date(r.reviewed_at) >= monthStart) {
          stats.monthRevenue += r.plan_amount || 0;
        }
      } else if (r.status === 'rejected') {
        stats.rejected++;
      }
    });

    const total = filtered.length;
    const offset = (page - 1) * limit;
    const paged = filtered.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: {
        requests: paged,
        stats,
        total,
        page,
        limit
      }
    });
  } catch (err: any) {
    console.error('[admin/payments] Unexpected error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
