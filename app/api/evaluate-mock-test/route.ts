import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateMultimodalJSON } from '@/lib/ai';

const EVALUATION_SYSTEM_PROMPT = `You are an expert PSC Nepal (Loksewa Ayog) Examiner.
Your task is to grade a student's handwritten answer sheet against the provided Mock Test questions.

1.  **OCR & Reading**: Accurately transcribe and understand the handwritten content from the provided image(s).
2.  **Grading**: Evaluate each answer based on accuracy, relevance, and presentation.
3.  **Feedback**: Provide constructive feedback for each question. Highlight what they did well and where they can improve.
4.  **Overall Assessment**: Summarize their performance and provide a total score.

Return ONLY valid JSON in this format:
{
  "total_score": number,
  "total_marks": number,
  "overall_feedback": "string",
  "breakdown": [
    {
      "question_id": "string",
      "question_text": "string",
      "marks_awarded": number,
      "max_marks": number,
      "feedback": "string"
    }
  ]
}`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fileUrl, testJson, userId, examId, submissionId } = body;

    if (!fileUrl || !testJson || !userId) {
      return NextResponse.json({ success: false, message: 'Missing required parameters' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Download file from Supabase Storage to send to Gemini
    // Extract bucket and path from URL
    const urlParts = fileUrl.split('/storage/v1/object/public/');
    if (urlParts.length < 2) throw new Error('Invalid file URL');
    
    const fullPath = urlParts[1];
    const bucket = fullPath.split('/')[0];
    const path = fullPath.split('/').slice(1).join('/');

    const { data: fileData, error: downloadError } = await supabase.storage.from(bucket).download(path);
    if (downloadError || !fileData) {
      throw new Error(`Failed to download answer sheet: ${downloadError?.message}`);
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());
    const base64Data = buffer.toString('base64');
    const mimeType = fileData.type || 'image/jpeg';

    // 2. Formulate Prompt
    const userMessage = `Grading Request:
Test Title: ${testJson.title}
Instructions: ${testJson.instructions}

Questions to Grade:
${JSON.stringify(testJson.sections || testJson.questions, null, 2)}

Attached is the student's answer sheet. Please evaluate it.`;

    // 3. Call Gemini Vision
    const evaluation = await generateMultimodalJSON(
      EVALUATION_SYSTEM_PROMPT,
      userMessage,
      [{ mimeType, data: base64Data }]
    );

    // 4. Update/Save Submission in DB
    const updateData = {
      user_id: userId,
      exam_id: examId,
      test_title: testJson.title,
      test_json: testJson,
      file_url: fileUrl,
      score: evaluation.total_score,
      total_marks: evaluation.total_marks,
      feedback: evaluation.overall_feedback,
      breakdown: evaluation.breakdown,
    };

    let result;
    if (submissionId) {
      const { data, error } = await supabase
        .from('mock_test_submissions')
        .update(updateData)
        .eq('id', submissionId)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('mock_test_submissions')
        .insert(updateData)
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    return NextResponse.json({
      success: true,
      submission: result
    });

  } catch (error: any) {
    console.error('Evaluate Mock Test Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
