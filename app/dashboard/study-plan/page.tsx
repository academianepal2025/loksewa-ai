'use client';

import { useState, useEffect, useCallback } from 'react';
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
  study: { bg: 'bg-[#1e3a5f]/5', border: 'border-border-subtle', text: 'text-[#c9a84c]', icon: BookOpen, label: 'Study' },
  revision: { bg: 'bg-[#c9a84c]/5', border: 'border-[#c9a84c]/20', text: 'text-[#c9a84c]', icon: BookMarked, label: 'Revision' },
  rest: { bg: 'bg-background', border: 'border-border-subtle', text: 'text-subtle', icon: Coffee, label: 'Rest' },
  mock_test: { bg: 'bg-[#1e3a5f]/10', border: 'border-[#1e3a5f]/20', text: 'text-[#1e3a5f]', icon: PenTool, label: 'Mock Test' },
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
      <div className="bg-surface rounded-2xl shadow-2xl max-w-sm w-full p-8 border border-border-subtle overflow-hidden relative">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#c9a84c]/5 rounded-full -mr-12 -mt-12" />
        
        <div className="text-center mb-8 relative z-10">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-xl border-2 border-border-subtle" />
            <div className="absolute inset-0 rounded-xl border-2 border-[#c9a84c] border-t-transparent animate-spin" />
            <div className="absolute inset-2.5 rounded-lg bg-background flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-[#c9a84c] animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-black text-foreground tracking-tighter uppercase">AI Strategy Engine</h3>
          <p className="text-[10px] font-black text-[#c9a84c] uppercase tracking-widest mt-3 animate-pulse">{rotatingMessage}</p>
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
                i < step ? 'bg-[#1e3a5f] border-[#1e3a5f] text-[#c9a84c]' : i === step ? 'border-[#c9a84c] text-[#c9a84c] animate-pulse' : 'border-border-subtle text-subtle'
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
  onView 
}: { 
  dayNumber: number, 
  status?: string, 
  isGeneratingLocal: boolean, 
  onGenerate: (force: boolean) => void,
  onView: () => void 
}) {
  if (isGeneratingLocal || status === 'generating') {
    return (
      <button disabled className="w-full sm:w-auto py-2.5 px-4 text-[9px] font-black uppercase tracking-widest bg-background border border-border-subtle rounded-lg flex items-center justify-center gap-2 text-subtle shadow-sm">
        <RefreshCw className="h-4 w-4 animate-spin" /> Analyzing...
      </button>
    );
  }
  if (status === 'ready') {
    return (
      <button onClick={onView} className="w-full sm:w-auto py-2.5 px-4 text-[9px] font-black uppercase tracking-widest bg-[#c9a84c]/10 text-[#c9a84c] border border-[#c9a84c]/20 rounded-lg flex items-center justify-center gap-2 hover:bg-[#c9a84c]/20 transition-all shadow-sm">
        <FileText className="h-4 w-4" /> View Intelligence
      </button>
    );
  }
  if (status === 'no_content') {
    return (
      <button onClick={() => onGenerate(true)} className="w-full sm:w-auto py-2.5 px-4 text-[9px] font-black uppercase tracking-widest bg-red-500/5 text-red-600 border border-red-500/20 rounded-lg flex items-center justify-center gap-2 hover:bg-red-500/10 transition-all text-left sm:text-center leading-tight shadow-sm">
        <AlertCircle className="h-4 w-4 flex-shrink-0" /> <span className="hidden sm:inline">Force Intel</span><span className="sm:hidden">Force</span>
      </button>
    );
  }
  if (status === 'failed') {
    return (
      <button onClick={() => onGenerate(false)} className="w-full sm:w-auto py-2.5 px-4 text-[9px] font-black uppercase tracking-widest bg-red-500/5 text-red-600 border border-red-500/20 rounded-lg flex items-center justify-center gap-2 hover:bg-red-500/10 transition-all shadow-sm">
        <RefreshCw className="h-4 w-4" /> Retry Intel
      </button>
    );
  }
  return (
    <button onClick={() => onGenerate(false)} className="w-full sm:w-auto py-2.5 px-4 text-[9px] font-black uppercase tracking-widest bg-background border border-[#c9a84c]/40 text-[#c9a84c] rounded-lg flex items-center justify-center gap-2 hover:bg-[#c9a84c]/5 transition-all shadow-sm">
      <FileText className="h-4 w-4" /> Generate Intel
    </button>
  );
}

// ── Day Detail Modal (Compact) ────────────────────────────────────────
function DayModal({ day, onClose, progress, onToggleSubtopic, onMarkComplete, noteStatusMap, isGeneratingLocal, onGenerateNote, onViewNote }: { 
  day: DailyPlan; 
  onClose: () => void; 
  progress: StudyProgress | null; 
  onToggleSubtopic: (subtopic: string) => void; 
  onMarkComplete: (feedback: { status: 'finished' | 'need_revisit', difficulty: 'easy' | 'medium' | 'hard', notes: string }) => void;
  noteStatusMap: Map<string, string>;
  isGeneratingLocal: boolean;
  onGenerateNote: (day: DailyPlan, topic: string, subtopics: string[], force: boolean) => void;
  onViewNote: (day: number, topic: string) => void;
}) {
  const [feedbackStatus, setFeedbackStatus] = useState<'finished' | 'need_revisit'>(progress?.feedback_status || 'finished');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(progress?.difficulty || 'medium');
  const [notes, setNotes] = useState(progress?.user_notes || '');

  const config = DAY_TYPE_CONFIG[day.day_type] || DAY_TYPE_CONFIG.study;
  const Icon = config.icon;
  const completedSubs = progress?.completed_subtopics || [];

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-surface rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto border border-border-subtle animate-zoom-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-background border border-border-subtle flex items-center justify-center text-foreground">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-black text-subtle uppercase tracking-widest mb-1">MISSION DAY {day.day_number}</p>
                <h3 className="text-lg font-black text-foreground tracking-tighter leading-tight uppercase">{day.primary_topic || config.label}</h3>
                {day.study_method && (
                  <span className="inline-block px-2 py-0.5 mt-2 bg-[#1e3a5f]/10 text-[#1e3a5f] border border-[#1e3a5f]/20 rounded text-[9px] font-black uppercase tracking-widest">Method: {day.study_method}</span>
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-background rounded-xl transition-all text-muted">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {day.learning_objective && (
            <div className="bg-[#1e3a5f]/5 border-l-2 border-[#1e3a5f] p-4 rounded-r-xl shadow-sm">
               <p className="text-[10px] font-black text-[#1e3a5f] uppercase tracking-widest mb-1">Learning Objective</p>
               <p className="text-xs font-medium text-foreground leading-relaxed">{day.learning_objective}</p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-6">
             <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-[#c9a84c]" />
                <div>
                   <p className="text-[9px] font-black text-subtle uppercase tracking-widest">Duration</p>
                   <p className="text-sm font-black text-foreground">{day.estimated_hours} Hours</p>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-[#c9a84c]" />
                <div>
                   <p className="text-[9px] font-black text-subtle uppercase tracking-widest">Target Date</p>
                   <p className="text-sm font-black text-foreground">{new Date(day.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</p>
                </div>
             </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[9px] font-black text-subtle uppercase tracking-widest">Daily Objectives</h4>
            <div className="space-y-1.5">
              {day.subtopics_to_cover.map((sub, i) => {
                const done = completedSubs.includes(sub);
                return (
                  <label key={i} className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer group shadow-sm ${done ? 'bg-background border-transparent opacity-60' : 'bg-background border-border-subtle hover:border-[#c9a84c]/40'}`}>
                    <div className="mt-0.5">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${done ? 'bg-[#c9a84c] border-[#c9a84c]' : 'border-border-subtle group-hover:border-[#c9a84c]/40'}`}>
                          {done && <Check className="h-2.5 w-2.5 text-[#1e3a5f]" />}
                      </div>
                      <input type="checkbox" hidden checked={done} onChange={() => onToggleSubtopic(sub)} />
                    </div>
                    <span className={`reading-area text-[11px] font-black uppercase tracking-widest leading-relaxed ${done ? 'line-through text-subtle' : 'text-foreground'}`}>{sub}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {day.focus_points && day.focus_points.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-[9px] font-black text-subtle uppercase tracking-widest">Focus Points</h4>
              <ul className="list-decimal list-inside space-y-1.5 pl-1">
                {day.focus_points.map((pt, i) => (
                  <li key={i} className="text-[11px] font-medium text-foreground leading-relaxed">{pt}</li>
                ))}
              </ul>
            </div>
          )}

          {day.avoid_mistakes && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl shadow-sm">
               <div className="flex items-center gap-2 mb-2">
                 <AlertTriangle className="h-3 w-3 text-yellow-600" />
                 <span className="text-[9px] font-black text-yellow-600 uppercase tracking-widest">Avoid Mistakes</span>
               </div>
               <p className="text-[11px] font-medium text-foreground leading-relaxed">{day.avoid_mistakes}</p>
            </div>
          )}

          {day.exam_connection && (
            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl shadow-sm">
               <div className="flex items-center gap-2 mb-2">
                 <Target className="h-3 w-3 text-blue-600" />
                 <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Previous Exam Pattern</span>
               </div>
               <p className="text-[11px] font-medium text-foreground leading-relaxed">{day.exam_connection}</p>
            </div>
          )}

          {day.study_tips && (
            <div className="bg-[#c9a84c]/5 rounded-xl p-4 border border-[#c9a84c]/20 shadow-sm">
               <div className="flex items-center gap-2 mb-2">
                 <Zap className="h-3 w-3 text-[#c9a84c]" />
                 <span className="text-[9px] font-black text-[#c9a84c] uppercase tracking-widest">Efficiency Tip</span>
               </div>
               <p className="reading-area text-[12px] text-foreground font-medium italic opacity-90 leading-relaxed">{day.study_tips}</p>
            </div>
          )}

          {day.resources_hint && (
            <p className="text-[10px] font-medium text-subtle italic text-center pt-2">{day.resources_hint}</p>
          )}

          {!progress?.is_completed && (
            <div className="bg-background p-4 rounded-xl border border-border-subtle space-y-4 shadow-sm">
              <h4 className="text-[9px] font-black text-subtle uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-[#c9a84c]" /> Session Feedback
              </h4>
              
              <div className="space-y-3">
                <p className="text-[8px] font-black text-subtle uppercase tracking-widest">Completion Status</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setFeedbackStatus('finished')}
                    className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${feedbackStatus === 'finished' ? 'bg-[#1e3a5f] text-[#c9a84c] border-[#1e3a5f]' : 'bg-surface text-subtle border-border-subtle'}`}
                  >
                    Fully Finished
                  </button>
                  <button 
                    onClick={() => setFeedbackStatus('need_revisit')}
                    className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all shadow-sm ${feedbackStatus === 'need_revisit' ? 'bg-[#c9a84c] text-[#1e3a5f] border-[#c9a84c]' : 'bg-surface text-subtle border-border-subtle'}`}
                  >
                    Need Revisit
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[8px] font-black text-subtle uppercase tracking-widest">Topic Difficulty</p>
                <div className="flex gap-2">
                  {[
                    { id: 'easy', label: 'Easy' },
                    { id: 'medium', label: 'Medium' },
                    { id: 'hard', label: 'Hard' }
                  ].map((d) => (
                    <button 
                      key={d.id}
                      onClick={() => setDifficulty(d.id as any)}
                      className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                        difficulty === d.id 
                          ? 'bg-[#1e3a5f] text-[#c9a84c] border-[#1e3a5f]' 
                          : 'bg-surface text-subtle border-border-subtle hover:border-muted'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[9px] font-black text-muted uppercase">Self-Reflection / Notes</p>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="OBSERVATIONS FROM THIS SESSION..."
                  className="w-full bg-background border border-border-subtle rounded-xl p-3 text-[11px] font-black uppercase tracking-widest text-foreground focus:ring-2 focus:ring-[#c9a84c]/20 focus:border-[#c9a84c] focus:outline-none transition-all resize-none h-16 shadow-sm placeholder:text-subtle/30"
                />
              </div>
            </div>
          )}

          {progress?.is_completed && (
            <div className="p-4 rounded-xl bg-[#c9a84c]/5 border border-[#c9a84c]/10 space-y-3">
              <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest">
                <span className="text-[#c9a84c]">Reflection Logged</span>
                <span className="text-subtle">{new Date(progress.completed_at!).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-6 py-3 border-y border-border-subtle">
                <div>
                   <p className="text-[7px] font-black text-subtle uppercase">Status</p>
                   <p className="text-[10px] font-black text-foreground capitalize">{progress.feedback_status?.replace('_', ' ') || 'N/A'}</p>
                </div>
                <div>
                   <p className="text-[7px] font-black text-subtle uppercase">Difficulty</p>
                   <p className="text-[10px] font-black text-foreground capitalize">{progress.difficulty || 'N/A'}</p>
                </div>
              </div>
              {progress.user_notes && (
                <p className="text-[10px] font-black text-muted uppercase tracking-widest leading-relaxed">"{progress.user_notes}"</p>
              )}
            </div>
          )}

          <button
            onClick={() => onMarkComplete({ status: feedbackStatus, difficulty, notes })}
            disabled={progress?.is_completed}
            className={`w-full py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              progress?.is_completed ? 'bg-background border border-border-subtle text-[#c9a84c]' : 'bg-[#1e3a5f] text-[#c9a84c] hover:opacity-90 active:scale-[0.99] shadow-lg shadow-[#1e3a5f]/10'
            }`}
          >
            {progress?.is_completed ? (
              <><CheckCircle2 className="h-4 w-4" /> SECURED</>
            ) : (
              <><Check className="h-4 w-4" /> Mark Day Complete</>
            )}
          </button>
          
          <div className="space-y-3 pt-4 border-t border-border-subtle mt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-subtle uppercase tracking-widest">Primary Topic</span>
                <GenerateNotesButton 
                  dayNumber={day.day_number}
                  status={noteStatusMap.get(`${day.day_number}-${day.primary_topic}`)}
                  isGeneratingLocal={isGeneratingLocal}
                  onGenerate={(force) => onGenerateNote(day, day.primary_topic, day.subtopics_to_cover, force)}
                  onView={() => onViewNote(day.day_number, day.primary_topic)}
                />
              </div>
              
              {day.secondary_topic && (
                <div className="flex items-center justify-between pt-1 border-t border-border-subtle/50">
                  <span className="text-[9px] font-black text-subtle uppercase tracking-widest line-clamp-1 flex-1 mr-4">{day.secondary_topic}</span>
                  <GenerateNotesButton 
                    dayNumber={day.day_number}
                    status={noteStatusMap.get(`${day.day_number}-${day.secondary_topic}`)}
                    isGeneratingLocal={isGeneratingLocal}
                    onGenerate={(force) => onGenerateNote(day, day.secondary_topic!, [], force)}
                    onView={() => onViewNote(day.day_number, day.secondary_topic!)}
                  />
                </div>
              )}

              {day.revision_topics && day.revision_topics.length > 0 && day.revision_topics.map((revTopic, idx) => (
                <div key={idx} className="flex items-center justify-between pt-1 border-t border-border-subtle/50">
                  <span className="text-[9px] font-black text-subtle uppercase tracking-widest line-clamp-1 flex-1 mr-4">Revision: {revTopic}</span>
                  <GenerateNotesButton 
                    dayNumber={day.day_number}
                    status={noteStatusMap.get(`${day.day_number}-${revTopic}`)}
                    isGeneratingLocal={isGeneratingLocal}
                    onGenerate={(force) => onGenerateNote(day, revTopic, [], force)}
                    onView={() => onViewNote(day.day_number, revTopic)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
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
  const [generatingNotesFor, setGeneratingNotesFor] = useState<number | null>(null);

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
                setGeneratingNotesFor(null);
              } else if (updatedNote.generation_status === 'failed') {
                toast.error(`Generation failed for ${updatedNote.topic}`);
                setGeneratingNotesFor(null);
              }
            }
          }
        )
        .subscribe();
        
      return () => { supabase.removeChannel(channel); };
    }
  }, [activeExamId, fetchPlan, fetchNoteStatuses, supabase]);

  const handleGenerateNote = async (day: DailyPlan, topicToGen: string, subtopicsToGen: string[], force = false) => {
    if (!activeExamId) return;
    setGeneratingNotesFor(day.day_number);
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
          force_generate: force
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 403) {
          toast.error("Daily limit reached", { description: "Upgrade to Pro for unlimited note generations." });
          showUpgradeModal('notes_limit');
        } else {
          throw new Error(data.error || 'Failed to generate notes');
        }
        setGeneratingNotesFor(null);
      } else if (data.status === 'no_content_found') {
        toast.error("No relevant study material found. Please upload notes.");
        setGeneratingNotesFor(null);
      } else {
        // Success
        window.dispatchEvent(new CustomEvent('usage-updated'));
      }
    } catch (e: any) {
      toast.error(e.message);
      setGeneratingNotesFor(null);
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
            toast.error('Mission Blocked', { description: 'Missing Syllabus! Upload your syllabus in Documents to proceed.' });
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
        toast.success('Roadmap Deployed', { description: 'Your tactical study plan is ready for action.' });
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
      toast.error('Engine Malfunction', { description: 'Roadmap generation failed. Our team has been notified.' });
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
  const daysRem = exams.find((e: Exam) => e.id === activeExamId) ? Math.max(0, Math.ceil((new Date(exams.find((e: Exam) => e.id === activeExamId)!.exam_date).getTime() - Date.now()) / 86400000)) : 0;
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
      {selectedDay && plan && <DayModal 
        day={selectedDay} 
        onClose={() => setSelectedDay(null)} 
        progress={getProgressForDay(selectedDay.day_number)} 
        onToggleSubtopic={s => toggleSubtopic(selectedDay, s)} 
        onMarkComplete={f => markDayComplete(selectedDay, f)} 
        noteStatusMap={noteStatusMap}
        isGeneratingLocal={generatingNotesFor === selectedDay.day_number}
        onGenerateNote={(d, topic, subtopics, force) => handleGenerateNote(d, topic, subtopics, force)}
        onViewNote={(day, topic) => router.push(`/dashboard/study-notes?day=${day}&topic=${encodeURIComponent(topic)}`)}
      />}

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

      {/* Header (Minimalist) */}
      <div className="bg-surface p-6 rounded-2xl border border-border-subtle relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -mr-32 -mt-32" />
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
            <div className="space-y-4">
               <h1 className="text-3xl font-black text-foreground tracking-tighter leading-tight">
                  STUDY <span className="text-[#c9a84c]">ROADMAP</span>
               </h1>
               <div className="flex flex-wrap gap-2 mb-6">
                  {exams.map((e: Exam) => (
                    <button 
                      key={e.id} onClick={() => { setActiveExamId(e.id); setPlan(null); }} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all min-h-[36px] shadow-sm ${activeExamId === e.id ? 'bg-[#1e3a5f] text-[#c9a84c] shadow-[#1e3a5f]/10' : 'bg-background border border-border-subtle text-subtle hover:text-foreground'}`}>
                      {e.exam_name}
                    </button>
                  ))}
               </div>
            </div>

            {planData && (
              <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                  <div className="bg-background border border-border-subtle p-4 rounded-xl">
                     <p className="text-[8px] font-black text-subtle uppercase tracking-widest mb-2">{t('timeline')}</p>
                     <p className="text-2xl font-black text-foreground">{daysRem} <span className="text-[9px] text-subtle font-black uppercase tracking-widest ml-1">{t('days_left')}</span></p>
                  </div>
                 <div className="bg-background border border-border-subtle p-4 rounded-xl">
                    <p className="text-[8px] font-black text-subtle uppercase tracking-widest mb-2">{t('milestones')}</p>
                    <div className="flex items-end gap-2 mb-2">
                       <p className="text-2xl font-black text-foreground leading-none">{completionPct}%</p>
                    </div>
                    <div className="h-1 bg-border-subtle rounded-full overflow-hidden"><div className="h-full bg-[#c9a84c]" style={{width: `${completionPct}%` }} /></div>
                 </div>
              </div>
            )}
         </div>
      </div>

      {!planData ? (
        <div className="bg-surface p-12 rounded-2xl text-center border border-border-subtle shadow-sm">
           <div className="h-12 w-12 rounded-lg bg-background border border-border-subtle flex items-center justify-center mx-auto mb-6">
              <Sparkles className="h-5 w-5 text-accent" />
           </div>
           <h2 className="text-2xl font-black text-foreground tracking-tighter mb-3">AI ROADMAP GENERATION</h2>
           <p className="text-xs text-subtle font-medium max-w-sm mx-auto mb-10 leading-relaxed">
             Loksewa AI will analyze your syllabus and past performance to build a high-efficiency study timeline.
           </p>
           
           {errorMsg && (
             <div className="mb-8 p-4 rounded-xl bg-background border border-border-subtle text-subtle text-[10px] font-black max-w-md mx-auto flex flex-col items-center gap-2 shadow-sm">
               <AlertTriangle className="h-4 w-4 text-[#c9a84c]" />
               <p className="text-center uppercase tracking-widest">{errorMsg}</p>
             </div>
           )}

            <button onClick={() => handleGenerate()} className="w-full sm:w-auto bg-[#1e3a5f] text-[#c9a84c] px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[44px] shadow-xl shadow-[#1e3a5f]/10">
              <Zap className="h-4 w-4" /> Build My Roadmap
           </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Timeline */}
           <div className="lg:col-span-8 space-y-6">
              {todayPlan && (
                <div className="bg-surface border border-border-subtle rounded-2xl p-6 shadow-sm relative overflow-hidden group">
                   <div className="flex flex-col sm:flex-row justify-between items-start gap-5 relative z-10">
                      <div className="flex-1 space-y-2.5">
                         <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-accent/10 text-accent text-[8px] font-black tracking-widest uppercase rounded">MISSION: DAY {todayPlan.day_number}</span>
                            <span className="text-[8px] font-black text-subtle uppercase flex items-center gap-1 tracking-widest"><Flame className="h-2.5 w-2.5 text-accent" /> {todayPlan.estimated_hours}H Load</span>
                         </div>
                         <h2 className="text-3xl font-black text-foreground leading-tight tracking-tighter">{todayPlan.primary_topic}</h2>
                      </div>
                      <div className="w-full sm:w-32 space-y-2">
                         <button onClick={() => setSelectedDay(todayPlan)} className="w-full py-2 text-[9px] font-black uppercase tracking-widest bg-background border border-border-subtle rounded-lg min-h-[40px] hover:bg-surface transition-all">Details</button>
                         <button onClick={() => markDayComplete(todayPlan, { status: 'finished', difficulty: 'medium', notes: 'Quick complete' })} disabled={getProgressForDay(todayPlan.day_number)?.is_completed} className={`w-full py-2 text-[9px] font-black uppercase tracking-widest rounded-lg min-h-[40px] shadow-sm transition-all ${getProgressForDay(todayPlan.day_number)?.is_completed ? 'bg-[#c9a84c]/10 text-[#c9a84c]' : 'bg-[#1e3a5f] text-[#c9a84c] shadow-[#1e3a5f]/10'}`}>
                            {getProgressForDay(todayPlan.day_number)?.is_completed ? 'SECURED' : 'COMPLETE'}
                         </button>
                         <div className="space-y-3 pt-2">
                           <div className="flex items-center justify-between gap-4">
                             <span className="text-[8px] font-black text-subtle uppercase truncate max-w-[100px]">{todayPlan.primary_topic}</span>
                             <GenerateNotesButton 
                                dayNumber={todayPlan.day_number}
                                status={noteStatusMap.get(`${todayPlan.day_number}-${todayPlan.primary_topic}`)}
                                isGeneratingLocal={generatingNotesFor === todayPlan.day_number}
                                onGenerate={(force) => handleGenerateNote(todayPlan, todayPlan.primary_topic, todayPlan.subtopics_to_cover, force)}
                                onView={() => router.push(`/dashboard/study-notes?day=${todayPlan.day_number}&topic=${encodeURIComponent(todayPlan.primary_topic)}`)}
                             />
                           </div>
                           {todayPlan.secondary_topic && (
                             <div className="flex items-center justify-between gap-4 pt-1 border-t border-border-subtle/30">
                               <span className="text-[8px] font-black text-subtle uppercase truncate max-w-[100px]">{todayPlan.secondary_topic}</span>
                               <GenerateNotesButton 
                                  dayNumber={todayPlan.day_number}
                                  status={noteStatusMap.get(`${todayPlan.day_number}-${todayPlan.secondary_topic}`)}
                                  isGeneratingLocal={generatingNotesFor === todayPlan.day_number}
                                  onGenerate={(force) => handleGenerateNote(todayPlan, todayPlan.secondary_topic!, [], force)}
                                  onView={() => router.push(`/dashboard/study-notes?day=${todayPlan.day_number}&topic=${encodeURIComponent(todayPlan.secondary_topic!)}`)}
                               />
                             </div>
                           )}
                           
                           {todayPlan.revision_topics && todayPlan.revision_topics.length > 0 && todayPlan.revision_topics.slice(0, 2).map((revTopic, idx) => (
                             <div key={idx} className="flex items-center justify-between gap-4 pt-1 border-t border-border-subtle/30">
                               <span className="text-[8px] font-black text-subtle uppercase truncate max-w-[100px]">Rev: {revTopic}</span>
                               <GenerateNotesButton 
                                  dayNumber={todayPlan.day_number}
                                  status={noteStatusMap.get(`${todayPlan.day_number}-${revTopic}`)}
                                  isGeneratingLocal={generatingNotesFor === todayPlan.day_number}
                                  onGenerate={(force) => handleGenerateNote(todayPlan, revTopic, [], force)}
                                  onView={() => router.push(`/dashboard/study-notes?day=${todayPlan.day_number}&topic=${encodeURIComponent(revTopic)}`)}
                               />
                             </div>
                           ))}
                         </div>
                      </div>
                   </div>
                </div>
               )}

               <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                     <h3 className="text-[10px] font-black text-subtle uppercase tracking-widest">WEEKLY SCHEDULE</h3>
                     <button onClick={() => setConfirmRegen(true)} className="text-[8px] font-black text-subtle hover:text-accent uppercase tracking-widest flex items-center gap-1.5 p-2"><RefreshCw className="h-2.5 w-2.5" /> Reset</button>
                  </div>
                  <div className="space-y-3">
                     {Object.entries(weeklyGroups).map(([wk, ds]) => {
                        const weekNum = parseInt(wk);
                        const open = expandedWeeks.has(weekNum);
                        const target = planData.weekly_targets.find(w => w.week_number === weekNum);
                        const done = ds.filter(d => getProgressForDay(d.day_number)?.is_completed).length;
                        return (
                          <div key={wk} className="bg-surface border border-border-subtle rounded-2xl overflow-hidden">
                             <button onClick={() => toggleWeek(weekNum)} className="w-full p-3 flex items-center justify-between hover:bg-background transition-colors min-h-[56px]">
                                <div className="flex items-center gap-4 flex-1">
                                   <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0 ${open ? 'bg-[#1e3a5f] text-[#c9a84c] shadow-md shadow-[#1e3a5f]/20' : 'bg-background border border-border-subtle text-subtle'}`}>{wk}</div>
                                   <div className="text-left"><h4 className="text-[10px] font-black uppercase tracking-widest">Week {wk}</h4><p className="text-[9px] text-subtle font-medium truncate max-w-[120px] sm:max-w-xs">{target?.weekly_goal}</p></div>
                                </div>
                                <div className="flex items-center gap-3">
                                   <div className="w-16 h-1 bg-border-subtle rounded-full hidden sm:block"><div className="h-full bg-[#c9a84c]" style={{width: `${(done / ds.length) * 100}%` }} /></div>
                                   <ChevronDown className={`h-4 w-4 text-subtle transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
                                </div>
                             </button>
                             {open && (
                                <div className="px-3 pb-4 grid grid-cols-2 lg:grid-cols-4 gap-2 animate-slide-in-top">
                                   {ds.map(d => {
                                      const cfg = DAY_TYPE_CONFIG[d.day_type] || DAY_TYPE_CONFIG.study;
                                      const fin = getProgressForDay(d.day_number)?.is_completed;
                                      const isT = d.date === todayStr;
                                      return (
                                        <div key={d.day_number} onClick={() => setSelectedDay(d)} className={`cursor-pointer p-3 rounded-xl border transition-all flex flex-col justify-between text-left h-auto min-h-[7rem] relative ${isT ? 'border-accent bg-background' : fin ? 'bg-background opacity-50' : 'bg-background border-border-subtle hover:border-accent/40'}`}>
                                           <div className="flex justify-between items-start">
                                              <div className="space-y-0.5"><p className="text-[8px] font-black text-subtle uppercase tracking-widest">{new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' })}</p><p className="text-xs font-black leading-none">Day {d.day_number}</p></div>
                                              <cfg.icon className="h-3 w-3 text-subtle opacity-40" />
                                           </div>
                                           <p className="text-[10px] font-black uppercase leading-tight line-clamp-2 mt-2 mb-3">{d.primary_topic || cfg.label}</p>
                                           <div className="mt-auto w-full space-y-1" onClick={e => e.stopPropagation()}>
                                               <div className="flex gap-1">
                                                  <div className={`h-1 flex-1 rounded-full ${noteStatusMap.get(`${d.day_number}-${d.primary_topic}`) === 'ready' ? 'bg-[#c9a84c]' : 'bg-border-subtle'}`} />
                                                  {d.secondary_topic && (
                                                    <div className={`h-1 flex-1 rounded-full ${noteStatusMap.get(`${d.day_number}-${d.secondary_topic}`) === 'ready' ? 'bg-[#c9a84c]' : 'bg-border-subtle'}`} />
                                                  )}
                                               </div>
                                            </div>
                                           {fin && <CheckCircle2 className="absolute top-1 right-1 h-3 w-3 text-[#c9a84c]" />}
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
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-4">
               <div className="bg-surface border border-border-subtle rounded-2xl p-6 space-y-6 sticky top-24">
                  <div className="space-y-4">
                     <h2 className="text-[10px] font-black text-subtle tracking-widest flex items-center gap-2 uppercase">
                        <Clock className="h-3.5 w-3.5 text-accent" /> Active Focus
                     </h2>
                     <p className="text-xs font-medium text-foreground bg-background p-4 rounded-lg border border-border-subtle leading-relaxed">
                        {currentWeekTarget?.weekly_goal || 'Stay consistent with your targets.'}
                     </p>
                  </div>
                  <div className="space-y-4">
                     <h4 className="text-[9px] font-black text-subtle uppercase tracking-widest flex items-center gap-2"><Zap className="h-3 w-3 text-accent" /> Methodology</h4>
                      <ul className="space-y-3">
                         <li className="flex gap-3 items-center"><Sparkles className="h-4 w-4 text-[#c9a84c]" /><p className="text-[10px] font-black uppercase tracking-widest text-muted">Priority Weighting</p></li>
                         <li className="flex gap-3 items-center"><BookMarked className="h-4 w-4 text-[#c9a84c]" /><p className="text-[10px] font-black uppercase tracking-widest text-muted">Spaced Repetition</p></li>
                      </ul>
                  </div>
                  <div className="pt-4 border-t border-border-subtle">
                      <div className="bg-[#1e3a5f] p-4 rounded-xl text-[#c9a84c] shadow-lg shadow-[#1e3a5f]/10">
                         <p className="text-[9px] font-black uppercase tracking-widest mb-2 opacity-70">Phase Intensity</p>
                         <p className="text-xl font-black italic">Deep Focus</p>
                         <div className="mt-3 h-1 bg-background/20 rounded-full overflow-hidden"><div className="h-full bg-[#c9a84c] w-3/4 shadow-[0_0_8px_rgba(201,168,76,0.5)]" /></div>
                      </div>
                  </div>
                  
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
