'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useDashboard } from '@/components/dashboard/DashboardProvider';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip } from '@/components/ui/tooltip';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, RadialBarChart, RadialBar, Cell
} from 'recharts';
import { 
  TrendingUp, Clock, Target, Calendar, CheckCircle, 
  AlertTriangle, RefreshCw, Sparkles, PenTool, ArrowRight, Activity, BookOpen
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/navigation';

export default function PerformancePage() {
  const { activeExamId, setActiveExamId, language, t } = useDashboard();
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    studyStreak: 0,
    totalHours: 0,
    quizAvg: 0,
    mockAvg: 0,
    daysToExam: 0
  });
  const [gapData, setGapData] = useState<any>(null);
  const [quizData, setQuizData] = useState<any[]>([]);
  const [topicAverages, setTopicAverages] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<Record<string, number>>({});
  const [timeAllocation, setTimeAllocation] = useState<any[]>([]);
  const [roadmapProgress, setRoadmapProgress] = useState(0);
  const [predictedScore, setPredictedScore] = useState(0);
  const [exams, setExams] = useState<any[]>([]);
  
  const [feedback, setFeedback] = useState<string | null>(null);
  const [generatingFeedback, setGeneratingFeedback] = useState(false);
  const [analyzingGaps, setAnalyzingGaps] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return;

      setLoading(true);
      
      try {
        // Fetch all exams for the switcher
        const { data: allExams } = await supabase.from('user_exams').select('id, exam_name').eq('user_id', user.id).order('exam_date', { ascending: true });
        if (allExams) setExams(allExams);

        let currentExamId = activeExamId;
        
        if (!currentExamId) {
          if (allExams && allExams.length > 0) {
            currentExamId = allExams[0].id;
            setActiveExamId(allExams[0].id);
          } else {
            setLoading(false);
            return;
          }
        }

        // Fetch Exam Data
        const { data: examData } = await supabase
          .from('user_exams')
          .select('exam_date')
          .eq('id', currentExamId)
          .single();

        let daysToExam = 0;
        if (examData?.exam_date) {
          const diff = new Date(examData.exam_date).getTime() - new Date().getTime();
          daysToExam = Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
        }

        // Fetch Study Plan to get progress for this specific exam
        const { data: plan } = await supabase
          .from('study_plans')
          .select('id')
          .eq('exam_id', currentExamId)
          .maybeSingle();

        // Fetch Study Progress for this specific plan
        let progress = null;
        if (plan) {
          const { data: prog } = await supabase
            .from('study_progress')
            .select('completed_at, day_number, is_completed')
            .eq('plan_id', plan.id);
          progress = prog;
        }

        // Assuming estimated hours is ~2 per completed day if not recorded
        let totalHours = 0;
        let streak = 0;
        const heat: Record<string, number> = {};

        if (progress) {
          const completed = progress.filter((p: any) => p.is_completed && p.completed_at);
          totalHours = completed.length * 2; // Rough estimate 2 hours per completed session
          
          // Calculate streak (consecutive days ending today or yesterday)
          const dates = completed.map((p: any) => new Date(p.completed_at!).toISOString().split('T')[0]).sort().reverse();
          const uniqueDates = Array.from(new Set(dates));
          
          if (uniqueDates.length > 0) {
            let current = new Date(uniqueDates[0] as string);
            let today = new Date();
            const diffDays = Math.floor((today.getTime() - current.getTime()) / (1000 * 3600 * 24));
            
            if (diffDays <= 1) {
              streak = 1;
              for (let i = 1; i < uniqueDates.length; i++) {
                const prev = new Date(uniqueDates[i] as string);
                if (Math.floor((current.getTime() - prev.getTime()) / (1000 * 3600 * 24)) === 1) {
                  streak++;
                  current = prev;
                } else {
                  break;
                }
              }
            }
          }

          // Populate heatmap
          completed.forEach((p: any) => {
            const dateStr = new Date(p.completed_at!).toISOString().split('T')[0];
            heat[dateStr] = (heat[dateStr] || 0) + 1;
          });
          // Calculate Time Allocation and Roadmap Progress
          if (plan?.plan_data?.daily_plans) {
            const dailyPlans = plan.plan_data.daily_plans;
            const completedDays = new Set(progress.filter((p: any) => p.is_completed).map((p: any) => p.day_number));
            
            setRoadmapProgress(Math.round((completedDays.size / dailyPlans.length) * 100));

            const timeMap: Record<string, number> = {};
            dailyPlans.forEach((dp: any) => {
              if (completedDays.has(dp.day_number)) {
                const topic = dp.primary_topic || 'General';
                timeMap[topic] = (timeMap[topic] || 0) + (dp.estimated_hours || 2);
              }
            });

            const tAlloc = Object.entries(timeMap).map(([topic, hours]) => ({
              name: topic,
              value: hours
            })).sort((a, b) => b.value - a.value).slice(0, 5);
            setTimeAllocation(tAlloc);
          }
        }
        setHeatmapData(heat);

        // Initialize metrics
        let quizAvg = 0;
        let mockAvg = 0;
        const topicMap: Record<string, { total: number, count: number }> = {};

        // Fetch Quiz Attempts
        try {
          const { data: quizzes, error: qError } = await supabase
            .from('quiz_attempts')
            .select('score, total_questions, created_at, topic')
            .eq('user_id', user.id)
            .eq('exam_id', currentExamId)
            .order('created_at', { ascending: true });

          if (qError) throw qError;

          if (quizzes && quizzes.length > 0) {
            const totalPct = quizzes.reduce((acc: number, q: any) => {
              const pct = (q.score / (q.total_questions || 1)) * 100;
              return acc + pct;
            }, 0);
            quizAvg = Math.round(totalPct / quizzes.length);

            const qChart = quizzes.map((q: any, i: number) => ({
              name: `Q${i + 1}`,
              score: Math.round((q.score / (q.total_questions || 1)) * 100),
              topic: q.topic || 'General',
              date: new Date(q.created_at).toLocaleDateString()
            }));
            setQuizData(qChart);

            quizzes.forEach((q: any) => {
              const topic = q.topic || 'General';
              const pct = (q.score / (q.total_questions || 1)) * 100;
              if (!topicMap[topic]) topicMap[topic] = { total: 0, count: 0 };
              topicMap[topic].total += pct;
              topicMap[topic].count += 1;
            });

            const tAvgs = Object.keys(topicMap).map(k => ({
              topic: k,
              avg: Math.round(topicMap[k].total / topicMap[k].count)
            })).sort((a, b) => a.avg - b.avg);
            setTopicAverages(tAvgs);
          }
        } catch (e) {
          console.error("Failed to fetch quizzes:", e);
          setQuizData([]);
          setTopicAverages([]);
        }

        // Fetch Mock Tests
        try {
          const { data: mocks, error: mError } = await supabase
            .from('mock_test_submissions')
            .select('score_percentage')
            .eq('user_id', user.id)
            .eq('exam_id', currentExamId);
          
          if (mError) throw mError;

          if (mocks && mocks.length > 0) {
            const totalMock = mocks.reduce((acc: number, m: any) => acc + (m.score_percentage || 0), 0);
            mockAvg = Math.round(totalMock / mocks.length);
          }
        } catch (e) {
          console.error("Failed to fetch mock tests:", e);
        }
        // Fetch Weekly Feedback
        const { data: latestFeedback } = await supabase
          .from('weekly_feedback')
          .select('feedback_text')
          .eq('user_id', user.id)
          .eq('exam_id', currentExamId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latestFeedback) {
          setFeedback(latestFeedback.feedback_text);
        } else {
          setFeedback(null);
        }

        const predicted = mockAvg > 0 
          ? Math.round((quizAvg * 0.4) + (mockAvg * 0.6)) 
          : quizAvg;
        
        setPredictedScore(predicted);

        setStats({
          studyStreak: streak,
          totalHours: totalHours,
          quizAvg: quizAvg,
          mockAvg: mockAvg,
          daysToExam: daysToExam
        });

      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [activeExamId, supabase]);

  const refreshData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user || !activeExamId) return;

    setLoading(true);
    
    let quizAvg = 0;
    let mockAvg = 0;
    const topicMap: Record<string, { total: number, count: number }> = {};

    // 1. Fetch Quiz Attempts
    try {
      const { data: quizzes, error: qError } = await supabase
        .from('quiz_attempts')
        .select('score, total_questions, created_at, topic')
        .eq('user_id', user.id)
        .eq('exam_id', activeExamId)
        .order('created_at', { ascending: true });

      if (qError) throw qError;

      if (quizzes && quizzes.length > 0) {
        const totalPct = quizzes.reduce((acc: number, q: any) => {
          const pct = (q.score / (q.total_questions || 1)) * 100;
          return acc + pct;
        }, 0);
        quizAvg = Math.round(totalPct / quizzes.length);

        const qChart = quizzes.map((q: any, i: number) => ({
          name: `Q${i + 1}`,
          score: Math.round((q.score / (q.total_questions || 1)) * 100),
          topic: q.topic || 'General',
          date: new Date(q.created_at).toLocaleDateString()
        }));
        setQuizData(qChart);

        quizzes.forEach((q: any) => {
          const topic = q.topic || 'General';
          const pct = (q.score / (q.total_questions || 1)) * 100;
          if (!topicMap[topic]) topicMap[topic] = { total: 0, count: 0 };
          topicMap[topic].total += pct;
          topicMap[topic].count += 1;
        });

        const tAvgs = Object.keys(topicMap).map(k => ({
          topic: k,
          avg: Math.round(topicMap[k].total / topicMap[k].count)
        })).sort((a, b) => a.avg - b.avg);
        setTopicAverages(tAvgs);
      } else {
        setQuizData([]);
        setTopicAverages([]);
      }
    } catch (e) {
      console.error("Failed to refresh quizzes:", e);
    }

    // 2. Fetch Mock Tests
    try {
      const { data: mocks, error: mError } = await supabase
        .from('mock_test_submissions')
        .select('score_percentage')
        .eq('user_id', user.id)
        .eq('exam_id', activeExamId);

      if (mError) throw mError;

      if (mocks && mocks.length > 0) {
        const totalMock = mocks.reduce((acc: number, m: any) => acc + (m.score_percentage || 0), 0);
        mockAvg = Math.round(totalMock / mocks.length);
      }
    } catch (e) {
      console.error("Failed to refresh mock tests:", e);
    }

    setStats(prev => ({
      ...prev,
      quizAvg: quizAvg,
      mockAvg: mockAvg
    }));

    setLoading(false);
  };

  const fetchGapAnalysis = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user || !activeExamId) return;

    setAnalyzingGaps(true);
    try {
      const res = await fetch('/api/analyze-gaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId: activeExamId, userId: user.id })
      });
      const data = await res.json();
      if (data.success) {
        setGapData(data);
      }
    } catch (error) {
      console.error("Failed to fetch gap analysis:", error);
    } finally {
      setAnalyzingGaps(false);
    }
  };

  useEffect(() => {
    if (!activeExamId) return;
    fetchGapAnalysis();
  }, [activeExamId]);

  const generateFeedback = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user || !activeExamId) return;

    setGeneratingFeedback(true);
    try {
      const res = await fetch('/api/generate-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId: activeExamId, language })
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(data.feedback);
      }
    } catch (error) {
      console.error("Failed to generate feedback:", error);
    } finally {
      setGeneratingFeedback(false);
    }
  };

  // Generate last 90 days array for Heatmap
  const today = new Date();
  const heatmapDays = Array.from({ length: 90 }, (_, i) => {
    const d = new Date(today.getTime() - (89 - i) * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    return {
      date: dateStr,
      count: heatmapData[dateStr] || 0
    };
  });

  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-in fade-in duration-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />)}
        </div>
        <Skeleton className="h-[400px] rounded-3xl w-full bg-zinc-200 dark:bg-zinc-800" />
      </div>
    );
  }

  if (!activeExamId) {
    return (
      <div className="p-8 flex items-center justify-center h-[60vh]">
        <div className="text-center p-8 bg-surface border border-border-subtle rounded-2xl max-w-md">
          <BookOpen className="w-12 h-12 text-subtle mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground">No Exam Selected</h2>
          <p className="text-subtle mt-2 mb-6">Create or select an exam in your settings to view performance analytics.</p>
          <button onClick={() => router.push('/dashboard/settings')} className="bg-foreground text-background px-4 py-2 rounded-xl font-medium text-sm">Go to Settings</button>
        </div>
      </div>
    );
  }

  const overallCoverage = gapData?.analysis?.overall_coverage_percentage || 0;
  const pieData = [{ name: 'Coverage', value: overallCoverage, fill: '#10b981' }]; // Emerald 500

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-7xl mx-auto">
      
      {/* EXAM SELECTOR HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight leading-tight">
          Performance <span className="text-accent">Analytics</span>
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={refreshData} 
            className="p-2 text-subtle hover:text-accent transition-colors rounded-lg bg-background border border-border-subtle"
            title="Refresh Stats"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {exams.map(e => (
            <button 
              key={e.id} 
              onClick={() => setActiveExamId(e.id)} 
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all min-h-[36px] shadow-sm ${activeExamId === e.id ? 'bg-[#1e3a5f] text-[#c9a84c] shadow-[#1e3a5f]/10' : 'bg-background border border-border-subtle text-subtle hover:text-foreground'}`}
            >
              {e.exam_name}
            </button>
          ))}
        </div>
      </div>

      {/* HEADER STATS */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-surface border border-border-subtle p-6 rounded-2xl flex flex-col justify-between">
          <p className="text-sm font-medium text-subtle flex items-center gap-2"><Activity className="w-4 h-4"/> Study Streak</p>
          <div className="mt-4">
            <span className="text-3xl font-bold text-foreground">{stats.studyStreak}</span>
            <span className="text-sm text-subtle ml-1">Days</span>
          </div>
        </div>
        <div className="bg-surface border border-border-subtle p-6 rounded-2xl flex flex-col justify-between">
          <p className="text-sm font-medium text-subtle flex items-center gap-2"><Target className="w-4 h-4"/> Quiz Avg</p>
          <div className="mt-4">
            <span className="text-3xl font-bold text-foreground">{stats.quizAvg}%</span>
          </div>
        </div>
        <div className="bg-surface border border-border-subtle p-6 rounded-2xl flex flex-col justify-between">
          <p className="text-sm font-medium text-subtle flex items-center gap-2"><PenTool className="w-4 h-4"/> Mock Avg</p>
          <div className="mt-4">
            <span className="text-3xl font-bold text-foreground">{stats.mockAvg}%</span>
          </div>
        </div>
        <div className="bg-surface border border-border-subtle p-6 rounded-2xl flex flex-col justify-between">
          <p className="text-sm font-medium text-subtle flex items-center gap-2"><Sparkles className="w-4 h-4"/> Predicted Score</p>
          <div className="mt-4">
            <span className="text-3xl font-bold text-accent">{predictedScore}%</span>
            <div className="h-1 w-full bg-border-subtle rounded-full mt-2"><div className="h-full bg-accent rounded-full" style={{ width: `${predictedScore}%` }} /></div>
          </div>
        </div>
        <div className="bg-surface border border-border-subtle p-6 rounded-2xl flex flex-col justify-between">
          <p className="text-sm font-medium text-subtle flex items-center gap-2"><TrendingUp className="w-4 h-4"/> Mission Progress</p>
          <div className="mt-4">
            <span className="text-3xl font-bold text-foreground">{roadmapProgress}%</span>
            <div className="h-1 w-full bg-border-subtle rounded-full mt-2"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${roadmapProgress}%` }} /></div>
          </div>
        </div>
        <div className="bg-accent/5 border border-accent/20 p-6 rounded-2xl flex flex-col justify-between">
          <p className="text-sm font-medium text-accent flex items-center gap-2"><Calendar className="w-4 h-4"/> Days left</p>
          <div className="mt-4">
            <span className="text-3xl font-bold text-accent">{stats.daysToExam}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* GAP ANALYSIS PANEL */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface border border-border-subtle rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-accent"/> Notes Coverage
              </h2>
              <button onClick={fetchGapAnalysis} disabled={analyzingGaps} className="p-2 text-subtle hover:text-foreground transition-colors rounded-full hover:bg-background">
                <RefreshCw className={`w-4 h-4 ${analyzingGaps ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {analyzingGaps && !gapData ? (
               <div className="flex flex-col items-center justify-center py-12 space-y-4">
                 <RefreshCw className="w-8 h-8 text-accent animate-spin" />
                 <p className="text-sm text-subtle">Analyzing syllabus coverage...</p>
               </div>
            ) : gapData ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center justify-center">
                   <div className="w-40 h-40">
                     <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart 
                          cx="50%" cy="50%" 
                          innerRadius="70%" outerRadius="100%" 
                          barSize={10} data={pieData}
                          startAngle={90} endAngle={-270}
                        >
                          <RadialBar background dataKey="value" cornerRadius={10} />
                          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold fill-foreground">
                            {overallCoverage}%
                          </text>
                        </RadialBarChart>
                     </ResponsiveContainer>
                   </div>
                   <p className="text-sm font-medium text-subtle mt-2">Overall Syllabus Coverage</p>
                </div>

                <div className="md:col-span-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 bg-surface/90 backdrop-blur pb-2 z-10">
                      <tr className="text-subtle font-medium border-b border-border-subtle">
                        <th className="pb-2 font-medium">Topic</th>
                        <th className="pb-2 font-medium">Coverage</th>
                        <th className="pb-2 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle/50">
                      {gapData.coverage_data?.map((gap: any, i: number) => (
                        <tr key={i} className="group">
                          <td className="py-3 pr-4 font-medium text-foreground max-w-[200px] truncate" title={gap.topic}>{gap.topic}</td>
                          <td className="py-3">
                            {gap.coverage_status === 'good' && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"><CheckCircle className="w-3 h-3 mr-1"/> Good</span>}
                            {gap.coverage_status === 'partial' && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">Partial</span>}
                            {gap.coverage_status === 'missing' && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20"><AlertTriangle className="w-3 h-3 mr-1"/> Missing</span>}
                          </td>
                          <td className="py-3 text-right">
                            {gap.coverage_status === 'missing' && (
                              <button 
                                onClick={() => router.push(`/dashboard/guru?query=I need notes and an explanation for the topic: ${encodeURIComponent(gap.topic)}`)}
                                className="text-xs bg-accent text-white px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-auto font-medium"
                              >
                                Fill Gap <ArrowRight className="w-3 h-3"/>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-subtle border border-dashed border-border-subtle rounded-xl bg-background/50">
                <p>Click refresh to analyze your notes coverage.</p>
              </div>
            )}
          </div>

          {/* QUIZ PERFORMANCE CHARTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface border border-border-subtle rounded-2xl p-6">
              <h3 className="text-sm font-bold text-subtle uppercase tracking-wider mb-6">Quiz Scores Over Time</h3>
              <div className="h-64">
                {quizData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={quizData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border-subtle opacity-30" />
                      <XAxis dataKey="name" tick={{fill: '#888888', fontSize: 12}} axisLine={false} tickLine={false} />
                      <YAxis tick={{fill: '#888888', fontSize: 12}} axisLine={false} tickLine={false} domain={[0, 100]} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', borderRadius: '12px', color: 'var(--text-foreground)' }}
                        itemStyle={{ color: 'var(--text-foreground)' }}
                      />
                      <Line type="monotone" dataKey="score" stroke="currentColor" className="text-accent" strokeWidth={3} dot={{ fill: 'currentColor', className: 'text-accent', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-subtle text-sm">No quiz data available</div>
                )}
              </div>
            </div>

            <div className="bg-surface border border-border-subtle rounded-2xl p-6">
              <h3 className="text-sm font-bold text-subtle uppercase tracking-wider mb-6">Average by Topic (%)</h3>
              <div className="h-64">
                {topicAverages.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topicAverages} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="currentColor" className="text-border-subtle opacity-30" />
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis dataKey="topic" type="category" tick={{fill: '#888888', fontSize: 11}} axisLine={false} tickLine={false} width={80} />
                      <RechartsTooltip cursor={{fill: 'var(--bg-background)'}} contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', borderRadius: '12px' }}/>
                      <Bar dataKey="avg" radius={[0, 4, 4, 0]}>
                        {topicAverages.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.avg < 50 ? '#ef4444' : entry.avg < 75 ? '#f59e0b' : '#10b981'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-subtle text-sm">No topic data available</div>
                )}
              </div>
            </div>

            <div className="bg-surface border border-border-subtle rounded-2xl p-6 md:col-span-2">
              <h3 className="text-sm font-bold text-subtle uppercase tracking-wider mb-6">Time Allocation (Hours by Subject)</h3>
              <div className="h-64">
                {timeAllocation.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={timeAllocation} margin={{ top: 0, right: 20, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border-subtle opacity-30" />
                      <XAxis dataKey="name" tick={{fill: '#888888', fontSize: 10}} axisLine={false} tickLine={false} />
                      <YAxis tick={{fill: '#888888', fontSize: 10}} axisLine={false} tickLine={false} />
                      <RechartsTooltip cursor={{fill: 'var(--bg-background)'}} contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', borderRadius: '12px' }}/>
                      <Bar dataKey="value" fill="var(--color-accent)" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-subtle text-sm">Start your roadmap missions to see subject-wise time allocation.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* WEAKEST TOPICS */}
          {topicAverages.length > 0 && (
            <div className="bg-surface border border-border-subtle rounded-2xl p-6">
              <h3 className="text-sm font-bold text-subtle uppercase tracking-wider mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" /> Focus Areas
              </h3>
              <div className="space-y-3">
                {topicAverages.slice(0, 3).map((t, i) => (
                  <div key={i} className="p-3 border border-red-500/20 bg-red-500/5 rounded-xl flex items-center justify-between">
                     <span className="text-sm font-medium text-foreground truncate max-w-[150px]">{t.topic}</span>
                     <span className="text-sm font-bold text-red-600">{t.avg}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI FEEDBACK */}
          <div className="bg-surface border border-border-subtle rounded-2xl p-6 flex flex-col h-full min-h-[300px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-subtle uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" /> Weekly Feedback
              </h3>
            </div>
            
            <div className="flex-grow prose prose-sm dark:prose-invert prose-headings:text-foreground prose-headings:font-bold prose-p:text-foreground/90 max-w-none overflow-y-auto mb-4 custom-scrollbar">
               {generatingFeedback ? (
                 <div className="flex flex-col items-center justify-center h-full space-y-4 py-8">
                   <RefreshCw className="w-6 h-6 text-accent animate-spin" />
                   <p className="text-xs text-subtle text-center">Coach is reviewing your progress...</p>
                 </div>
               ) : feedback ? (
                 <ReactMarkdown>{feedback}</ReactMarkdown>
               ) : (
                 <div className="flex flex-col items-center justify-center h-full text-center text-subtle py-8">
                   <p className="text-sm">Get personalized coaching based on this week's data.</p>
                 </div>
               )}
            </div>

            <button 
              onClick={generateFeedback}
              disabled={generatingFeedback}
              className="w-full py-2.5 bg-background hover:bg-accent/5 text-foreground hover:text-accent border border-border-subtle hover:border-accent/30 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 mt-auto"
            >
              {feedback ? 'Regenerate Feedback' : 'Generate Feedback'} 
              <Sparkles className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* HEATMAP */}
      <div className="bg-surface border border-border-subtle rounded-2xl p-6 overflow-x-auto">
        <h3 className="text-sm font-bold text-subtle uppercase tracking-wider mb-6">Study Heatmap (Last 90 Days)</h3>
        <div className="flex gap-1 min-w-max pb-2">
          {heatmapDays.map((day, i) => {
            const intensity = day.count === 0 ? 'bg-background border border-border-subtle' : 
                              day.count === 1 ? 'bg-emerald-500/30 border border-emerald-500/20' : 
                              day.count === 2 ? 'bg-emerald-500/60 border border-emerald-500/20' : 
                              'bg-emerald-500 border border-emerald-600';
            return (
              <Tooltip key={i} content={`${day.count} sessions on ${day.date}`}>
                <div className={`w-3.5 h-3.5 rounded-sm ${intensity} transition-all hover:ring-2 ring-accent/50`} />
              </Tooltip>
            );
          })}
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs text-subtle justify-end min-w-max">
           <span>Less</span>
           <div className="w-3 h-3 rounded-sm bg-background border border-border-subtle"></div>
           <div className="w-3 h-3 rounded-sm bg-emerald-500/30 border border-emerald-500/20"></div>
           <div className="w-3 h-3 rounded-sm bg-emerald-500/60 border border-emerald-500/20"></div>
           <div className="w-3 h-3 rounded-sm bg-emerald-500 border border-emerald-600"></div>
           <span>More</span>
        </div>
      </div>

    </div>
  );
}
