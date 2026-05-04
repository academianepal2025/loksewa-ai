import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all user data in parallel
    const [
      examsRes, plansRes, progressRes, quizRes,
      feedbackRes, notesRes, flashcardsRes, chatRes
    ] = await Promise.all([
      supabase.from('user_exams').select('*').eq('user_id', user.id),
      supabase.from('study_plans').select('*').eq('user_id', user.id),
      supabase.from('study_progress').select('*').eq('user_id', user.id),
      supabase.from('quiz_attempts').select('*').eq('user_id', user.id),
      supabase.from('weekly_feedback').select('*').eq('user_id', user.id),
      supabase.from('study_notes').select('*').eq('user_id', user.id),
      supabase.from('flashcards').select('*').eq('user_id', user.id),
      supabase.from('chat_messages').select('*').eq('user_id', user.id)
    ]);

    const exportData = {
      export_metadata: {
        app_name: 'Loksewa AI',
        export_date: new Date().toISOString(),
        user_id: user.id,
        user_email: user.email
      },
      exams: examsRes.data || [],
      study_plans: plansRes.data || [],
      study_progress: progressRes.data || [],
      quiz_attempts: quizRes.data || [],
      weekly_feedback: feedbackRes.data || [],
      study_notes: notesRes.data || [],
      flashcards: flashcardsRes.data || [],
      chat_messages: chatRes.data || []
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const date = new Date().toISOString().split('T')[0];

    return new NextResponse(jsonString, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="loksewa-ai-data-export-${date}.json"`,
      },
    });

  } catch (error: any) {
    console.error('Data Export API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
