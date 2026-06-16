import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateText, generateQueryEmbedding } from '@/lib/ai';
import { checkUserLimits } from '@/lib/checkUserLimits';

const getSystemInstruction = (examId: string, hasContent: boolean, lang: string = 'en') => {
  const isNp = lang === 'np';
  
  let instruction = `You are an expert PSC Nepal Loksewa Ayog exam preparation coach and note maker. Your job is to generate comprehensive, exam-focused study notes for a specific topic based on the student's own uploaded study materials.

These notes must be written specifically for Nepal PSC exam aspirants preparing for Loksewa Ayog examinations. Every explanation should be relevant to the Nepal administrative context, Nepal Constitution 2072, Nepal's governance structure, and Nepal specific laws and acts where applicable.

NOTES FORMAT — follow this exact structure for every topic:

---
## [TOPIC NAME]
**Priority:** High | **Exam Relevance:** Moderate | **Best Revision:** Morning

### ${isNp ? 'परिचय (Introduction)' : 'Introduction'}
Write 2 to 3 paragraphs introducing the topic, explaining why it matters for Nepal PSC exams, and giving the big picture context with Nepal specific framing.

### ${isNp ? 'मुख्य अवधारणाहरू (Key Concepts)' : 'Key Concepts'}
1. **Concept One**
   - Detail A
   - Detail B
2. **Concept Two**

### ${isNp ? 'विस्तृत व्याख्या (Detailed Explanation)' : 'Detailed Explanation'}
#### [Subtopic 1]
Write thorough paragraphs covering the subtopic. Explain the concept fully, give legal/constitutional basis citing articles/sections, and explain its mechanism in Nepal.

#### [Subtopic 2]
...

### ${isNp ? 'सम्झनुपर्ने महत्त्वपूर्ण तथ्यहरू (Important Facts to Remember)' : 'Important Facts to Remember'}
1. Fact one
2. Fact two

### ${isNp ? 'गत वर्षका प्रश्न ढाँचाहरू (Previous Year Question Patterns)' : 'Previous Year Question Patterns'}
(Only include this section if PYQ content was provided)
Describe what kinds of questions have been asked from this topic in past Loksewa exams.

### ${isNp ? 'द्रुत समीक्षा सारांश (Quick Revision Summary)' : 'Quick Revision Summary'}
- Bullet point 1
- Bullet point 2
- Bullet point 3

### ${isNp ? 'स्मरण सुझावहरू (Memory Tips)' : 'Memory Tips'}
Provide 2 to 3 mnemonic devices, acronyms, or memory tricks for the hardest facts.
---

IMPORTANT RULES:
1. Write in ${isNp ? 'Clear Nepali Language' : 'Clear Simple English'}.
2. ${isNp ? 'Always include relevant English technical terms in brackets [English Term] after Nepali terms.' : 'Where Nepali terms are important include them in parentheses after the English.'}
3. Every specific fact that could be a direct exam question should be bolded.
4. Keep notes highly concise, dense with facts, and completely free of conversational filler or fluff. Use bullet points or lists wherever possible. Limit the total notes content size to be crisp and readable.`;

  if (!hasContent) {
    instruction += `\n\nCRITICAL: The student has not provided any uploaded study materials for this topic. You must generate general knowledge PSC exam notes based on your own expert knowledge of the Nepal Loksewa syllabus.`;
  } else {
    instruction += `\n\nCRITICAL: Use the provided context from the student's documents. Even if the context is in a different language, translate and synthesize it into the target language (${isNp ? 'Nepali' : 'English'}).
    
YOU MUST CITE YOUR SOURCES. Whenever you use information from the provided context, you MUST explicitly cite it in the text. For example: "(Source: [Document Name])" or "[Document Name]". Do not make up document names. Use the exact document names provided in the context blocks.`;
  }

  return instruction;
};

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { examId, day_number, topic, subtopics = [], date, force_generate = false, language } = body;

    if (!examId || !day_number || !topic) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Check user's language preference
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('language')
      .eq('user_id', user.id)
      .maybeSingle();
    
    const userLang = language || prefs?.language || 'en';

    // Check if notes already exist
    const { data: existingNote } = await supabase
      .from('study_notes')
      .select('id, generation_status, notes_content')
      .eq('exam_id', examId)
      .eq('day_number', day_number)
      .eq('topic', topic)
      .single();

    if (existingNote?.generation_status === 'ready' && !force_generate) {
      return NextResponse.json({ success: true, existing: true, data: existingNote });
    }

    // Check Plan Limits
    const limits = await checkUserLimits(user.id);
    if (limits.limits.notes.exceeded) {
      return NextResponse.json(
        { 
          error: 'limit_reached', 
          limit_type: 'notes_limit', 
          is_pro: limits.plan !== 'free',
          message: limits.plan !== 'free' ? 'You have reached your total note generation limit.' : 'Total limit of 3 notes reached for free account.' 
        },
        { status: 403 }
      );
    }

    // Upsert placeholder
    const { error: upsertError } = await supabase
      .from('study_notes')
      .upsert({
        user_id: user.id,
        exam_id: examId,
        day_number,
        date,
        topic,
        subtopics,
        generation_status: 'generating',
        no_content_found: false,
        error_message: null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'exam_id,day_number,topic' });

    if (upsertError) {
      console.error('Upsert Error:', upsertError);
      throw new Error('Database error during initialization');
    }

    // --- NEW RAG Logic: Vector Similarity Search ---
    console.log(`[DEBUG] Generating embedding for topic: ${topic}`);
    const queryEmbedding = await generateQueryEmbedding(topic);
    
    const { data: matchedChunks, error: rpcError } = await supabase.rpc('match_document_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: 0.35,
      match_count: 8,
      p_user_id: user.id,
      p_exam_id: examId
    });

    if (rpcError) {
      console.error('RPC match_document_chunks Error:', rpcError);
    }

    let relevantChunks = matchedChunks || [];
    let hasPyq = relevantChunks.some((c: any) => c.doc_type === 'pyq');

    // No Content Found check (fallback)
    if (relevantChunks.length === 0 && !force_generate) {
      console.log('[DEBUG] No semantic matches found. Attempting simple keyword fallback...');
      const { data: kwChunks } = await supabase
        .from('document_chunks')
        .select('chunk_text, doc_type, document_id, documents!inner(user_id)')
        .eq('documents.user_id', user.id)
        .eq('exam_id', examId)
        .ilike('chunk_text', `%${topic}%`)
        .limit(5);
      
      if (kwChunks && kwChunks.length > 0) {
        relevantChunks = kwChunks;
      }
    }

    if (relevantChunks.length === 0 && !force_generate) {
      // Return missing content status so the frontend can prompt the user
      await supabase.from('study_notes').update({
        generation_status: 'no_content',
        no_content_found: true,
        updated_at: new Date().toISOString()
      }).eq('exam_id', examId).eq('day_number', day_number).eq('topic', topic);
      
      return NextResponse.json({ success: false, status: 'no_content_found' });
    }

    // Fetch actual file names for the document IDs to cite them
    let documentNamesMap: Record<string, string> = {};
    if (relevantChunks.length > 0) {
      const docIds = [...new Set(relevantChunks.map((c: any) => c.document_id))];
      const { data: docs } = await supabase
        .from('documents')
        .select('id, file_name')
        .in('id', docIds);
      
      if (docs) {
        docs.forEach(d => { documentNamesMap[d.id] = d.file_name; });
      }
    }

    // Build context string
    let contextString = "No specific uploaded materials found for this topic. Please use your expert knowledge of the Loksewa syllabus.";
    if (relevantChunks.length > 0) {
      contextString = relevantChunks.map((c: any) => {
        const fileName = documentNamesMap[c.document_id] || c.doc_type?.toUpperCase() || 'DOCUMENT';
        const prefix = `[FROM SOURCE: ${fileName}]`;
        return `${prefix}\n${c.chunk_text}`;
      }).join('\n\n');
    }

    const userPrompt = `Generate comprehensive PSC exam notes for the topic: ${topic}. 
The subtopics to cover are: ${subtopics.join(', ')}. 
The output language must be: ${userLang === 'np' ? 'NEPALI' : 'ENGLISH'}.
\nRELEVANT CONTEXT FROM STUDENT DOCUMENTS:\n${contextString}`;

    // Call AI
    const markdownOutput = await generateText(getSystemInstruction(examId, relevantChunks.length > 0, userLang), userPrompt, undefined, { userId: user.id, feature: 'notes' });

    const wordCount = markdownOutput.split(/\s+/).filter(w => w.length > 0).length;
    const uniqueDocs = new Set(relevantChunks.map((c: any) => c.document_id)).size;

    const notesContentObject = {
      full_markdown: markdownOutput,
      topic,
      subtopics,
      word_count: wordCount,
      has_pyq_content: hasPyq,
      source_docs_count: uniqueDocs,
      generated_from_general_knowledge: relevantChunks.length === 0,
      language: userLang
    };

    // Update Note
    const { error: finalizeError } = await supabase
      .from('study_notes')
      .update({
        notes_content: notesContentObject,
        generation_status: 'ready',
        source_chunks_found: relevantChunks.length > 0,
        no_content_found: false,
        word_count: wordCount,
        updated_at: new Date().toISOString()
      })
      .eq('exam_id', examId)
      .eq('day_number', day_number)
      .eq('topic', topic);

    if (finalizeError) throw new Error(finalizeError.message);

    // Increment Usage & Log AI Cost
    try {
      const { incrementUsage } = await import('@/lib/usage');
      await incrementUsage(user.id, 'note');
    } catch (e) {
      console.warn("Failed to increment notes usage:", e);
    }

    return NextResponse.json({
      success: true,
      data: {
        exam_id: examId,
        day_number,
        topic,
        notes_content: notesContentObject
      }
    });

  } catch (error: any) {
    console.error('Notes Generation Error:', error);
    
    // Attempt to set failure state
    try {
      const body = await request.clone().json();
      if (body.examId && body.day_number) {
        const supabaseFallback = await createClient();
        await supabaseFallback.from('study_notes').update({
          generation_status: 'failed',
          error_message: error.message
        }).eq('exam_id', body.examId).eq('day_number', body.day_number);
      }
    } catch (e) {}

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
