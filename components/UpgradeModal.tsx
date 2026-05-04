'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Shield, Zap, Sparkles, Star, Rocket, Info } from 'lucide-react';
import { useUpgradeModal } from '@/lib/UpgradeModalContext';

const features = [
  { name: 'Document Uploads', free: '3 Total', pro: 'Unlimited' },
  { name: 'Guru Chat Messages', free: '10 Per Day', pro: 'Unlimited' },
  { name: 'Quiz Generations', free: '3 Per Day', pro: 'Unlimited' },
  { name: 'Notes Generations', free: '3 Per Day', pro: 'Unlimited' },
  { name: 'Active Exams', free: '1 Active', pro: '3 Active' },
  { name: 'Flashcard Generations', free: 'Limited', pro: 'Unlimited' },
  { name: 'Gap Analysis', free: 'Not Available', pro: 'Available' },
  { name: 'Weekly AI Feedback', free: 'Not Available', pro: 'Available' },
  { name: 'Performance Analytics', free: 'Basic', pro: 'Full Access' },
];

const plans = [
  {
    id: 'pro_monthly',
    name: 'Pro Monthly',
    price: '499',
    period: 'per month',
    description: 'Best for short term preparation.',
    features: ['All Pro Features', '30 Days Access', 'Priority Support'],
    color: 'orange'
  },
  {
    id: 'pro_quarterly',
    name: 'Pro Quarterly',
    price: '1299',
    period: 'for 3 months',
    description: 'Best value for most aspirants.',
    savings: 'Save NPR 198',
    popular: true,
    features: ['All Pro Features', '90 Days Access', 'Study Materials Pack'],
    color: 'blue'
  },
  {
    id: 'cycle_pack',
    name: 'Exam Cycle Pack',
    price: '1999',
    period: 'one time',
    description: '6 months for one complete cycle.',
    features: ['All Pro Features', '180 Days Access', 'Mock Test Series'],
    color: 'emerald'
  }
];

export function UpgradeModal({ onSelectPlan }: { onSelectPlan: (plan: any) => void }) {
  const { isOpen, hideUpgradeModal, limitType } = useUpgradeModal();

  const getLimitMessage = () => {
    switch (limitType) {
      case 'document_limit': return 'You have reached the 3 document upload limit on the free plan.';
      case 'chat_limit': return 'You have used all 10 daily Guru chat messages.';
      case 'quiz_limit': return 'You have used all 3 daily quiz generations.';
      case 'notes_limit': return 'You have used all 3 daily note generations.';
      case 'exam_limit': return 'Free plan supports only 1 active exam.';
      case 'mock_test_limit': return 'Mock tests are available exclusively for Pro members.';
      default: return 'Unlock the full potential of Loksewa AI.';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={hideUpgradeModal}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-5xl bg-surface border border-border-subtle rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 sm:p-8 border-b border-border-subtle flex justify-between items-start shrink-0 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/5 rounded-full blur-3xl -mr-32 -mt-32" />
               <div className="relative z-10 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-orange-600 flex items-center justify-center text-background shadow-lg shadow-primary/20">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Upgrade to Loksewa Pro</h2>
                    <p className="text-sm font-medium text-accent mt-0.5">{getLimitMessage()}</p>
                  </div>
               </div>
               <button 
                 onClick={hideUpgradeModal}
                 className="p-2 hover:bg-background rounded-full transition-colors relative z-10"
               >
                 <X className="h-6 w-6 text-subtle" />
               </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-12 scrollbar-hide">
               {/* Comparison Table */}
               <div className="space-y-6">
                  <div className="flex items-center gap-2 px-2">
                    <Info className="h-4 w-4 text-accent" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-subtle">Feature Comparison</h3>
                  </div>
                  <div className="bg-background/50 border border-border-subtle rounded-2xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface/50 border-b border-border-subtle">
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-subtle">Core Abilities</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-subtle text-center">Free Tier</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-orange-600 text-center">Pro Intelligence</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-subtle">
                        {features.map((f, i) => (
                          <tr key={i} className="hover:bg-surface/30 transition-colors">
                            <td className="px-6 py-3.5 text-sm font-bold text-foreground">{f.name}</td>
                            <td className="px-6 py-3.5 text-sm font-medium text-subtle text-center">{f.free}</td>
                            <td className="px-6 py-3.5 text-sm font-bold text-foreground text-center">
                              <span className="inline-flex items-center gap-1.5 text-orange-600">
                                {f.pro === 'Unlimited' && <Zap className="h-3.5 w-3.5" />}
                                {f.pro}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>

               {/* Plan Selection */}
               <div className="space-y-8">
                  <div className="text-center space-y-2">
                     <h3 className="text-xl font-bold text-foreground">Select Your Mission Plan</h3>
                     <p className="text-sm font-medium text-subtle">Choose the duration that matches your exam timeline.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((p) => (
                      <div 
                        key={p.id}
                        className={`relative p-8 rounded-3xl border-2 transition-all flex flex-col group ${
                          p.popular 
                            ? 'border-blue-600/50 bg-blue-600/[0.03] scale-105 z-10 shadow-xl shadow-blue-600/5' 
                            : 'border-border-subtle bg-surface hover:border-accent/40'
                        }`}
                      >
                        {p.popular && (
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-background text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg">
                            Most Popular
                          </div>
                        )}
                        {p.savings && (
                          <div className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-600 text-[9px] font-bold uppercase px-2 py-1 rounded-md border border-emerald-500/20">
                            {p.savings}
                          </div>
                        )}

                        <div className="mb-6">
                           <h4 className="text-lg font-bold text-foreground mb-1">{p.name}</h4>
                           <p className="text-xs font-medium text-subtle leading-relaxed">{p.description}</p>
                        </div>

                        <div className="mb-8">
                           <div className="flex items-baseline gap-1">
                              <span className="text-sm font-bold text-subtle">NPR</span>
                              <span className="text-4xl font-black text-foreground tracking-tighter">{p.price}</span>
                           </div>
                           <p className="text-[10px] font-bold uppercase tracking-widest text-subtle mt-1">{p.period}</p>
                        </div>

                        <div className="space-y-3 mb-10 flex-1">
                           {p.features.map((feat, idx) => (
                             <div key={idx} className="flex items-center gap-3">
                                <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${p.popular ? 'bg-blue-600/10 text-blue-600' : 'bg-orange-600/10 text-orange-600'}`}>
                                   <Check className="h-3 w-3" />
                                </div>
                                <span className="text-xs font-bold text-foreground/80">{feat}</span>
                             </div>
                           ))}
                        </div>

                        <button 
                          onClick={() => {
                            onSelectPlan(p);
                            hideUpgradeModal();
                          }}
                          className={`w-full py-4 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 min-h-[52px] ${
                            p.popular 
                              ? 'bg-blue-600 text-background shadow-lg shadow-blue-600/20 hover:bg-blue-700' 
                              : 'bg-orange-600 text-background shadow-lg shadow-primary/20 hover:opacity-90'
                          }`}
                        >
                          Pay Now <Rocket className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
               </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border-subtle bg-background/30 flex items-center justify-center gap-6 shrink-0">
               <div className="flex items-center gap-2 text-[10px] font-bold text-subtle uppercase tracking-wider">
                  <Shield className="h-3.5 w-3.5" /> Secure Manual Verification
               </div>
               <div className="h-4 w-px bg-border-subtle" />
               <div className="flex items-center gap-2 text-[10px] font-bold text-subtle uppercase tracking-wider">
                  <Zap className="h-3.5 w-3.5" /> Plan Active Within 24h
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
