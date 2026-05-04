import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function DELETE() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error: deleteError } = await supabase
      .from('chat_messages')
      .delete()
      .eq('user_id', user.id)
      .select('id');

    if (deleteError) {
      console.error('Clear chats error:', deleteError);
      return NextResponse.json({ error: 'Failed to clear chat history' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `${data?.length || 0} messages deleted`,
      count: data?.length || 0
    });

  } catch (error: any) {
    console.error('Clear Chats API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
