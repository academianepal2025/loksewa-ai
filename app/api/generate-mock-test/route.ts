import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateJSON } from '@/lib/ai';

const getSystemInstruction = (lang: string) => {
  const base = `You are an expert exam simulator for PSC Nepal (Loksewa Ayog).
Your objective is to analyze the provided Previous Year Questions (PYQs) and generate a brand new, highly realistic Mock Test.
The questions must strictly follow the stylistic pattern, depth, and structural conventions of the provided PYQs.
Assume the user will be answering in a written/subjective format unless the PYQs are purely multiple choice.

Return ONLY valid JSON:
{
  "title": "string",
  "duration_minutes": number,
  "instructions": "string",
  "sections": [
    {
      "section_title": "string",
      "section_instructions": "string",
      "questions": [
        {
          "id": "string",
          "text": "string",
          "marks": number,
          "type": "subjective" | "objective"
        }
      ]
    }
  ]
}`;

  if (lang === 'np') {
    return `${base}\n\nIMPORTANT: Generate the mock test in Pure Nepali. Write all titles, instructions, section titles, section instructions, and questions in Devanagari script. If any technical terms are used, you can add their English equivalent in brackets [English Term] next to them.`;
  }
  return base;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { examId, userId } = body;

    if (!examId || !userId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: examId, userId' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }

    const supabase = await createClient();

    // Fetch user language preference from DB for true sync
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('language')
      .eq('user_id', userId)
      .maybeSingle();
    
    const userLang = prefs?.language || 'en';

    // Fetch PYQ chunks
    const { data: pyqChunks, error: searchError } = await supabase
      .from('document_chunks')
      .select('chunk_text')
      .eq('exam_id', examId)
      .eq('doc_type', 'pyq')
      .limit(15);

    if (searchError) {
      throw new Error(`Failed to fetch PYQ documents: ${searchError.message}`);
    }

    if (!pyqChunks || pyqChunks.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No PYQ documents found. Please upload them first.' },
        { status: 404 }
      );
    }

    const contextContent = pyqChunks.map((c: any, i: number) => `[PYQ Sample ${i + 1}]\n${c.chunk_text}`).join('\n\n---\n\n');

    const userMessage = `Analyze these Loksewa Ayog Previous Year Questions.
Infer the standard exam duration and question structure.
Generate a comprehensive Mock Test that simulates a full examination.

PYQ Context:
${contextContent}`;

    const parsedData = await generateJSON(getSystemInstruction(userLang), userMessage, undefined, { userId, feature: 'mock_test' });

    if (!parsedData.sections || !Array.isArray(parsedData.sections)) {
      throw new Error('AI failed to generate a valid mock test with sections.');
    }

    return NextResponse.json({
      success: true,
      test: parsedData
    });

  } catch (error: any) {
    console.error('Generate Mock Test Route Error:', error);
    const status = error.status || 500;
    return NextResponse.json(
      { success: false, message: error.message },
      { status }
    );
  }
}
