'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  CalendarDays,
  Clock,
  FileText,
  CheckCircle2,
  Sparkles,
  Upload,
  BookOpen,
  ChevronDown,
} from 'lucide-react';

const TOTAL_STEPS = 4;

const EXAM_CATEGORIES = [
  'Kharidar',
  'Nayab Subba',
  'Section Officer',
  'Sakha Adhikrit',
  'Engineering',
  'Health',
  'Teaching',
  'Other',
];

interface ExamFormData {
  exam_category: string;
  exam_name: string;
  study_days: number;
  custom_days: string;
  daily_study_hours: number;
  total_papers: number;
}

const DURATION_PRESETS = [30, 45, 60, 90];

function computeExamDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// ─── Progress Bar ────────────────────────────────────────────────────
function ProgressBar({ currentStep }: { currentStep: number }) {
  const progress = (currentStep / TOTAL_STEPS) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs font-medium text-gray-400 mb-2">
        <span>Step {currentStep} of {TOTAL_STEPS}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-violet-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// ─── Step 1: Welcome ─────────────────────────────────────────────────
function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center text-center animate-fade-in">
      <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-orange-500 to-violet-600 flex items-center justify-center mb-8 shadow-xl shadow-orange-200">
        <GraduationCap className="h-10 w-10 text-white" />
      </div>

      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
        Loksewa AI
      </h1>
      <p className="text-lg text-gray-500 font-light mb-2 max-w-md">
        Your Personal PSC Preparation Expert
      </p>

      <div className="mt-6 flex flex-col items-center gap-3 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-orange-400" />
          <span>AI-powered study plans & practice</span>
        </div>
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-orange-400" />
          <span>Tailored to your exact exam</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-orange-400" />
          <span>Fits your daily schedule</span>
        </div>
      </div>

      <button
        onClick={onNext}
        className="mt-12 px-10 py-4 bg-orange-600 text-white font-semibold rounded-2xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-200 flex items-center gap-2 group"
      >
        Get Started
        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}

// ─── Step 2: Exam Setup Form ─────────────────────────────────────────
function StepExamSetup({
  formData,
  onChange,
  onNext,
  onBack,
  saving,
}: {
  formData: ExamFormData;
  onChange: (data: Partial<ExamFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  saving: boolean;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.exam_category) errs.exam_category = 'Please select a category';
    if (!formData.exam_name.trim()) errs.exam_name = 'Please enter the exam name';
    const effectiveDays = formData.study_days || parseInt(formData.custom_days) || 0;
    if (!effectiveDays || effectiveDays < 7) errs.study_days = 'Please select at least 7 days';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <div className="w-full animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Set Up Your Exam
        </h2>
        <p className="text-gray-500 font-light">
          Tell us about the exam you&apos;re preparing for
        </p>
      </div>

      <div className="space-y-6">
        {/* Exam Category */}
        <div>
          <label htmlFor="exam-category" className="block text-sm font-medium text-gray-700 mb-1.5">
            Exam Category
          </label>
          <div className="relative">
            <select
              id="exam-category"
              value={formData.exam_category}
              onChange={(e) => onChange({ exam_category: e.target.value })}
              className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 pr-10 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            >
              <option value="">Select a category...</option>
              {EXAM_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
          {errors.exam_category && (
            <p className="mt-1 text-xs text-red-500">{errors.exam_category}</p>
          )}
        </div>

        {/* Exam Name */}
        <div>
          <label htmlFor="exam-name" className="block text-sm font-medium text-gray-700 mb-1.5">
            Exam Name
          </label>
          <input
            id="exam-name"
            type="text"
            placeholder='e.g. "Nayab Subba - Prasashan"'
            value={formData.exam_name}
            onChange={(e) => onChange({ exam_name: e.target.value })}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          />
          {errors.exam_name && (
            <p className="mt-1 text-xs text-red-500">{errors.exam_name}</p>
          )}
        </div>

        {/* Study Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-gray-400" />
              Study Plan Duration
            </span>
          </label>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {DURATION_PRESETS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => onChange({ study_days: d, custom_days: '' })}
                className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                  formData.study_days === d && !formData.custom_days
                    ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                {d} Days
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 font-medium whitespace-nowrap">Or custom:</span>
            <input
              type="number"
              min={7}
              max={365}
              placeholder="e.g. 120"
              value={formData.custom_days}
              onChange={(e) => onChange({ custom_days: e.target.value, study_days: 0 })}
              className={`flex-1 rounded-xl border bg-white px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                formData.custom_days ? 'border-orange-500' : 'border-gray-200'
              }`}
            />
            <span className="text-xs text-gray-400 font-medium">days</span>
          </div>
          {errors.study_days && (
            <p className="mt-2 text-xs text-red-500">{errors.study_days}</p>
          )}
        </div>

        {/* Daily Study Hours Slider */}
        <div>
          <label htmlFor="study-hours" className="block text-sm font-medium text-gray-700 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-gray-400" />
              Daily Study Hours
            </span>
          </label>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-400">1 hour</span>
              <span className="text-2xl font-bold text-orange-600">
                {formData.daily_study_hours}h
              </span>
              <span className="text-xs text-gray-400">10 hours</span>
            </div>
            <input
              id="study-hours"
              type="range"
              min={1}
              max={10}
              step={1}
              value={formData.daily_study_hours}
              onChange={(e) =>
                onChange({ daily_study_hours: parseInt(e.target.value, 10) })
              }
              className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-orange-600"
            />
          </div>
        </div>

        {/* Number of Papers */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-gray-400" />
              Number of Papers
            </span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => onChange({ total_papers: num })}
                className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                  formData.total_papers === num
                    ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                {num} Paper{num > 1 ? 's' : ''}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-10">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-8 py-3 bg-orange-600 text-white font-semibold rounded-2xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-200 flex items-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Save & Continue
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Document Upload Instructions ────────────────────────────
function StepDocuments({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const tips = [
    {
      title: 'Syllabus PDF',
      desc: 'Upload your official exam syllabus so our AI can create a targeted study plan.',
    },
    {
      title: 'Previous Year Papers',
      desc: 'Past question papers help us identify patterns and frequently tested topics.',
    },
    {
      title: 'Notes & Handouts',
      desc: "Any study material you already have — we'll integrate it into your plan.",
    },
  ];

  return (
    <div className="w-full animate-fade-in">
      <div className="text-center mb-8">
        <div className="h-14 w-14 mx-auto rounded-2xl bg-violet-100 flex items-center justify-center mb-4">
          <Upload className="h-7 w-7 text-violet-600" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Supercharge with Documents
        </h2>
        <p className="text-gray-500 font-light max-w-md mx-auto">
          After setup, you can upload these documents from your dashboard for a fully personalized experience.
        </p>
      </div>

      <div className="space-y-4">
        {tips.map((tip, i) => (
          <div
            key={i}
            className="flex gap-4 p-5 bg-white rounded-2xl border border-gray-100 hover:border-orange-100 transition-colors"
          >
            <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 font-bold text-sm">
              {i + 1}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">{tip.title}</h3>
              <p className="text-gray-500 text-sm font-light mt-0.5">{tip.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mt-6">
        <p className="text-sm text-orange-700 text-center font-medium">
          💡 Don&apos;t worry — you can skip this and upload documents anytime from your dashboard.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-10">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          onClick={onNext}
          className="px-8 py-3 bg-orange-600 text-white font-semibold rounded-2xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-200 flex items-center gap-2 group"
        >
          Continue
          <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}

// ─── Step 4: Success ─────────────────────────────────────────────────
function StepSuccess() {
  return (
    <div className="flex flex-col items-center text-center animate-fade-in">
      <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6 animate-bounce-once">
        <CheckCircle2 className="h-10 w-10 text-emerald-600" />
      </div>

      <h2 className="text-3xl font-bold text-gray-900 mb-3">You&apos;re All Set!</h2>
      <p className="text-gray-500 font-light max-w-sm">
        Your study plan is being prepared by our AI. Redirecting you to your dashboard...
      </p>

      <div className="mt-8 flex items-center gap-2 text-sm text-orange-600 font-medium">
        <span className="h-4 w-4 border-2 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
        Loading your dashboard
      </div>
    </div>
  );
}

// ─── Main Onboarding Page ────────────────────────────────────────────
export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingExam, setCheckingExam] = useState(true);
  const [formData, setFormData] = useState<ExamFormData>({
    exam_category: '',
    exam_name: '',
    study_days: 60,
    custom_days: '',
    daily_study_hours: 3,
    total_papers: 1,
  });

  const router = useRouter();
  const supabase = createClient();

  // Check if user already has an exam (returning user → skip onboarding)
  useEffect(() => {
    const checkExistingExam = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/signin');
        return;
      }

      const { data: exams } = await supabase
        .from('user_exams')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (exams && exams.length > 0) {
        router.push('/dashboard');
        return;
      }

      setCheckingExam(false);
    };

    checkExistingExam();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateFormData = useCallback((partial: Partial<ExamFormData>) => {
    setFormData((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleSaveExam = async () => {
    setSaving(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('You must be logged in.');
        setSaving(false);
        return;
      }

      const effectiveDays = formData.study_days || parseInt(formData.custom_days) || 60;
      const { error: insertError } = await supabase.from('user_exams').insert({
        user_id: user.id,
        exam_name: formData.exam_name.trim(),
        exam_category: formData.exam_category,
        exam_date: computeExamDate(effectiveDays),
        daily_study_hours: formData.daily_study_hours,
        total_papers: formData.total_papers,
        status: 'active',
      });

      if (insertError) {
        setError(insertError.message);
        setSaving(false);
        return;
      }

      setSaving(false);
      setCurrentStep(3);
    } catch {
      setError('Something went wrong. Please try again.');
      setSaving(false);
    }
  };

  // Auto-redirect on step 4
  useEffect(() => {
    if (currentStep === 4) {
      const timeout = setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [currentStep, router]);

  // Loading state while checking for existing exams
  if (checkingExam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <span className="h-8 w-8 border-3 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
          <span className="text-sm text-gray-400 font-medium">Checking your account...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with Progress */}
      <header className="w-full bg-white border-b border-gray-100">
        <div className="max-w-xl mx-auto px-6 py-4">
          <ProgressBar currentStep={currentStep} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 text-center">
              {error}
            </div>
          )}

          {currentStep === 1 && (
            <StepWelcome onNext={() => setCurrentStep(2)} />
          )}

          {currentStep === 2 && (
            <StepExamSetup
              formData={formData}
              onChange={updateFormData}
              onNext={handleSaveExam}
              onBack={() => setCurrentStep(1)}
              saving={saving}
            />
          )}

          {currentStep === 3 && (
            <StepDocuments
              onNext={() => setCurrentStep(4)}
              onBack={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 4 && <StepSuccess />}
        </div>
      </main>
    </div>
  );
}
