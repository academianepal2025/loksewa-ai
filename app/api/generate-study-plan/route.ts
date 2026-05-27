import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateJSON } from '@/lib/ai';

function getSystemInstruction(lang: string) {
  const base = `You are a PSC Nepal exam preparation coach creating a precise and academically rigorous day by day study plan. You have been given a detailed syllabus analysis that includes the exact question types asked from each topic, the recommended study sequence, priority scores, and specific learning approaches for each topic. Use ALL of this information to create a study plan that tells the student not just WHAT to study each day but HOW to study it and WHAT SPECIFIC THINGS to focus on.

STRICT GENERATION CONSTRAINTS:
- You MUST generate exactly {{totalDays}} entries in the daily_plans array, with no gaps and no repetitions.
- Each date MUST be calculated sequentially starting from {{startDate}}.
- Week numbers MUST go from 1 to {{totalWeeks}} with every week present.
- Every 7th day MUST be a revision day.
- The last 7 days MUST be mock_test days.
- Sundays MUST be marked as rest days based on real calendar calculation.

TOPIC ALLOCATION RULES:
- Topics with priority_score 9-10 get the most days.
- Topics with priority_score 7-8 get more days than average.
- Topics with priority_score 4-6 get average days.
- Topics with priority_score 1-3 get minimum 1 day.
- You MUST follow the study_sequence_order from the analysis. Never put an advanced topic before its foundational prerequisites.

Return ONLY valid JSON matching this exact schema:
{
  "total_days": number,
  "exam_date": "string",
  "daily_plans": [
    {
      "day_number": number,
      "date": "string (YYYY-MM-DD)",
      "day_type": "study" | "revision" | "rest" | "mock_test",
      "week_number": number,
      "primary_topic": "string",
      "secondary_topic": "string or null",
      "subtopics_to_cover": ["string"],
      "estimated_hours": number,
      "learning_objective": "string",
      "study_method": "string",
      "focus_points": ["string"],
      "avoid_mistakes": "string",
      "exam_connection": "string",
      "resources_hint": "string",
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
    return `${base}\n\nIMPORTANT: Write all descriptive strings (primary_topic, secondary_topic, subtopics_to_cover, study_tips, weekly_goal, learning_objective, study_method, focus_points, avoid_mistakes, exam_connection, resources_hint) in Pure Nepali. Always include relevant English technical terms in brackets [English Term] immediately after their Nepali counterparts.`;
  }
  return base;
}

function validateStudyPlan(plan: any, expectedDays: number, expectedWeeks: number, startDate: string) {
  if (!plan.daily_plans || !Array.isArray(plan.daily_plans)) {
    throw new Error("Validation Failed: daily_plans is missing or not an array.");
  }
  if (plan.daily_plans.length !== expectedDays) {
    throw new Error(`Validation Failed: Expected ${expectedDays} daily_plans, but got ${plan.daily_plans.length}.`);
  }

  const start = new Date(startDate);
  
  for (let i = 0; i < plan.daily_plans.length; i++) {
    const day = plan.daily_plans[i];
    if (day.day_number !== i + 1) {
      throw new Error(`Validation Failed: Missing or out-of-order day_number at index ${i}. Expected ${i + 1}, got ${day.day_number}.`);
    }
    
    // Check sequential date (basic check)
    const expectedDate = new Date(start);
    expectedDate.setDate(expectedDate.getDate() + i);
    const expectedDateStr = expectedDate.toISOString().split('T')[0];
    if (day.date !== expectedDateStr) {
       throw new Error(`Validation Failed: Incorrect date at day ${day.day_number}. Expected ${expectedDateStr}, got ${day.date}.`);
    }

    if (!day.week_number) {
       throw new Error(`Validation Failed: Missing week_number at day ${day.day_number}.`);
    }
  }

  if (!plan.weekly_targets || !Array.isArray(plan.weekly_targets)) {
    throw new Error("Validation Failed: weekly_targets is missing or not an array.");
  }
  if (plan.weekly_targets.length !== expectedWeeks) {
    throw new Error(`Validation Failed: Expected ${expectedWeeks} weekly_targets, but got ${plan.weekly_targets.length}.`);
  }
  for (let i = 0; i < plan.weekly_targets.length; i++) {
    const week = plan.weekly_targets[i];
    if (week.week_number !== i + 1) {
      throw new Error(`Validation Failed: Missing or out-of-order week_number at index ${i}. Expected ${i + 1}, got ${week.week_number}.`);
    }
  }
}


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { examId, userId, overrideDays, overrideHours, language } = body;

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
    today.setHours(0, 0, 0, 0);
    const examDate = new Date(exam.exam_date);
    examDate.setHours(0, 0, 0, 0);
    
    // Accurate calculation based on midnights to prevent timezone skipping
    const diffTime = Math.max(0, examDate.getTime() - today.getTime());
    const calculatedDaysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const totalDays = overrideDays || Math.max(1, calculatedDaysRemaining);
    const studyHours = overrideHours || exam.daily_study_hours;
    const startDate = today.toISOString().split('T')[0];
    const totalWeeks = Math.ceil(totalDays / 7);

    console.log(`[DEBUG] Study Plan calculation: startDate=${startDate}, totalDays=${totalDays}, totalWeeks=${totalWeeks}, examDate=${exam.exam_date}`);

    let systemInstruction = getSystemInstruction(userLang)
      .replace('{{totalDays}}', totalDays.toString())
      .replace('{{startDate}}', startDate)
      .replace('{{totalWeeks}}', totalWeeks.toString());

    const userMessage = `Constraints:
Start Date: ${startDate}
Exam Date: ${exam.exam_date}
Total Days: ${totalDays}
Total Weeks: ${totalWeeks}
Daily Hours: ${studyHours}
Exam Name: ${exam.exam_name}

Instructions:
Generate exactly ${totalDays} daily plan entries starting from ${startDate}. Use the recommended_study_sequence to determine the order of topics. For each topic use the learning_approach, key_facts_to_memorize, question_types, and common_mistakes fields from the analysis to fill in the new fields in each daily plan entry. Do not invent information — only use what is provided in the analysis.

Syllabus Analysis JSON:
${JSON.stringify(analysis.analysis_data, null, 2)}`;

    console.log(`Generating study plan for ${exam.exam_name} (${totalDays} days remaining, ${studyHours} hours/day)...`);
    let planData = await generateJSON(systemInstruction, userMessage);

    // Normalize potential nested structures from Gemini
    if (planData.plan && Array.isArray(planData.plan.daily_plans)) {
      planData = planData.plan;
    } else if (planData.study_plan && Array.isArray(planData.study_plan.daily_plans)) {
      planData = planData.study_plan;
    }

    try {
       validateStudyPlan(planData, totalDays, totalWeeks, startDate);
       console.log("[DEBUG] Study plan passed rigorous validation.");
    } catch (valError: any) {
       console.error("[ERROR] Study plan validation failed:", valError.message);
       throw new Error(`AI generated an invalid plan: ${valError.message}`);
    }

    // 5. Delete existing study plans for this exam to ensure only one active plan exists
    console.log('Purging old study plans...');
    await supabase.from('study_plans').delete().eq('exam_id', examId).eq('user_id', userId);

    console.log('Saving new plan to database...');
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

    // Log AI Usage
    try {
      const { logAiUsage } = await import('@/lib/ai-logger');
      await logAiUsage({ userId, feature: 'study_plan' });
    } catch (e) {
      console.warn("Failed to log AI usage for study plan:", e);
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
