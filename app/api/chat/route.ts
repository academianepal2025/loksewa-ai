import { createClient } from '@/lib/supabase/server';
import { generateQueryEmbedding, streamText } from '@/lib/ai';
import { checkUserLimits } from '@/lib/checkUserLimits';

interface SearchDocumentResult {
  doc_type?: string;
  chunk_text: string;
}

interface ChatMessageHistory {
  role: string;
  content: string;
}

const SYSTEM_INSTRUCTION = `You are Loksewa Guru, an expert assistant for Nepal PSC (Public Service Commission) exam preparation. 

STRICT RESPONSE RULES:
1. SCOPE AND RELEVANCE: You MUST ONLY answer questions that are directly relevant to the user's exam syllabus or Nepal PSC (Loksewa) preparation. If the user is asking about topics beyond the exam syllabus, or anything unrelated to Loksewa prep (e.g. general programming outside their syllabus, recipes, casual chat, unrelated exams), you MUST gracefully and politely decline to answer.
2. CONTEXT PRIORITIZATION: Try to answer using the provided context from the student's uploaded materials (notes and previous year questions).
3. SYLLABUS FALLBACK: If the question is relevant to the exam syllabus but the answer is not present in the provided context, you may use your general knowledge to generate a complete, helpful, and accurate response. However, in this case, you MUST prepend the following warning message at the very top of your response (in a new line, styled as italic):
   - Match the language of your response.
   - If responding in English:
     "*⚠️ Note: This response is AI-generated based on general knowledge, not from your uploaded study materials. Please upload relevant materials for personalized context.*"
   - If responding in Nepali:
     "*⚠️ नोट: यो जवाफ सामान्य ज्ञानमा आधारित AI-द्वारा तयार गरिएको हो, तपाईंको अपलोड गरिएका सामग्रीहरूबाट होइन। व्यक्तिगत र सान्दर्भिक उत्तरका लागि कृपया सम्बन्धित सामग्रीहरू अपलोड गर्नुहोस्।*"
4. Match the language of the student's question (Nepali or English).
5. For constitutional articles, acts, procedures — be precise and structured.
6. Mention if a topic appeared in PYQs: "**[PYQ ALERT]** This topic appeared in previous year questions."
7. End important answers with the topic's exam priority if available.
8. If the user explicitly asks for a brief explanation or a single paragraph, adhere strictly to that length.
9. Keep responses highly concise. Avoid repeating facts, minimize conversational fluff, prioritize bullet points/tables over wordy prose, and limit the response to 300 words maximum.

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
      const isLifetimeExceeded = limits.plan === 'free' && ((limits.limits.chat as any).lifetimeUsed || 0) >= 10;
      return new Response(
        JSON.stringify({ 
           error: 'limit_reached', 
           limit_type: 'chat_limit',
           is_pro: limits.plan !== 'free',
           message: limits.plan !== 'free' 
             ? 'You have reached your daily guru limit. Come back tomorrow for more.' 
             : isLifetimeExceeded 
               ? 'You have reached the lifetime free chat limit of 10 messages. Please upgrade to Pro for unlimited chat.' 
               : 'Daily free chat limit of 3 messages reached. Please upgrade to Pro or come back tomorrow.' 
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
    const queryEmbedding = await generateQueryEmbedding(message, { userId });

    // ── Step 2: Search relevant document chunks ───────────────────
    const { data: relevantChunks, error: searchError } = await supabase.rpc(
      'match_document_chunks',
      {
        query_embedding: queryEmbedding,
        match_threshold: 0.35,
        match_count: 5,
        p_user_id: userId,
        p_exam_id: examId,
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
      const chunksString = (relevantChunks as SearchDocumentResult[])
        .map((chunk, i: number) => {
          const sourceLabel = (chunk.doc_type || 'NOTES').toUpperCase();
          return `[Source ${i + 1} — ${sourceLabel}]\n${chunk.chunk_text}`;
        })
        .join('\n\n---\n\n');
      contextString = contextString ? `${contextString}\n\n---\n\n${chunksString}` : chunksString;
    }

    const contextEmpty = !relevantChunks || relevantChunks.length === 0;

    const fullSystemPrompt = !contextEmpty
      ? `${SYSTEM_INSTRUCTION}\n\n[USER PREFERENCE]: All responses MUST be in ${userLang === 'np' ? 'NEPALI' : 'ENGLISH'}. If Nepali, use Devanagari script.\n\nContext from student's documents and syllabus intelligence:\n${contextString}`
      : `${SYSTEM_INSTRUCTION}\n\n[USER PREFERENCE]: All responses MUST be in ${userLang === 'np' ? 'NEPALI' : 'ENGLISH'}. If Nepali, use Devanagari script.\n\nNo relevant context was found in the student's documents for this query. You MUST fallback to your general knowledge to answer the query, and you MUST prepend the warning notice at the very top of your response.`;

    // ── Step 4: Convert conversation history to Gemini format (capped at last 10 messages for cost control) ─────
    const geminiHistory = (conversationHistory as ChatMessageHistory[])
      .filter((msg) => msg.role && msg.content)
      .slice(-10)
      .map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

    // ── Step 5: Start streaming chat using centralized utility ──
    const { chat, modelUsed } = await streamText(fullSystemPrompt, geminiHistory);
    const streamResult = await chat.sendMessageStream({ message });

    // ── Step 6: Stream response via ReadableStream ────────────────
    let fullResponse = '';
    let lastUsageMetadata: any = null;

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of streamResult) {
            const text = chunk.text ?? '';
            if (chunk.usageMetadata) {
              lastUsageMetadata = chunk.usageMetadata;
            }
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
            
            // Extract real token usage from stream response metadata captured during iteration
            const inputTokens = lastUsageMetadata?.promptTokenCount;
            const outputTokens = lastUsageMetadata?.candidatesTokenCount;

            const { logAiUsage } = await import('@/lib/ai-logger');
            await logAiUsage({ 
              userId, 
              feature: 'chat',
              inputTokens,
              outputTokens,
              model: modelUsed
            });
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
  } catch (error) {
    console.error('Chat API Error:', error);
    const err = error as { status?: number; message?: string };
    const status = err.status || 500;
    return new Response(
      JSON.stringify({ error: err.message || 'Internal Server Error' }),
      { status, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
