import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateJSON } from '@/lib/ai';

function getSystemInstruction(lang: string) {
  const base = `You are an expert PSC Nepal Loksewa Ayog exam analyst with deep knowledge of all examination categories including Kharidar, Nayab Subba, Section Officer, and Gazetted Officer levels. Analyze the provided syllabus in exhaustive detail. For every single topic in the syllabus you must provide complete analysis covering what the topic is about, why it is important for this specific PSC exam category, what types of questions are typically asked from this topic in actual Loksewa Ayog exams, how many marks this topic typically carries, what subtopics must be studied within it, and how a student should approach studying it.

Return ONLY valid JSON matching this exact schema:
{
  "exam_overview": {
    "total_topics": number,
    "papers": [{ "paper_number": number, "paper_name": "string", "total_marks": number }],
    "estimated_total_hours_needed": number,
    "total_marks": number,
    "examination_pattern": "string",
    "passing_marks": number,
    "recommended_study_sequence": ["string"]
  },
  "topics": [
    {
      "topic_name": "string",
      "paper": "string",
      "subtopics": ["string"],
      "estimated_hours": number,
      "priority": "critical" | "high" | "medium" | "low",
      "priority_score": number,
      "priority_reason": "string",
      "marks_weightage": number,
      "question_types": ["string"],
      "learning_approach": "string",
      "key_facts_to_memorize": ["string"],
      "common_mistakes": "string",
      "study_sequence_order": number,
      "typical_question_types": ["string"],
      "pyq_likelihood": "very_high" | "high" | "medium" | "low"
    }
  ],
  "study_strategy": "string",
  "critical_topics_summary": "string"
}

CRITICAL PERFORMANCE RULES:
1. Provide exhaustive detail for priority_reason, study_strategy, and critical_topics_summary.
2. If there are more than 30 minor subtopics, aggregate them into broader themes to keep the array size manageable but do not lose critical detail.
3. Priority score must be a number from 1 to 10.
4. Marks weightage must be an estimated percentage of total marks.
5. Learning approach must be a detailed string of 2 to 3 sentences explaining exactly HOW the student should study this topic.`;

  if (lang === 'np') {
    return `${base}\n\nIMPORTANT: Write all descriptive strings (paper_name, topic_name, priority_reason, study_strategy, critical_topics_summary, learning_approach, common_mistakes) in Pure Nepali. Always include relevant English technical terms in brackets [English Term] immediately after their Nepali counterparts.`;
  }
  return base;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { examId, userId, language } = body;

    const supabase = await createClient();

    // Fetch user language preference from DB for true sync
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('language')
      .eq('user_id', userId)
      .maybeSingle();
    
    const userLang = language || prefs?.language || 'en';

    if (!examId || !userId) {
      return NextResponse.json({ success: false, message: 'Missing examId or userId' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }


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
    const analysisData = await generateJSON(getSystemInstruction(userLang), userMessage);

    console.log(`[DEBUG] Analysis complete. Found ${analysisData.exam_overview?.total_topics || 0} total topics.`);

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
