import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(request: Request, { params }: { params: Promise<{ noteId: string }> }) {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { noteId } = resolvedParams;
    const { markdown } = await request.json();

    if (!markdown) {
      return NextResponse.json({ error: 'Missing markdown content' }, { status: 400 });
    }

    // Verify ownership
    const { data: existingNote, error: fetchError } = await supabase
      .from('study_notes')
      .select('user_id, notes_content')
      .eq('id', noteId)
      .single();

    if (fetchError || !existingNote || existingNote.user_id !== user.id) {
      return NextResponse.json({ error: 'Note not found or unauthorized' }, { status: 404 });
    }

    const updatedContent = {
      ...existingNote.notes_content,
      full_markdown: markdown
    };

    const { error: updateError } = await supabase
      .from('study_notes')
      .update({ notes_content: updatedContent, updated_at: new Date().toISOString() })
      .eq('id', noteId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Notes Update Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
