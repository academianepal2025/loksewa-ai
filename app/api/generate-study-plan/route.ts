import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateJSON } from '@/lib/ai';

function getSystemInstruction(lang: string) {
  const base = `You are a PSC Nepal exam preparation coach. Create a detailed day-by-day study plan following these strict rules:
- Allocate hours proportional to topic priority (critical=most, low=least)
- Insert revision sessions every 7 days for completed topics
- Reserve last 7 days entirely for full revision and mock tests
- One rest day every 7 days (Sunday)
- Start with foundational topics, progress to complex ones
- Group related subtopics in same session for better retention
- Each study day must have primary topic and optional secondary topic

Return ONLY valid JSON:
{
  "total_days": number,
  "exam_date": "string",
  "daily_plans": [
    {
      "day_number": number,
      "date": "string (YYYY-MM-DD)",
      "day_type": "study" | "revision" | "rest" | "mock_test",
      "primary_topic": "string",
      "secondary_topic": "string or null",
      "subtopics_to_cover": ["string"],
      "estimated_hours": number,
      "study_tips": "string",
      "is_revision": boolean,
      "revision_topics": ["string"]
    }
  ],
  "weekly_targets": [
    {
      "week_number": number,
      "topics_to_complete": ["string"],
      "revision_topics": ["string"],
      "weekly_goal": "string"
    }
  ]
}`;

  if (lang === 'np') {
    return `${base}\n\nIMPORTANT: Write all descriptive strings (primary_topic, secondary_topic, subtopics_to_cover, study_tips, weekly_goal) in Pure Nepali. Always include relevant English technical terms in brackets [English Term] immediately after their Nepali counterparts.`;
  }
  return base;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { examId, userId, overrideDays, overrideHours } = body;

    const supabase = await createClient();

    // Fetch user language preference from DB for true sync
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('language')
      .eq('user_id', userId)
      .maybeSingle();
    
    const userLang = prefs?.language || 'en';

    if (!examId || !userId) {
      return NextResponse.json({ success: false, message: 'Missing examId or userId' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }


    // If overrideHours is provided, update user_exams table
    if (overrideHours) {
      await supabase
        .from('user_exams')
        .update({ daily_study_hours: overrideHours })
        .eq('id', examId)
        .eq('user_id', userId);
    }

    // 1. Fetch syllabus_analysis for this examId
    const { data: analysis, error: analysisError } = await supabase
      .from('syllabus_analysis')
      .select('analysis_data')
      .eq('exam_id', examId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (analysisError || !analysis) {
      return NextResponse.json({
        success: false,
        message: 'No syllabus analysis found. Please analyze the syllabus first.'
      }, { status: 404 });
    }

    // 2. Fetch exam details
    const { data: exam, error: examError } = await supabase
      .from('user_exams')
      .select('exam_name, exam_date, daily_study_hours')
      .eq('id', examId)
      .single();

    if (examError || !exam) {
      throw new Error(`Failed to fetch exam details: ${examError?.message}`);
    }

    // 3. Calculate exact days remaining or use override
    const today = new Date();
    const examDate = new Date(exam.exam_date);
    const daysRemaining = overrideDays || Math.max(1, Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    const studyHours = overrideHours || exam.daily_study_hours;

    const userMessage = `Days remaining: ${daysRemaining}
Daily available hours: ${studyHours}
Exam Name: ${exam.exam_name}
Exam Date: ${exam.exam_date}
Syllabus Analysis JSON:
${JSON.stringify(analysis.analysis_data, null, 2)}`;

    console.log(`Generating study plan for ${exam.exam_name} (${daysRemaining} days remaining, ${studyHours} hours/day)...`);
    let planData = await generateJSON(getSystemInstruction(userLang), userMessage);

    // Normalize potential nested structures from Gemini
    if (planData.plan && Array.isArray(planData.plan.daily_plans)) {
      planData = planData.plan;
    } else if (planData.study_plan && Array.isArray(planData.study_plan.daily_plans)) {
      planData = planData.study_plan;
    }

    if (!planData.daily_plans || !Array.isArray(planData.daily_plans)) {
       throw new Error("AI returned an invalid study plan structure without daily_plans.");
    }

    // 5. Save to study_plans table
    console.log('Saving plan to database...');
    const { data: insertedPlan, error: insertError } = await supabase
      .from('study_plans')
      .insert({
        exam_id: examId,
        user_id: userId,
        plan_data: planData
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to save study plan: ${insertError.message}`);
    }

    // 6. Return plan JSON
    return NextResponse.json({
      success: true,
      plan: planData,
      id: insertedPlan.id
    });

  } catch (error: any) {
    console.error('Generate Study Plan Route Error:', error);
    const status = error.status || 500;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}
