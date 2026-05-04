'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, CreditCard, BarChart3, BookOpen, Loader2, Calendar, Shield, FileText, MessageSquare, Brain, ClipboardList, Flame } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface UserDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
}

export function UserDetailPanel({ isOpen, onClose, userId }: UserDetailPanelProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [grantPlan, setGrantPlan] = useState('pro_monthly');
  const [grantExpiry, setGrantExpiry] = useState('');
  const [granting, setGranting] = useState(false);
  const [revoking, setRevoking] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetail();
    }
    return () => { setData(null); };
  }, [isOpen, userId]);

  const fetchUserDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch { toast.error('Failed to load user'); }
    finally { setLoading(false); }
  };

  const handleGrantPlan = async () => {
    setGranting(true);
    try {
      const res = await fetch('/api/admin/grant-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, plan: grantPlan, expiresAt: grantExpiry || undefined })
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`${grantPlan.replace('_', ' ')} plan granted`);
        fetchUserDetail();
      } else throw new Error(json.error);
    } catch (e: any) { toast.error(e.message); }
    finally { setGranting(false); }
  };

  const handleRevokePlan = async () => {
    setRevoking(true);
    try {
      const res = await fetch('/api/admin/revoke-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Plan revoked');
        fetchUserDetail();
      } else throw new Error(json.error);
    } catch (e: any) { toast.error(e.message); }
    finally { setRevoking(false); }
  };

  const p = data?.profile;
  const sub = data?.subscription;
  const usage = data?.usage;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute right-0 top-0 bottom-0 w-full max-w-xl bg-surface border-l border-border-subtle shadow-2xl overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur-md border-b border-border-subtle p-6 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-foreground">User Detail</h2>
              <button onClick={onClose} className="p-2 hover:bg-background rounded-xl text-subtle hover:text-foreground transition-all">
                <X className="h-5 w-5" />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
              </div>
            ) : data ? (
              <div className="p-6 space-y-8">
                {/* User Info */}
                <section className="space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent flex items-center gap-2">
                    <User className="h-3.5 w-3.5" /> User Information
                  </h3>
                  <div className="bg-background border border-border-subtle rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold text-lg">
                        {(p?.full_name || '?')[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-lg">{p?.full_name || 'Unknown'}</p>
                        <p className="text-xs text-subtle">{p?.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <p className="text-[10px] font-bold text-subtle uppercase tracking-wider">Phone</p>
                        <p className="text-sm font-bold text-foreground">{p?.phone || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-subtle uppercase tracking-wider">Joined</p>
                        <p className="text-sm font-bold text-foreground">{p?.created_at ? format(new Date(p.created_at), 'MMM dd, yyyy') : '—'}</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Subscription */}
                <section className="space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent flex items-center gap-2">
                    <CreditCard className="h-3.5 w-3.5" /> Subscription
                  </h3>
                  <div className="bg-background border border-border-subtle rounded-2xl p-5 space-y-4">
                    {sub ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            sub.plan_status === 'active' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                            'bg-red-500/10 text-red-600 border border-red-500/20'
                          }`}>{sub.plan?.replace('_', ' ')} — {sub.plan_status}</span>
                          {sub.days_remaining !== null && (
                            <span className={`text-xs font-bold ${sub.days_remaining > 7 ? 'text-emerald-500' : sub.days_remaining > 3 ? 'text-yellow-500' : 'text-red-500'}`}>
                              {sub.days_remaining}d remaining
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[10px] font-bold text-subtle uppercase tracking-wider">Started</p>
                            <p className="text-xs font-bold text-foreground">{sub.started_at ? format(new Date(sub.started_at), 'MMM dd, yyyy') : '—'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-subtle uppercase tracking-wider">Expires</p>
                            <p className="text-xs font-bold text-foreground">{sub.expires_at ? format(new Date(sub.expires_at), 'MMM dd, yyyy') : '—'}</p>
                          </div>
                        </div>
                        {/* Progress bar */}
                        {sub.started_at && sub.expires_at && sub.plan_status === 'active' && (
                          <div>
                            <div className="h-2 bg-border-subtle rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
                                style={{
                                  width: `${Math.min(100, Math.max(0, ((Date.now() - new Date(sub.started_at).getTime()) / (new Date(sub.expires_at).getTime() - new Date(sub.started_at).getTime())) * 100))}%`
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-subtle text-center py-3">No active subscription (Free tier)</p>
                    )}
                  </div>
                </section>

                {/* Manual Plan Management */}
                <section className="space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5" /> Plan Management
                  </h3>
                  <div className="bg-background border border-border-subtle rounded-2xl p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-subtle uppercase tracking-widest">Plan</label>
                        <select
                          value={grantPlan}
                          onChange={(e) => setGrantPlan(e.target.value)}
                          className="w-full bg-surface border border-border-subtle rounded-xl px-3 py-2.5 text-xs font-bold text-foreground outline-none focus:border-accent"
                        >
                          <option value="pro_monthly">Pro Monthly</option>
                          <option value="pro_quarterly">Pro Quarterly</option>
                          <option value="cycle_pack">Cycle Pack</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-subtle uppercase tracking-widest">Custom Expiry</label>
                        <input
                          type="date"
                          value={grantExpiry}
                          onChange={(e) => setGrantExpiry(e.target.value)}
                          className="w-full bg-surface border border-border-subtle rounded-xl px-3 py-2.5 text-xs font-bold text-foreground outline-none focus:border-accent"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleGrantPlan}
                        disabled={granting}
                        className="flex-1 py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {granting && <Loader2 className="h-3 w-3 animate-spin" />}
                        Grant Plan
                      </button>
                      <button
                        onClick={handleRevokePlan}
                        disabled={revoking || !sub || sub.plan_status !== 'active'}
                        className="flex-1 py-3 bg-red-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {revoking && <Loader2 className="h-3 w-3 animate-spin" />}
                        Revoke Plan
                      </button>
                    </div>
                  </div>
                </section>

                {/* Usage Statistics */}
                <section className="space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent flex items-center gap-2">
                    <BarChart3 className="h-3.5 w-3.5" /> Usage Statistics
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Documents', value: usage?.documents || 0, icon: FileText, color: 'text-blue-500 bg-blue-500/10' },
                      { label: 'Chats', value: usage?.chats || 0, icon: MessageSquare, color: 'text-purple-500 bg-purple-500/10' },
                      { label: 'Quizzes', value: usage?.quizzes || 0, icon: ClipboardList, color: 'text-emerald-500 bg-emerald-500/10' },
                      { label: 'Notes', value: usage?.notes || 0, icon: BookOpen, color: 'text-orange-500 bg-orange-500/10' },
                      { label: 'Plans', value: usage?.studyPlans || 0, icon: Brain, color: 'text-indigo-500 bg-indigo-500/10' },
                      { label: 'Streak', value: usage?.studyStreak || 0, icon: Flame, color: 'text-red-500 bg-red-500/10' },
                    ].map((s) => (
                      <div key={s.label} className="bg-background border border-border-subtle rounded-xl p-4 text-center">
                        <div className={`h-8 w-8 rounded-lg ${s.color} flex items-center justify-center mx-auto mb-2`}>
                          <s.icon className="h-4 w-4" />
                        </div>
                        <p className="text-xl font-black text-foreground">{s.value}</p>
                        <p className="text-[9px] font-bold text-subtle uppercase tracking-wider mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Payment History */}
                {data.paymentHistory?.length > 0 && (
                  <section className="space-y-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" /> Payment History
                    </h3>
                    <div className="space-y-2">
                      {data.paymentHistory.map((p: any) => (
                        <div key={p.id} className="bg-background border border-border-subtle rounded-xl p-4 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-foreground">{p.plan?.replace('_', ' ')}</p>
                            <p className="text-[10px] text-subtle">{format(new Date(p.created_at), 'MMM dd, yyyy HH:mm')}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black text-foreground">NPR {p.plan_amount}</p>
                            <span className={`text-[9px] font-bold uppercase ${
                              p.status === 'approved' ? 'text-emerald-500' :
                              p.status === 'rejected' ? 'text-red-500' :
                              p.status === 'manually_granted' ? 'text-blue-500' :
                              'text-orange-500'
                            }`}>{p.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Exams */}
                {data.exams?.length > 0 && (
                  <section className="space-y-4 pb-8">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent flex items-center gap-2">
                      <BookOpen className="h-3.5 w-3.5" /> Exams
                    </h3>
                    <div className="space-y-2">
                      {data.exams.map((e: any) => (
                        <div key={e.id} className="bg-background border border-border-subtle rounded-xl p-4">
                          <p className="text-sm font-bold text-foreground">{e.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] text-subtle">{e.category}</span>
                            {e.exam_date && <span className="text-[10px] text-accent">{format(new Date(e.exam_date), 'MMM dd, yyyy')}</span>}
                            <span className="text-[10px] font-bold text-subtle uppercase">{e.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            ) : null}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
