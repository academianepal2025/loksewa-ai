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

    // Fetch all requests first to compute stats accurately
    const { data: allRequests, error: allErr } = await supabaseAdmin
      .from('payment_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (allErr) {
      console.error('[admin/payments] Fetch error:', allErr);
      return NextResponse.json({ error: allErr.message }, { status: 500 });
    }

    const all = allRequests || [];

    // Calculate global stats across all payment requests
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const stats = {
      total: all.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      monthRevenue: 0
    };

    all.forEach((r: any) => {
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

    // Apply tab, date, search filters in memory for consistent pagination
    let filtered = all;

    if (tab !== 'all') {
      filtered = filtered.filter((r: any) => r.status === tab);
    }

    if (dateFrom && !isNaN(Date.parse(dateFrom))) {
      const fromTime = new Date(dateFrom).getTime();
      filtered = filtered.filter((r: any) => new Date(r.created_at).getTime() >= fromTime);
    }

    if (dateTo && !isNaN(Date.parse(dateTo))) {
      const toTime = new Date(dateTo + 'T23:59:59').getTime();
      filtered = filtered.filter((r: any) => new Date(r.created_at).getTime() <= toTime);
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((r: any) =>
        (r.user_email && r.user_email.toLowerCase().includes(q)) ||
        (r.payer_name && r.payer_name.toLowerCase().includes(q)) ||
        (r.payer_phone && r.payer_phone.toLowerCase().includes(q)) ||
        (r.id && r.id.toLowerCase().includes(q))
      );
    }

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
