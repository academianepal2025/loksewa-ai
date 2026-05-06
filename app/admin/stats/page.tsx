'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import {
  TrendingUp, DollarSign, Users, MessageSquare,
  ClipboardList, BookOpen, Brain, FileText,
  CheckCircle2, XCircle, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminStatsPage() {
  const [chartData, setChartData] = useState<any>(null);
  const [platformData, setPlatformData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/stats?section=charts').then(r => r.json()),
      fetch('/api/admin/stats?section=platform').then(r => r.json())
    ]).then(([charts, platform]) => {
      if (charts.success) setChartData(charts.data);
      if (platform.success) setPlatformData(platform.data);
    }).catch(() => toast.error('Failed to load stats'))
    .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#1e3a5f]" />
      </div>
    );
  }

  const featureUsage = platformData?.featureUsage || {};
  const docStats = platformData?.documentStats || {};
  const topUsers = platformData?.topActiveUsers || [];
  const planDist = platformData?.planDistribution || [];
  const totalFeatures = (featureUsage.chats || 0) + (featureUsage.quizzes || 0) + (featureUsage.notes || 0) + (featureUsage.studyPlans || 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tighter uppercase">Platform Analytics</h1>
        <p className="text-[10px] text-subtle mt-1 uppercase tracking-widest font-black">Comprehensive Mission Statistics</p>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-surface border border-border-subtle rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-[#1e3a5f]/10 text-[#1e3a5f] flex items-center justify-center border border-[#1e3a5f]/20 shadow-sm">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground uppercase tracking-widest">User Growth</h3>
              <p className="text-[10px] text-subtle font-medium">Daily signups (30d)</p>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData?.signupsChart || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} stroke="var(--subtle)" />
                <YAxis tick={{ fontSize: 10 }} stroke="var(--subtle)" allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', fontSize: '12px' }}
                  labelFormatter={(v) => `Date: ${v}`}
                />
                <Line type="monotone" dataKey="count" stroke="#1e3a5f" strokeWidth={2.5} dot={{ r: 3, fill: '#1e3a5f' }} activeDot={{ r: 5 }} name="Signups" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Revenue */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-surface border border-border-subtle rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-[#c9a84c]/10 text-[#c9a84c] flex items-center justify-center border border-[#c9a84c]/20 shadow-sm">
              <DollarSign className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Mission Revenue</h3>
              <p className="text-[10px] text-subtle font-medium">Daily revenue in NPR (30d)</p>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData?.revenueChart || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} stroke="var(--subtle)" />
                <YAxis tick={{ fontSize: 10 }} stroke="var(--subtle)" />
                <Tooltip
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(v: any) => [`NPR ${v}`, 'Revenue']}
                  labelFormatter={(v) => `Date: ${v}`}
                />
                <Bar dataKey="amount" fill="#c9a84c" radius={[4, 4, 0, 0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Plan Distribution + Feature Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plan Distribution Donut */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-surface border border-border-subtle rounded-2xl p-6">
          <h3 className="text-sm font-black text-foreground mb-6 flex items-center gap-2 uppercase tracking-widest">
            <Users className="h-4 w-4 text-subtle" /> Plan Distribution
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planDist.filter((d: any) => d.value > 0)}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {planDist.filter((d: any) => d.value > 0).map((entry: any, i: number) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(v: any, name: any) => [v, name]}
                />
                <Legend
                  wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                  iconType="circle"
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Feature Usage */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-surface border border-border-subtle rounded-2xl p-6">
          <h3 className="text-sm font-black text-foreground mb-6 flex items-center gap-2 uppercase tracking-widest">
            <Brain className="h-4 w-4 text-subtle" /> Feature Usage
          </h3>
          <p className="text-3xl font-black text-foreground mb-1 tracking-tighter">{totalFeatures.toLocaleString()}</p>
          <p className="text-[10px] font-black text-subtle uppercase tracking-widest mb-6">Total AI Interactions</p>
          <div className="space-y-4">
            {[
              { label: 'Chat Messages', value: featureUsage.chats || 0, icon: MessageSquare, color: 'bg-[#1e3a5f]', pct: totalFeatures > 0 ? ((featureUsage.chats || 0)/totalFeatures)*100 : 0 },
              { label: 'Quiz Attempts', value: featureUsage.quizzes || 0, icon: ClipboardList, color: 'bg-[#c9a84c]', pct: totalFeatures > 0 ? ((featureUsage.quizzes || 0)/totalFeatures)*100 : 0 },
              { label: 'Study Notes', value: featureUsage.notes || 0, icon: BookOpen, color: 'bg-[#1e3a5f]/80', pct: totalFeatures > 0 ? ((featureUsage.notes || 0)/totalFeatures)*100 : 0 },
              { label: 'Study Plans', value: featureUsage.studyPlans || 0, icon: Brain, color: 'bg-[#c9a84c]/80', pct: totalFeatures > 0 ? ((featureUsage.studyPlans || 0)/totalFeatures)*100 : 0 },
            ].map(f => (
              <div key={f.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <f.icon className="h-3 w-3 text-subtle" /> {f.label}
                  </span>
                  <span className="text-xs font-bold text-subtle">{f.value.toLocaleString()}</span>
                </div>
                <div className="h-1.5 bg-border-subtle rounded-full overflow-hidden">
                  <div className={`h-full ${f.color} rounded-full transition-all`} style={{ width: `${Math.max(2, f.pct)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Document Processing */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-surface border border-border-subtle rounded-2xl p-6">
          <h3 className="text-sm font-black text-foreground mb-6 flex items-center gap-2 uppercase tracking-widest">
            <FileText className="h-4 w-4 text-subtle" /> Document Processing
          </h3>
          <div className="text-center mb-6">
            <p className="text-5xl font-black text-foreground">{docStats.successRate || 100}%</p>
            <p className="text-[10px] font-bold text-subtle uppercase tracking-widest mt-1">Success Rate</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 text-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto mb-2" />
              <p className="text-xl font-black text-emerald-600">{docStats.success || 0}</p>
              <p className="text-[9px] font-bold text-subtle uppercase tracking-wider">Success</p>
            </div>
            <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 text-center">
              <XCircle className="h-5 w-5 text-red-500 mx-auto mb-2" />
              <p className="text-xl font-black text-red-600">{docStats.failed || 0}</p>
              <p className="text-[9px] font-bold text-subtle uppercase tracking-wider">Failed</p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs text-subtle">{docStats.total || 0} total documents processed</p>
          </div>
        </motion.div>
      </div>

      {/* Top Active Users */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="bg-surface border border-border-subtle rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border-subtle">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-subtle" /> Top 10 Active Users
          </h3>
        </div>
        <div className="overflow-x-auto admin-table-scroll">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-background/50 border-b border-border-subtle">
              <tr>
                <th className="px-5 py-3 text-[10px] font-bold text-subtle uppercase tracking-widest w-10">#</th>
                <th className="px-5 py-3 text-[10px] font-bold text-subtle uppercase tracking-widest">User</th>
                <th className="px-5 py-3 text-[10px] font-bold text-subtle uppercase tracking-widest text-center">Docs</th>
                <th className="px-5 py-3 text-[10px] font-bold text-subtle uppercase tracking-widest text-center">Chats</th>
                <th className="px-5 py-3 text-[10px] font-bold text-subtle uppercase tracking-widest text-center">Quizzes</th>
                <th className="px-5 py-3 text-[10px] font-bold text-subtle uppercase tracking-widest text-center">Notes</th>
                <th className="px-5 py-3 text-[10px] font-bold text-subtle uppercase tracking-widest text-center">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {topUsers.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-sm text-subtle">No user activity data yet</td></tr>
              ) : topUsers.map((u: any, i: number) => (
                <tr key={u.id} className="hover:bg-background/30 transition-all">
                  <td className="px-5 py-4">
                    <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                      i === 0 ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
                      i === 1 ? 'bg-zinc-300/20 text-zinc-500 border border-zinc-300/30' :
                      i === 2 ? 'bg-[#c9a84c]/10 text-[#c9a84c] border border-[#c9a84c]/20' :
                      'bg-background text-subtle border border-border-subtle'
                    }`}>{i + 1}</span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-bold text-foreground">{u.name}</p>
                    <p className="text-[10px] text-subtle">{u.email}</p>
                  </td>
                  <td className="px-5 py-4 text-xs font-bold text-foreground text-center">{u.docs}</td>
                  <td className="px-5 py-4 text-xs font-bold text-foreground text-center">{u.chats}</td>
                  <td className="px-5 py-4 text-xs font-bold text-foreground text-center">{u.quizzes}</td>
                  <td className="px-5 py-4 text-xs font-bold text-foreground text-center">{u.notes}</td>
                  <td className="px-5 py-4 text-center">
                    <span className="text-sm font-black text-[#1e3a5f] bg-[#1e3a5f]/10 px-3 py-1 rounded-full border border-[#1e3a5f]/20">{u.total}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
