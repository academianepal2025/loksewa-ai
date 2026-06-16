import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateText } from '@/lib/ai';

const getSystemInstruction = (topic: string, section: string, lang: string = 'en') => {
  const isNp = lang === 'np';
  return `You are an expert PSC Nepal Loksewa Ayog exam preparation coach and note maker. Your job is to generate a comprehensive, highly detailed, exam-focused deep-dive expansion on a specific subtopic or concept.

Parent Study Topic: ${topic}
Specific Concept to Expand: ${section}
Target Language: ${isNp ? 'Nepali' : 'English'}

Write a thorough, highly detailed notes section covering this concept. Include:
1. Academic/legal definitions and basic introduction.
2. Step-by-step processes or core components (e.g., if expanding "planning", explain types of planning, steps, principles, etc.).
3. Nepal-specific governance/administrative context or constitutional basis where applicable.
4. Tips for answering exam questions related to this concept in Loksewa exams.

FORMATTING RULES:
- Format in Markdown. Use ### for headers.
- Write in ${isNp ? 'Clear Nepali Language' : 'Clear Simple English'}.
- ${isNp ? 'Always include relevant English technical terms in brackets [English Term] after Nepali terms.' : 'Where Nepali terms are important, include them in parentheses after the English.'}
- Use bold text for key facts.
- Keep the expansion extremely concise and direct. Avoid conversational preambles, repetitive conclusions, or fluff. Deliver high-density information using bullet points and brief paragraphs.`;
};

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { checkUserLimits } = await import('@/lib/checkUserLimits');
    const limits = await checkUserLimits(user.id);
    if (limits.plan === 'free') {
      return NextResponse.json(
        { error: 'Note expansion is a premium feature. Please upgrade to Pro to unlock deep-dive analyses.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { noteId, sectionToExpand, language } = body;

    if (!noteId || !sectionToExpand) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Verify ownership and get current note content
    const { data: existingNote, error: fetchError } = await supabase
      .from('study_notes')
      .select('user_id, topic, notes_content')
      .eq('id', noteId)
      .single();

    if (fetchError || !existingNote || existingNote.user_id !== user.id) {
      return NextResponse.json({ error: 'Note not found or unauthorized' }, { status: 404 });
    }

    // Check user's language preference
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('language')
      .eq('user_id', user.id)
      .maybeSingle();
    
    const userLang = language || prefs?.language || 'en';

    console.log(`[DEBUG] Expanding section "${sectionToExpand}" for note "${existingNote.topic}" in language "${userLang}"`);

    const userPrompt = `Generate a detailed topic expansion for "${sectionToExpand}" under the parent topic "${existingNote.topic}". Output must be in ${userLang === 'np' ? 'NEPALI' : 'ENGLISH'}.`;

    // Generate expansion using Gemini
    const expansionMarkdown = await generateText(
      getSystemInstruction(existingNote.topic, sectionToExpand, userLang),
      userPrompt,
      undefined,
      { userId: user.id, feature: 'notes' }
    );

    const headingText = userLang === 'np' ? `🔍 विस्तृत विश्लेषण: ${sectionToExpand}` : `🔍 Deep Dive: ${sectionToExpand}`;
    const newMarkdown = `${existingNote.notes_content?.full_markdown || ''}\n\n---\n### ${headingText}\n${expansionMarkdown}`;
    const wordCount = newMarkdown.split(/\s+/).filter(w => w.length > 0).length;

    const updatedContent = {
      ...existingNote.notes_content,
      full_markdown: newMarkdown,
      word_count: wordCount
    };

    const { error: updateError } = await supabase
      .from('study_notes')
      .update({
        notes_content: updatedContent,
        word_count: wordCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', noteId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return NextResponse.json({
      success: true,
      updated_markdown: newMarkdown,
      word_count: wordCount
    });

  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Notes Expansion Error:', error);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
