import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateJSON } from '@/lib/ai';
import { checkUserLimits } from '@/lib/checkUserLimits';

function getSystemInstruction(lang: string) {
  const base = `You are creating MCQ practice questions for PSC Nepal (Loksewa Ayog) exams.
Questions must match the style and difficulty of actual Loksewa Ayog exam questions.
All 4 options must be plausible — no obviously wrong options.
Correct answers must be definitively correct based on Nepal law, constitution, or facts.
Explanations must cite the specific article, section, or source when applicable.

Return ONLY valid JSON:
{
  "quiz_title": "string",
  "topic": "string",
  "questions": [
    {
      "id": "string",
      "question": "string",
      "options": { "A": "string", "B": "string", "C": "string", "D": "string" },
      "correct_answer": "A" | "B" | "C" | "D",
      "explanation": "string",
      "difficulty": "easy" | "medium" | "hard",
      "source_reference": "string"
    }
  ]
}`;

  if (lang === 'np') {
    return `${base}\n\nIMPORTANT: Write everything (Question, Options, Explanation) in Pure Nepali. Always include relevant English technical terms in brackets [English Term] immediately after their Nepali counterparts. Example: "मुलुकी देवानी संहिता [Civil Code]".`;
  }
  return base;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { examId, topic, questionCount = 10 } = body;
    const userId = user.id;

    // Fetch user language preference from DB for true sync
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('language')
      .eq('user_id', userId)
      .maybeSingle();
    
    const userLang = prefs?.language || 'en';

    if (!examId || !topic) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: examId, topic' },
        { status: 400 }
      );
    }

    // ── Step 0: Check Plan Limits ──────────────────────────────────
    const limits = await checkUserLimits(userId);
    if (limits.limits.quizzes.exceeded) {
      return NextResponse.json(
        { 
          error: 'limit_reached', 
          limit_type: 'quiz_limit',
          is_pro: limits.plan !== 'free',
          message: limits.plan !== 'free' ? 'You are generating more than usual. Come back tomorrow for more.' : 'Daily limit reached.'
        },
        { status: 403 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }

    // 1. Vector Search for relevant document chunks
    let relevantContext = '';
    try {
      const { generateQueryEmbedding } = await import('@/lib/ai');
      const topicEmbedding = await generateQueryEmbedding(topic);

      const { data: chunks, error: searchError } = await supabase.rpc(
        'search_documents',
        {
          query_embedding: topicEmbedding,
          match_count: 10,
          filter_user_id: userId,
          filter_exam_id: examId,
        }
      );

      if (!searchError && chunks && chunks.length > 0) {
        relevantContext = chunks.map((c: any, i: number) => `[Context ${i + 1} - ${(c.doc_type || 'NOTES').toUpperCase()}]\n${c.chunk_text}`).join('\n\n---\n\n');
      }
    } catch (e) {
      console.warn('[Quiz Search] Vector search failed, falling back to keyword search:', e);
      // Fallback to keyword search
      const { data: fallbackChunks } = await supabase
        .from('document_chunks')
        .select('chunk_text, doc_type')
        .eq('exam_id', examId)
        .ilike('chunk_text', `%${topic}%`)
        .limit(10);
      
      if (fallbackChunks && fallbackChunks.length > 0) {
        relevantContext = fallbackChunks.map((c: any, i: number) => `[Context ${i + 1} - ${(c.doc_type || 'NOTES').toUpperCase()}]\n${c.chunk_text}`).join('\n\n---\n\n');
      }
    }

    const contextContent = relevantContext || `No specific document context found. Generate questions based on standard PSC Nepal (Loksewa) syllabus knowledge for the topic: ${topic}.`;

    // 2. Call Gemini API via centralized utility
    const userMessage = `Generate a ${questionCount}-question MCQ quiz on: ${topic}
Focus on authentic Loksewa Ayog patterns.
    
Content Context:
${contextContent}`;

    const parsedData = await generateJSON(getSystemInstruction(userLang), userMessage);

    if (!parsedData.questions || !Array.isArray(parsedData.questions)) {
      throw new Error('AI failed to generate a valid list of questions.');
    }

    // 3. Increment Usage & Log AI Cost in Background
    try {
      const { incrementUsage } = await import('@/lib/usage');
      await incrementUsage(userId, 'quiz');
      
      const { logAiUsage } = await import('@/lib/ai-logger');
      await logAiUsage({ userId, feature: 'quiz' });
    } catch (e) {
      console.error('Failed to increment/log quiz usage:', e);
    }

    // 4. Return the generated quiz
    return NextResponse.json({
      success: true,
      quiz_title: parsedData.quiz_title || `${topic} Mastery Quiz`,
      topic: parsedData.topic || topic,
      questions: parsedData.questions,
      count: parsedData.questions.length
    });

  } catch (error: any) {
    console.error('Generate Quiz Route Error:', error);
    const status = error.status || 500;
    return NextResponse.json(
      { success: false, message: error.message },
      { status }
    );
  }
}
