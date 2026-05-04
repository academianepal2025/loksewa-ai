import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateJSON } from '@/lib/ai';

function getSystemInstruction(lang: string) {
  const base = `You are an expert PSC Nepal (Loksewa Ayog) exam analyst. Analyze the provided syllabus and return structured JSON analysis.
Return ONLY valid JSON matching this exact schema:
{
  "exam_overview": {
    "total_topics": number,
    "papers": [{ "paper_number": number, "paper_name": "string", "total_marks": number }],
    "estimated_total_hours_needed": number
  },
  "topics": [
    {
      "topic_name": "string",
      "paper": "string",
      "subtopics": ["string"],
      "estimated_hours": number,
      "priority": "critical" | "high" | "medium" | "low",
      "priority_reason": "string",
      "typical_question_types": ["string"],
      "pyq_likelihood": "very_high" | "high" | "medium" | "low"
    }
  ],
  "study_strategy": "string",
  "critical_topics_summary": "string"
}

CRITICAL PERFORMANCE RULES:
1. Keep 'priority_reason' under 10 words.
2. Keep 'study_strategy' under 40 words.
3. Keep 'critical_topics_summary' under 30 words.
4. If there are more than 30 minor subtopics, aggregate them into broader themes to keep the array size small.`;

  if (lang === 'np') {
    return `${base}\n\nIMPORTANT: Write all descriptive strings (paper_name, topic_name, priority_reason, study_strategy, critical_topics_summary) in Pure Nepali. Always include relevant English technical terms in brackets [English Term] immediately after their Nepali counterparts.`;
  }
  return base;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { examId, userId, language = 'en' } = body;

    if (!examId || !userId) {
      return NextResponse.json({ success: false, message: 'Missing examId or userId' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }

    const supabase = await createClient();

    // 1. Fetch all documents for this exam to see what's actually there
    const { data: allDocs } = await supabase.from('documents').select('id, doc_type, exam_id').eq('exam_id', examId);
    console.log(`[DEBUG] Found ${allDocs?.length || 0} total documents for exam ${examId}:`, allDocs);

    const { data: syllabusDocuments, error: docsError } = await supabase
      .from('documents')
      .select('parsed_text')
      .eq('exam_id', examId)
      .eq('doc_type', 'syllabus');

    if (docsError) {
      throw new Error(`Failed to fetch syllabus documents: ${docsError.message}`);
    }

    if (!syllabusDocuments || syllabusDocuments.length === 0) {
      console.log(`[DEBUG] No syllabus documents found. Returning 404.`);
      return NextResponse.json({ 
        success: false, 
        message: 'No syllabus documents found for this exam. Please upload a syllabus first.' 
      }, { status: 404 });
    }

    // 2. Combine all parsed_text into one string
    const combinedSyllabusText = syllabusDocuments
      .map(doc => doc.parsed_text)
      .filter(Boolean)
      .join('\n\n---\n\n');

    if (!combinedSyllabusText.trim()) {
      return NextResponse.json({ 
        success: false, 
        message: 'Syllabus documents have no parsed text. Please wait for processing to complete.' 
      }, { status: 400 });
    }

    // 3. Fetch exam details from user_exams
    const { data: exam, error: examError } = await supabase
      .from('user_exams')
      .select('exam_name, exam_date, daily_study_hours')
      .eq('id', examId)
      .single();

    if (examError || !exam) {
      throw new Error(`Failed to fetch exam details: ${examError?.message}`);
    }

    // 4. Calculate days remaining from today to exam_date
    const today = new Date();
    const examDate = new Date(exam.exam_date);
    const daysRemaining = Math.max(0, Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

    const userMessage = `Exam: ${exam.exam_name}
Exam Date: ${exam.exam_date}
Daily Study Hours: ${exam.daily_study_hours}
Days Remaining: ${daysRemaining}
Syllabus Content:
${combinedSyllabusText}`;

    // 5. Call Gemini API with structured output using centralized utility
    const analysisData = await generateJSON(getSystemInstruction(language), userMessage);

    // 7. Insert into syllabus_analysis table
    const { data: insertedRow, error: insertError } = await supabase
      .from('syllabus_analysis')
      .insert({
        exam_id: examId,
        user_id: userId,
        analysis_data: analysisData
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to save analysis: ${insertError.message}`);
    }

    // 8. Return the analysis JSON
    return NextResponse.json({
      success: true,
      analysis: analysisData,
      id: insertedRow.id
    });

  } catch (error: any) {
    console.error('Analyze Syllabus Route Error:', error);
    const status = error.status || 500;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}
