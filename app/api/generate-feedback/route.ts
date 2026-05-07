import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateText } from '@/lib/ai';

function getSystemInstruction(lang: string) {
  const base = `You are a PSC Nepal exam preparation coach writing a weekly performance review.
Be specific and direct. Reference actual topics and scores from the data.
Do not give generic advice. Be honest about weak areas but encouraging.
Write in a coaching tone — firm but supportive.

Structure your response with these exact sections:
## This Week's Summary
## Your Strongest Performance
## Area Needing Most Attention  
## Your Action Plan for Next Week
## Coach's Note

Maximum 300 words total. Be specific, not generic.`;

  if (lang === 'np') {
    return `${base}\n\nIMPORTANT: Write entirely in Pure Nepali. However, always include the English technical terms in brackets [English Term] immediately after their Nepali counterparts. For example: "संवैधानिक निकाय [Constitutional Bodies]".`;
  }
  return base;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { examId, userId } = body;

    const supabase = await createClient();

    // Fetch user language preference from DB for true sync
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('language')
      .eq('user_id', userId)
      .maybeSingle();
    
    const userLang = prefs?.language || 'en';

    if (!examId || !userId) {
      return NextResponse.json({ success: false, message: 'Missing examId or userId' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateStr = sevenDaysAgo.toISOString();

    // 1. Fetch Exam Details
    const { data: exam } = await supabase
      .from('user_exams')
      .select('exam_name, exam_date')
      .eq('id', examId)
      .single();

    // 2. Fetch Quiz Attempts (Last 7 Days)
    const { data: quizzes } = await supabase
      .from('quiz_attempts')
      .select('topic, score, total_questions, created_at')
      .eq('exam_id', examId)
      .eq('user_id', userId)
      .gte('created_at', dateStr)
      .order('created_at', { ascending: false });

    // 3. Fetch Study Plan and Progress
    // We need plan_id to query study_progress reliably
    const { data: plan } = await supabase
      .from('study_plans')
      .select('id, plan_data')
      .eq('exam_id', examId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let progressData = [];
    if (plan) {
      const { data: progress } = await supabase
        .from('study_progress')
        .select('*')
        .eq('plan_id', plan.id)
        .gte('completed_at', dateStr);
      progressData = progress || [];
    }

    // 4. Fetch Gap Analysis (Fallback to syllabus analysis)
    const { data: gapData } = await supabase
      .from('syllabus_analysis')
      .select('analysis_data')
      .eq('exam_id', examId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // 5. Synthesis Context for Gemini
    const today = new Date();
    const examDate = exam ? new Date(exam.exam_date) : null;
    const daysRemaining = examDate ? Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 'Unknown';

    const studyContext = progressData.length > 0 
      ? progressData.map(p => `- Day ${p.day_number}: ${p.is_completed ? 'Completed' : 'Partial'} (${p.completed_subtopics?.length || 0} subtopics)`).join('\n')
      : 'No study progress recorded in the last 7 days.';

    const quizContext = quizzes && quizzes.length > 0
      ? quizzes.map(q => `- ${q.topic}: ${q.score}/${q.total_questions}`).join('\n')
      : 'No quiz attempts recorded in the last 7 days.';

    const gapContext = gapData?.analysis_data 
      ? `Critical Topics: ${gapData.analysis_data.critical_topics_summary || 'Analysis available'}`
      : 'No specific gap analysis available.';

    const userPrompt = `
Exam: ${exam?.exam_name || 'PSC Nepal Exam'}
Days to Exam: ${daysRemaining}

STUDY PROGRESS (Last 7 Days):
${studyContext}

QUIZ PERFORMANCE (Last 7 Days):
${quizContext}

SYLLABUS INSIGHTS:
${gapContext}

Please generate my weekly performance review based on this data.`;

    // 6. Call Gemini 2.0 Flash via centralized utility
    const responseText = await generateText(getSystemInstruction(userLang), userPrompt);

    // 7. Persist to weekly_feedback table
    const { error: insertError } = await supabase.from('weekly_feedback').insert({
      user_id: userId,
      exam_id: examId,
      feedback_text: responseText
    });
    
    if (insertError) {
      console.warn('Failed to persist feedback to database:', insertError.message);
      // We still return success since the generation worked
    }

    return NextResponse.json({
      success: true,
      feedback: responseText,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Generate Feedback Route Error:', error);
    const status = error.status || 500;
    return NextResponse.json(
      { success: false, message: error.message },
      { status }
    );
  }
}
