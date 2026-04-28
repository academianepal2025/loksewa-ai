'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import {
  CalendarDays,
  Clock,
  FileText,
  Plus,
  ArrowRight,
  X,
  ChevronDown,
  Sparkles,
  History
} from 'lucide-react';

interface Exam {
  id: string;
  exam_name: string;
  exam_category: string;
  exam_date: string;
  daily_study_hours: number;
  total_papers: number;
  status: string;
}

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

const DURATION_PRESETS = [30, 45, 60, 90];

function computeExamDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// ─── Helpers ─────────────────────────────────────────────────────────
function getDaysRemaining(dateString: string) {
  const target = new Date(dateString);
  const now = new Date();
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

// ─── Exam Card ───────────────────────────────────────────────────────
function ExamCard({ exam }: { exam: Exam }) {
  const daysRemaining = getDaysRemaining(exam.exam_date);

  return (
    <div className="group bg-surface rounded-2xl border border-border-subtle overflow-hidden hover:border-accent/40 transition-all duration-300">
      <div className="p-6 sm:p-7 space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-subtle uppercase tracking-wider">Mission Target</p>
            <h3 className="text-xl font-bold text-foreground tracking-tight leading-tight group-hover:text-accent transition-colors">{exam.exam_name}</h3>
          </div>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-accent/10 text-accent uppercase tracking-wider border border-accent/20">
            {exam.status}
          </span>
        </div>

        <div className="flex justify-between items-end">
          <div className="px-3 py-1 rounded-lg bg-background border border-border-subtle text-subtle text-[10px] font-bold tracking-wider uppercase">
            {exam.exam_category}
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-foreground leading-none tracking-tight">{daysRemaining}</span>
            <span className="text-[9px] text-subtle block uppercase font-bold tracking-wider mt-1">Days Left</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3 bg-background rounded-xl border border-border-subtle group-hover:border-accent/20 transition-colors">
            <CalendarDays className="h-4 w-4 text-accent" />
             <div className="flex flex-col">
                <span className="text-[9px] font-bold text-subtle uppercase tracking-wider leading-none mb-1">Duration</span>
                <span className="text-[11px] font-bold text-foreground truncate">{daysRemaining} Day Plan</span>
             </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-background rounded-xl border border-border-subtle group-hover:border-accent/20 transition-colors">
            <Clock className="h-4 w-4 text-accent" />
             <div className="flex flex-col">
                <span className="text-[9px] font-bold text-subtle uppercase tracking-wider leading-none mb-1">Intensity</span>
                <span className="text-[11px] font-bold text-foreground">{exam.daily_study_hours}h Daily</span>
             </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
          <div className="flex items-center text-[11px] text-subtle font-bold tracking-wider uppercase">
            <FileText className="h-4 w-4 mr-2 text-orange-600" />
            {exam.total_papers} Papers
          </div>
          <Link
            href={`/dashboard/study-plan`}
            className="flex items-center gap-2 text-[11px] font-bold text-orange-600 hover:text-accent transition-all uppercase tracking-wider group/link"
          >
            Open Plan
            <ArrowRight className="h-3.5 w-3.5 transform group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Implementation ───────────────────────────────────────────
function AddExamModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    exam_category: '',
    exam_name: '',
    study_days: 60,
    custom_days: '',
    daily_study_hours: 3,
    total_papers: 1,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.exam_category || !formData.exam_name) {
      setError('Please fill in all required fields');
      return;
    }
    const effectiveDays = formData.study_days || parseInt(formData.custom_days) || 0;
    if (!effectiveDays || effectiveDays < 7) {
      setError('Please select at least 7 days for your study plan');
      return;
    }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

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
    } else {
      setSaving(false);
      onSuccess();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-surface rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-zoom-in border border-border-subtle" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-border-subtle flex justify-between items-center relative">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-background border border-border-subtle flex items-center justify-center text-foreground">
                <Sparkles className="h-5 w-5 text-accent" />
            </div>
            <div>
                <p className="text-[10px] font-bold text-subtle uppercase tracking-wider">Configuration</p>
                <h2 className="text-xl font-bold text-foreground tracking-tight">New Mission Target</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-background rounded-xl transition-all text-subtle">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl text-[11px] text-red-600 font-bold text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-subtle uppercase tracking-wider mb-2 ml-1">Category</label>
              <div className="relative">
                <select
                  value={formData.exam_category}
                  onChange={(e) => setFormData(prev => ({ ...prev, exam_category: e.target.value }))}
                  className="w-full appearance-none rounded-xl bg-background border border-border-subtle px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all"
                >
                  <option value="">Select Category...</option>
                  {EXAM_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-4 h-4 w-4 text-subtle pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-subtle uppercase tracking-wider mb-2 ml-1">Papers</label>
              <div className="flex gap-2">
                {[1, 2, 3].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, total_papers: num }))}
                    className={`flex-1 py-3 text-sm font-bold border rounded-xl transition-all ${
                      formData.total_papers === num ? 'border-accent bg-accent/5 text-accent' : 'bg-background border-border-subtle text-subtle'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-subtle uppercase tracking-wider mb-2 ml-1">Exam Designation</label>
            <input
              type="text"
              placeholder="e.g. Officer Level II"
              value={formData.exam_name}
              onChange={(e) => setFormData(prev => ({ ...prev, exam_name: e.target.value }))}
              className="w-full rounded-xl bg-background border border-border-subtle px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all placeholder:text-subtle/50"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-subtle uppercase tracking-wider mb-2 ml-1">Study Duration</label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {DURATION_PRESETS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, study_days: d, custom_days: '' }))}
                  className={`py-3 text-sm font-bold border rounded-xl transition-all ${
                    formData.study_days === d && !formData.custom_days ? 'border-accent bg-accent/5 text-accent' : 'bg-background border-border-subtle text-subtle'
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={7}
                max={365}
                placeholder="Custom days"
                value={formData.custom_days}
                onChange={(e) => setFormData(prev => ({ ...prev, custom_days: e.target.value, study_days: 0 }))}
                className={`flex-1 rounded-xl bg-background border px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all ${
                  formData.custom_days ? 'border-accent' : 'border-border-subtle'
                }`}
              />
              <span className="text-[10px] font-bold text-subtle uppercase">days</span>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex justify-between items-center text-[10px] font-bold text-subtle uppercase tracking-wider ml-1">
               <span>Study Intensity</span>
               <span className="text-accent">{formData.daily_study_hours} Hours Daily</span>
            </label>
            <input
              type="range"
              min="1"
              max="14"
              value={formData.daily_study_hours}
              onChange={(e) => setFormData(prev => ({ ...prev, daily_study_hours: parseInt(e.target.value) }))}
              className="w-full h-1.5 bg-background border border-border-subtle rounded-full appearance-none cursor-pointer accent-accent"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-orange-600 text-background font-bold text-base py-4 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 active:scale-[0.99]"
            >
              {saving ? 'Synchronizing...' : 'Initialize Mission'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page Component ───────────────────────────────────────────
export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchExams = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from('user_exams')
      .select('*')
      .eq('user_id', user.id)
      .order('exam_date', { ascending: true });
    if (error) setError(error.message);
    else setExams(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchExams(); }, [fetchExams]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Visual Header */}
      <div className="bg-surface p-8 sm:p-10 rounded-2xl border border-border-subtle relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -mr-32 -mt-32" />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
          <div className="space-y-4">
             <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent">Active Missions</span>
             </div>
             <h1 className="text-3xl font-bold text-foreground tracking-tight leading-tight">
                Target <span className="text-accent">Exams</span>
             </h1>
             <p className="text-sm text-subtle font-medium max-w-sm leading-relaxed">
                Strategic tracking of your Public Service Commission objectives and examination timelines.
             </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-orange-600 text-background px-8 py-3.5 rounded-xl font-bold text-sm flex items-center gap-3 hover:opacity-90 transition-all"
          >
            <Plus className="h-5 w-5" />
            Add Mission
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-surface/50 animate-pulse h-[300px] rounded-2xl border border-border-subtle" />
          ))}
        </div>
      ) : exams.length === 0 ? (
        <div className="bg-surface p-16 sm:p-24 rounded-2xl text-center border border-border-subtle border-dashed">
          <div className="h-20 w-20 bg-background border border-border-subtle rounded-2xl flex items-center justify-center mx-auto mb-8">
            <History className="h-10 w-10 text-subtle opacity-40" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3 tracking-tight">Command Center Empty</h2>
          <p className="text-subtle max-w-sm mx-auto mb-10 text-sm font-medium leading-relaxed">You haven't initialized any exam objectives yet. Your study journey begins with a target.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-orange-600 text-background px-10 py-4 rounded-xl font-bold text-base inline-flex items-center gap-3 hover:opacity-90 transition-all"
          >
            <Plus className="h-5 w-5" />
            Launch First Mission
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map(exam => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      )}

      <AddExamModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => { setIsModalOpen(false); fetchExams(); }}
      />
    </div>
  );
}
