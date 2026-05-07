import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateMultimodalJSON } from '@/lib/ai';
import { checkUserLimits } from '@/lib/checkUserLimits';

function getEvaluationPrompt(lang: string) {
  const isNp = lang === 'np';
  return `You are an expert PSC Nepal (Loksewa Ayog) Examiner.
Your task is to grade a student's handwritten answer sheet against the provided Mock Test questions.

1.  **OCR & Reading**: Accurately transcribe and understand the handwritten content from the provided image(s).
2.  **Grading**: Evaluate each answer based on accuracy, relevance, and presentation.
3.  **Feedback**: Provide constructive feedback for each question in ${isNp ? 'Nepali (with English terms in brackets)' : 'English'}. Highlight what they did well and where they can improve.
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
}

export async function POST(request: Request) {
  const supabase = await createClient();
  let body: any = null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    body = await request.json();
    const { fileUrl, testJson, examId, submissionId } = body;
    const userId = user.id;

    // Fetch user language preference from DB for true sync
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('language')
      .eq('user_id', userId)
      .maybeSingle();
    
    const userLang = prefs?.language || 'en';

    if (!fileUrl || !testJson) {
      return NextResponse.json({ success: false, message: 'Missing required parameters' }, { status: 400 });
    }

    // ── Step 0: Check Plan Limits ──────────────────────────────────
    const limits = await checkUserLimits(userId);
    if (!limits.allowed && limits.exceeded_limit === 'mock_test_limit') {
      return NextResponse.json(
        { error: 'limit_reached', limit_type: 'mock_test_limit' },
        { status: 403 }
      );
    }

    // 1. Download file from Supabase Storage to send to Gemini
    // Extract bucket and path from URL
    const urlParts = fileUrl.split('/storage/v1/object/public/');
    if (urlParts.length < 2) throw new Error('Invalid file URL');
    
    const fullPath = urlParts[1];
    const bucket = fullPath.split('/')[0];
    const path = fullPath.split('/').slice(1).join('/');

    const { data: fileData, error: downloadError } = await supabase.storage.from(bucket).download(path);
    if (downloadError || !fileData) {
      throw new Error(`Failed to download file: ${downloadError?.message}`);
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());
    const base64Image = buffer.toString('base64');
    const mimeType = fileData.type || 'image/jpeg';

    // 2. Prepare multimodal content
    const testContent = typeof testJson === 'string' ? testJson : JSON.stringify(testJson);
    const userPrompt = `Grade this answer sheet against these mock test questions:\n${testContent}`;

    // 3. Call Gemini
    const evaluation = await generateMultimodalJSON(
      getEvaluationPrompt(userLang), 
      userPrompt, 
      [{ mimeType, data: base64Image }]
    );

    // 4. Update submission in DB
    if (submissionId) {
       await supabase.from('mock_test_submissions').update({
         marks_obtained: evaluation.total_score,
         feedback: evaluation.overall_feedback,
         detailed_breakdown: evaluation.breakdown,
         evaluation_status: 'completed'
       }).eq('id', submissionId);
    }

    return NextResponse.json({ success: true, data: evaluation });

  } catch (error: any) {
    console.error('Evaluate Mock Test Error:', error);
    
    if (body?.submissionId) {
       await supabase.from('mock_test_submissions').update({
         evaluation_status: 'failed'
       }).eq('id', body.submissionId);
    }

    const status = error.status || 500;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}
