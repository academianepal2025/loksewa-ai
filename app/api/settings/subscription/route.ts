import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];

    const [subRes, docRes, dailyRes, notesRes, examRes, payReqRes] = await Promise.all([
      // Active subscription
      supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .maybeSingle(),
      // Total documents
      supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id),
      // Today's daily usage
      supabase
        .from('daily_usage')
        .select('chat_messages_sent, quizzes_generated')
        .eq('user_id', user.id)
        .eq('usage_date', today)
        .maybeSingle(),
      // Ready study notes
      supabase
        .from('study_notes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('generation_status', 'ready'),
      // Active exams count
      supabase
        .from('user_exams')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id),
      // Payment requests
      supabase
        .from('payment_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
    ]);

    const daily = dailyRes.data;

    return NextResponse.json({
      success: true,
      subscription: subRes.data || null,
      usage: {
        documents: docRes.count || 0,
        daily_chats: daily?.chat_messages_sent || 0,
        daily_quizzes: daily?.quizzes_generated || 0,
        daily_notes: notesRes.count || 0,
        active_exams: examRes.count || 0
      },
      paymentRequests: payReqRes.data || []
    });

  } catch (error: any) {
    console.error('Settings Subscription API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
