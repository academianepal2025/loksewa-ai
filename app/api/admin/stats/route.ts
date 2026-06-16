import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { error } = await verifyAdmin();
    if (error) return error;

    const supabaseAdmin = createAdminClient();
    const url = new URL(req.url);
    const section = url.searchParams.get('section') || 'overview';

    if (section === 'overview') {
      return await getOverviewStats(supabaseAdmin);
    } else if (section === 'charts') {
      return await getChartData(supabaseAdmin);
    } else if (section === 'platform') {
      return await getPlatformStats(supabaseAdmin);
    }

    return await getOverviewStats(supabaseAdmin);
  } catch (error: any) {
    console.error('Admin Stats Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function getOverviewStats(supabaseAdmin: any) {
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Parallel queries for maximum speed
  const [
    profilesRes,
    activeSubsRes,
    pendingPaymentsRes,
    documentsRes,
    studyPlansRes,
    recentPaymentsRes,
    recentSignupsRes,
    expiringSubsRes,
    failedDocsRes
  ] = await Promise.all([
    // Total users
    supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }),
    // Active paid subscribers
    supabaseAdmin.from('subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')
      .gt('expires_at', now.toISOString()),
    // Pending payment requests
    supabaseAdmin.from('payment_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
    // Total documents
    supabaseAdmin.from('documents').select('id', { count: 'exact', head: true }),
    // Total study plans
    supabaseAdmin.from('study_plans').select('id', { count: 'exact', head: true }),
    // Recent 10 payment requests
    supabaseAdmin.from('payment_requests')
      .select('id, user_email, plan, plan_amount, status, created_at, payer_name')
      .order('created_at', { ascending: false })
      .limit(10),
    // Recent 10 signups
    supabaseAdmin.from('profiles')
      .select('id, full_name, email, created_at')
      .order('created_at', { ascending: false })
      .limit(10),
    // Expiring subscriptions (within 7 days)
    supabaseAdmin.from('subscriptions')
      .select('id, user_id, plan, status, expires_at')
      .eq('status', 'active')
      .gt('expires_at', now.toISOString())
      .lt('expires_at', sevenDaysFromNow.toISOString())
      .order('expires_at', { ascending: true }),
    // Failed documents
    supabaseAdmin.from('documents')
      .select('id, file_name, user_id, created_at')
      .eq('processing_status', 'failed')
      .order('created_at', { ascending: false })
      .limit(20)
  ]);

  // For expiring subs, resolve user emails
  let expiringWithEmails: any[] = [];
  if (expiringSubsRes.data && expiringSubsRes.data.length > 0) {
    const userIds = expiringSubsRes.data.map((s: any) => s.user_id);
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name')
      .in('id', userIds);

    const profileMap = new Map<string, any>((profiles || []).map((p: any) => [p.id, p]));
    expiringWithEmails = expiringSubsRes.data.map((s: any) => ({
      ...s,
      user_email: profileMap.get(s.user_id)?.email || 'Unknown',
      user_name: profileMap.get(s.user_id)?.full_name || 'Unknown'
    }));
  }

  // For failed docs, resolve user emails
  let failedWithEmails: any[] = [];
  if (failedDocsRes.data && failedDocsRes.data.length > 0) {
    const userIds = [...new Set(failedDocsRes.data.map((d: any) => d.user_id))];
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .in('id', userIds);

    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p.email]));
    failedWithEmails = failedDocsRes.data.map((d: any) => ({
      ...d,
      user_email: profileMap.get(d.user_id) || 'Unknown'
    }));
  }

  return NextResponse.json({
    success: true,
    data: {
      totalUsers: profilesRes.count || 0,
      activeSubscribers: activeSubsRes.count || 0,
      pendingPayments: pendingPaymentsRes.count || 0,
      totalDocuments: documentsRes.count || 0,
      totalStudyPlans: studyPlansRes.count || 0,
      recentPayments: recentPaymentsRes.data || [],
      recentSignups: recentSignupsRes.data || [],
      expiringPlans: expiringWithEmails,
      failedDocs: failedWithEmails
    }
  });
}

async function getChartData(supabaseAdmin: any) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [signupsRes, revenueRes] = await Promise.all([
    // User signups in last 30 days
    supabaseAdmin.from('profiles')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true }),
    // Approved payments in last 30 days
    supabaseAdmin.from('payment_requests')
      .select('plan_amount, reviewed_at')
      .eq('status', 'approved')
      .gte('reviewed_at', thirtyDaysAgo.toISOString())
      .order('reviewed_at', { ascending: true })
  ]);

  // Group signups by day
  const signupsByDay: Record<string, number> = {};
  (signupsRes.data || []).forEach((p: any) => {
    const day = p.created_at.split('T')[0];
    signupsByDay[day] = (signupsByDay[day] || 0) + 1;
  });

  // Group revenue by day
  const revenueByDay: Record<string, number> = {};
  (revenueRes.data || []).forEach((p: any) => {
    if (p.reviewed_at) {
      const day = p.reviewed_at.split('T')[0];
      revenueByDay[day] = (revenueByDay[day] || 0) + (p.plan_amount || 0);
    }
  });

  // Fill in missing days
  const signupsChart: { date: string; count: number }[] = [];
  const revenueChart: { date: string; amount: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    signupsChart.push({ date: key, count: signupsByDay[key] || 0 });
    revenueChart.push({ date: key, amount: revenueByDay[key] || 0 });
  }

  return NextResponse.json({
    success: true,
    data: { signupsChart, revenueChart }
  });
}

async function getPlatformStats(supabaseAdmin: any) {
  const [
    freeUsersRes,
    proMonthlyRes,
    proQuarterlyRes,
    cyclePackRes,
    expiredRes,
    chatCountRes,
    quizCountRes,
    notesCountRes,
    plansCountRes,
    docsSuccessRes,
    docsFailedRes,
    aiCostRes,
    dauRes,
    mauRes
  ] = await Promise.all([
    // Free = profiles not in active subscriptions
    supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active').eq('plan', 'pro_monthly')
      .gt('expires_at', new Date().toISOString()),
    supabaseAdmin.from('subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active').eq('plan', 'pro_quarterly')
      .gt('expires_at', new Date().toISOString()),
    supabaseAdmin.from('subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active').eq('plan', 'cycle_pack')
      .gt('expires_at', new Date().toISOString()),
    supabaseAdmin.from('subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'expired'),
    // Feature usage
    supabaseAdmin.from('chat_messages').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('quiz_attempts').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('study_notes').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('study_plans').select('id', { count: 'exact', head: true }),
    // Document stats
    supabaseAdmin.from('documents')
      .select('id', { count: 'exact', head: true })
      .eq('processing_status', 'ready'),
    supabaseAdmin.from('documents')
      .select('id', { count: 'exact', head: true })
      .eq('processing_status', 'failed'),
    // AI Cost & Usage (Last 30 Days with User profiles)
    supabaseAdmin.from('ai_usage_logs')
      .select(`
        cost_estimate,
        feature,
        input_tokens,
        output_tokens,
        model,
        created_at,
        user_id,
        profiles (
          full_name,
          email
        )
      `)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    // DAU (Today)
    supabaseAdmin.from('activity_logs').select('user_id', { head: false }).eq('activity_date', new Date().toISOString().split('T')[0]),
    // MAU (Last 30 Days)
    supabaseAdmin.from('activity_logs').select('user_id', { head: false }).gte('activity_date', new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0])
  ]);

  const totalPaid = (proMonthlyRes.count || 0) + (proQuarterlyRes.count || 0) + (cyclePackRes.count || 0);
  const totalProfiles = freeUsersRes.count || 0;
  const freeCount = Math.max(0, totalProfiles - totalPaid);

  // Calculate AI Cost and Feature breakdown from logs
  let totalAiCost = 0;
  const aiFeatureUsage: Record<string, number> = { chat: 0, quiz: 0, notes: 0, study_plan: 0 };
  
  // Detailed aggregates for dashboard
  const aiFeatureMetrics: Record<string, { calls: number; inputTokens: number; outputTokens: number; cost: number }> = {};
  const aiModelMetrics: Record<string, { calls: number; inputTokens: number; outputTokens: number; cost: number }> = {};
  const aiUserMetrics: Record<string, { name: string; email: string; calls: number; totalTokens: number; cost: number }> = {};
  const aiDailyMetrics: Record<string, { cost: number; tokens: number; calls: number }> = {};

  if (aiCostRes?.data) {
     aiCostRes.data.forEach((log: any) => {
        const cost = Number(log.cost_estimate || 0);
        const input = Number(log.input_tokens || 0);
        const output = Number(log.output_tokens || 0);
        const feature = log.feature || 'unknown';
        const model = log.model || 'unknown';
        const dateKey = log.created_at ? log.created_at.split('T')[0] : new Date().toISOString().split('T')[0];

        totalAiCost += cost;
        aiFeatureUsage[feature] = (aiFeatureUsage[feature] || 0) + 1;

        // 1. Feature aggregation
        if (!aiFeatureMetrics[feature]) {
          aiFeatureMetrics[feature] = { calls: 0, inputTokens: 0, outputTokens: 0, cost: 0 };
        }
        aiFeatureMetrics[feature].calls += 1;
        aiFeatureMetrics[feature].inputTokens += input;
        aiFeatureMetrics[feature].outputTokens += output;
        aiFeatureMetrics[feature].cost += cost;

        // 2. Model aggregation
        if (!aiModelMetrics[model]) {
          aiModelMetrics[model] = { calls: 0, inputTokens: 0, outputTokens: 0, cost: 0 };
        }
        aiModelMetrics[model].calls += 1;
        aiModelMetrics[model].inputTokens += input;
        aiModelMetrics[model].outputTokens += output;
        aiModelMetrics[model].cost += cost;

        // 3. User aggregation
        const userId = log.user_id;
        if (userId) {
          if (!aiUserMetrics[userId]) {
            const profile = log.profiles || {};
            aiUserMetrics[userId] = {
              name: profile.full_name || 'Anonymous User',
              email: profile.email || 'No Email',
              calls: 0,
              totalTokens: 0,
              cost: 0
            };
          }
          aiUserMetrics[userId].calls += 1;
          aiUserMetrics[userId].totalTokens += (input + output);
          aiUserMetrics[userId].cost += cost;
        }

        // 4. Daily aggregation
        if (!aiDailyMetrics[dateKey]) {
          aiDailyMetrics[dateKey] = { cost: 0, tokens: 0, calls: 0 };
        }
        aiDailyMetrics[dateKey].cost += cost;
        aiDailyMetrics[dateKey].tokens += (input + output);
        aiDailyMetrics[dateKey].calls += 1;
     });
  }

  // Convert aggregates to clean lists
  const aiFeatureList = Object.entries(aiFeatureMetrics).map(([name, stats]) => ({
    name,
    ...stats
  })).sort((a, b) => b.cost - a.cost);

  const aiModelList = Object.entries(aiModelMetrics).map(([name, stats]) => ({
    name,
    ...stats
  })).sort((a, b) => b.cost - a.cost);

  const aiUserList = Object.values(aiUserMetrics)
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 10);

  const aiDailyList: { date: string; cost: number; tokens: number; calls: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const stats = aiDailyMetrics[key] || { cost: 0, tokens: 0, calls: 0 };
    aiDailyList.push({
      date: key,
      cost: Number(stats.cost.toFixed(4)),
      tokens: stats.tokens,
      calls: stats.calls
    });
  }

  // Calculate unique DAU and MAU
  const uniqueDAU = new Set(dauRes?.data?.map((l: any) => l.user_id) || []).size;
  const uniqueMAU = new Set(mauRes?.data?.map((l: any) => l.user_id) || []).size;

  // Top active users: sum documents, chats, quizzes, notes per user
  const { data: topUsers } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, email')
    .limit(50);

  let topActive: any[] = [];
  if (topUsers && topUsers.length > 0) {
    const userIds = topUsers.map((u: any) => u.id);

    const [docsPerUser, chatsPerUser, quizzesPerUser, notesPerUser] = await Promise.all([
      supabaseAdmin.from('documents').select('user_id').in('user_id', userIds),
      supabaseAdmin.from('chat_messages').select('user_id').in('user_id', userIds),
      supabaseAdmin.from('quiz_attempts').select('user_id').in('user_id', userIds),
      supabaseAdmin.from('study_notes').select('user_id').in('user_id', userIds)
    ]);

    const countByUser = (data: any[], field: string) => {
      const map: Record<string, number> = {};
      (data || []).forEach((row: any) => {
        map[row[field]] = (map[row[field]] || 0) + 1;
      });
      return map;
    };

    const docCounts = countByUser(docsPerUser.data, 'user_id');
    const chatCounts = countByUser(chatsPerUser.data, 'user_id');
    const quizCounts = countByUser(quizzesPerUser.data, 'user_id');
    const noteCounts = countByUser(notesPerUser.data, 'user_id');

    topActive = topUsers.map((u: any) => ({
      id: u.id,
      name: u.full_name || 'Unknown',
      email: u.email,
      total: (docCounts[u.id] || 0) + (chatCounts[u.id] || 0) + (quizCounts[u.id] || 0) + (noteCounts[u.id] || 0),
      docs: docCounts[u.id] || 0,
      chats: chatCounts[u.id] || 0,
      quizzes: quizCounts[u.id] || 0,
      notes: noteCounts[u.id] || 0
    }))
    .sort((a: any, b: any) => b.total - a.total)
    .slice(0, 10);
  }

  const docsSuccess = docsSuccessRes.count || 0;
  const docsFailed = docsFailedRes.count || 0;
  const docsTotal = docsSuccess + docsFailed;
  const successRate = docsTotal > 0 ? Math.round((docsSuccess / docsTotal) * 100) : 100;

  return NextResponse.json({
    success: true,
    data: {
      planDistribution: [
        { name: 'Free', value: freeCount, fill: '#71717a' },
        { name: 'Pro Monthly', value: proMonthlyRes.count || 0, fill: '#3b82f6' },
        { name: 'Pro Quarterly', value: proQuarterlyRes.count || 0, fill: '#8b5cf6' },
        { name: 'Cycle Pack', value: cyclePackRes.count || 0, fill: '#f59e0b' },
        { name: 'Expired', value: expiredRes.count || 0, fill: '#ef4444' }
      ],
      featureUsage: {
        chats: chatCountRes.count || 0,
        quizzes: quizCountRes.count || 0,
        notes: notesCountRes.count || 0,
        studyPlans: plansCountRes.count || 0
      },
      aiUsage: aiFeatureUsage,
      aiCost: totalAiCost,
      aiAnalysis: {
        features: aiFeatureList,
        models: aiModelList,
        users: aiUserList,
        daily: aiDailyList
      },
      dau: uniqueDAU,
      mau: uniqueMAU,
      topActiveUsers: topActive,
      documentStats: {
        success: docsSuccess,
        failed: docsFailed,
        total: docsTotal,
        successRate
      }
    }
  });
}
