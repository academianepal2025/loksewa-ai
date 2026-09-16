import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export interface ActivityItem {
  id: string;
  type: 'signup' | 'payment' | 'document' | 'quiz' | 'study_plan' | 'chat';
  title: string;
  description: string;
  user_email: string;
  user_name?: string;
  status?: string;
  created_at: string;
  metadata?: any;
}

export async function GET() {
  try {
    const { error: authError } = await verifyAdmin();
    if (authError) return authError;

    const supabaseAdmin = createAdminClient();

    // Query top recent items across key tables in parallel
    const [
      signupsRes,
      paymentsRes,
      docsRes,
      quizzesRes,
      plansRes,
      chatsRes
    ] = await Promise.all([
      // Signups
      supabaseAdmin.from('profiles')
        .select('id, full_name, email, created_at')
        .order('created_at', { ascending: false })
        .limit(10),
      // Payments
      supabaseAdmin.from('payment_requests')
        .select('id, user_email, plan, plan_amount, status, created_at, payer_name')
        .order('created_at', { ascending: false })
        .limit(10),
      // Documents
      supabaseAdmin.from('documents')
        .select('id, file_name, processing_status, user_id, created_at')
        .order('created_at', { ascending: false })
        .limit(10),
      // Quizzes
      supabaseAdmin.from('quiz_attempts')
        .select('id, score, total_questions, user_id, created_at')
        .order('created_at', { ascending: false })
        .limit(10),
      // Study Plans
      supabaseAdmin.from('study_plans')
        .select('id, title, target_exam, user_id, created_at')
        .order('created_at', { ascending: false })
        .limit(10),
      // Chats
      supabaseAdmin.from('chat_messages')
        .select('id, role, user_id, created_at')
        .eq('role', 'user')
        .order('created_at', { ascending: false })
        .limit(10)
    ]);

    // Gather unique user IDs to resolve profiles
    const userIds = new Set<string>();
    (docsRes.data || []).forEach(d => d.user_id && userIds.add(d.user_id));
    (quizzesRes.data || []).forEach(q => q.user_id && userIds.add(q.user_id));
    (plansRes.data || []).forEach(p => p.user_id && userIds.add(p.user_id));
    (chatsRes.data || []).forEach(c => c.user_id && userIds.add(c.user_id));

    const profileMap = new Map<string, { email: string; full_name: string }>();
    if (userIds.size > 0) {
      const { data: userProfiles } = await supabaseAdmin
        .from('profiles')
        .select('id, email, full_name')
        .in('id', Array.from(userIds));

      (userProfiles || []).forEach(p => {
        profileMap.set(p.id, { email: p.email || 'Anonymous', full_name: p.full_name || 'User' });
      });
    }

    const activities: ActivityItem[] = [];

    // Map Signups
    (signupsRes.data || []).forEach(s => {
      activities.push({
        id: `signup-${s.id}`,
        type: 'signup',
        title: 'New User Registered',
        description: `${s.full_name || 'New user'} registered with email ${s.email}`,
        user_email: s.email || 'No email',
        user_name: s.full_name || undefined,
        created_at: s.created_at
      });
    });

    // Map Payments
    (paymentsRes.data || []).forEach(p => {
      activities.push({
        id: `payment-${p.id}`,
        type: 'payment',
        title: `Payment Order (${p.status.toUpperCase()})`,
        description: `${p.payer_name || p.user_email} requested ${p.plan?.replace('_', ' ')} (NPR ${p.plan_amount})`,
        user_email: p.user_email,
        user_name: p.payer_name,
        status: p.status,
        created_at: p.created_at,
        metadata: { amount: p.plan_amount, plan: p.plan }
      });
    });

    // Map Documents
    (docsRes.data || []).forEach(d => {
      const prof = profileMap.get(d.user_id);
      activities.push({
        id: `doc-${d.id}`,
        type: 'document',
        title: 'Document Uploaded',
        description: `Uploaded file "${d.file_name}" (${d.processing_status})`,
        user_email: prof?.email || 'Unknown',
        user_name: prof?.full_name,
        status: d.processing_status,
        created_at: d.created_at
      });
    });

    // Map Quizzes
    (quizzesRes.data || []).forEach(q => {
      const prof = profileMap.get(q.user_id);
      activities.push({
        id: `quiz-${q.id}`,
        type: 'quiz',
        title: 'Quiz Attempted',
        description: `Scored ${q.score}/${q.total_questions} on quiz`,
        user_email: prof?.email || 'Unknown',
        user_name: prof?.full_name,
        created_at: q.created_at
      });
    });

    // Map Study Plans
    (plansRes.data || []).forEach(p => {
      const prof = profileMap.get(p.user_id);
      activities.push({
        id: `plan-${p.id}`,
        type: 'study_plan',
        title: 'Study Plan Generated',
        description: `Created study plan: ${p.title || p.target_exam || 'Custom Plan'}`,
        user_email: prof?.email || 'Unknown',
        user_name: prof?.full_name,
        created_at: p.created_at
      });
    });

    // Map Chats
    (chatsRes.data || []).forEach(c => {
      const prof = profileMap.get(c.user_id);
      activities.push({
        id: `chat-${c.id}`,
        type: 'chat',
        title: 'AI Chat Query',
        description: `Asked AI assistant a question`,
        user_email: prof?.email || 'Unknown',
        user_name: prof?.full_name,
        created_at: c.created_at
      });
    });

    // Sort all activities by created_at desc and pick top 30
    activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const topActivities = activities.slice(0, 30);

    return NextResponse.json({
      success: true,
      data: topActivities
    });
  } catch (err: any) {
    console.error('[admin/activity] Unexpected error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
