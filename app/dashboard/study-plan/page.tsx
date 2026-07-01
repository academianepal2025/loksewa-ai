'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboard } from '@/components/dashboard/DashboardProvider';
import { useRotatingMessages } from '@/lib/hooks';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip } from '@/components/ui/tooltip';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { StudyPlanRegenModal } from '@/components/dashboard/StudyPlanRegenModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useUpgradeModal } from '@/lib/UpgradeModalContext';
import { UsageIndicator } from '@/components/dashboard/UsageIndicator';
import { TacticalPrompt } from '@/components/dashboard/TacticalPrompt';

import {
  Calendar,
  Clock,
  Target,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Coffee,
  PenTool,
  BookMarked,
  X,
  Check,
  AlertTriangle,
  AlertCircle,
  FileText,
  Flame,
  Zap
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────
interface DailyPlan {
  day_number: number;
  date: string;
  day_type: 'study' | 'revision' | 'rest' | 'mock_test';
  week_number?: number;
  primary_topic: string;
  secondary_topic: string | null;
  subtopics_to_cover: string[];
  estimated_hours: number;
  learning_objective?: string;
  study_method?: string;
  focus_points?: string[];
  avoid_mistakes?: string;
  exam_connection?: string;
  resources_hint?: string;
  study_tips: string;
  is_revision: boolean;
  revision_topics: string[];
}

interface WeeklyTarget {
  week_number: number;
  topics_to_complete: string[];
  revision_topics: string[];
  weekly_goal: string;
}

interface PlanData {
  total_days: number;
  exam_date: string;
  daily_plans: DailyPlan[];
  weekly_targets: WeeklyTarget[];
}

interface StudyPlan {
  id: string;
  plan_data: PlanData;
  created_at: string;
}

interface Exam {
  id: string;
  exam_name: string;
  exam_date: string;
  daily_study_hours: number;
}

interface StudyProgress {
  id: string;
  plan_id: string;
  day_number: number;
  completed_subtopics: string[];
  is_completed: boolean;
  completed_at: string | null;
  feedback_status?: 'finished' | 'need_revisit';
  difficulty?: 'easy' | 'medium' | 'hard';
  user_notes?: string;
}

// ── Day Type Styling ──────────────────────────────────────────────────
const DAY_TYPE_CONFIG = {
  study: { bg: 'bg-primary/5', border: 'border-border-subtle/60', text: 'text-accent', icon: BookOpen, label: 'Study' },
  revision: { bg: 'bg-accent/5', border: 'border-accent/20', text: 'text-accent', icon: BookMarked, label: 'Revision' },
  rest: { bg: 'bg-background', border: 'border-border-subtle/60', text: 'text-subtle', icon: Coffee, label: 'Rest' },
  mock_test: { bg: 'bg-primary/10', border: 'border-primary/20', text: 'text-primary', icon: PenTool, label: 'Mock Test' },
};

// ── Generation Steps Animation (Compact) ─────────────────────────────
function GenerationOverlay({ step }: { step: number }) {
  const steps = [
    { label: 'Syllabus Analysis', detail: 'Parsing core topics' },
    { label: 'Strategy Synthesis', detail: 'Calculating optimal cycles' },
    { label: 'Protocol Deployment', detail: 'Finalizing Roadmap' },
  ];

  const rotatingMessage = useRotatingMessages(true, [
    "AI is analyzing...",
    "This may take a moment...",
    "Almost there...",
    "Still processing, please wait...",
    "Working on it..."
  ]);

  return (
    <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl max-w-sm w-full p-8 border border-border-subtle overflow-hidden relative">
        <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full -mr-12 -mt-12" />
        
        <div className="text-center mb-8 relative z-10">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-xl border-2 border-border-subtle" />
            <div className="absolute inset-0 rounded-xl border-2 border-accent border-t-transparent animate-spin" />
            <div className="absolute inset-2.5 rounded-lg bg-background flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-accent animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-foreground tracking-tight">Generating Study Plan</h3>
          <p className="text-[10px] font-black text-accent uppercase tracking-widest mt-3 animate-pulse">{rotatingMessage}</p>
        </div>

        <div className="space-y-4 relative z-10">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`flex items-start gap-4 transition-all duration-700 ${
                i < step ? 'opacity-40' : i === step ? 'opacity-100' : 'opacity-20'
              }`}
            >
              <div className={`mt-0.5 w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 border ${
                i < step ? 'bg-primary border-primary text-accent' : i === step ? 'border-accent text-accent animate-pulse' : 'border-border-subtle text-subtle'
              }`}>
                {i < step ? <Check className="h-3 w-3" /> : <span className="text-[10px] font-black">{i + 1}</span>}
              </div>
              <div>
                <p className={`text-[10px] font-black uppercase tracking-widest ${i === step ? 'text-foreground' : 'text-subtle'}`}>
                  {s.label}
                </p>
                <p className="text-[10px] text-muted font-black uppercase tracking-widest mt-0.5">{s.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Generate Notes Button ─────────────────────────────────────────────
function GenerateNotesButton({ 
  dayNumber, 
  status, 
  isGeneratingLocal, 
  onGenerate, 
  onView,
  isNotesLimitReached
}: { 
  dayNumber: number,
  status?: string,
  isGeneratingLocal: boolean,
  onGenerate: (force: boolean) => void,
  onView: () => void,
  isNotesLimitReached: boolean
}) {
  if (isGeneratingLocal || status === 'generating') {
    return (
      <button disabled className="w-full sm:w-auto py-2 px-4 text-xs font-medium bg-background border border-border-subtle rounded-lg flex items-center justify-center gap-2 text-muted">
        <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Generating...
      </button>
    );
  }
  if (status === 'ready') {
    return (
      <button onClick={onView} className="w-full sm:w-auto py-2 px-4 text-xs font-medium bg-accent/10 text-accent border border-accent/20 rounded-lg flex items-center justify-center gap-2 hover:bg-accent/20 transition-all">
        <FileText className="h-3.5 w-3.5" /> View Notes
      </button>
    );
  }
  if (status === 'no_content') {
    return (
      <button onClick={() => onGenerate(true)} className="w-full sm:w-auto py-2 px-4 text-xs font-medium bg-red-500/5 text-red-600 border border-red-500/20 rounded-lg flex items-center justify-center gap-2 hover:bg-red-500/10 transition-all">
        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" /> Force Generate
      </button>
    );
  }
  if (status === 'failed') {
    return (
      <button onClick={() => onGenerate(false)} className="w-full sm:w-auto py-2 px-4 text-xs font-medium bg-red-500/5 text-red-600 border border-red-500/20 rounded-lg flex items-center justify-center gap-2 hover:bg-red-500/10 transition-all">
        <RefreshCw className="h-3.5 w-3.5" /> Retry
      </button>
    );
  }
  return (
    <button 
      onClick={() => onGenerate(false)} 
      disabled={isNotesLimitReached}
      className={`w-full sm:w-auto py-2 px-4 text-xs font-medium border rounded-lg flex items-center justify-center gap-2 transition-all ${
        isNotesLimitReached 
          ? 'bg-background border-border-subtle/60 text-muted cursor-not-allowed' 
          : 'bg-background border-accent/40 text-accent hover:bg-accent/5'
      }`}
    >
      <FileText className="h-3.5 w-3.5" /> {isNotesLimitReached ? 'Limit Reached' : 'Generate Notes'}
    </button>
  );
}

// ── Day Detail Content (Inline Expansion) ─────────────────────────────
function DayDetailsContent({ 
  day, 
  progress, 
  onToggleSubtopic, 
  onMarkComplete, 
  noteStatusMap, 
  generatingNotesForTopic, 
  onGenerateNote, 
  onViewNote, 
  isNotesLimitReached 
}: { 
  day: DailyPlan; 
  progress: StudyProgress | null; 
  onToggleSubtopic: (subtopic: string) => void; 
  onMarkComplete: (feedback: { status: 'finished' | 'need_revisit', difficulty: 'easy' | 'medium' | 'hard', notes: string }) => void;
  noteStatusMap: Map<string, string>;
  generatingNotesForTopic: string | null;
  onGenerateNote: (day: DailyPlan, topic: string, subtopics: string[], force: boolean) => void;
  onViewNote: (day: number, topic: string) => void;
  isNotesLimitReached: boolean;
}) {
  const [feedbackStatus, setFeedbackStatus] = useState<'finished' | 'need_revisit'>(progress?.feedback_status || 'finished');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(progress?.difficulty || 'medium');
  const [notes, setNotes] = useState(progress?.user_notes || '');

  const config = DAY_TYPE_CONFIG[day.day_type] || DAY_TYPE_CONFIG.study;
  const completedSubs = progress?.completed_subtopics || [];

  return (
    <div className="mt-3 p-5 rounded-xl bg-background/50 border border-border-subtle/80 space-y-5 animate-slide-in-top" onClick={e => e.stopPropagation()}>
      {/* Learning Objective */}
      {day.learning_objective && (
        <div className="bg-blue-500/[0.04] border border-blue-500/15 border-l-4 border-l-primary p-3 rounded-r-lg shadow-sm">
           <p className="text-xs font-semibold text-primary mb-1">Learning Objective</p>
           <p className="text-xs text-foreground/90 leading-relaxed">{day.learning_objective}</p>
        </div>
      )}

      {/* Target stats details */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
         <div className="bg-purple-500/[0.04] border border-purple-500/15 p-2.5 rounded-lg">
            <p className="text-[10px] text-purple-600 font-semibold">Duration</p>
            <p className="text-xs font-bold text-purple-700 mt-0.5">{day.estimated_hours} Hours</p>
         </div>
         <div className="bg-emerald-500/[0.04] border border-emerald-500/15 p-2.5 rounded-lg">
            <p className="text-[10px] text-emerald-600 font-semibold">Target Date</p>
            <p className="text-xs font-bold text-emerald-700 mt-0.5">{new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
         </div>
         {day.study_method && (
           <div className="bg-blue-500/[0.04] border border-blue-500/15 p-2.5 rounded-lg">
              <p className="text-[10px] text-blue-600 font-semibold">Method</p>
              <p className="text-xs font-bold text-blue-700 mt-0.5">{day.study_method}</p>
           </div>
         )}
      </div>

      {/* Subtopics Checklist & Study tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Objectives */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-foreground">Subtopics to Cover</h4>
          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {day.subtopics_to_cover.map((sub, i) => {
              const done = completedSubs.includes(sub);
              return (
                <label key={i} className={`flex items-start gap-2.5 p-2 rounded-lg border transition-all cursor-pointer group ${
                  done 
                    ? 'bg-emerald-500/[0.02] border-emerald-500/10 opacity-70' 
                    : 'bg-amber-500/[0.02] border-amber-500/10 hover:border-amber-500/30'
                }`}>
                  <div className="mt-0.5">
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                      done ? 'bg-emerald-500 border-emerald-500' : 'border-amber-500/30 group-hover:border-amber-500'
                    }`}>
                        {done && <Check className="h-2 w-2 text-white" />}
                    </div>
                    <input type="checkbox" hidden checked={done} onChange={() => onToggleSubtopic(sub)} />
                  </div>
                  <span className={`text-[11px] font-medium leading-relaxed ${done ? 'line-through text-muted' : 'text-foreground'}`}>{sub}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Tips & Study notes triggers */}
        <div className="space-y-3">
          {day.study_tips && (
            <div className="bg-accent/[0.04] rounded-lg p-3 border border-accent/15">
               <div className="flex items-center gap-1.5 mb-1">
                 <Zap className="h-3 w-3 text-accent" />
                 <span className="text-[10px] font-bold text-accent">Study Tip</span>
               </div>
               <p className="text-xs text-foreground/80 font-medium italic leading-relaxed">"{day.study_tips}"</p>
            </div>
          )}

          {day.avoid_mistakes && (
            <div className="bg-yellow-500/[0.04] border border-yellow-500/15 p-3 rounded-lg">
               <div className="flex items-center gap-1.5 mb-1">
                 <AlertTriangle className="h-3.5 w-3.5 text-yellow-600" />
                 <span className="text-[10px] font-bold text-yellow-600">Avoid Mistakes</span>
               </div>
               <p className="text-xs text-foreground/80 leading-relaxed">{day.avoid_mistakes}</p>
            </div>
          )}

          {day.exam_connection && (
            <div className="bg-blue-500/[0.04] border border-blue-500/15 p-3 rounded-lg">
               <div className="flex items-center gap-1.5 mb-1">
                 <Target className="h-3.5 w-3.5 text-blue-600" />
                 <span className="text-[10px] font-bold text-blue-600">Previous Exam Pattern</span>
               </div>
               <p className="text-xs text-foreground/80 leading-relaxed">{day.exam_connection}</p>
            </div>
          )}
        </div>
      </div>

      {/* Generated Notes Button Row */}
      <div className="pt-3 border-t border-border-subtle/40 space-y-2">
        <h4 className="text-xs font-bold text-foreground">Study Material & Notes</h4>
        {(() => {
          const noteTopicKey = day.subtopics_to_cover && day.subtopics_to_cover.length > 0 
            ? day.subtopics_to_cover[0] 
            : day.primary_topic;
          const displayLabel = day.subtopics_to_cover && day.subtopics_to_cover.length > 0 
            ? day.subtopics_to_cover.join(', ') 
            : day.primary_topic;
          return (
            <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-lg bg-surface border border-border-subtle/50">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground">{displayLabel}</p>
                <p className="text-[10px] text-muted">Generate notes for these specific topics</p>
              </div>
              <GenerateNotesButton 
                dayNumber={day.day_number}
                status={noteStatusMap.get(`${day.day_number}-${noteTopicKey}`)}
                isGeneratingLocal={generatingNotesForTopic === noteTopicKey}
                onGenerate={(force) => onGenerateNote(day, noteTopicKey, day.subtopics_to_cover, force)}
                onView={() => onViewNote(day.day_number, noteTopicKey)}
                isNotesLimitReached={isNotesLimitReached}
              />
            </div>
          );
        })()}

        {day.secondary_topic && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-lg bg-surface border border-border-subtle/50">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground">{day.secondary_topic}</p>
              <p className="text-[10px] text-muted">Generate notes for this secondary topic</p>
            </div>
            <GenerateNotesButton 
              dayNumber={day.day_number}
              status={noteStatusMap.get(`${day.day_number}-${day.secondary_topic}`)}
              isGeneratingLocal={generatingNotesForTopic === day.secondary_topic}
              onGenerate={(force) => onGenerateNote(day, day.secondary_topic!, [], force)}
              onView={() => onViewNote(day.day_number, day.secondary_topic!)}
              isNotesLimitReached={isNotesLimitReached}
            />
          </div>
        )}
      </div>

      {/* Feedback & Done Actions */}
      <div className="pt-3 border-t border-border-subtle/40">
        {!progress?.is_completed ? (
          <div className="bg-surface/50 p-3 rounded-lg border border-border-subtle/50 space-y-3">
            <h4 className="text-xs font-bold text-foreground">Log Session Status</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-[10px] text-muted font-medium">Did you complete all topics?</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setFeedbackStatus('finished')}
                    className={`flex-1 py-1.5 rounded-md text-xs font-medium border transition-all ${feedbackStatus === 'finished' ? 'bg-primary text-accent border-primary' : 'bg-background text-muted border-border-subtle'}`}
                  >
                    Fully Finished
                  </button>
                  <button 
                    onClick={() => setFeedbackStatus('need_revisit')}
                    className={`flex-1 py-1.5 rounded-md text-xs font-medium border transition-all ${feedbackStatus === 'need_revisit' ? 'bg-accent text-background border-accent' : 'bg-background text-muted border-border-subtle'}`}
                  >
                    Need Revisit
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] text-muted font-medium">How difficult was it?</p>
                <div className="flex gap-2">
                  {['easy', 'medium', 'hard'].map((lvl) => (
                    <button 
                      key={lvl}
                      onClick={() => setDifficulty(lvl as any)}
                      className={`flex-1 py-1.5 rounded-md text-xs font-medium border transition-all capitalize ${
                        difficulty === lvl 
                          ? 'bg-primary text-accent border-primary' 
                          : 'bg-background text-muted border-border-subtle'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] text-muted font-medium">Self-Reflection / Quick Notes</p>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write observations, difficulty notes..."
                className="w-full bg-background border border-border-subtle rounded-md p-2 text-xs text-foreground focus:ring-1 focus:ring-accent focus:outline-none resize-none h-12"
              />
            </div>

            <button
              onClick={() => onMarkComplete({ status: feedbackStatus, difficulty, notes })}
              className="w-full py-2 rounded-lg font-semibold text-xs bg-primary text-accent hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Check className="h-3 w-3" /> Mark Day Complete
            </button>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-emerald-500/[0.02] border border-emerald-500/10 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-emerald-500 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Completed
              </span>
              <span className="text-muted">{new Date(progress.completed_at!).toLocaleDateString()}</span>
            </div>
            <div className="flex gap-4 py-1.5 border-y border-border-subtle/20 text-[10px]">
              <div>
                 <span className="text-muted">Status: </span>
                 <span className="font-semibold text-foreground capitalize">{progress.feedback_status?.replace('_', ' ') || 'N/A'}</span>
              </div>
              <div>
                 <span className="text-muted">Difficulty: </span>
                 <span className="font-semibold text-foreground capitalize">{progress.difficulty || 'N/A'}</span>
              </div>
            </div>
            {progress.user_notes && (
              <p className="text-xs text-muted italic leading-relaxed">"{progress.user_notes}"</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function StudyPlanPage() {
  const router = useRouter();
  const supabase = createClient();
  const { t, language } = useDashboard();
  const { showUpgradeModal } = useUpgradeModal();
  const [exams, setExams] = useState<Exam[]>([]);
  const [activeExamId, setActiveExamId] = useState<string | null>(null);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [progress, setProgress] = useState<StudyProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [selectedDay, setSelectedDay] = useState<DailyPlan | null>(null);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]));
  const [confirmRegen, setConfirmRegen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'no_syllabus' | 'api' | null>(null);
  const [noteStatusMap, setNoteStatusMap] = useState<Map<string, string>>(new Map());
  const [generatingNotesForTopic, setGeneratingNotesForTopic] = useState<string | null>(null);
  const [missingContentPrompt, setMissingContentPrompt] = useState<{day: DailyPlan, topic: string, subtopics: string[]} | null>(null);
  const [isNotesLimitReached, setIsNotesLimitReached] = useState(false);
  const fetchExams = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('user_exams').select('id, exam_name, exam_date, daily_study_hours').eq('user_id', user.id).order('exam_date', { ascending: true });
    if (data?.length) { setExams(data); if (!activeExamId) setActiveExamId(data[0].id); }
    setLoading(false);
  }, [supabase, activeExamId]);

  const fetchPlan = useCallback(async () => {
    if (!activeExamId) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    console.log(`Fetching plan for exam: ${activeExamId} and user: ${user.id}`);
    const { data: plans, error } = await supabase
      .from('study_plans')
      .select('*')
      .eq('exam_id', activeExamId)
      .eq('user_id', user.id)
      .limit(1);

    const data = plans?.[0] || null;

    if (error) {
      console.error('Error fetching plan:', error.message, error.details, error.hint, error.code);
      setErrorMsg(`Failed to load study plan: ${error.message || 'Unknown database error'}`);
      setLoading(false);
      return;
    }

    if (data) {
      console.log('Plan found in database. ID:', data.id);
      let planData = data.plan_data;
      
      // Normalize potential nested structures
      if (planData?.plan && Array.isArray(planData.plan.daily_plans)) {
        planData = planData.plan;
      } else if (planData?.study_plan && Array.isArray(planData.study_plan.daily_plans)) {
        planData = planData.study_plan;
      }

      // Basic validation of plan structure
      const hasDailyPlans = planData && Array.isArray(planData.daily_plans);
      
      if (hasDailyPlans) {
        setPlan({ ...data, plan_data: planData });
        const { data: prog } = await supabase.from('study_progress').select('*').eq('plan_id', data.id);
        if (prog) setProgress(prog);
      } else {
        console.error('Plan data structure is invalid:', planData);
        setErrorMsg('The existing study plan has an invalid format. Please try regenerating it.');
        setPlan(null);
      }
    } else {
      console.log('No plan found for this exam.');
      setPlan(null);
      setProgress([]);
    }
    setLoading(false);
  }, [supabase, activeExamId]);

  const toggleWeek = (wk: number) => {
    setExpandedWeeks(prev => {
      const next = new Set(prev);
      if (next.has(wk)) next.delete(wk);
      else next.add(wk);
      return next;
    });
  };

  const fetchNoteStatuses = useCallback(async () => {
    if (!activeExamId) return;
    const { data } = await supabase
      .from('study_notes')
      .select('day_number, topic, generation_status, no_content_found')
      .eq('exam_id', activeExamId);
    
    if (data) {
      const map = new Map<string, string>();
      data.forEach((note: any) => map.set(`${note.day_number}-${note.topic}`, note.no_content_found ? 'no_content' : note.generation_status));
      setNoteStatusMap(map);
    }
  }, [activeExamId, supabase]);

  useEffect(() => { fetchExams(); }, [fetchExams]);
  useEffect(() => { 
    if (activeExamId) {
      fetchPlan();
      fetchNoteStatuses();
      
      const channel = supabase
        .channel(`study-notes-${activeExamId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'study_notes', filter: `exam_id=eq.${activeExamId}` },
          (payload: any) => {
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const updatedNote = payload.new as any;
              setNoteStatusMap((prev: Map<string, string>) => {
                const next = new Map(prev);
                next.set(`${updatedNote.day_number}-${updatedNote.topic}`, updatedNote.no_content_found ? 'no_content' : updatedNote.generation_status);
                return next;
              });
              if (updatedNote.generation_status === 'ready') {
                toast.success(`Notes generated for ${updatedNote.topic}!`);
                setGeneratingNotesForTopic(null);
              } else if (updatedNote.generation_status === 'failed') {
                toast.error(`Generation failed for ${updatedNote.topic}`);
                setGeneratingNotesForTopic(null);
              }
            }
          }
        )
        .subscribe();
        
      return () => { supabase.removeChannel(channel); };
    }
  }, [activeExamId, fetchPlan, fetchNoteStatuses, supabase]);

  const checkLimits = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const res = await fetch('/api/check-limits');
    const data = await res.json();
    if (data.plan === 'free' && data.limits.notes.exceeded) {
      setIsNotesLimitReached(true);
    } else {
      setIsNotesLimitReached(false);
    }
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkLimits();
    window.addEventListener('usage-updated', checkLimits);
    return () => window.removeEventListener('usage-updated', checkLimits);
  }, [checkLimits]);

  const handleGenerateNote = async (day: DailyPlan, topicToGen: string, subtopicsToGen: string[], force = false) => {
    if (!activeExamId) return;
    setGeneratingNotesForTopic(topicToGen);
    toast(`Generating notes for ${topicToGen}...`, { icon: '⏳' });
    
    try {
      const res = await fetch('/api/notes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: activeExamId,
          day_number: day.day_number,
          topic: topicToGen,
          subtopics: subtopicsToGen,
          date: day.date,
          force_generate: force,
          language,
          study_method: day.study_method,
          study_tips: day.study_tips
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 403) {
          if (data.is_pro) {
             toast.error(data.message || 'Daily limit reached');
          } else {
             toast.error("Daily limit reached", { description: "Upgrade to Pro for unlimited note generations." });
             showUpgradeModal('notes_limit');
          }
        } else {
          throw new Error(data.error || 'Failed to generate notes');
        }
        setGeneratingNotesForTopic(null);
      } else if (data.status === 'no_content_found') {
        setMissingContentPrompt({ day, topic: topicToGen, subtopics: subtopicsToGen });
        setGeneratingNotesForTopic(null);
      } else {
        // Success
        window.dispatchEvent(new CustomEvent('usage-updated'));
        
        // Redirect to the study notes page for this generated note
        router.push(`/dashboard/study-notes?day=${day.day_number}&topic=${encodeURIComponent(topicToGen)}`);
      }
    } catch (e: any) {
      toast.error(e.message);
      setGeneratingNotesForTopic(null);
    }
  };

  const fetchWithRetry = async (url: string, options: RequestInit, retries = 2): Promise<Response> => {
    const res = await fetch(url, options);
    if (res.status === 503 && retries > 0) {
      await new Promise(r => setTimeout(r, 3000));
      return fetchWithRetry(url, options, retries - 1);
    }
    return res;
  };

  const handleGenerate = async (overrideDays?: number, overrideHours?: number) => {
    if (!activeExamId) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setGenerating(true);
    setGenStep(0);
    setErrorMsg(null);
    setErrorType(null);
    try {
      // Step 0: Check if analysis already exists
      const { data: existingAnalysisData } = await supabase
        .from('syllabus_analysis')
        .select('id')
        .eq('exam_id', activeExamId)
        .order('created_at', { ascending: false })
        .limit(1);
      
      const existingAnalysis = existingAnalysisData?.[0] || null;

      if (!existingAnalysis) {
        setGenStep(0);
        const aRes = await fetchWithRetry('/api/analyze-syllabus', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ examId: activeExamId, userId: user.id, language }) 
        });
        
        if (!aRes.ok) {
          const aData = await aRes.json().catch(() => ({}));
          if (aRes.status === 404) { 
            toast.error('Missing Syllabus', { description: 'Please upload your syllabus in Documents to proceed.' });
            router.push('/dashboard/documents');
          } else { 
            setErrorType('api'); 
            setErrorMsg(aData.message || 'AI service unavailable during analysis.'); 
          }
          setGenerating(false);
          return;
        }
      }

      setGenStep(1);
      const pRes = await fetchWithRetry('/api/generate-study-plan', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          examId: activeExamId, 
          userId: user.id, 
          language,
          overrideDays,
          overrideHours
        }) 
      });
      
      const pData = await pRes.json().catch(() => null);
      
      if (!pRes.ok) { 
        setErrorType('api'); 
        setErrorMsg(pData?.message || 'Failed to generate roadmap after retries.'); 
        setGenerating(false);
        return; 
      }

      setGenStep(2);
      const planResult = pData;
      if (planResult && planResult.success && planResult.plan) {
        toast.success('Study plan created!', { description: 'Your personalized study schedule is ready.' });
          setPlan({
            id: planResult.id,
            plan_data: planResult.plan,
            created_at: new Date().toISOString()
          });
          setProgress([]); // Fresh plan, fresh progress
        } else {
          await fetchPlan();
        }
      
      await new Promise(r => setTimeout(r, 500));
    } catch (e: any) { 
      console.error('Generation flow error:', e);
      toast.error('Something went wrong', { description: 'Study plan generation failed. Please try again.' });
      setErrorMsg('Unexpected error occurred during roadmap generation.'); 
    } finally { 
      setGenerating(false); 
    }
  };

  const getProgressForDay = (d: number) => progress.find(p => p.day_number === d) || null;
  const toggleSubtopic = async (day: DailyPlan, sub: string) => {
    if (!plan) return;
    const existing = getProgressForDay(day.day_number);
    let subs = existing?.completed_subtopics || [];
    subs = subs.includes(sub) ? subs.filter(s => s !== sub) : [...subs, sub];
    if (existing) await supabase.from('study_progress').update({ completed_subtopics: subs }).eq('id', existing.id);
    else await supabase.from('study_progress').insert({ plan_id: plan.id, day_number: day.day_number, completed_subtopics: subs, is_completed: false });
    const { data: prog } = await supabase.from('study_progress').select('*').eq('plan_id', plan.id);
    if (prog) setProgress(prog);
  };

  const markDayComplete = async (day: DailyPlan, feedback: { status: 'finished' | 'need_revisit', difficulty: 'easy' | 'medium' | 'hard', notes: string }) => {
    if (!plan) return;
    const existing = getProgressForDay(day.day_number);
    const payload = { 
      is_completed: true, 
      completed_at: new Date().toISOString(), 
      completed_subtopics: day.subtopics_to_cover,
      feedback_status: feedback.status,
      difficulty: feedback.difficulty,
      user_notes: feedback.notes
    };
    if (existing) await supabase.from('study_progress').update(payload).eq('id', existing.id);
    else await supabase.from('study_progress').insert({ ...payload, plan_id: plan.id, day_number: day.day_number });
    const { data: prog } = await supabase.from('study_progress').select('*').eq('plan_id', plan.id);
    if (prog) setProgress(prog);
  };

  const planData = plan?.plan_data;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayPlan = planData?.daily_plans.find((d: DailyPlan) => d.date === todayStr) || planData?.daily_plans.find((d: DailyPlan) => d.date >= todayStr);
  const completedDays = progress.filter((p: StudyProgress) => p.is_completed).length;
  const totalStudyDays = planData?.daily_plans.filter((d: DailyPlan) => d.day_type !== 'rest').length || 1;
  const completionPct = Math.round((completedDays / totalStudyDays) * 100);
  const daysRem = useMemo(() => {
    const activeExam = exams.find((e: Exam) => e.id === activeExamId);
    if (!activeExam) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const examDate = new Date(activeExam.exam_date);
    examDate.setHours(0, 0, 0, 0);
    return Math.max(0, Math.ceil((examDate.getTime() - today.getTime()) / 86400000));
  }, [exams, activeExamId]);
  const currentWeekNum = todayPlan ? (todayPlan.week_number || Math.ceil(todayPlan.day_number / 7)) : 1;
  const currentWeekTarget = planData?.weekly_targets.find((w: WeeklyTarget) => w.week_number === currentWeekNum);
  const weeklyGroups: Record<number, DailyPlan[]> = {};
  planData?.daily_plans.forEach((d: DailyPlan) => { const wk = d.week_number || Math.ceil(d.day_number / 7); if (!weeklyGroups[wk]) weeklyGroups[wk] = []; weeklyGroups[wk].push(d); });

  if (loading) return (
    <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
      <Skeleton className="h-64 sm:h-72 w-full rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <div className="space-y-4">
             <Skeleton className="h-10 w-48 rounded-full" />
             {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
          </div>
        </div>
        <Skeleton className="lg:col-span-4 h-96 w-full rounded-2xl" />
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-12">
      {generating && <GenerationOverlay step={genStep} />}


      <StudyPlanRegenModal
        isOpen={confirmRegen}
        onClose={() => setConfirmRegen(false)}
        onConfirm={(days, hours) => {
          setConfirmRegen(false);
          handleGenerate(days, hours);
        }}
        initialDays={daysRem || 30}
        initialHours={exams.find((e: Exam) => e.id === activeExamId)?.daily_study_hours || 4}
      />

      {missingContentPrompt && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={() => setMissingContentPrompt(null)}>
          <div className="bg-surface rounded-2xl shadow-2xl max-w-md w-full border border-border-subtle overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center space-y-4">
              <div className="h-12 w-12 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center mx-auto mb-2">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-black text-foreground uppercase tracking-tighter">Missing Notes</h3>
              <p className="text-[11px] font-medium text-subtle leading-relaxed">
                We couldn&apos;t find any content for <strong className="text-foreground">{missingContentPrompt.topic}</strong> in your uploaded documents. 
                Do you want to upload study materials for this topic, or force the AI to generate notes using its general knowledge?
              </p>
            </div>
            <div className="p-4 bg-background border-t border-border-subtle flex flex-col gap-3">
              <button
                onClick={() => router.push('/dashboard/documents')}
                className="w-full py-3 rounded-xl bg-primary text-accent border border-primary text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all flex justify-center items-center gap-2"
              >
                <BookMarked className="h-4 w-4" /> Upload Study Materials
              </button>
              <button
                onClick={() => {
                   const { day, topic, subtopics } = missingContentPrompt;
                   setMissingContentPrompt(null);
                   handleGenerateNote(day, topic, subtopics, true);
                }}
                className="w-full py-3 rounded-xl bg-red-500/5 text-red-600 border border-red-500/20 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all flex justify-center items-center gap-2"
              >
                <Zap className="h-4 w-4" /> Force Notes
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Study Roadmap
            </h1>
            <p className="text-base text-muted mt-1">Your personalized daily study schedule</p>
          </div>
          {planData && (
            <button 
              onClick={() => setConfirmRegen(true)} 
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-muted border border-border-subtle rounded-xl hover:text-foreground hover:border-accent/30 transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Regenerate Plan
            </button>
          )}
        </div>

        {/* Exam selector tabs */}
        {exams.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {exams.map((e: Exam) => (
              <button 
                key={e.id} 
                onClick={() => { setActiveExamId(e.id); setPlan(null); }} 
                className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all border-2 ${
                  activeExamId === e.id 
                    ? 'bg-primary text-accent border-primary shadow-lg shadow-primary/15' 
                    : 'bg-surface border-border-subtle text-foreground/70 hover:text-foreground hover:border-accent/30'
                }`}
              >
                🎯 {e.exam_name}
              </button>
            ))}
          </div>
        )}

        {/* Stats pills */}
        {planData && (
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-500/[0.06] border border-blue-500/15 rounded-xl">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-semibold text-foreground">{daysRem}</span>
              <span className="text-xs text-muted">days left</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-2.5 bg-accent/[0.06] border border-accent/15 rounded-xl">
              <TrendingUp className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold text-foreground">{completionPct}%</span>
              <div className="w-16 h-1.5 bg-border-subtle rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full transition-all" style={{width: `${completionPct}%`}} />
              </div>
              <span className="text-xs text-muted">complete</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/[0.06] border border-emerald-500/15 rounded-xl">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-semibold text-foreground">{completedDays}/{totalStudyDays}</span>
              <span className="text-xs text-muted">days done</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      {!planData ? (
        <div className="bg-surface rounded-2xl border border-border-subtle p-12 text-center">
          <div className="h-14 w-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="h-6 w-6 text-accent" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Get Started with Your Study Plan</h2>
          <p className="text-sm text-muted max-w-md mx-auto mb-8 leading-relaxed">
            Our AI will analyze your syllabus and create a personalized daily study schedule tailored to your exam timeline.
          </p>
          
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/5 border border-red-500/15 text-sm text-red-600 max-w-md mx-auto flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}

          <button 
            onClick={() => handleGenerate()} 
            className="bg-primary text-accent px-8 py-3.5 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all inline-flex items-center gap-2 shadow-lg shadow-primary/15"
          >
            <Sparkles className="h-4 w-4" /> Generate My Study Plan
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ── Today's Focus ──────────────────────────────────────── */}
          {todayPlan && (() => {
            const isTodayPlanExpanded = selectedDay?.day_number === todayPlan.day_number;
            return (
              <div className="rounded-2xl border-2 border-accent/20 bg-gradient-to-r from-accent/[0.04] to-transparent p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-[60px] -mr-20 -mt-20" />
                <div className="relative z-10">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <div className="flex items-center gap-1.5 px-3.5 py-1 bg-accent/10 rounded-full">
                      <Flame className="h-3.5 w-3.5 text-accent" />
                      <span className="text-sm font-semibold text-accent">Today&apos;s Focus</span>
                    </div>
                    <span className="text-sm text-muted">Day {todayPlan.day_number}</span>
                    <span className="text-sm text-muted">&middot; {todayPlan.estimated_hours}h study</span>
                    {todayPlan.study_method && (
                      <span className="px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/15 rounded-md text-xs font-medium">{todayPlan.study_method}</span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-foreground tracking-tight mb-1">{todayPlan.primary_topic}</h2>
                  {todayPlan.secondary_topic && (
                    <p className="text-base text-muted">{todayPlan.secondary_topic}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 mt-5">
                    <button 
                      onClick={() => setSelectedDay(isTodayPlanExpanded ? null : todayPlan)} 
                      className="px-4 py-2 text-sm font-semibold bg-surface border border-border-subtle rounded-lg hover:bg-background transition-all"
                    >
                      {isTodayPlanExpanded ? 'Collapse' : 'View Details'}
                    </button>
                    <GenerateNotesButton 
                      dayNumber={todayPlan.day_number}
                      status={noteStatusMap.get(`${todayPlan.day_number}-${todayPlan.primary_topic}`)}
                      isGeneratingLocal={generatingNotesForTopic === todayPlan.primary_topic}
                      onGenerate={(force) => handleGenerateNote(todayPlan, todayPlan.primary_topic, todayPlan.subtopics_to_cover, force)}
                      onView={() => router.push(`/dashboard/study-notes?day=${todayPlan.day_number}&topic=${encodeURIComponent(todayPlan.primary_topic)}`)}
                      isNotesLimitReached={isNotesLimitReached}
                    />
                    <button 
                      onClick={() => markDayComplete(todayPlan, { status: 'finished', difficulty: 'medium', notes: 'Quick complete' })} 
                      disabled={getProgressForDay(todayPlan.day_number)?.is_completed}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all inline-flex items-center gap-1.5 ${
                        getProgressForDay(todayPlan.day_number)?.is_completed 
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                          : 'bg-primary text-white hover:opacity-90'
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {getProgressForDay(todayPlan.day_number)?.is_completed ? 'Completed' : 'Mark Done'}
                    </button>
                  </div>

                  {/* Inline Expansion for Today's Focus */}
                  {isTodayPlanExpanded && (
                    <div className="mt-5">
                      <DayDetailsContent
                        day={todayPlan}
                        progress={getProgressForDay(todayPlan.day_number)}
                        onToggleSubtopic={s => toggleSubtopic(todayPlan, s)}
                        onMarkComplete={f => markDayComplete(todayPlan, f)}
                        noteStatusMap={noteStatusMap}
                        generatingNotesForTopic={generatingNotesForTopic}
                        onGenerateNote={(dayObj, topic, subtopics, force) => handleGenerateNote(dayObj, topic, subtopics, force)}
                        onViewNote={(dayNum, topic) => router.push(`/dashboard/study-notes?day=${dayNum}&topic=${encodeURIComponent(topic)}`)}
                        isNotesLimitReached={isNotesLimitReached}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ── Weekly Schedule ─────────────────────────────────────── */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-foreground px-1">Weekly Schedule</h3>
            {Object.entries(weeklyGroups).map(([wk, ds]) => {
              const weekNum = parseInt(wk);
              const open = expandedWeeks.has(weekNum);
              const target = planData.weekly_targets.find((w: WeeklyTarget) => w.week_number === weekNum);
              const done = ds.filter((d: DailyPlan) => getProgressForDay(d.day_number)?.is_completed).length;
              return (
                <div key={wk} className="rounded-xl border border-border-subtle overflow-hidden bg-surface">
                  {/* Week header */}
                  <button 
                    onClick={() => toggleWeek(weekNum)} 
                    className="w-full px-5 py-4 flex items-center justify-between hover:bg-background/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0 transition-colors ${
                        open ? 'bg-primary/10 text-primary' : 'bg-background border border-border-subtle text-muted'
                      }`}>{wk}</div>
                      <div className="text-left">
                        <p className="text-base font-semibold text-foreground">Week {wk}</p>
                        {target?.weekly_goal && (
                          <p className="text-sm text-muted truncate max-w-[180px] sm:max-w-xs">{target.weekly_goal}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted font-medium hidden sm:block">{done}/{ds.length}</span>
                      <div className="w-20 h-1.5 bg-border-subtle rounded-full overflow-hidden hidden sm:block">
                        <div className="h-full bg-accent rounded-full transition-all duration-500" style={{width: `${ds.length > 0 ? (done / ds.length) * 100 : 0}%`}} />
                      </div>
                      <ChevronDown className={`h-4 w-4 text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {/* Day rows */}
                  {open && (
                    <div className="border-t border-border-subtle/60">
                      {ds.map((d: DailyPlan, idx: number) => {
                        const cfg = DAY_TYPE_CONFIG[d.day_type] || DAY_TYPE_CONFIG.study;
                        const fin = getProgressForDay(d.day_number)?.is_completed;
                        const isT = d.date === todayStr;
                        const isExpanded = selectedDay?.day_number === d.day_number;
                        
                        // Color scheme per day type
                        let stripeColor = 'bg-blue-500';
                        let badgeBg = 'bg-blue-500/10 text-blue-600 border-blue-500/20';
                        let cardBg = 'bg-blue-500/[0.04] hover:bg-blue-500/[0.06] border-blue-500/10';
                        
                        if (d.day_type === 'revision') { 
                          stripeColor = 'bg-amber-500'; 
                          badgeBg = 'bg-amber-500/10 text-amber-600 border-amber-500/20'; 
                          cardBg = 'bg-amber-500/[0.04] hover:bg-amber-500/[0.06] border-amber-500/10';
                        }
                        else if (d.day_type === 'mock_test') { 
                          stripeColor = 'bg-purple-500'; 
                          badgeBg = 'bg-purple-500/10 text-purple-600 border-purple-500/20'; 
                          cardBg = 'bg-purple-500/[0.04] hover:bg-purple-500/[0.06] border-purple-500/10';
                        }
                        else if (d.day_type === 'rest') { 
                          stripeColor = 'bg-zinc-400'; 
                          badgeBg = 'bg-zinc-400/10 text-zinc-500 border-zinc-400/20'; 
                          cardBg = 'bg-zinc-500/[0.04] hover:bg-zinc-500/[0.06] border-zinc-500/10';
                        }
                        
                        if (fin) {
                          stripeColor = 'bg-emerald-500';
                          cardBg = 'bg-emerald-500/[0.04] hover:bg-emerald-500/[0.06] border-emerald-500/10';
                        }
                        if (isT) {
                          stripeColor = 'bg-accent';
                          cardBg = 'bg-accent/[0.06] hover:bg-accent/[0.08] border-accent/20';
                        }

                        return (
                          <div 
                            key={d.day_number}
                            className={`border-b border-border-subtle/40 last:border-0 transition-colors duration-200 ${
                              isExpanded ? 'bg-surface/50' : ''
                            }`}
                          >
                            {/* Main Day Header Card */}
                            <div 
                              onClick={() => setSelectedDay(isExpanded ? null : d)}
                              className={`flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-colors group ${cardBg}`}
                            >
                              {/* Color stripe */}
                              <div className={`w-1 h-8 rounded-full flex-shrink-0 ${stripeColor}`} />
                              
                              {/* Day info */}
                              <div className="w-20 flex-shrink-0">
                                <p className="text-sm font-semibold text-foreground">Day {d.day_number}</p>
                                <p className="text-xs text-muted">{new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' })}</p>
                              </div>
                              
                              {/* Type badge */}
                              <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border flex-shrink-0 hidden sm:inline-block ${badgeBg}`}>
                                {cfg.label}
                              </span>
                              
                              {/* Topic */}
                              <div className="flex-1 min-w-0">
                                <p className={`text-base truncate font-semibold ${fin ? 'text-muted line-through' : 'text-foreground'}`}>
                                  {d.primary_topic || cfg.label}
                                </p>
                                {d.subtopics_to_cover && d.subtopics_to_cover.length > 0 && (
                                  <p className="text-xs text-muted/80 mt-0.5 truncate max-w-[200px] sm:max-w-lg">
                                    📋 {d.subtopics_to_cover.join(', ')}
                                  </p>
                                )}
                              </div>
                              
                              {/* Status indicators */}
                              {isT && (
                                <span className="px-2 py-0.5 bg-accent/10 text-accent text-xs font-semibold rounded-md flex-shrink-0">Today</span>
                              )}
                              {fin && !isT && (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                              )}
                              
                              {/* Actions */}
                              <div className="flex items-center gap-2 flex-shrink-0 opacity-60 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                <button 
                                  onClick={() => setSelectedDay(isExpanded ? null : d)} 
                                  className="px-3 py-1.5 text-sm font-medium text-muted bg-background border border-border-subtle rounded-lg hover:text-foreground hover:border-accent/30 transition-all"
                                >
                                  {isExpanded ? 'Collapse' : 'Details'}
                                </button>
                                {!fin && d.day_type !== 'rest' && (
                                  <button 
                                    onClick={() => markDayComplete(d, { status: 'finished', difficulty: 'medium', notes: 'Quick complete' })} 
                                    className="px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-lg hover:opacity-90 transition-all"
                                  >
                                    Done
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Inline Expansion Drawer */}
                            {isExpanded && (
                              <div className="px-5 pb-5">
                                <DayDetailsContent
                                  day={d}
                                  progress={getProgressForDay(d.day_number)}
                                  onToggleSubtopic={s => toggleSubtopic(d, s)}
                                  onMarkComplete={f => markDayComplete(d, f)}
                                  noteStatusMap={noteStatusMap}
                                  generatingNotesForTopic={generatingNotesForTopic}
                                  onGenerateNote={(dayObj, topic, subtopics, force) => handleGenerateNote(dayObj, topic, subtopics, force)}
                                  onViewNote={(dayNum, topic) => router.push(`/dashboard/study-notes?day=${dayNum}&topic=${encodeURIComponent(topic)}`)}
                                  isNotesLimitReached={isNotesLimitReached}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Contextual Guidance */}
      <TacticalPrompt 
        id="study_plan_analyze_tip"
        title="Create Your Study Plan"
        message="Your study plan is empty. Click 'Generate My Study Plan' to create a daily study schedule based on your uploaded documents."
        type="tactical"
        delay={4000}
      />

    </div>
  );
}