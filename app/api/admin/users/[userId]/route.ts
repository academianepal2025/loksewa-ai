import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { error } = await verifyAdmin();
    if (error) return error;

    const { userId } = await params;
    const supabaseAdmin = createAdminClient();

    // Parallel fetch all user data
    const [profileRes, subRes, paymentsRes, docsRes, chatsRes, quizzesRes, notesRes, plansRes, examsRes, progressRes] = await Promise.all([
      supabaseAdmin.from('profiles')
        .select('*')
        .eq('id', userId)
        .single(),
      supabaseAdmin.from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabaseAdmin.from('payment_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabaseAdmin.from('documents')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabaseAdmin.from('chat_messages')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabaseAdmin.from('quiz_attempts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabaseAdmin.from('study_notes')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabaseAdmin.from('study_plans')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabaseAdmin.from('exams')
        .select('id, name, category, exam_date, status, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabaseAdmin.from('study_progress')
        .select('study_streak')
        .eq('user_id', userId)
        .maybeSingle()
    ]);

    if (profileRes.error || !profileRes.data) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const profile = profileRes.data;
    const subscription = subRes.data;
    const now = new Date();
    let planStatus = 'free';
    let daysRemaining = null;

    if (subscription) {
      if (subscription.status === 'active' && new Date(subscription.expires_at) > now) {
        planStatus = 'active';
        daysRemaining = Math.ceil((new Date(subscription.expires_at).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      } else {
        planStatus = 'expired';
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          avatar_url: profile.avatar_url,
          created_at: profile.created_at,
          is_admin: profile.is_admin
        },
        subscription: subscription ? {
          ...subscription,
          plan_status: planStatus,
          days_remaining: daysRemaining
        } : null,
        paymentHistory: paymentsRes.data || [],
        usage: {
          documents: docsRes.count || 0,
          chats: chatsRes.count || 0,
          quizzes: quizzesRes.count || 0,
          notes: notesRes.count || 0,
          studyPlans: plansRes.count || 0,
          studyStreak: progressRes.data?.study_streak || 0
        },
        exams: examsRes.data || []
      }
    });
  } catch (error: any) {
    console.error('Admin User Detail Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
