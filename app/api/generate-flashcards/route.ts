import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateJSON } from '@/lib/ai';

function getSystemInstruction(lang: string) {
  const base = `You are creating flashcards for PSC Nepal (Loksewa Ayog) exam preparation.
Create flashcards that test recall of: constitutional articles and provisions,
legal acts and their sections, administrative procedures, key definitions,
historical dates and events relevant to Nepal, and factual PSC exam knowledge.

Each card must have a distinct, specific question — not vague or overlapping.
Difficulty should be accurately assessed based on how obscure the fact is.

Return ONLY valid JSON:
{
  "flashcards": [
    {
      "id": "string",
      "front": "string",
      "back": "string",
      "topic": "string",
      "difficulty": "easy" | "medium" | "hard",
      "hint": "string",
      "exam_tip": "string"
    }
  ]
}`;

  if (lang === 'np') {
    return `${base}\n\nIMPORTANT: Write everything (Front, Back, Topic, Hint, Exam Tip) in Pure Nepali. Always include relevant English technical terms in brackets [English Term] immediately after their Nepali counterparts.`;
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
    const { examId, topic, count } = body;
    const userId = user.id;

    // Fetch user language preference from DB for true sync
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('language')
      .eq('user_id', userId)
      .maybeSingle();
    
    const userLang = prefs?.language || 'en';

    if (!examId || !topic || !count) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: examId, topic, count' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }

    // 1. Vector Search for relevant document chunks
    // First, we need the embedding for the topic to perform vector search
    let relevantContext = '';
    try {
      const { generateQueryEmbedding } = await import('@/lib/ai');
      const topicEmbedding = await generateQueryEmbedding(topic);

      const { data: chunks, error: searchError } = await supabase.rpc(
        'search_documents',
        {
          query_embedding: topicEmbedding,
          match_count: 5,
          filter_user_id: userId,
          filter_exam_id: examId,
        }
      );

      if (!searchError && chunks && chunks.length > 0) {
        relevantContext = chunks.map((c: any, i: number) => `[Source ${i + 1} — ${(c.doc_type || 'notes').toUpperCase()}]\n${c.chunk_text}`).join('\n\n---\n\n');
      }
    } catch (e) {
      console.warn('[Flashcard Search] Vector search failed, falling back to keyword search:', e);
      // Fallback to keyword search if RPC fails
      const { data: fallbackChunks } = await supabase
        .from('document_chunks')
        .select('chunk_text, doc_type')
        .eq('exam_id', examId)
        .ilike('chunk_text', `%${topic}%`)
        .limit(5);
      
      if (fallbackChunks && fallbackChunks.length > 0) {
        relevantContext = fallbackChunks.map((c: any, i: number) => `[Source ${i + 1} — ${(c.doc_type || 'notes').toUpperCase()}]\n${c.chunk_text}`).join('\n\n---\n\n');
      }
    }

    const contextContent = relevantContext || `No specific document context found. Generate factual PSC Nepal exam flashcards on the topic based on standard Loksewa preparation knowledge. Topic: ${topic}`;

    // 2. Call Gemini API with JSON response via centralized utility
    const userMessage = `Create ${count} flashcards on: ${topic}\n\nContent:\n${contextContent}`;
    const parsed = await generateJSON(getSystemInstruction(userLang), userMessage, undefined, { userId, feature: 'flashcards' });

    const flashcards = parsed?.flashcards;
    if (!Array.isArray(flashcards) || flashcards.length === 0) {
      throw new Error('Gemini returned an empty or invalid flashcards array.');
    }

    // 4. Save to flashcards table
    const rowsToInsert = flashcards.map((card: any) => ({
      user_id: userId,
      exam_id: examId,
      topic: card.topic || topic,
      front: card.front,
      back: card.back,
      difficulty: card.difficulty || 'medium',
      hint: card.hint || null,
      exam_tip: card.exam_tip || null,
    }));

    const { data: insertedCards, error: insertError } = await supabase
      .from('flashcards')
      .insert(rowsToInsert)
      .select();

    if (insertError) {
      // Return the cards even if saving failed — don't block the user
      console.error('Failed to save flashcards to DB:', insertError);
      return NextResponse.json({
        success: true,
        flashcards,
        saved: false,
        warning: 'Flashcards generated but could not be saved: ' + insertError.message,
      });
    }

    // Increment Usage (counts toward quiz quota)
    try {
      const { incrementUsage } = await import('@/lib/usage');
      await incrementUsage(userId, 'quiz');
    } catch (e) {
      console.error('Failed to increment flashcard usage:', e);
    }

    return NextResponse.json({
      success: true,
      flashcards: insertedCards ?? flashcards,
      saved: true,
      count: flashcards.length,
    });

  } catch (error: any) {
    console.error('Generate Flashcards Route Error:', error);
    const status = error.status || 500;
    return NextResponse.json(
      { success: false, message: error.message },
      { status }
    );
  }
}
