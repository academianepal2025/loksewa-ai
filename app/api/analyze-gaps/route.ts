import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { examId, userId } = body;

    if (!examId || !userId) {
      return NextResponse.json({ success: false, message: 'Missing examId or userId' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Fetch the latest syllabus analysis
    const { data: analysisData, error: analysisError } = await supabase
      .from('syllabus_analysis')
      .select('analysis_data')
      .eq('exam_id', examId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (analysisError || !analysisData) {
      return NextResponse.json({ 
        success: false, 
        message: 'Syllabus analysis not found.' 
      }, { status: 404 });
    }

    const topics = (analysisData.analysis_data as any).topics || [];
    if (topics.length === 0) {
      return NextResponse.json({ 
        success: true, 
        analysis: { overall_coverage_percentage: 0 }, 
        coverage_data: [] 
      });
    }

    // 2. Fetch all ready study notes for this exam
    const { data: notes, error: notesError } = await supabase
      .from('study_notes')
      .select('topic, generation_status')
      .eq('exam_id', examId)
      .eq('generation_status', 'ready');

    const coveredTopics = new Set((notes || []).map(n => n.topic));

    // 3. Map syllabus topics to coverage status
    const coverage_data = topics.map((t: any) => {
      const isCovered = coveredTopics.has(t.topic_name);
      return {
        topic: t.topic_name,
        coverage_status: isCovered ? 'good' : 'missing'
      };
    });

    // 4. Calculate overall percentage
    const goodCount = coverage_data.filter((c: any) => c.coverage_status === 'good').length;
    const percentage = Math.round((goodCount / topics.length) * 100);

    return NextResponse.json({
      success: true,
      analysis: {
        overall_coverage_percentage: percentage
      },
      coverage_data
    });

  } catch (error: any) {
    console.error('Analyze Gaps Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
