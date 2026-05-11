import { createClient } from '@/lib/supabase/server';
import { generateQueryEmbedding, streamText } from '@/lib/ai';
import { checkUserLimits } from '@/lib/checkUserLimits';

const SYSTEM_INSTRUCTION = `You are Loksewa Guru, an expert assistant for Nepal PSC (Public Service Commission) exam preparation. 

STRICT RESPONSE RULES:
1. Answer ONLY from the provided context.
2. If answer is not in context, respond: 'यो जानकारी तपाईंको अपलोड गरिएका नोट्समा भेटिएन। थप सामग्री थप्नुहोस्।'
3. Match the language of the student's question (Nepali or English).
4. For constitutional articles, acts, procedures — be precise and structured.
5. Mention if a topic appeared in PYQs: "**[PYQ ALERT]** This topic appeared in previous year questions."
6. End important answers with the topic's exam priority if available.
7. NEVER make up facts. NEVER answer outside provided context.
8. If the user explicitly asks for a brief explanation or a single paragraph, adhere strictly to that length.

FORMATTING RULES (ESSENTIAL):
- Use proper Markdown for high readability.
- Use ### for Section Headers.
- Use **Bold** for emphasis on key terms and article numbers.
- Use Markdown Tables for data comparisons or weightage breakdowns.
- Use Bullet points for lists.
- For Nepali text, use proper Devanagari script.
- Ensure a clean, structured layout with enough spacing between sections.`;

export async function POST(request: Request) {
  const supabase = await createClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { message, examId, conversationHistory = [] } = body;
    const userId = user.id;

    if (!message || !examId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: message, examId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ── Step 0: Check Plan Limits ──────────────────────────────────
    const limits = await checkUserLimits(userId);
    if (limits.limits.chat.exceeded) {
      return new Response(
        JSON.stringify({ 
           error: 'limit_reached', 
           limit_type: 'chat_limit',
           is_pro: limits.plan !== 'free',
           message: limits.plan !== 'free' ? 'You have reached your daily guru limit. Come back tomorrow for more.' : 'Daily limit reached.' 
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }



    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not defined');
    }

    // ── Step 1: Fetch User Language Preference ───────────────────
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('language')
      .eq('user_id', userId)
      .maybeSingle();
    
    const userLang = prefs?.language || 'en';

    // ── Step 2: Generate query embedding using centralized utility ────
    const queryEmbedding = await generateQueryEmbedding(message);

    // ── Step 2: Search relevant document chunks ───────────────────
    const { data: relevantChunks, error: searchError } = await supabase.rpc(
      'search_documents',
      {
        query_embedding: queryEmbedding,
        match_count: 8,
        filter_user_id: userId,
        filter_exam_id: examId,
      }
    );

    if (searchError) {
      console.error('Search error:', searchError);
    }

    // ── Step 2.5: Fetch Syllabus Intelligence ───────────────────
    const { data: syllabusAnalysis } = await supabase
      .from('syllabus_analysis')
      .select('analysis_data')
      .eq('exam_id', examId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const syllabusIntel = syllabusAnalysis?.analysis_data 
      ? `[SYLLABUS INTELLIGENCE]\nCritical Focus: ${syllabusAnalysis.analysis_data.critical_topics_summary}\nTopics & Priorities: ${JSON.stringify(syllabusAnalysis.analysis_data.topics)}\nStudy Strategy: ${syllabusAnalysis.analysis_data.study_strategy}`
      : '';

    // ── Step 3: Build context from retrieved chunks ───────────────
    let contextString = syllabusIntel;
    if (relevantChunks && relevantChunks.length > 0) {
      const chunksString = relevantChunks
        .map((chunk: any, i: number) => {
          const sourceLabel = (chunk.doc_type || 'NOTES').toUpperCase();
          return `[Source ${i + 1} — ${sourceLabel}]\n${chunk.chunk_text}`;
        })
        .join('\n\n---\n\n');
      contextString = contextString ? `${contextString}\n\n---\n\n${chunksString}` : chunksString;
    }

    const fullSystemPrompt = contextString
      ? `${SYSTEM_INSTRUCTION}\n\n[USER PREFERENCE]: All responses MUST be in ${userLang === 'np' ? 'NEPALI' : 'ENGLISH'}. If Nepali, use Devanagari script.\n\nContext from student's documents and syllabus intelligence:\n${contextString}`
      : `${SYSTEM_INSTRUCTION}\n\n[USER PREFERENCE]: All responses MUST be in ${userLang === 'np' ? 'NEPALI' : 'ENGLISH'}. If Nepali, use Devanagari script.\n\nNo relevant context was found in the student's documents for this query.`;

    // ── Step 4: Convert conversation history to Gemini format ─────
    const geminiHistory = conversationHistory
      .filter((msg: any) => msg.role && msg.content)
      .map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

    // ── Step 5: Start streaming chat using centralized utility ──
    const chat = await streamText(fullSystemPrompt, geminiHistory);
    const streamResult = await chat.sendMessageStream({ message });

    // ── Step 6: Stream response via ReadableStream ────────────────
    let fullResponse = '';

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of streamResult) {
            const text = chunk.text ?? '';
            if (text) {
              fullResponse += text;
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();

          // ── Step 7: Save messages & Increment Usage ─────────────────
          try {
             await supabase.from('chat_messages').insert([
              { user_id: userId, exam_id: examId, role: 'user', content: message },
              { user_id: userId, exam_id: examId, role: 'assistant', content: fullResponse }
            ]);

            const { incrementUsage } = await import('@/lib/usage');
            await incrementUsage(userId, 'chat');
          } catch (saveError) {
            console.error('Background tasks failed:', saveError);
          }
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    const status = error.status || 500;
    return new Response(
      JSON.stringify({ error: error.message || 'Internal Server Error' }),
      { status, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
