'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  Rocket, 
  ChevronRight, 
  FileText, 
  Map, 
  BookOpen, 
  Target 
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface ChecklistItem {
  id: string;
  title: string;
  desc: string;
  href: string;
  isCompleted: boolean;
  icon: any;
}

export function MissionChecklist() {
  const supabase = createClient();
  const [steps, setSteps] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  const fetchProgress = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [
      { count: examCount },
      { data: docs },
      { count: planCount },
      { count: noteCount }
    ] = await Promise.all([
      supabase.from('user_exams').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('documents').select('doc_type').eq('user_id', user.id),
      supabase.from('study_plans').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('study_notes').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    ]);

    const hasSyllabus = docs?.some(d => d.doc_type?.toLowerCase().includes('syllabus'));

    const checklist: ChecklistItem[] = [
      {
        id: 'exam',
        title: 'Choose Your Exam',
        desc: 'Select the exam you are preparing for.',
        href: '/dashboard/exams',
        isCompleted: (examCount || 0) > 0,
        icon: Target
      },
      {
        id: 'syllabus',
        title: 'Upload Syllabus',
        desc: 'Add your official syllabus PDF.',
        href: '/dashboard/documents',
        isCompleted: !!hasSyllabus,
        icon: FileText
      },
      {
        id: 'plan',
        title: 'Create Study Plan',
        desc: 'Generate your personal study schedule.',
        href: '/dashboard/study-plan',
        isCompleted: (planCount || 0) > 0,
        icon: Map
      },
      {
        id: 'notes',
        title: 'Generate Study Notes',
        desc: 'Create your first AI study note.',
        href: '/dashboard/study-notes',
        isCompleted: (noteCount || 0) > 0,
        icon: BookOpen
      }
    ];

    setSteps(checklist);
    
    // If all completed, we might want to hide it after a while
    if (checklist.every(s => s.isCompleted)) {
      // Keep it visible for now but maybe minimize
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchProgress();
  // eslint-disable-next-line react-hooks/exhaustive-disable
  }, []);

  if (loading) return null;
  
  const completedCount = steps.filter(s => s.isCompleted).length;
  if (completedCount === steps.length) return null; // Hide when fully activated

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface border border-border-subtle rounded-3xl overflow-hidden shadow-sm mb-8"
    >
      <div className="p-6 border-b border-border-subtle bg-[#1e3a5f]/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#1e3a5f] flex items-center justify-center text-[#c9a84c] shadow-lg shadow-primary/10">
            <Rocket className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-foreground uppercase tracking-tighter">Getting Started Guide</h3>
            <p className="text-[10px] text-subtle font-black uppercase tracking-widest">Complete these steps to set up your account</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xl font-black text-[#c9a84c] tracking-tighter">{completedCount}/{steps.length}</span>
          <span className="text-[9px] font-black text-subtle uppercase tracking-widest">Steps Completed</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border-subtle">
        {steps.map((step) => (
          <Link 
            key={step.id} 
            href={step.href}
            className="p-5 hover:bg-[#1e3a5f]/[0.03] transition-all group relative overflow-hidden"
          >
            {step.isCompleted && (
              <div className="absolute top-0 right-0 p-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
            )}
            
            <div className="flex items-start gap-3">
              <div className={`mt-1 h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${step.isCompleted ? 'bg-emerald-500/10 text-emerald-600' : 'bg-background border border-border-subtle text-subtle group-hover:border-accent/40 group-hover:text-accent'}`}>
                <step.icon className="h-4 w-4" />
              </div>
              <div>
                <h4 className={`text-[11px] font-black uppercase tracking-widest ${step.isCompleted ? 'text-emerald-700/70' : 'text-foreground'}`}>
                  {step.title}
                </h4>
                <p className="text-[9px] text-subtle font-medium mt-1 leading-relaxed line-clamp-2">
                  {step.desc}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
               <div className="h-1 flex-1 bg-background rounded-full overflow-hidden mr-4">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: step.isCompleted ? '100%' : '0%' }}
                    className="h-full bg-emerald-500"
                  />
               </div>
               <ChevronRight className={`h-3 w-3 transition-transform group-hover:translate-x-1 ${step.isCompleted ? 'text-emerald-500/50' : 'text-subtle'}`} />
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
