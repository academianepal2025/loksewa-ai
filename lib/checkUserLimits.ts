import { createClient } from '@/lib/supabase/server';

export interface UserLimits {
  allowed: boolean;
  plan: 'free' | 'pro_monthly' | 'pro_quarterly' | 'cycle_pack' | 'admin';
  limits: {
    documents: { used: number, max: number, exceeded: boolean };
    chat: { used: number, max: number, exceeded: boolean };
    quizzes: { used: number, max: number, exceeded: boolean };
    notes: { used: number, max: number, exceeded: boolean };
    exams: { used: number, max: number, exceeded: boolean };
    mock_tests: { used: number, max: number, exceeded: boolean };
  };
  exceeded_limit: string | null;
}

export async function checkUserLimits(userId: string): Promise<UserLimits> {
  const supabase = await createClient();

  // 1. Check if user is Admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single();

  if (profile?.is_admin) {
    return {
      allowed: true,
      plan: 'admin',
      limits: {
        documents: { used: 0, max: Infinity, exceeded: false },
        chat: { used: 0, max: Infinity, exceeded: false },
        quizzes: { used: 0, max: Infinity, exceeded: false },
        notes: { used: 0, max: Infinity, exceeded: false },
        exams: { used: 0, max: Infinity, exceeded: false },
        mock_tests: { used: 0, max: Infinity, exceeded: false },
      },
      exceeded_limit: null,
    };
  }

  // 2. Fetch subscription status and usage stats
  const now = new Date().toISOString();
  const today = now.split('T')[0];

  const [
    { data: subscription },
    { count: docCount },
    { data: usage },
    { count: examCount },
    { count: totalNotesCount },
    { count: totalChatMessagesCount }
  ] = await Promise.all([
    supabase.from('subscriptions').select('plan, status, expires_at').eq('user_id', userId).eq('status', 'active').gt('expires_at', now).maybeSingle(),
    supabase.from('documents').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('daily_usage').select('*').eq('user_id', userId).eq('usage_date', today).maybeSingle(),
    supabase.from('user_exams').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('study_notes').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('generation_status', 'ready'),
    supabase.from('chat_messages').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('role', 'user')
  ]);

  const isPro = subscription && subscription.plan !== 'free';
  const planType = isPro ? subscription.plan : 'free';

  // 3. Define Limits based on Plan
  const limits = isPro ? {
    documents: { used: docCount || 0, max: Infinity, exceeded: false },
    chat: { used: usage?.chat_messages_sent || 0, max: 10, exceeded: (usage?.chat_messages_sent || 0) >= 10 },
    quizzes: { used: usage?.quizzes_generated || 0, max: Infinity, exceeded: false },
    notes: { used: usage?.notes_generated || 0, max: 5, exceeded: (usage?.notes_generated || 0) >= 5 },
    exams: { used: examCount || 0, max: Infinity, exceeded: false },
    mock_tests: { used: 0, max: Infinity, exceeded: false },
  } : {
    // LIFETIME LIMITS
    documents: { used: docCount || 0, max: 3, exceeded: (docCount || 0) >= 3 },
    exams: { used: examCount || 0, max: 1, exceeded: (examCount || 0) >= 1 },
    notes: { used: totalNotesCount || 0, max: 1, exceeded: (totalNotesCount || 0) >= 1 },
    
    // DAILY LIMITS
    chat: { 
      used: usage?.chat_messages_sent || 0, 
      max: 3, 
      exceeded: (usage?.chat_messages_sent || 0) >= 3 || (totalChatMessagesCount || 0) >= 10,
      lifetimeUsed: totalChatMessagesCount || 0,
      lifetimeMax: 10
    },
    quizzes: { used: usage?.quizzes_generated || 0, max: 3, exceeded: (usage?.quizzes_generated || 0) >= 3 },
    mock_tests: { used: 0, max: 0, exceeded: true }, 
  };

  let exceeded_limit = null;
  if (limits.documents.exceeded) exceeded_limit = 'document_limit';
  else if (limits.chat.exceeded) exceeded_limit = 'chat_limit';
  else if (limits.quizzes.exceeded) exceeded_limit = 'quiz_limit';
  else if (limits.notes.exceeded) exceeded_limit = 'notes_limit';
  else if (limits.exams.exceeded) exceeded_limit = 'exam_limit';

  return {
    allowed: !exceeded_limit,
    plan: planType as any,
    limits,
    exceeded_limit,
  };
}

export async function checkDocumentLimit(userId: string) {
  const result = await checkUserLimits(userId);
  return { allowed: result.plan !== 'free' || !result.limits.documents.exceeded, used: result.limits.documents.used, max: result.limits.documents.max };
}

export async function checkChatLimit(userId: string) {
  const result = await checkUserLimits(userId);
  return { allowed: result.plan !== 'free' || !result.limits.chat.exceeded, used: result.limits.chat.used, max: result.limits.chat.max };
}

export async function checkQuizLimit(userId: string) {
  const result = await checkUserLimits(userId);
  return { allowed: result.plan !== 'free' || !result.limits.quizzes.exceeded, used: result.limits.quizzes.used, max: result.limits.quizzes.max };
}

export async function checkNotesLimit(userId: string) {
  const result = await checkUserLimits(userId);
  return { allowed: result.plan !== 'free' || !result.limits.notes.exceeded, used: result.limits.notes.used, max: result.limits.notes.max };
}

export async function checkExamLimit(userId: string) {
  const result = await checkUserLimits(userId);
  return { allowed: result.plan !== 'free' || !result.limits.exams.exceeded, used: result.limits.exams.used, max: result.limits.exams.max };
}
