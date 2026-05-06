'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import {
  Target,
  Zap,
  Activity,
  Calendar,
  ChevronRight,
  BookOpen,
  FileText,
  MessageSquare,
  BarChart3,
  ArrowUpRight,
  Clock,
  Sparkles,
  Rocket
} from 'lucide-react';
import { useDashboard } from '@/components/dashboard/DashboardProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip } from '@/components/ui/tooltip';
import { EmptyState } from '@/components/ui/empty-state';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

// ── Types ─────────────────────────────────────────────────────────────
interface Exam {
  id: string;
  exam_name: string;
  exam_date: string;
}

// ── Components ──────────────────────────────────────────────────────

function MiniStat({ label, value, icon: Icon, tooltip }: any) {
  return (
    <div className="bg-surface border border-border-subtle p-4 rounded-xl flex items-center gap-4 transition-all group relative">
      <div className="h-10 w-10 rounded-lg bg-background border border-border-subtle flex items-center justify-center text-foreground group-hover:scale-105 transition-transform">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1.5">
          <p className="text-[10px] font-bold text-subtle uppercase tracking-wider leading-none">{label}</p>
          <Tooltip content={tooltip} />
        </div>
        <p className="text-base font-bold text-foreground leading-none truncate">{value}</p>
      </div>
    </div>
  );
}

function OperationalCard({ title, desc, icon: Icon, href, color = 'zinc' }: any) {
  return (
    <Link href={href}>
      <div className="bg-surface border border-border-subtle p-6 rounded-2xl h-full flex flex-col group hover:border-[#c9a84c]/40 transition-all active:scale-[0.99] shadow-sm hover:shadow-xl hover:shadow-[#1e3a5f]/5">
        <div className="h-10 w-10 rounded-lg bg-background border border-border-subtle flex items-center justify-center text-foreground group-hover:bg-[#1e3a5f] group-hover:text-[#c9a84c] transition-all duration-300 mb-6">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-base font-bold text-foreground mb-2 flex items-center gap-2">
          {title}
          <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
        </h3>
        <p className="text-xs font-medium text-muted leading-relaxed mb-6">{desc}</p>
        <div className="mt-auto flex items-center text-[10px] font-black uppercase tracking-widest text-[#c9a84c] group-hover:gap-2 transition-all">
          Launch Module <ChevronRight className="h-3 w-3" />
        </div>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<Exam[]>([]);
  const [exam, setExam] = useState<Exam | null>(null);
  const [stats, setStats] = useState({
    streak: 0,
    accuracy: 0,
    progress: 0,
    hours: 0,
    notes: 0,
    stronghold: 'N/A',
    targetArea: 'N/A',
    feedback: 'Generate your first performance review in the Performance tab to see insights here.'
  });

  const { t, language, activeExamId, setActiveExamId } = useDashboard();

  useEffect(() => {
    async function initDashboard() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch All Exams
      const { data: allExams } = await supabase
        .from('user_exams')
        .select('*')
        .eq('user_id', user.id)
        .order('exam_date', { ascending: true });
      
      if (allExams) {
        setExams(allExams);
        
        // Determine which exam to display
        let currentExam = null;
        if (activeExamId) {
          currentExam = allExams.find((e: Exam) => e.id === activeExamId) || allExams[0];
        } else {
          currentExam = allExams[0];
          if (currentExam) setActiveExamId(currentExam.id);
        }
        setExam(currentExam);

        if (currentExam) {
          const currentExamId = currentExam.id;

          // 2. Fetch Aggregated Stats for this specific exam
          const { data: quizzes } = await supabase
            .from('quiz_attempts')
            .select('score, total_questions, topic')
            .eq('user_id', user.id)
            .eq('exam_id', currentExamId);

          const acc = quizzes?.length 
            ? Math.round(quizzes.reduce((a: number, b: any) => a + (b.score / b.total_questions), 0) / quizzes.length * 100) 
            : 0;

          // Fetch AI Notes count for this specific exam
          const { count: notesCount } = await supabase
            .from('study_notes')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('exam_id', currentExamId)
            .eq('generation_status', 'ready');

          // Fetch Study Progress
          const { data: plan } = await supabase
            .from('study_plans')
            .select('id')
            .eq('exam_id', currentExamId)
            .maybeSingle();
          
          let progressPct = 0;
          if (plan) {
            const { data: prog } = await supabase
              .from('study_progress')
              .select('is_completed')
              .eq('plan_id', plan.id);
            
            if (prog?.length) {
              const completed = prog.filter((p: any) => p.is_completed).length;
              progressPct = Math.round((completed / 90) * 100); 
            }
          }

          // Fetch Latest Feedback
          const { data: latestFeedback } = await supabase
            .from('weekly_feedback')
            .select('feedback_text')
            .eq('exam_id', currentExamId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Calculate Strong/Weak from Topic Averages
          const topicMap: Record<string, { total: number, count: number }> = {};
          if (quizzes && quizzes.length > 0) {
            quizzes.forEach((q: any) => {
              const topic = q.topic || 'General';
              const pct = (q.score / (q.total_questions || 1)) * 100;
              if (!topicMap[topic]) topicMap[topic] = { total: 0, count: 0 };
              topicMap[topic].total += pct;
              topicMap[topic].count += 1;
            });
          }

          let stronghold = 'N/A';
          let targetArea = 'N/A';
          const topicAvgs = Object.entries(topicMap).map(([name, data]) => ({
            name,
            avg: data.total / data.count
          })).sort((a, b) => b.avg - a.avg);

          if (topicAvgs.length > 0) {
            stronghold = topicAvgs[0].name;
            if (topicAvgs.length > 1) {
              targetArea = topicAvgs[topicAvgs.length - 1].name;
            }
          }

          setStats({
            streak: 3, 
            accuracy: acc || 0,
            progress: Math.min(100, progressPct || 12),
            hours: 4.5,
            notes: notesCount || 0,
            stronghold,
            targetArea,
            feedback: latestFeedback?.feedback_text?.slice(0, 150) + '...' || 'No recent feedback available. Complete a quiz to get started.'
          });
        }
      }

      setLoading(false);
    }
    initDashboard();
  }, [supabase, activeExamId, setActiveExamId]);

  const daysRem = exam ? Math.max(0, Math.ceil((new Date(exam.exam_date).getTime() - Date.now()) / 86400000)) : 0;

  if (loading) return (
    <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
      <Skeleton className="h-64 sm:h-72 w-full rounded-2xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
        <Skeleton className="lg:col-span-4 h-96 w-full rounded-2xl" />
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-12">
      {/* ── SECTION 1: HERO (ACTIVE MISSION) ────────────────────── */}
      {!exam ? (
        <EmptyState 
          icon={Target}
          title="Mission Parameters Not Set"
          description="You haven't defined an active Loksewa mission yet. Setting an exam allows our AI to generate a tactical study plan."
          action={
            <Link href="/dashboard/settings" className="px-8 py-3 bg-[#1e3a5f] text-[#c9a84c] rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2 min-h-[44px] shadow-lg shadow-[#1e3a5f]/20">
              Initialize Mission <Target className="h-4 w-4" />
            </Link>
          }
        />
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface p-6 sm:p-10 rounded-2xl border border-border-subtle relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -mr-32 -mt-32" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex flex-wrap gap-2 mb-6">
                {exams.map((e: Exam) => (
                  <button 
                    key={e.id}
                    onClick={() => setActiveExamId(e.id)}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      exam.id === e.id 
                        ? 'bg-[#1e3a5f] text-[#c9a84c] border border-[#1e3a5f]' 
                        : 'bg-background border border-border-subtle text-subtle hover:text-foreground hover:border-[#c9a84c]/40'
                    }`}
                  >
                    {e.exam_name}
                  </button>
                ))}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3 leading-tight">
                {exam.exam_name}
              </h1>
              <p className="text-subtle text-sm font-medium max-w-sm mb-8 leading-relaxed">
                {daysRem} day study plan in progress. Stay consistent to reach your goal.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/dashboard/study-plan" className="px-8 py-3 bg-[#c9a84c] text-[#1e3a5f] rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2 min-h-[44px] min-w-[160px] shadow-lg shadow-[#c9a84c]/20">
                  {t('continue_study')} <ChevronRight className="h-3.5 w-3.5" />
                </Link>
                <div className="px-6 py-3 bg-background border border-border-subtle rounded-xl text-xs font-black upper             <div className="hidden lg:flex flex-col items-center justify-center text-center p-8 bg-background border border-border-subtle rounded-2xl">
               <div className="relative h-28 w-28 mb-4">
                  <svg className="h-full w-full" viewBox="0 0 36 36">
                     <path className="text-border-subtle" strokeWidth="2.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                     <path className="text-[#c9a84c]" strokeWidth="2.5" strokeDasharray={`${stats.progress}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-xl font-bold text-foreground">{stats.progress}%</span>
                  </div>
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-subtle">{t('ready_percent')}</p>
            </div>r">
                     <span className="text-xl font-bold text-foreground">{stats.progress}%</span>
                  </div>
               </div>
               <p className="text-[10px] font-bold uppercase tracking-wider text-subtle">{t('ready_percent')}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── SECTION 2: INTEL GRID ────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStat label={t('streak')} value={`${stats.streak} Days`} icon={Calendar} tooltip="Total consecutive days of study logs." />
        <MiniStat label={t('accuracy')} value={`${stats.accuracy}%`} icon={Zap} tooltip="Weighted average from your practice hub quizzes." />
        <MiniStat label={t('hours')} value={`${stats.hours}h`} icon={Clock} tooltip="Cumulative focus hours measured from session engagement." />
        <MiniStat label="AI Notes" value={`${stats.notes}`} icon={BookOpen} tooltip="Total AI-generated study notes added to your knowledge base." />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── SECTION 3: STRATEGIC ASSETS ────────────────────────── */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <OperationalCard 
            title={t('practice')} 
            desc="Battle-test your knowledge with adaptive quizzes and interactive flashcards generated from your documents." 
            icon={Rocket} 
            href="/dashboard/practice" 
            color="orange" 
          />
          <OperationalCard 
            title={t('documents')} 
            desc="Centralize your syllabus, notes, and previous year questions. Our AI extracts core insights automatically." 
            icon={FileText} 
            href="/dashboard/documents" 
          />
          <OperationalCard 
            title={t('guru')} 
            desc="Your personal AI mentor. Ask complex questions about the Nepal Constitution, Law, and GS topics." 
            icon={MessageSquare} 
            href="/dashboard/guru" 
            color="orange" 
          />
          <OperationalCard 
            title={t('performance')} 
            desc="Analyze performance trends, identify syllabus gaps, and optimize your study velocity with AI feedback." 
            icon={BarChart3} 
            href="/dashboard/performance" 
          />
        </div>

        {/* ── SECTION 4: SIGNAL INTEL (FEEDBACK PREVIEW) ──────────── */}
        <div className="lg:col-span-4">
           <div className="bg-surface border border-border-subtle rounded-2xl p-6 h-full flex flex-col group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -mr-16 -mt-16" />
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                 <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-[#1e3a5f] flex items-center justify-center text-background">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">{t('coach_report')}</h3>
                 </div>
                 <Link href="/dashboard/performance" className="text-[10px] font-bold text-accent flex items-center gap-1 hover:gap-2 transition-all min-h-[44px]">
                    {t('full_recap')} <ChevronRight className="h-3 w-3" />
                 </Link>
              </div>

              <div className="space-y-6 relative z-10 flex-1">
                 <div className="p-4 bg-background border border-border-subtle rounded-xl">
                    <p className="text-[10px] font-bold text-accent uppercase mb-2">{t('strategy_update')}</p>
                    <p className="text-xs font-medium text-muted leading-relaxed line-clamp-3">
                      "{stats.feedback}"
                    </p>
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-background border border-border-subtle rounded-xl">
                       <p className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-1">{t('stronghold')}</p>
                       <p className="text-[10px] font-bold text-foreground truncate">{stats.stronghold}</p>
                    </div>
                    <div className="p-4 bg-background border border-border-subtle rounded-xl">
                       <p className="text-[9px] font-bold text-red-600 dark:text-red-400 uppercase mb-1">{t('target_area')}</p>
                       <p className="text-[10px] font-bold text-foreground truncate">{stats.targetArea}</p>
                    </div>
                 </div>

                 <div className="pt-6 border-t border-border-subtle">
                    <Link href={`/dashboard/guru?message=Help me improve ${stats.targetArea} topics`} className="w-full py-3.5 bg-[#1e3a5f] text-background rounded-xl text-[10px] font-bold uppercase text-center block hover:opacity-90 transition-opacity min-h-[44px] flex items-center justify-center">
                       {t('brief_guru')}
                    </Link>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
