'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip } from '@/components/ui/tooltip';
import { EmptyState } from '@/components/ui/empty-state';
import { motion, AnimatePresence } from 'framer-motion';

import { 
  Zap, 
  ChevronRight, 
  RotateCcw, 
  Sparkles, 
  Target, 
  Clock, 
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Trophy,
  Dices,
  Info,
  Check,
  X as XIcon,
  HelpCircle,
  Layers,
  ChevronLeft,
  Star,
  Lightbulb,
  Timer,
  RefreshCw
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDashboard } from '@/components/dashboard/DashboardProvider';
import ReactMarkdown from 'react-markdown';
import { useUpgradeModal } from '@/lib/UpgradeModalContext';
import { UsageIndicator } from '@/components/dashboard/UsageIndicator';

// --- Types ---
interface Flashcard {
  id: string;
  front: string;
  back: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hint: string | null;
  exam_tip: string | null;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: { A: string, B: string, C: string, D: string };
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  source_reference: string;
}

interface Exam {
  id: string;
  exam_name: string;
}

// --- Shared Components ---

function GenerationOverlay({ step, type }: { step: number; type: 'flashcards' | 'quiz' }) {
  const steps = type === 'flashcards' ? [
    { label: 'Mining knowledge chunks', detail: 'Retrieving context from your documents' },
    { label: 'Synthesizing flashcards', detail: 'Generating recall-focused questions' },
    { label: 'Finalizing deck', detail: 'Structuring for optimal retention' },
  ] : [
    { label: 'Mining syllabus patterns', detail: 'Extracting Loksewa-style logic' },
    { label: 'Synthesizing distractors', detail: 'Creating challenging plausibility' },
    { label: 'Hardening mission', detail: 'Validating legal and factual citations' },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl shadow-2xl max-w-md w-full p-10 border border-border-subtle overflow-hidden relative animate-zoom-in">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 animate-pulse" />
        
        <div className="text-center mb-10 relative z-10">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-2xl border-4 border-background" />
            <div className="absolute inset-0 rounded-2xl border-4 border-[#c9a84c] border-t-transparent animate-spin" />
            <div className="absolute inset-3 rounded-xl bg-[#c9a84c]/10 flex items-center justify-center">
              {type === 'flashcards' ? <Layers className="h-7 w-7 text-[#c9a84c] animate-pulse" /> : <Dices className="h-7 w-7 text-[#c9a84c] animate-pulse" />}
            </div>
          </div>
          <h3 className="text-xl font-black text-foreground tracking-tighter uppercase">{type === 'flashcards' ? 'Deck Forge' : 'Mission Engine'}</h3>
          <p className="text-[10px] text-accent mt-2 font-black uppercase tracking-widest">Provisioning {type === 'flashcards' ? 'memory' : 'MCQ'} protocols...</p>
        </div>

        <div className="space-y-6 relative z-10">
          {steps.map((s, i) => (
            <div key={i} className={`flex items-start gap-4 transition-all duration-700 ${i < step ? 'opacity-40' : i === step ? 'opacity-100' : 'opacity-20'}`}>
              <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border-2 ${i < step ? 'bg-[#1e3a5f] border-[#1e3a5f] text-[#c9a84c]' : i === step ? 'border-[#c9a84c] text-[#c9a84c] animate-pulse' : 'border-border-subtle text-subtle'}`}>
                {i < step ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="text-[10px] font-black">{i + 1}</span>}
              </div>
              <div>
                <p className={`text-[10px] font-black uppercase tracking-widest ${i === step ? 'text-foreground' : 'text-subtle'}`}>{s.label}</p>
                <p className="text-[9px] text-subtle font-black uppercase tracking-widest mt-0.5">{s.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PracticePage() {
  const supabase = createClient();
  const { language, activeExamId, setActiveExamId, t } = useDashboard();
  const [activeTab, setActiveTab] = useState<'flashcards' | 'quiz' | 'mock-test'>('flashcards');
  const [loading, setLoading] = useState(true);
  
  // Shared state
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [topics, setTopics] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [customTopic, setCustomTopic] = useState('');
  const [error, setError] = useState<string | null>(null);

  // --- Flashcard State ---
  const [generatingFlashcards, setGeneratingFlashcards] = useState(false);
  const [genStepFlashcards, setGenStepFlashcards] = useState(0);
  const [flashcardCount, setFlashcardCount] = useState<number>(10);
  const [deck, setDeck] = useState<Flashcard[]>([]);
  const [currentFlashIndex, setCurrentFlashIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashcardRatings, setFlashcardRatings] = useState<Record<number, 'didnt-know' | 'almost' | 'got-it'>>({});
  const [flashcardSessionComplete, setFlashcardSessionComplete] = useState(false);

  // --- Quiz State ---
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [genStepQuiz, setGenStepQuiz] = useState(0);
  const [quizQuestionCount, setQuizQuestionCount] = useState<number>(10);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [userQuizAnswers, setUserQuizAnswers] = useState<Record<number, string>>({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null);
  const [quizEndTime, setQuizEndTime] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // --- Mock Test State ---
  const [generatingMockTest, setGeneratingMockTest] = useState(false);
  const [mockTest, setMockTest] = useState<any>(null);
  const [mockTestActive, setMockTestActive] = useState(false);
  const [mockTestTimeLeft, setMockTestTimeLeft] = useState<number>(0);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);

  const { showUpgradeModal } = useUpgradeModal();
  const { isPro, isAdmin } = useDashboard();
  const router = useRouter();

  // Fetch initial data
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: examsData } = await supabase
        .from('user_exams')
        .select('id, exam_name')
        .eq('user_id', user.id)
        .order('exam_date', { ascending: true });

      if (examsData?.length) {
        setExams(examsData);
        if (!selectedExamId) {
          const initialId = activeExamId || examsData[0].id;
          setSelectedExamId(initialId);
          if (!activeExamId) setActiveExamId(initialId);
        }
      }
      setLoading(false);
    }
    init();
  }, [supabase, activeExamId, setActiveExamId]);

  // Sync local selectedExamId with global activeExamId if global changes
  useEffect(() => {
    if (activeExamId && activeExamId !== selectedExamId) {
      setSelectedExamId(activeExamId);
    }
  }, [activeExamId, selectedExamId]);

  // Fetch topics when exam changes
  useEffect(() => {
    if (!selectedExamId) return;

    async function fetchTopics() {
      const { data } = await supabase
        .from('syllabus_analysis')
        .select('analysis_data')
        .eq('exam_id', selectedExamId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (data?.length) {
        const analysis = data[0].analysis_data as any;
        const topicNames = (analysis.topics || []).map((t: any) => t.topic_name);
        setTopics(topicNames);
        if (topicNames.length) setSelectedTopic(topicNames[0]);
      } else {
        setTopics([]);
        setSelectedTopic('custom');
      }
    }
    fetchTopics();
  }, [selectedExamId, supabase]);

  // --- Flashcard Handlers ---
  const handleGenerateFlashcards = async () => {
    const topicToUse = selectedTopic === 'custom' ? customTopic : selectedTopic;
    if (!topicToUse) return;

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    setGeneratingFlashcards(true);
    setGenStepFlashcards(0);
    setError(null);

    try {
      await new Promise(r => setTimeout(r, 600));
      setGenStepFlashcards(1);

      const res = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: selectedExamId,
          userId: authUser.id,
          topic: topicToUse,
          count: flashcardCount,
          language
        })
      });

      if (!res.ok) {
        if (res.status === 429 || res.status === 503) {
          throw new Error('Loksewa AI engine is currently at maximum capacity. Please wait 30 seconds.');
        }
        const data = await res.json().catch(() => ({}));
        let errMsg = data.message || 'Failed to generate flashcards';
        throw new Error(errMsg);
      }

      const data = await res.json();
      setGenStepFlashcards(2);
      await new Promise(r => setTimeout(r, 600));
      
      setDeck(data.flashcards);
      setCurrentFlashIndex(0);
      setIsFlipped(false);
      setFlashcardRatings({});
      setFlashcardSessionComplete(false);
      setActiveTab('flashcards');
      window.dispatchEvent(new CustomEvent('usage-updated'));
    } catch (e: any) {
      toast.error('Mission Failed', { description: e.message });
      setError(e.message);
    } finally {
      setGeneratingFlashcards(false);
    }
  };

  const handleFlashcardRate = async (rating: 'didnt-know' | 'almost' | 'got-it') => {
    const card = deck[currentFlashIndex];
    const newRatings = { ...flashcardRatings, [currentFlashIndex]: rating };
    setFlashcardRatings(newRatings);
    const difficultyMap = { 'didnt-know': 'hard', 'almost': 'medium', 'got-it': 'easy' };
    
    if (currentFlashIndex < deck.length - 1) {
      setCurrentFlashIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      setFlashcardSessionComplete(true);
      
      // Persist the flashcard session as a performance metric
      const gotIt = Object.values(newRatings).filter(r => r === 'got-it').length;
      const { data: { user } } = await supabase.auth.getUser();
      if (user && selectedExamId) {
        const { error: insertError } = await supabase.from('quiz_attempts').insert({
          user_id: user.id,
          exam_id: selectedExamId,
          topic: `Flashcards - ${selectedTopic || 'General'}`,
          score: gotIt,
          total_questions: deck.length,
        });
        if (insertError) {
          console.error('Failed to save flashcard session:', insertError);
          toast.error('Sync Failed', { description: 'Flashcard progress could not be saved to your profile.' });
        }
      }
    }
    await supabase.from('flashcards').update({ difficulty: difficultyMap[rating] }).eq('id', card.id);
  };

  // --- Quiz Handlers ---
  const handleGenerateQuiz = async () => {
    const topicToUse = selectedTopic === 'custom' ? customTopic : selectedTopic;
    if (!topicToUse) return;
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    // Plan Limit Check
    const resLimit = await fetch('/api/check-limits');
    const limitData = await resLimit.json();
    if (limitData.plan === 'free' && limitData.limits.quizzes.exceeded) {
      showUpgradeModal('quiz_limit');
      return;
    }

    setGeneratingQuiz(true);
    setGenStepQuiz(0);
    setError(null);
    try {
      await new Promise(r => setTimeout(r, 600));
      setGenStepQuiz(1);
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: selectedExamId,
          userId: authUser.id,
          topic: topicToUse,
          questionCount: quizQuestionCount,
          language
        })
      });
      if (!res.ok) {
        if (res.status === 429 || res.status === 503) {
          throw new Error('Loksewa AI engine is currently at maximum capacity. Please wait 30 seconds.');
        }
        const data = await res.json().catch(() => ({}));
        let errMsg = data.message || 'Failed to generate quiz';
        throw new Error(errMsg);
      }
      const data = await res.json();
      setGenStepQuiz(2);
      await new Promise(r => setTimeout(r, 600));
      setQuizQuestions(data.questions);
      setQuizFinished(false);
      setCurrentQuizIndex(0);
      setUserQuizAnswers({});
      setQuizStartTime(Date.now());
      setActiveTab('quiz');
      window.dispatchEvent(new CustomEvent('usage-updated'));
    } catch (e: any) {
      toast.error('Deployment Failed', { description: e.message });
      setError(e.message);
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handleQuizAnswer = (optionKey: string) => {
    if (userQuizAnswers[currentQuizIndex]) return; 
    setUserQuizAnswers(prev => ({ ...prev, [currentQuizIndex]: optionKey }));
    setShowExplanation(true);
  };

  const handleNextQuizQuestion = async () => {
    if (currentQuizIndex < quizQuestions.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
      setShowExplanation(false);
    } else {
      setQuizFinished(true);
      setQuizEndTime(Date.now());
      await saveQuizAttempt();
    }
  };

  // --- Mock Test Handlers ---
  const handleGenerateMockTest = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser || !selectedExamId) return;

    // Plan Limit Check
    if (!isPro && !isAdmin) {
      toast.error('Pro Feature', { description: 'Mock tests are available for Pro members only.' });
      showUpgradeModal('mock_test_limit');
      return;
    }

    setGeneratingMockTest(true);
    setError(null);
    try {
      const res = await fetch('/api/generate-mock-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId: selectedExamId, userId: authUser.id })
      });
      if (!res.ok) {
        if (res.status === 404) {
          toast.error('Intelligence Gap', { description: 'No Previous Year Questions found. Upload them to generate a mock test.' });
          router.push('/dashboard/documents');
          return;
        }
        throw new Error('Failed to generate mock test');
      }
      const data = await res.json();
      setMockTest(data.test);
      setMockTestTimeLeft((data.test.duration_minutes || 180) * 60);
      setMockTestActive(true);
    } catch (e: any) {
      toast.error('Mock Session Failed', { description: e.message });
      setError(e.message);
    } finally {
      setGeneratingMockTest(false);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (mockTestActive && mockTestTimeLeft > 0) {
      timer = setInterval(() => {
        setMockTestTimeLeft(prev => {
          if (prev <= 1) {
            setMockTestActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [mockTestActive, mockTestTimeLeft]);

  const saveQuizAttempt = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const correctCount = quizQuestions.reduce((acc, q, idx) => {
      return acc + (userQuizAnswers[idx] === q.correct_answer ? 1 : 0);
    }, 0);
    const detailLog = quizQuestions.map((q, idx) => ({
      question: q.question,
      user_answer: userQuizAnswers[idx],
      correct_answer: q.correct_answer,
      is_correct: userQuizAnswers[idx] === q.correct_answer
    }));
    const { error: insertError } = await supabase.from('quiz_attempts').insert({
      user_id: user.id,
      exam_id: selectedExamId,
      topic: selectedTopic === 'custom' ? customTopic : selectedTopic,
      score: correctCount,
      total_questions: quizQuestions.length
    });

    if (insertError) {
      console.error('Failed to save quiz attempt:', insertError);
      toast.error('Sync Failed', { description: 'Quiz results could not be saved to your profile.' });
    } else {
      toast.success('Session Saved', { description: 'Performance analytics updated.' });
    }
  };

  const score = quizQuestions.reduce((acc, q, idx) => {
    return acc + (userQuizAnswers[idx] === q.correct_answer ? 1 : 0);
  }, 0);
  const pct = quizQuestions.length > 0 ? Math.round((score / quizQuestions.length) * 100) : 0;

  if (loading) return (
    <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
      <Skeleton className="h-64 w-full rounded-2xl" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-32 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Skeleton className="lg:col-span-8 h-[600px] rounded-2xl" />
        <Skeleton className="lg:col-span-4 h-64 rounded-2xl" />
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-12">
      {generatingFlashcards && <GenerationOverlay step={genStepFlashcards} type="flashcards" />}
      {generatingQuiz && <GenerationOverlay step={genStepQuiz} type="quiz" />}

      {/* Hero Header */}
      <div className="bg-surface p-6 sm:p-8 rounded-2xl border border-border-subtle relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -mr-32 -mt-32" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-[10px] font-black text-accent uppercase tracking-widest">Practice Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tighter leading-tight uppercase">
            Master Your <span className="text-accent">Syllabus</span>
          </h1>
          <p className="text-xs text-subtle font-medium max-w-sm leading-relaxed">
            Hone your skills through AI-powered active recall and persistent repetition.
          </p>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex p-1.5 bg-surface border border-border-subtle rounded-xl w-fit mx-auto sm:mx-0">
        <button
          onClick={() => setActiveTab('flashcards')}
          className={`flex items-center gap-3 px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'flashcards' ? 'bg-[#1e3a5f] text-[#c9a84c] shadow-lg shadow-[#1e3a5f]/20' : 'text-subtle hover:text-foreground'}`}
        >
          <Layers className="h-4 w-4" />
          {t('flashcards')}
          <Tooltip content="Active recall cards generated from your documents." />
        </button>
        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex items-center gap-3 px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'quiz' ? 'bg-[#1e3a5f] text-[#c9a84c] shadow-lg shadow-[#1e3a5f]/20' : 'text-subtle hover:text-foreground'}`}
        >
          <Dices className="h-4 w-4" />
          {t('quizzes')}
          <Tooltip content="Scenario-based MCQs with detailed PSC-style explanations." />
        </button>
        <button
          onClick={() => setActiveTab('mock-test')}
          className={`flex items-center gap-3 px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'mock-test' ? 'bg-[#1e3a5f] text-[#c9a84c] shadow-lg shadow-[#1e3a5f]/20' : 'text-subtle hover:text-foreground'}`}
        >
          <Target className="h-4 w-4" />
          {t('mock_test')}
          <Tooltip content="Full-length exam simulations based on Previous Year Questions." />
        </button>
      </div>

      {/* Main Content Area */}
      {((activeTab === 'flashcards' && deck.length === 0) || (activeTab === 'quiz' && quizQuestions.length === 0) || (activeTab === 'mock-test' && !mockTestActive)) ? (
        /* --- CONFIGURATION HUB --- */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-surface border border-border-subtle rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-8">
                  <div className="h-8 w-8 rounded-lg bg-background border border-border-subtle flex items-center justify-center text-foreground shadow-sm">
                     <Target className="h-4 w-4" />
                  </div>
                  <h2 className="text-sm font-black text-foreground tracking-tighter uppercase tracking-widest">Initialize Session</h2>
              </div>

               <div className="mb-8 p-4 bg-background border border-border-subtle rounded-xl space-y-4">
                  <UsageIndicator type="quizzes" />
                  <UsageIndicator type="mock_tests" />
               </div>
              
              <div className="space-y-8 sm:space-y-10">
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-subtle uppercase tracking-wider ml-1">Target Mission</p>
                  <div className="flex flex-wrap gap-2">
                    {exams.length > 0 ? exams.map(e => (
                      <button key={e.id} onClick={() => setSelectedExamId(e.id)} className={`px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all min-h-[44px] shadow-sm ${selectedExamId === e.id ? 'bg-[#1e3a5f] text-[#c9a84c] shadow-[#1e3a5f]/10' : 'bg-background border border-border-subtle text-subtle hover:text-foreground'}`}>
                        {e.exam_name}
                      </button>
                    )) : (
                      <EmptyState 
                        icon={Target}
                        title="No Mission Initialized"
                        description="You need to set up an exam in settings before you can practice."
                        action={<Link href="/dashboard/settings" className="px-6 py-2.5 bg-[#1e3a5f] text-[#c9a84c] rounded-lg text-[10px] font-black uppercase tracking-widest">Go to Settings</Link>}
                      />
                    )}
                  </div>
                </div>

                {activeTab !== 'mock-test' && (
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-subtle uppercase tracking-wider ml-1">Knowledge Sector</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                       {topics.length > 0 ? topics.map(t => (
                         <button key={t} onClick={() => setSelectedTopic(t)} className={`p-4 rounded-xl border transition-all text-left flex items-start gap-3 min-h-[64px] shadow-sm ${selectedTopic === t ? 'bg-[#c9a84c]/5 border-[#c9a84c]' : 'bg-background border-border-subtle hover:border-[#c9a84c]/40'}`}>
                           <div className={`p-2 rounded-lg flex-shrink-0 ${selectedTopic === t ? 'bg-[#1e3a5f] text-[#c9a84c]' : 'bg-surface text-subtle'}`}>
                              <BookOpen className="h-3.5 w-3.5" />
                           </div>
                           <span className={`text-[12px] font-black leading-tight uppercase tracking-widest ${selectedTopic === t ? 'text-foreground' : 'text-subtle'}`}>{t}</span>
                         </button>
                       )) : (
                         <div className="sm:col-span-2 p-6 bg-background border border-dashed border-border-subtle rounded-xl flex items-center gap-4 text-subtle">
                            <AlertTriangle className="h-5 w-5" />
                            <p className="text-[11px] font-bold uppercase tracking-wider">No syllabus topics detected</p>
                         </div>
                       )}
                       <button onClick={() => setSelectedTopic('custom')} className={`p-4 rounded-xl border transition-all text-left flex items-start gap-3 sm:col-span-2 min-h-[64px] shadow-sm ${selectedTopic === 'custom' ? 'bg-[#c9a84c]/5 border-[#c9a84c]/40' : 'bg-background border-border-subtle hover:border-[#c9a84c]/40'}`}>
                          <div className={`p-2 rounded-lg flex-shrink-0 ${selectedTopic === 'custom' ? 'bg-[#1e3a5f] text-[#c9a84c]' : 'bg-surface text-subtle'}`}>
                             <Zap className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex-1">
                            <span className={`text-[10px] font-black uppercase tracking-widest block mb-1 ${selectedTopic === 'custom' ? 'text-foreground' : 'text-subtle'}`}>Custom Target</span>
                            {selectedTopic === 'custom' && (
                              <input type="text" value={customTopic} onChange={e => setCustomTopic(e.target.value)} placeholder="e.g., CONSTITUTION OF NEPAL..." className="w-full bg-background border border-border-subtle focus:border-[#c9a84c]/50 rounded-lg px-3 py-2 text-xs font-black uppercase tracking-widest outline-none mt-2 transition-all placeholder:text-subtle/30 min-h-[44px] shadow-sm" onClick={e => e.stopPropagation()} />
                            )}
                          </div>
                       </button>
                    </div>
                  </div>
                )}

                {activeTab !== 'mock-test' && (
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-subtle uppercase tracking-wider ml-1">Density</p>
                    <div className="flex flex-wrap gap-2">
                      {activeTab === 'flashcards' ? [10, 20, 30].map(n => (
                        <button key={n} onClick={() => setFlashcardCount(n)} className={`px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all min-h-[44px] shadow-sm ${flashcardCount === n ? 'bg-[#1e3a5f] text-[#c9a84c]' : 'bg-background border border-border-subtle text-subtle hover:text-foreground'}`}>{n} Units</button>
                      )) : [5, 10, 15, 20].map(n => (
                        <button key={n} onClick={() => setQuizQuestionCount(n)} className={`px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all min-h-[44px] shadow-sm ${quizQuestionCount === n ? 'bg-[#1e3a5f] text-[#c9a84c]' : 'bg-background border border-border-subtle text-subtle hover:text-foreground'}`}>{n} Steps</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-8 bg-red-500/5 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-600">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <p className="text-xs font-bold uppercase tracking-wider">{error}</p>
                </div>
              )}

              <button
                onClick={activeTab === 'flashcards' ? handleGenerateFlashcards : activeTab === 'quiz' ? handleGenerateQuiz : handleGenerateMockTest}
                disabled={(activeTab !== 'mock-test' && selectedTopic === 'custom' && !customTopic) || generatingFlashcards || generatingQuiz || generatingMockTest}
                className="w-full mt-10 py-4 rounded-xl bg-[#1e3a5f] text-[#c9a84c] font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-3 disabled:opacity-50 min-h-[56px] shadow-xl shadow-[#1e3a5f]/10"
              >
                {(generatingFlashcards || generatingQuiz || generatingMockTest) ? (
                  <><RefreshCw className="h-4 w-4 animate-spin" /> Processing...</>
                ) : (
                  <><Zap className="h-4 w-4" /> Deploy Session</>
                )}
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
             <div className="bg-surface border border-border-subtle rounded-2xl p-6 space-y-6">
                <h4 className="text-[10px] font-bold text-subtle uppercase tracking-wider">Protocol Overview</h4>
                <div className="space-y-6">
                   <div className="flex gap-4">
                      <div className="h-9 w-9 rounded-lg bg-background border border-border-subtle flex items-center justify-center text-[#c9a84c]"><Info className="h-4 w-4" /></div>
                      <div>
                        <p className="text-[13px] font-bold text-foreground leading-tight">PSC Calibration</p>
                        <p className="text-[11px] text-subtle font-medium mt-1">AI-generated content aligned with official PSC Nepal patterns.</p>
                      </div>
                   </div>
                   <div className="flex gap-4">
                      <div className="h-9 w-9 rounded-lg bg-background border border-border-subtle flex items-center justify-center text-[#c9a84c]"><Sparkles className="h-4 w-4" /></div>
                      <div>
                        <p className="text-[13px] font-black text-foreground leading-tight uppercase tracking-tighter">Act Reference</p>
                        <p className="text-[11px] text-subtle font-black uppercase tracking-widest mt-1 opacity-70">Citations from relevant legal acts.</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      ) : activeTab === 'flashcards' ? (
        /* --- FLASHCARD VIEW --- */
        <div className="max-w-4xl mx-auto space-y-10 animate-fade-in">
           {!flashcardSessionComplete ? (
             <div className="space-y-10">
                <div className="flex items-center justify-between px-2">
                   <div className="space-y-1">
                      <span className="text-[10px] font-bold text-accent uppercase tracking-wider">{selectedTopic === 'custom' ? customTopic : selectedTopic}</span>
                      <h4 className="text-xl font-black text-foreground tracking-tighter">Active Recall</h4>
                   </div>
                   <div className="text-right">
                      <span className="text-2xl font-black text-foreground tracking-tighter">{currentFlashIndex + 1}</span>
                      <span className="text-sm font-black text-subtle"> / {deck.length}</span>
                   </div>
                </div>
                 <div className="h-1 w-full bg-surface rounded-full overflow-hidden">
                    <div className="h-full bg-[#c9a84c] transition-all duration-700 shadow-[0_0_8px_rgba(201,168,76,0.3)]" style={{ width: `${((currentFlashIndex + 1) / deck.length) * 100}%` }} />
                 </div>
                <div className="w-full h-[320px] perspective-1000 cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
                  <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                    <div className="absolute inset-0 backface-hidden bg-surface rounded-2xl border border-border-subtle shadow-sm p-8 flex flex-col justify-between">
                       <div className="flex justify-between items-start">
                          <span className="px-2 py-0.5 bg-background border border-border-subtle text-subtle text-[9px] font-black tracking-widest uppercase rounded">Prompt</span>
                          <span className="text-[9px] font-black text-[#c9a84c] bg-[#c9a84c]/5 px-2 py-0.5 rounded tracking-widest uppercase border border-[#c9a84c]/20">{deck[currentFlashIndex].difficulty}</span>
                       </div>
                       <div className="flex-1 flex items-center justify-center text-center px-4">
                         <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tighter leading-snug">{deck[currentFlashIndex].front}</h3>
                       </div>
                       <div className="text-center pt-4 text-[9px] font-black text-subtle uppercase tracking-widest">Click to reveal</div>
                    </div>
                    <div className="absolute inset-0 backface-hidden bg-background rounded-2xl border border-accent/20 shadow-xl p-8 flex flex-col rotate-y-180 overflow-y-auto">
                       <span className="px-2 py-0.5 bg-accent/10 text-accent text-[9px] font-black tracking-widest uppercase rounded w-fit mb-6 border border-accent/20">Resolution</span>
                       <div className="flex-1 flex items-center justify-center text-center px-4">
                          <p className="text-base sm:text-lg font-medium text-foreground leading-relaxed whitespace-pre-wrap">{deck[currentFlashIndex].back}</p>
                       </div>
                       {deck[currentFlashIndex].exam_tip && (
                         <div className="mt-6 bg-surface p-4 rounded-xl border border-border-subtle flex items-start gap-3">
                            <Sparkles className="h-4 w-4 text-accent flex-shrink-0" />
                            <p className="text-[11px] font-medium text-subtle leading-relaxed italic">{deck[currentFlashIndex].exam_tip}</p>
                         </div>
                       )}
                    </div>
                  </div>
                </div>
                 <div className="flex flex-col items-center gap-8">
                   <div className="flex items-center gap-4">
                      <button disabled={currentFlashIndex === 0} onClick={(e) => { e.stopPropagation(); setCurrentFlashIndex(prev => prev - 1); setIsFlipped(false); }} className="p-4 rounded-xl bg-surface border border-border-subtle hover:border-accent/40 text-subtle hover:text-accent transition-all disabled:opacity-30 disabled:pointer-events-none min-h-[44px] min-w-[44px]"><ChevronLeft className="h-5 w-5" /></button>
                      <div className="px-6 py-3 rounded-xl bg-surface border border-border-subtle font-black text-[10px] tracking-widest text-subtle uppercase min-h-[44px] flex items-center">{currentFlashIndex + 1} OF {deck.length}</div>
                      <button disabled={currentFlashIndex === deck.length - 1} onClick={(e) => { e.stopPropagation(); setCurrentFlashIndex(prev => prev + 1); setIsFlipped(false); }} className="p-4 rounded-xl bg-surface border border-border-subtle hover:border-accent/40 text-subtle hover:text-accent transition-all disabled:opacity-30 disabled:pointer-events-none min-h-[44px] min-w-[44px]"><ChevronRight className="h-5 w-5" /></button>
                   </div>
                   <div className={`flex flex-wrap justify-center gap-4 transition-all duration-500 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                      <button onClick={() => handleFlashcardRate('didnt-know')} className="group flex flex-col items-center gap-2 p-5 px-8 rounded-2xl bg-background hover:bg-red-500 text-red-600 hover:text-background border border-red-500/20 transition-all shadow-sm min-h-[44px]"><XIcon className="h-5 w-5" /><span className="text-[9px] font-black uppercase tracking-widest">Uncertain</span></button>
                      <button onClick={() => handleFlashcardRate('almost')} className="group flex flex-col items-center gap-2 p-5 px-8 rounded-2xl bg-background hover:bg-amber-500 text-amber-600 hover:text-background border border-amber-500/20 transition-all shadow-sm min-h-[44px]"><RotateCcw className="h-5 w-5" /><span className="text-[9px] font-black uppercase tracking-widest">Almost</span></button>
                      <button onClick={() => handleFlashcardRate('got-it')} className="group flex flex-col items-center gap-2 p-5 px-8 rounded-2xl bg-background hover:bg-emerald-500 text-emerald-600 hover:text-background border border-emerald-500/20 transition-all shadow-sm min-h-[44px]"><Check className="h-5 w-5" /><span className="text-[9px] font-black uppercase tracking-widest">Mastered</span></button>
                   </div>
                 </div>
               </div>
           ) : (
              <div className="bg-surface rounded-2xl p-10 text-center border border-border-subtle animate-zoom-in shadow-sm">
                 <div className="h-16 w-16 bg-[#c9a84c]/5 border border-[#c9a84c]/20 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm"><Trophy className="h-8 w-8 text-[#c9a84c]" /></div>
                 <h2 className="text-2xl font-black text-foreground tracking-tighter uppercase mb-4">Session Concluded</h2>
                 <div className="flex gap-12 justify-center mb-10">
                    <div><p className="text-3xl font-black text-[#c9a84c] tracking-tighter">{Math.round((Object.values(flashcardRatings).filter(r => r === 'got-it').length / deck.length) * 100)}%</p><p className="text-[10px] font-black text-subtle uppercase tracking-widest mt-1">Accuracy</p></div>
                    <div><p className="text-3xl font-black text-red-500 tracking-tighter">{Object.values(flashcardRatings).filter(r => r === 'didnt-know').length}</p><p className="text-[10px] font-black text-subtle uppercase tracking-widest mt-1">Gaps</p></div>
                 </div>
                <button onClick={() => { setDeck([]); setFlashcardSessionComplete(false); }} className="px-8 py-3.5 rounded-xl bg-[#1e3a5f] text-[#c9a84c] font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 mx-auto shadow-lg shadow-[#1e3a5f]/10"><RotateCcw className="h-4 w-4" /> Reset Deck</button>
             </div>
           )}
        </div>
      ) : activeTab === 'quiz' ? (
        /* --- QUIZ VIEW --- */
        <div className="max-w-4xl mx-auto space-y-10 animate-fade-in">
           {!quizFinished ? (
             <div className="space-y-10">
                <div className="flex justify-between items-end px-2">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-accent uppercase tracking-widest">{selectedTopic === 'custom' ? customTopic : selectedTopic}</p>
                      <h2 className="text-2xl font-black text-foreground tracking-tighter">Step {currentQuizIndex + 1} of {quizQuestions.length}</h2>
                   </div>
                   <div className="text-right flex items-center gap-4">
                      {quizStartTime && <div className="text-[11px] font-black text-subtle flex items-center gap-2 uppercase tracking-widest"><Clock className="h-3.5 w-3.5 text-accent" /> {Math.floor((Date.now() - quizStartTime) / 1000)}s</div>}
                   </div>
                </div>
                <div className="h-1 w-full bg-surface rounded-full overflow-hidden">
                   <div className="h-full bg-accent transition-all duration-500" style={{ width: `${((currentQuizIndex + 1) / quizQuestions.length) * 100}%` }} />
                </div>
                <div className="bg-surface border border-border-subtle rounded-2xl p-6 space-y-8">
                   <div className="space-y-3">
                      <div className="flex items-center gap-2"><span className="text-[9px] font-black text-accent uppercase tracking-widest">Inquiry</span></div>
                      <h3 className="text-lg sm:text-xl font-black text-foreground leading-snug tracking-tighter">{quizQuestions[currentQuizIndex].question}</h3>
                   </div>
                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                      {Object.entries(quizQuestions[currentQuizIndex].options).map(([key, text]) => {
                        const isSelected = userQuizAnswers[currentQuizIndex] === key;
                        const isCorrect = quizQuestions[currentQuizIndex].correct_answer === key;
                        const hasAnswered = !!userQuizAnswers[currentQuizIndex];
                        let buttonStyle = "border-border-subtle bg-background hover:border-accent/40";
                        let keyStyle = "bg-surface text-subtle";
                        if (hasAnswered) {
                          if (isCorrect) { buttonStyle = "border-emerald-500/40 bg-emerald-500/5 text-emerald-700"; keyStyle = "bg-emerald-500 text-white"; }
                          else if (isSelected) { buttonStyle = "border-red-500/40 bg-red-500/5 text-red-700"; keyStyle = "bg-red-500 text-white"; }
                          else { buttonStyle = "border-border-subtle opacity-40 grayscale"; }
                        } else if (isSelected) { buttonStyle = "border-accent bg-accent/5"; keyStyle = "bg-accent text-white"; }
                        return (
                          <button key={key} onClick={() => handleQuizAnswer(key)} disabled={hasAnswered} className={`group flex items-center gap-3 p-4 sm:p-5 rounded-xl border transition-all text-left relative overflow-hidden min-h-[56px] shadow-sm ${buttonStyle}`}>
                             <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center font-black text-sm transition-all flex-shrink-0 ${keyStyle}`}>{key}</div>
                             <span className="text-[13px] sm:text-[15px] font-black flex-1 uppercase tracking-widest">{text}</span>
                             {hasAnswered && isCorrect && <CheckCircle2 className="h-5 w-5 text-[#c9a84c] absolute right-4" />}
                             {hasAnswered && isSelected && !isCorrect && <XIcon className="h-5 w-5 text-red-500 absolute right-4" />}
                          </button>
                        );
                      })}
                   </div>
                   {showExplanation && (
                     <div className="mt-8 p-6 bg-surface border border-border-subtle rounded-2xl animate-fade-in">
                        <div className="flex items-center gap-2 mb-3"><Lightbulb className="h-4 w-4 text-accent" /><span className="text-[10px] font-black text-accent uppercase tracking-widest">Insight</span></div>
                        <p className="text-[13px] text-foreground leading-relaxed mb-4">{quizQuestions[currentQuizIndex].explanation}</p>
                        {quizQuestions[currentQuizIndex].source_reference && (
                          <div className="flex items-center gap-2 text-[10px] text-subtle font-black uppercase tracking-widest bg-background border border-border-subtle w-fit px-2 py-1 rounded mb-4"><BookOpen className="h-3 w-3" />{quizQuestions[currentQuizIndex].source_reference}</div>
                        )}
                        <div className="flex justify-end pt-4">
                           <button onClick={handleNextQuizQuestion} className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#1e3a5f] text-[#c9a84c] font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 min-h-[44px] shadow-lg shadow-[#1e3a5f]/10">{currentQuizIndex === quizQuestions.length - 1 ? 'Conclude Session' : 'Next Question'} <ChevronRight className="h-4 w-4" /></button>
                        </div>
                     </div>
                   )}
                </div>
             </div>
           ) : (
             <div className="space-y-8 animate-fade-in">
                <div className={`p-10 sm:p-14 rounded-2xl text-center relative overflow-hidden border border-border-subtle`}>
                   <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[100px] -mr-40 -mt-40" />
                   <div className="relative z-10 space-y-4">
                      <div className="h-16 w-16 bg-background border border-border-subtle rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm"><Trophy className={`h-8 w-8 ${pct >= 70 ? 'text-[#c9a84c]' : 'text-accent'}`} /></div>
                      <p className="text-[10px] font-black text-subtle uppercase tracking-widest">Mission Summary: Completed</p>
                      <h2 className="text-5xl sm:text-6xl font-black text-foreground tracking-tighter uppercase">{score}<span className="text-subtle/30">/</span>{quizQuestions.length}</h2>
                     <div className="flex justify-center gap-10 mt-6 font-bold">
                        <div><p className="text-2xl text-foreground tracking-tight">{Math.floor(((quizEndTime || 0) - (quizStartTime || 0)) / 1000)}s</p><p className="text-[9px] text-subtle uppercase tracking-wider">Duration</p></div>
                        <div className="w-px bg-border-subtle h-10" />
                        <div><p className="text-2xl text-foreground tracking-tight">{pct}%</p><p className="text-[9px] text-subtle uppercase tracking-wider">Accuracy</p></div>
                     </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button onClick={() => handleGenerateQuiz()} className="p-6 rounded-2xl bg-surface border border-border-subtle hover:border-accent group flex items-center justify-center gap-4 transition-all"><div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:rotate-180 transition-transform"><RotateCcw className="h-5 w-5" /></div><span className="text-lg font-bold text-foreground">Retake Mission</span></button>
                  <button onClick={() => setQuizQuestions([])} className="p-6 rounded-2xl bg-surface border border-border-subtle hover:border-primary group flex items-center justify-center gap-4 transition-all"><div className="h-10 w-10 rounded-xl bg-[#c9a84c]/10 flex items-center justify-center text-[#c9a84c]"><Layers className="h-5 w-5" /></div><span className="text-lg font-bold text-foreground">Deploy New Sector</span></button>
                </div>
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-foreground tracking-tight italic">Mission Intelligence Breakdown</h3>
                  {quizQuestions.map((q, idx) => (
                    <div key={idx} className={`bg-surface border border-border-subtle rounded-2xl p-6 sm:p-8 transition-all ${userQuizAnswers[idx] === q.correct_answer ? 'border-emerald-500/10' : 'border-red-500/10'}`}>
                      <div className="flex gap-4">
                        <div className={`h-10 w-10 rounded-xl flex-shrink-0 flex items-center justify-center font-bold ${userQuizAnswers[idx] === q.correct_answer ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>{userQuizAnswers[idx] === q.correct_answer ? <Check className="h-4 w-4" /> : <XIcon className="h-4 w-4" />}</div>
                        <div className="space-y-4 flex-1">
                          <h4 className="text-lg font-bold text-foreground leading-snug">{q.question}</h4>
                          <details className="group">
                             <summary className="list-none cursor-pointer flex items-center gap-2 text-[10px] font-bold text-muted hover:text-[#c9a84c] transition-colors"><span className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg group-open:rotate-180 transition-transform"><ChevronRight className="h-3 w-3" /></span>VIEW RATIONALE</summary>
                             <div className="pt-4 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                   {Object.entries(q.options).map(([opt, text]) => (
                                     <div key={opt} className={`p-3 rounded-xl border text-[13px] flex gap-3 ${opt === q.correct_answer ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold' : opt === userQuizAnswers[idx] ? 'bg-red-500/5 border-red-500/30 text-red-700 dark:text-red-400' : 'border-border-subtle opacity-40'}`}><span className="font-bold text-xs">{opt}</span> {text}</div>
                                   ))}
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-border-subtle"><p className="text-[13px] font-medium text-muted leading-relaxed italic">{q.explanation}</p></div>
                             </div>
                          </details>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
           )}
        </div>
      ) : activeTab === 'mock-test' ? (
        /* --- MOCK TEST VIEW --- */
        <div className="max-w-5xl mx-auto space-y-10 animate-fade-in">
          <div className="flex justify-between items-end px-4">
             <div className="space-y-1">
                <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Simulation Mode</span>
                <h2 className="text-2xl font-bold text-foreground tracking-tight">{mockTest?.title || 'Simulated Exam'}</h2>
             </div>
             <div className="text-right flex items-center gap-4">
                <div className="text-xl font-bold text-red-600 flex items-center gap-2 bg-red-500/5 border border-red-500/20 px-5 py-2.5 rounded-xl"><Timer className="h-5 w-5 animate-pulse" /> {Math.floor(mockTestTimeLeft / 60)}:{String(mockTestTimeLeft % 60).padStart(2, '0')}</div>
             </div>
          </div>
          <div className="bg-surface border border-border-subtle rounded-2xl p-8 sm:p-12 shadow-sm space-y-10">
             <div className="max-w-none border-b border-border-subtle pb-8">
               <h3 className="text-lg font-bold text-foreground uppercase tracking-wider mb-4">Instructions</h3>
               <p className="text-sm text-subtle font-medium leading-relaxed">{mockTest?.instructions || 'Answer all questions to the best of your ability based on the PSC Nepal syllabus.'}</p>
             </div>
             <div className="space-y-12">
                {mockTest?.sections?.map((section: any, sIdx: number) => (
                  <div key={sIdx} className="space-y-6">
                    <div className="border-b border-border-subtle pb-4">
                      <h4 className="text-2xl font-bold text-foreground">{section.section_title}</h4>
                      {section.section_instructions && <p className="text-sm font-medium text-muted mt-2 italic">{section.section_instructions}</p>}
                    </div>
                    <div className="space-y-6 pl-4 sm:pl-6 border-l border-border-subtle">
                      {section.questions?.map((q: any, qIdx: number) => (
                        <div key={qIdx} className="p-5 rounded-2xl bg-background border border-border-subtle hover:border-accent/30 transition-all group">
                          <div className="flex justify-between items-start gap-4">
                            <h5 className="text-base font-bold text-foreground leading-snug">Q{qIdx + 1}. {q.text}</h5>
                            <span className="flex-shrink-0 text-xs font-bold text-accent bg-accent/10 px-3 py-1 rounded-lg">[{q.marks} Marks]</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
             </div>
             <div className="mt-12 pt-10 border-t border-border-subtle text-center space-y-6">
                <div className="h-16 w-16 bg-background border border-border-subtle rounded-2xl flex items-center justify-center mx-auto text-subtle"><Layers className="h-8 w-8" /></div>
                <div>
                   <h3 className="text-lg font-bold text-foreground tracking-tight">Evaluate Session</h3>
                   <p className="text-sm text-subtle mt-2 font-medium max-w-sm mx-auto">Upload a scanned image of your written answers for AI evaluation.</p>
                </div>
                <div className="relative inline-block group">
                    <input type="file" accept="image/*,.pdf" disabled={isEvaluating} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed" onChange={async (e) => {
                      if (!isPro && !isAdmin) {
                        toast.error('Pro Feature', { description: 'AI Grading is a Pro feature.' });
                        showUpgradeModal('mock_test_limit');
                        return;
                      }
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const { data: { user: authUser } } = await supabase.auth.getUser();
                      if (!authUser) return;
                      setIsEvaluating(true);
                      setError(null);
                      try {
                        const fileExt = file.name.split('.').pop();
                        const fileName = `${authUser.id}/${Date.now()}.${fileExt}`;
                        const { data: uploadData, error: uploadError } = await supabase.storage.from('answer-sheets').upload(fileName, file);
                        if (uploadError) throw uploadError;
                        const { data: { publicUrl } } = supabase.storage.from('answer-sheets').getPublicUrl(fileName);
                        const res = await fetch('/api/evaluate-mock-test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileUrl: publicUrl, testJson: mockTest, userId: authUser.id, examId: selectedExamId }) });
                        if (!res.ok) throw new Error('Evaluation failed. Please try again.');
                        const evalData = await res.json();
                        setEvaluationResult(evalData.submission);
                        window.dispatchEvent(new CustomEvent('usage-updated'));
                      } catch (err: any) { setError(err.message); } finally { setIsEvaluating(false); }
                    }} />
                  <button className={`px-10 py-4 rounded-xl bg-[#1e3a5f] text-[#c9a84c] font-bold text-sm transition-all flex items-center gap-3 ${isEvaluating ? 'opacity-50' : 'hover:opacity-90'}`}>
                    {isEvaluating ? <><RefreshCw className="h-5 w-5 animate-spin" /> Analyzing Answers...</> : 'Upload for AI Grading'}
                  </button>
                </div>
                {isEvaluating && <p className="text-xs font-bold text-accent animate-pulse uppercase tracking-[0.2em] mt-4">Loksewa AI is reading your answers...</p>}
                {evaluationResult && (
                  <div className="mt-12 p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl animate-zoom-in text-left">
                     <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center"><Trophy className="h-5 w-5" /></div>
                        <div><p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Evaluation Protocol Complete</p><h3 className="text-xl font-bold text-foreground">Mission Performance Report</h3></div>
                     </div>
                     <div className="prose prose-sm dark:prose-invert max-w-none text-[13px] font-medium leading-relaxed prose-headings:text-foreground prose-headings:font-bold prose-p:my-2"><ReactMarkdown>{evaluationResult.feedback}</ReactMarkdown></div>
                  </div>
                )}
              </div>
           </div>
        </div>
      ) : null}

      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-in-top { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes zoom-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
        .animate-slide-in-top { animation: slide-in-top 0.8s ease-out forwards; }
        .animate-zoom-in { animation: zoom-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      `}</style>
    </div>
  );
}
