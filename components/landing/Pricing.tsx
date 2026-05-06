'use client';

import { useState } from 'react';
import { Check, X, ChevronDown, ChevronUp, CreditCard, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const features = [
  { name: "Document Uploads", free: "3 docs", pro: "Unlimited", cycle: "Unlimited", group: "Study Plan" },
  { name: "Personal Study Plan", free: "Basic", pro: "Advanced AI", cycle: "Advanced AI", group: "Study Plan" },
  { name: "Daily Guru Chat", free: "10 msgs", pro: "Unlimited", cycle: "Unlimited", group: "AI Chat" },
  { name: "Quiz Generation", free: "3/day", pro: "Unlimited", cycle: "Unlimited", group: "Practice" },
  { name: "Study Notes Gen", free: "3/day", pro: "Unlimited", cycle: "Unlimited", group: "Notes" },
  { name: "Gap Analysis", free: false, pro: true, cycle: true, group: "Analytics" },
  { name: "Weekly AI Feedback", free: false, pro: true, cycle: true, group: "Analytics" },
  { name: "Performance Analytics", free: false, pro: true, cycle: true, group: "Analytics" },
  { name: "One complete exam cycle", free: false, pro: false, cycle: true, group: "Support" },
  { name: "Priority Support", free: false, pro: true, cycle: true, group: "Support" },
];

export function Pricing() {
  const [billing, setBilling] = useState<'monthly' | 'quarterly'>('monthly');
  const [showComparison, setShowComparison] = useState(false);

  return (
    <section id="pricing" className="py-20 bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f]">Simple and Transparent Pricing</h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto font-medium">
            Cheaper than one printed notes book. More powerful than a coaching institute.
          </p>

          {/* Billing Toggle */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <span className={`text-sm font-bold ${billing === 'monthly' ? 'text-[#1e3a5f]' : 'text-gray-400'}`}>Monthly</span>
            <button
              onClick={() => setBilling(billing === 'monthly' ? 'quarterly' : 'monthly')}
              className="relative w-14 h-7 bg-[#1e3a5f] rounded-full p-1 transition-all"
            >
              <motion.div
                animate={{ x: billing === 'monthly' ? 0 : 28 }}
                className="w-5 h-5 bg-[#c9a84c] rounded-full"
              />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${billing === 'quarterly' ? 'text-[#1e3a5f]' : 'text-gray-400'}`}>Quarterly</span>
              <span className="bg-[#c9a84c] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter animate-pulse">Save 15%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {/* Free Plan */}
          <div className="bg-white rounded-3xl border border-gray-100 p-8 flex flex-col hover:border-[#1e3a5f]/20 transition-all shadow-sm">
            <h3 className="text-lg font-bold text-gray-400 uppercase tracking-[0.1em] mb-2">Free Plan</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-black text-[#1e3a5f]">NPR 0</span>
              <span className="text-gray-400 font-bold text-sm">/mo</span>
            </div>
            <p className="text-xs text-gray-400 font-bold mb-8 uppercase tracking-widest">Forever free</p>
            <Link href="/auth/signup" className="w-full py-4 border-2 border-[#1e3a5f] text-[#1e3a5f] font-bold rounded-2xl text-center hover:bg-[#1e3a5f] hover:text-white transition-all mb-8">
              Get Started
            </Link>
            <div className="space-y-4 mt-auto">
              {[
                { label: "3 document uploads", checked: true },
                { label: "10 Guru chat messages", checked: true },
                { label: "3 quizzes per day", checked: true },
                { label: "3 notes generations", checked: true },
                { label: "1 active exam", checked: true },
                { label: "Unlimited quizzes", checked: false },
                { label: "Gap analysis", checked: false },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  {f.checked ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-red-300" />}
                  <span className={`text-xs ${f.checked ? 'text-gray-600 font-medium' : 'text-gray-400'}`}>{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro Monthly */}
          <div
            className="bg-white rounded-3xl border-2 border-[#c9a84c] p-8 flex flex-col shadow-2xl relative z-20 scale-105"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#c9a84c] text-[#1e3a5f] text-[10px] font-black uppercase px-4 py-1.5 rounded-full tracking-widest whitespace-nowrap">
              Most Popular
            </div>
            <h3 className="text-lg font-bold text-[#1e3a5f] uppercase tracking-[0.1em] mb-2">Pro Monthly</h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-black text-[#1e3a5f]">NPR 499</span>
              <span className="text-gray-400 font-bold text-sm">/mo</span>
            </div>
            <p className="text-[10px] text-gray-400 font-bold mb-8 uppercase tracking-widest leading-tight">
              Billed monthly, cancel anytime. <br/>Equivalent to 1 printed book.
            </p>
            <Link href="/auth/signup" className="w-full py-4 bg-[#c9a84c] text-[#1e3a5f] font-black rounded-2xl text-center hover:scale-105 transition-all shadow-lg shadow-[#c9a84c]/20 mb-8">
              Start Preparing
            </Link>
            <div className="space-y-4 mt-auto">
              {[
                { label: "Unlimited uploads", checked: true },
                { label: "Unlimited Guru chat", checked: true },
                { label: "Unlimited quizzes", checked: true },
                { label: "Unlimited notes", checked: true },
                { label: "Gap Analysis", checked: true },
                { label: "Weekly AI Feedback", checked: true },
                { label: "Advanced Analytics", checked: true },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs text-gray-600 font-bold">{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro Quarterly */}
          <div className="bg-white rounded-3xl border border-gray-100 p-8 flex flex-col hover:border-[#1e3a5f]/20 transition-all shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-bold text-[#1e3a5f] uppercase tracking-[0.1em]">Pro Quarterly</h3>
              <span className="bg-[#1e3a5f] text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Best Value</span>
            </div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-black text-[#1e3a5f]">
                {billing === 'monthly' ? 'NPR 433' : 'NPR 1299'}
              </span>
              <span className="text-gray-400 font-bold text-sm">
                {billing === 'monthly' ? '/mo' : ' total'}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-bold mb-8 uppercase tracking-widest">
              {billing === 'monthly' 
                ? 'Billed NPR 1299 every 3 months. Save NPR 198 compared to monthly.' 
                : 'Billed every 3 months. Best value for serious aspirants.'}
            </p>
            <Link href="/auth/signup" className="w-full py-4 bg-[#1e3a5f] text-white font-bold rounded-2xl text-center hover:bg-[#1e3a5f]/90 transition-all mb-8">
              Start Preparing
            </Link>
            <div className="space-y-4 mt-auto">
              <p className="text-[10px] text-[#c9a84c] font-black uppercase text-center mb-2">Most serious choice</p>
              {[
                "Everything in Pro",
                "Long term focus",
                "Best per-month price",
                "Advanced tracking",
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs text-gray-600 font-medium">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Exam Cycle Pack */}
          <div className="bg-gradient-to-br from-[#1e3a5f] to-[#12243d] rounded-3xl p-8 flex flex-col shadow-sm text-white">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-bold text-[#c9a84c] uppercase tracking-[0.1em]">Exam Cycle Pack</h3>
              <span className="bg-[#c9a84c] text-[#1e3a5f] text-[8px] font-black px-2 py-0.5 rounded-full uppercase">One Time</span>
            </div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-black text-white text-nowrap">NPR 1999</span>
            </div>
            <p className="text-[10px] text-gray-300 font-bold mb-8 uppercase tracking-widest">6 months full access. <br/>One time payment.</p>
            <Link href="/auth/signup" className="w-full py-4 bg-white text-[#1e3a5f] font-black rounded-2xl text-center hover:bg-gray-100 transition-all mb-8">
              Get Lifetime Access
            </Link>
            <div className="space-y-4 mt-auto">
              {[
                "6 months full access",
                "Ideal for 1 complete cycle",
                "All Pro features",
                "Priority Support",
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-[#c9a84c]" />
                  <span className="text-xs text-white/80 font-medium">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Note */}
        <div className="bg-white border border-border-subtle rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 mb-16">
          <div className="flex items-center gap-4">
             <div className="h-12 w-12 rounded-2xl bg-[#f8fafc] flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-[#1e3a5f]" />
             </div>
             <div>
               <p className="text-sm font-bold text-[#1e3a5f]">Safe & Secure Payments</p>
               <p className="text-xs text-gray-500">Manual verification within 24 hours. No credit card required.</p>
             </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
             <span className="text-2xl" title="eSewa">🇳🇵</span>
             <span className="text-xs font-black text-gray-400 uppercase tracking-widest">eSewa • Khalti • IME Pay • QR</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
             <ShieldCheck className="h-4 w-4" />
             <span className="text-xs font-bold uppercase tracking-tight">Verified by Academian</span>
          </div>
        </div>

        {/* Feature Comparison Accordion */}
        <div className="flex flex-col items-center">
           <button
             onClick={() => setShowComparison(!showComparison)}
             className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-[#1e3a5f] font-bold text-sm hover:border-[#c9a84c] transition-all shadow-sm"
           >
             {showComparison ? "Hide Comparison" : "See Full Feature Comparison"}
             {showComparison ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
           </button>

           <AnimatePresence>
             {showComparison && (
               <motion.div
                 initial={{ height: 0, opacity: 0 }}
                 animate={{ height: "auto", opacity: 1 }}
                 exit={{ height: 0, opacity: 0 }}
                 className="w-full mt-8 overflow-hidden overflow-x-auto"
               >
                 <div className="min-w-[800px] bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-xl">
                   <table className="w-full">
                     <thead>
                       <tr className="bg-[#1e3a5f] text-white">
                         <th className="px-6 py-5 text-left text-xs font-black uppercase tracking-widest">Feature</th>
                         <th className="px-6 py-5 text-center text-xs font-black uppercase tracking-widest">Free</th>
                         <th className="px-6 py-5 text-center text-xs font-black uppercase tracking-widest text-[#c9a84c]">Pro</th>
                         <th className="px-6 py-5 text-center text-xs font-black uppercase tracking-widest">Cycle Pack</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {features.map((f, i) => (
                          <tr key={i} className="hover:bg-gray-50/50 transition-all">
                             <td className="px-6 py-4">
                               <p className="text-sm font-bold text-[#1e3a5f]">{f.name}</p>
                               <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">{f.group}</p>
                             </td>
                             <td className="px-6 py-4 text-center">
                               {typeof f.free === 'string' ? <span className="text-xs font-bold text-gray-600">{f.free}</span> : (f.free ? <Check className="mx-auto h-5 w-5 text-emerald-500" /> : <X className="mx-auto h-5 w-5 text-red-300" />)}
                             </td>
                             <td className="px-6 py-4 text-center bg-[#c9a84c]/5">
                               {typeof f.pro === 'string' ? <span className="text-xs font-black text-[#1e3a5f]">{f.pro}</span> : (f.pro ? <Check className="mx-auto h-5 w-5 text-[#c9a84c]" /> : <X className="mx-auto h-5 w-5 text-red-300" />)}
                             </td>
                             <td className="px-6 py-4 text-center">
                               {typeof f.cycle === 'string' ? <span className="text-xs font-bold text-gray-600">{f.cycle}</span> : (f.cycle ? <Check className="mx-auto h-5 w-5 text-emerald-500" /> : <X className="mx-auto h-5 w-5 text-red-300" />)}
                             </td>
                          </tr>
                        ))}
                     </tbody>
                   </table>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
