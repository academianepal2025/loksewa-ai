'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users, CreditCard, FileText, Calendar, AlertCircle,
  RefreshCw, CheckCircle2, Clock, Eye, RotateCcw, TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';

interface OverviewData {
  totalUsers: number;
  activeSubscribers: number;
  pendingPayments: number;
  totalDocuments: number;
  totalStudyPlans: number;
  recentPayments: any[];
  recentSignups: any[];
  expiringPlans: any[];
  failedDocs: any[];
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats?section=overview');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setLastRefresh(new Date());
      }
    } catch { toast.error('Failed to fetch stats'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleRetryDoc = async (docId: string) => {
    try {
      const res = await fetch('/api/process-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: docId })
      });
      if (res.ok) toast.success('Document reprocessing started');
      else toast.error('Failed to retry');
    } catch { toast.error('Retry failed'); }
  };

  const statCards = data ? [
    { label: 'Total Users', value: data.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { label: 'Active Subscribers', value: data.activeSubscribers, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { label: 'Pending Payments', value: data.pendingPayments, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    { label: 'Documents', value: data.totalDocuments, icon: FileText, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { label: 'Study Plans', value: data.totalStudyPlans, icon: Calendar, color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  ] : [];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[1,2,3,4,5].map(i => <div key={i} className="h-28 bg-surface border border-border-subtle rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-64 bg-surface border border-border-subtle rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard Overview</h1>
          <p className="text-xs text-subtle mt-1">Last refreshed: {format(lastRefresh, 'HH:mm:ss')} • Auto-refreshes every 60s</p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchData(); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1e3a5f] text-[#c9a84c] rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-[#1e3a5f]/20"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`admin-stat-card bg-surface border border-border-subtle p-5 rounded-2xl`}
          >
            <div className={`h-10 w-10 rounded-xl ${card.bg} ${card.color} flex items-center justify-center mb-3 border ${card.border}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <p className="text-3xl font-black text-foreground tracking-tight">{card.value.toLocaleString()}</p>
            <p className="text-[10px] font-bold text-subtle uppercase tracking-widest mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-surface border border-border-subtle rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-border-subtle flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-subtle" /> Recent Payments
            </h3>
            <Link href="/admin/payments" className="text-[10px] font-black text-[#c9a84c] uppercase tracking-widest hover:opacity-80 transition-colors">
              View All →
            </Link>
          </div>
          <div className="divide-y divide-border-subtle max-h-[420px] overflow-y-auto">
            {(data?.recentPayments || []).length === 0 ? (
              <p className="text-sm text-subtle text-center py-8">No payment requests yet</p>
            ) : data?.recentPayments.map((p: any) => (
              <div key={p.id} className="px-5 py-4 flex items-center justify-between hover:bg-background/50 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{p.user_email}</p>
                  <p className="text-[10px] text-subtle">{p.plan?.replace('_', ' ')} • NPR {p.plan_amount} • {format(new Date(p.created_at), 'MMM dd, HH:mm')}</p>
                </div>
                <span className={`shrink-0 ml-3 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                  p.status === 'pending' ? 'bg-[#c9a84c]/10 text-[#c9a84c] border border-[#c9a84c]/20' :
                  p.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                  'bg-red-500/10 text-red-600 border border-red-500/20'
                }`}>{p.status}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Signups */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-surface border border-border-subtle rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-border-subtle flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-subtle" /> Recent Signups
            </h3>
            <Link href="/admin/users" className="text-[10px] font-black text-[#c9a84c] uppercase tracking-widest hover:opacity-80 transition-colors">
              View All →
            </Link>
          </div>
          <div className="divide-y divide-border-subtle max-h-[420px] overflow-y-auto">
            {(data?.recentSignups || []).length === 0 ? (
              <p className="text-sm text-subtle text-center py-8">No recent signups</p>
            ) : data?.recentSignups.map((u: any) => (
              <div key={u.id} className="px-5 py-4 flex items-center justify-between hover:bg-background/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 text-xs font-bold shrink-0">
                    {(u.full_name || u.email || '?')[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{u.full_name || 'No name'}</p>
                    <p className="text-[10px] text-subtle truncate">{u.email}</p>
                  </div>
                </div>
                <p className="text-[10px] font-bold text-subtle shrink-0 ml-3">{format(new Date(u.created_at), 'MMM dd')}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Expiring Plans & Failed Docs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiring Plans */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-surface border border-border-subtle rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-border-subtle">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" /> Expiring Plans (Next 7 Days)
            </h3>
          </div>
          <div className="divide-y divide-border-subtle max-h-[350px] overflow-y-auto">
            {(data?.expiringPlans || []).length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-foreground">No expiring plans</p>
                <p className="text-xs text-subtle">All subscriptions are healthy</p>
              </div>
            ) : data?.expiringPlans.map((s: any) => (
              <div key={s.id} className="px-5 py-4 flex items-center justify-between hover:bg-background/50 transition-colors">
                <div>
                  <p className="text-sm font-bold text-foreground">{s.user_email}</p>
                  <p className="text-[10px] text-subtle">{s.plan?.replace('_', ' ')}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-red-500">{format(new Date(s.expires_at), 'MMM dd, yyyy')}</p>
                  <p className="text-[10px] text-subtle">{Math.ceil((new Date(s.expires_at).getTime() - Date.now()) / (1000*60*60*24))}d left</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Failed Documents */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="bg-surface border border-border-subtle rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-border-subtle">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" /> Failed Documents
            </h3>
          </div>
          <div className="divide-y divide-border-subtle max-h-[350px] overflow-y-auto">
            {(data?.failedDocs || []).length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-foreground">All systems nominal</p>
                <p className="text-xs text-subtle">No failed documents</p>
              </div>
            ) : data?.failedDocs.map((d: any) => (
              <div key={d.id} className="px-5 py-4 flex items-center justify-between hover:bg-background/50 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground truncate max-w-[200px]">{d.file_name}</p>
                  <p className="text-[10px] text-subtle">{d.user_email} • {format(new Date(d.created_at), 'MMM dd')}</p>
                </div>
                <button
                  onClick={() => handleRetryDoc(d.id)}
                  className="shrink-0 ml-3 flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-600 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-red-500/20 transition-all border border-red-500/20"
                >
                  <RotateCcw className="h-3 w-3" /> Retry
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
