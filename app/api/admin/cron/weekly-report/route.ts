import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendWeeklyReportEmail } from '@/lib/email';

export async function GET(request: Request) {
  // Simple cron secret protection
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const supabaseAdmin = createAdminClient();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString();

    const [
      signupsRes,
      dauRes,
      proConversionsRes,
      aiLogsRes
    ] = await Promise.all([
      // New signups in last 7 days
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', sevenDaysAgoStr),
      // Active users in last 7 days
      supabaseAdmin.from('activity_logs').select('user_id', { head: false }).gte('activity_date', sevenDaysAgoStr.split('T')[0]),
      // Pro conversions in last 7 days
      supabaseAdmin.from('subscriptions').select('id', { count: 'exact', head: true }).gte('created_at', sevenDaysAgoStr),
      // AI usage in last 7 days
      supabaseAdmin.from('ai_usage_logs').select('feature, cost_estimate').gte('created_at', sevenDaysAgoStr)
    ]);

    const newSignups = signupsRes.count || 0;
    
    // Average DAU over the last 7 days
    const uniqueActiveUsersThisWeek = new Set(dauRes.data?.map((l: any) => l.user_id) || []).size;
    const avgDau = Math.round(uniqueActiveUsersThisWeek / 7);

    const proConversions = proConversionsRes.count || 0;

    let totalAiCost = 0;
    const featureUsage: Record<string, number> = { chat: 0, quiz: 0, notes: 0, study_plan: 0 };
    if (aiLogsRes.data) {
      aiLogsRes.data.forEach((log: any) => {
        totalAiCost += (log.cost_estimate || 0);
        featureUsage[log.feature] = (featureUsage[log.feature] || 0) + 1;
      });
    }

    const metrics = {
      newSignups,
      avgDau,
      proConversions,
      totalAiCost: totalAiCost.toFixed(2),
      featureUsage
    };

    await sendWeeklyReportEmail(metrics);

    return NextResponse.json({ success: true, metrics });
  } catch (error: any) {
    console.error('Weekly Report Cron Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
