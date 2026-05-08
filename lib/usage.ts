import { createClient } from '@/lib/supabase/server';

export type UsageType = 'chat' | 'quiz' | 'note';

export async function incrementUsage(userId: string, type: UsageType) {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  const columnMap: Record<UsageType, string> = {
    chat: 'chat_messages_sent',
    quiz: 'quizzes_generated',
    note: 'notes_generated'
  };

  const rpcMap: Record<UsageType, string> = {
    chat: 'increment_chat_usage',
    quiz: 'increment_quiz_usage',
    note: 'increment_notes_usage'
  };

  const columnName = columnMap[type];
  const rpcName = rpcMap[type];

  try {
    // Attempt RPC first
    const { error: rpcError } = await supabase.rpc(rpcName, { 
      p_user_id: userId,
      p_usage_date: today // Many RPCs expect this now
    });

    if (rpcError) {
      console.warn(`RPC ${rpcName} failed, falling back to direct upsert:`, rpcError);
      
      // Fallback: Direct upsert
      const { data: current } = await supabase
        .from('daily_usage')
        .select(columnName)
        .eq('user_id', userId)
        .eq('usage_date', today)
        .maybeSingle();

      const { error: upsertError } = await supabase.from('daily_usage').upsert({
        user_id: userId,
        usage_date: today,
        [columnName]: ((current as any)?.[columnName] || 0) + 1,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,usage_date' });

      if (upsertError) {
        console.error(`Failed to increment ${type} usage via upsert:`, upsertError);
      }
    }
  } catch (error) {
    console.error(`Error in incrementUsage (${type}):`, error);
  }
}
