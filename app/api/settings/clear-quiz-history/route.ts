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
      .from('quiz_attempts')
      .delete()
      .eq('user_id', user.id)
      .select('id');

    if (deleteError) {
      console.error('Clear quiz history error:', deleteError);
      return NextResponse.json({ error: 'Failed to clear quiz history' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `${data?.length || 0} quiz attempts deleted`,
      count: data?.length || 0
    });

  } catch (error: any) {
    console.error('Clear Quiz History API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
