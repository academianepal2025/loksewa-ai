'use client';

import React from 'react';
import { useDashboard } from './DashboardProvider';
import { AlertCircle, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import { useUpgradeModal } from '@/lib/UpgradeModalContext';
import { differenceInDays, parseISO } from 'date-fns';

export function PlanBanner() {
  const { isPro, subscription, isAdmin } = useDashboard();
  const { showUpgradeModal } = useUpgradeModal();

  if (isAdmin || !subscription) return null;

  const expiryDate = parseISO(subscription.expires_at);
  const daysRemaining = differenceInDays(expiryDate, new Date());
  const isExpired = daysRemaining < 0;

  if (isExpired) {
    return (
      <div className="bg-red-600 text-white px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in slide-in-from-top duration-500">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-5 w-5 animate-pulse" />
          <p className="text-xs font-bold uppercase tracking-widest">Your Pro plan has expired. You are now on the limited free plan.</p>
        </div>
        <button 
          onClick={() => showUpgradeModal()}
          className="px-6 py-2 bg-white text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-zinc-100 transition-all shadow-lg"
        >
          Restore Full Access
        </button>
      </div>
    );
  }

  if (daysRemaining <= 7) {
    const isUrgent = daysRemaining <= 3;
    return (
      <div className={`px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in slide-in-from-top duration-500 ${isUrgent ? 'bg-[#1e3a5f] text-white' : 'bg-[#c9a84c] text-[#1e3a5f]'}`}>
        <div className="flex items-center gap-3">
          <AlertCircle className={`h-5 w-5 ${isUrgent ? 'animate-bounce' : ''}`} />
          <p className="text-xs font-black uppercase tracking-widest">
            {isUrgent 
              ? `Plan expires in ${daysRemaining} days — renew immediately to prevent disruption.` 
              : `Your Pro plan expires in ${daysRemaining} days. Renew now to keep unlimited access.`}
          </p>
        </div>
        <button 
          onClick={() => showUpgradeModal()}
          className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 ${isUrgent ? 'bg-white text-[#1e3a5f]' : 'bg-[#1e3a5f] text-[#c9a84c]'}`}
        >
          Renew Mission Plan <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return null;
}
