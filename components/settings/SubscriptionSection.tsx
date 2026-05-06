'use client';

import { useState, useEffect } from 'react';
import { Loader2, AlertTriangle, Crown } from 'lucide-react';
import { toast } from 'sonner';

const PLAN_COLORS: Record<string, string> = {
  pro_monthly: 'text-[#c9a84c] bg-[#1e3a5f] border-[#c9a84c]/20',
  pro_quarterly: 'text-[#c9a84c] bg-[#1e3a5f] border-[#c9a84c]/20',
  cycle_pack: 'text-[#c9a84c] bg-[#1e3a5f] border-[#c9a84c]/20',
};

const PLAN_NAMES: Record<string, string> = {
  pro_monthly: 'Pro Monthly', pro_quarterly: 'Pro Quarterly', cycle_pack: 'Exam Cycle Pack',
};

const FREE_LIMITS = { documents: 3, daily_chats: 10, daily_quizzes: 3, daily_notes: 5, active_exams: 1 };
const LIMIT_LABELS: Record<string, string> = { documents: 'Documents', daily_chats: 'Daily Chat Messages', daily_quizzes: 'Daily Quizzes', daily_notes: 'Daily Notes', active_exams: 'Active Exams' };

export function SubscriptionSection({ showUpgradeModal, dashboard }: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings/subscription').then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="bg-surface border border-border-subtle rounded-2xl p-6 sm:p-8 animate-pulse">
      <div className="h-6 w-48 bg-background rounded mb-4" /><div className="h-32 bg-background rounded-xl" />
    </div>
  );

  const sub = data?.subscription;
  const usage = data?.usage || {};
  const payReqs = data?.paymentRequests || [];
  const isPro = !!sub;
  const hasPending = payReqs.some((r: any) => r.status === 'pending');

  let daysLeft = 0, progress = 0;
  if (sub?.expires_at) {
    daysLeft = Math.max(0, Math.ceil((new Date(sub.expires_at).getTime() - Date.now()) / 86400000));
    if (sub.started_at) {
      const total = (new Date(sub.expires_at).getTime() - new Date(sub.started_at).getTime()) / 86400000;
      progress = Math.min(100, Math.max(0, ((total - daysLeft) / total) * 100));
    }
  }

  return (
    <div className="bg-surface border border-border-subtle rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-black text-foreground tracking-tighter mb-1 uppercase">Subscription & Billing</h2>
      <p className="text-xs text-subtle font-black uppercase tracking-widest opacity-70 mb-6">Your current plan and usage overview.</p>

      {/* Plan Card */}
      <div className={`rounded-2xl border p-6 mb-6 relative overflow-hidden ${isPro ? PLAN_COLORS[sub.plan] || 'border-border-subtle' : 'bg-background border-border-subtle'}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-subtle mb-1">Active Plan</p>
            <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
              {isPro && <Crown className="h-5 w-5 text-[#c9a84c]" />}
              {isPro ? PLAN_NAMES[sub.plan] || sub.plan : 'Free Tier'}
            </h3>
            {isPro && sub.expires_at && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-subtle">Period Progress</span>
                  <span className="text-foreground">{daysLeft} days remaining</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-[#c9a84c] rounded-full transition-all duration-500 shadow-sm" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-[9px] font-black text-subtle uppercase tracking-widest mt-1">Expires {new Date(sub.expires_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            )}
          </div>
          <div>
            {hasPending ? (
              <span className="px-4 py-2.5 bg-background/50 border border-border-subtle text-subtle rounded-xl text-[10px] font-black uppercase tracking-widest cursor-not-allowed">Awaiting Verification</span>
            ) : (
            <button onClick={() => showUpgradeModal()} className="px-6 py-2.5 bg-[#c9a84c] text-[#1e3a5f] rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-[#c9a84c]/10">
                {isPro ? (daysLeft <= 7 ? 'Renew Mission' : 'Extend Mission') : 'Upgrade Mission'}
              </button>
            )}
          </div>
        </div>

        {/* Warnings */}
        {isPro && daysLeft <= 7 && daysLeft > 3 && (
          <div className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-[#c9a84c]/10 border border-[#c9a84c]/20 rounded-xl text-[10px] font-black text-[#c9a84c] uppercase tracking-widest">
            <AlertTriangle className="h-4 w-4" /> Your plan expires in {daysLeft} days. Renew now.
          </div>
        )}
        {isPro && daysLeft <= 3 && daysLeft > 0 && (
          <div className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-black text-red-600 uppercase tracking-widest">
            <AlertTriangle className="h-4 w-4" /> Only {daysLeft} day{daysLeft > 1 ? 's' : ''} left! Renew to avoid interruption.
          </div>
        )}
        {isPro && daysLeft === 0 && (
          <div className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-black text-red-600 uppercase tracking-widest">
            <AlertTriangle className="h-4 w-4" /> Your plan has expired. Renew to restore Pro access.
          </div>
        )}
      </div>

      {!isPro && (
        <div className="mb-6">
          <p className="text-[10px] font-black text-subtle uppercase tracking-widest mb-3 ml-1">Current Usage</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(FREE_LIMITS).map(([key, limit]) => (
              <div key={key} className="bg-background border border-border-subtle rounded-xl p-3 shadow-sm">
                <p className="text-[10px] font-black text-subtle uppercase tracking-widest mb-1">{LIMIT_LABELS[key]}</p>
                <p className="text-sm font-black text-foreground uppercase tracking-widest">{usage[key] || 0} <span className="text-[10px] text-subtle font-black opacity-50">/ {limit}</span></p>
              </div>
            ))}
          </div>
        </div>
      )}

      {payReqs.length > 0 && (
        <div>
          <p className="text-[10px] font-black text-subtle uppercase tracking-widest mb-3 ml-1">Payment Requests</p>
          {hasPending && (
            <div className="mb-3 p-3 bg-[#c9a84c]/5 border border-[#c9a84c]/20 rounded-xl text-[10px] font-black text-[#c9a84c] uppercase tracking-widest">
              Your payment is under review — activation scheduled within 24 hours.
            </div>
          )}
          <div className="space-y-2">
            {payReqs.map((r: any) => (
              <div key={r.id} className="bg-background border border-border-subtle rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
                <div>
                  <p className="text-[11px] font-black text-foreground uppercase tracking-widest">{(r.plan || '').replace('_', ' ')}</p>
                  <p className="text-[9px] text-subtle font-black uppercase tracking-widest mt-0.5">{new Date(r.created_at).toLocaleDateString()} · NPR {r.plan_amount}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border shadow-sm ${r.status === 'pending' ? 'bg-[#c9a84c]/5 border-[#c9a84c]/20 text-[#c9a84c]' : r.status === 'approved' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600' : 'bg-red-500/5 border-red-500/20 text-red-600'}`}>{r.status}</span>
                  {r.status === 'rejected' && r.admin_notes && <p className="text-[9px] font-black text-red-500 max-w-[200px] text-right uppercase tracking-widest mt-1">Reason: {r.admin_notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
