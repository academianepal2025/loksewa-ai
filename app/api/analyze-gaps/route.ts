import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateText } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const { examId, userId } = await request.json();

    if (!examId || !userId) {
      return NextResponse.json({ error: 'Missing examId or userId' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Fetch syllabus_analysis topics array for this exam
    const { data: syllabusData, error: syllabusError } = await supabase
      .from('syllabus_analysis')
      .select('topics')
      .eq('exam_id', examId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (syllabusError || !syllabusData || syllabusData.length === 0) {
      return NextResponse.json({ error: 'Failed to fetch syllabus analysis' }, { status: 404 });
    }

    const topics = syllabusData[0].topics || [];
    
    if (topics.length === 0) {
      return NextResponse.json({ error: 'No topics found in syllabus analysis' }, { status: 404 });
    }

    // 2 & 3. For each topic, count chunks and classify coverage
    const coverageData = [];
    let goodCount = 0;
    
    for (const topic of topics) {
      const topicName = topic.topic || topic.name || topic;
      const priority = topic.priority || 'medium';
      
      if (!topicName || typeof topicName !== 'string') continue;

      const { count, error: countError } = await supabase
        .from('document_chunks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('doc_type', 'notes')
        .ilike('content', `%${topicName}%`);

      const chunkCount = count || 0;
      let coverageStatus = 'missing';
      if (chunkCount >= 3) {
        coverageStatus = 'good';
        goodCount++;
      } else if (chunkCount >= 1) {
        coverageStatus = 'partial';
      }

      coverageData.push({
        topic: topicName,
        priority: priority,
        chunk_count: chunkCount,
        coverage_status: coverageStatus
      });
    }

    // 4. Call Gemini
    const systemInstruction = `You are analyzing a PSC Nepal exam student's study material gaps.
Based on topic coverage data, provide specific, actionable recommendations.
Prioritize gaps in critical and high priority topics.

Return ONLY valid JSON:
{
  "overall_coverage_percentage": number,
  "gaps": [
    {
      "topic": string,
      "coverage_status": "good" | "partial" | "missing",
      "syllabus_priority": string,
      "recommendation": string,
      "urgency": "immediate" | "soon" | "when_possible"
    }
  ],
  "strongest_areas": [string],
  "weakest_areas": [string],
  "immediate_action": string,
  "estimated_hours_to_fill_gaps": number
}`;

    const promptText = `Please analyze the following topic coverage data:\n\n${JSON.stringify(coverageData, null, 2)}`;

    const aiResponse = await generateText(promptText, systemInstruction);
    
    let parsedResponse;
    try {
      const jsonStr = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
      parsedResponse = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse AI JSON:', e);
      return NextResponse.json({ error: 'AI failed to return valid JSON' }, { status: 500 });
    }

    // 5. Return the analysis
    return NextResponse.json({
      success: true,
      coverage_data: coverageData,
      analysis: parsedResponse
    });

  } catch (error: any) {
    console.error('Analyze Gaps error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
