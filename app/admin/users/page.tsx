'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Search, Filter, ChevronLeft, ChevronRight, Users,
  ArrowUpDown, Eye, Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { UserDetailPanel } from '@/components/admin/UserDetailPanel';

interface UserRow {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
  plan: string | null;
  plan_status: string;
  expires_at: string | null;
  days_remaining: number | null;
  documents: number;
  chats: number;
  quizzes: number;
  notes: number;
}

const planBadge: Record<string, string> = {
  pro_monthly: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  pro_quarterly: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  cycle_pack: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
};

const statusBadge: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  expired: 'bg-red-500/10 text-red-600 border-red-500/20',
  free: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [searchTimeout, setSearchTimeout] = useState<any>(null);

  // User detail panel
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(), limit: limit.toString(),
        search, filter, sort
      });
      const res = await fetch(`/api/admin/users?${params}`, { cache: 'no-store' });
      if (!res.ok) {
        const errText = await res.text();
        console.error(`[admin/users] API Error ${res.status}:`, errText);
        toast.error(`Failed to load users: ${res.status}`);
        return;
      }
      const json = await res.json();
      if (json.success) {
        console.log(`[admin/users] Loaded ${json.data.users.length} users`);
        setUsers(json.data.users);
        setTotal(json.data.total);
      } else {
        console.error('[admin/users] API returned success:false', json.error);
        toast.error(json.error || 'Failed to load users');
      }
    } catch (e: any) {
      console.error('[admin/users] Fetch exception:', e);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search, filter, sort]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSearchChange = (val: string) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    const t = setTimeout(() => { setSearch(val); setPage(1); }, 400);
    setSearchTimeout(t);
  };

  const totalPages = Math.ceil(total / limit);

  const daysColor = (d: number | null) => {
    if (d === null) return 'text-subtle';
    if (d > 7) return 'text-emerald-500';
    if (d > 3) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-500" /> User Directory
          </h1>
          <p className="text-xs text-subtle mt-1">{total} total users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle" />
          <input
            type="text"
            placeholder="Search name, email, or phone..."
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-surface border border-border-subtle rounded-xl pl-11 pr-4 py-3 text-sm font-bold text-foreground outline-none focus:border-accent transition-all"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setPage(1); }}
          className="bg-surface border border-border-subtle rounded-xl px-4 py-3 text-xs font-bold text-foreground outline-none focus:border-accent min-w-[150px]"
        >
          <option value="all">All Plans</option>
          <option value="free">Free</option>
          <option value="pro_monthly">Pro Monthly</option>
          <option value="pro_quarterly">Pro Quarterly</option>
          <option value="cycle_pack">Cycle Pack</option>
          <option value="expired">Expired</option>
        </select>
        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(1); }}
          className="bg-surface border border-border-subtle rounded-xl px-4 py-3 text-xs font-bold text-foreground outline-none focus:border-accent min-w-[150px]"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="alpha">A → Z</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border-subtle rounded-2xl overflow-hidden">
        <div className="overflow-x-auto admin-table-scroll">
          <table className="w-full text-left min-w-[1100px]">
            <thead className="bg-background/50 border-b border-border-subtle">
              <tr>
                <th className="px-5 py-3 text-[10px] font-bold text-subtle uppercase tracking-widest">User</th>
                <th className="px-5 py-3 text-[10px] font-bold text-subtle uppercase tracking-widest">Phone</th>
                <th className="px-5 py-3 text-[10px] font-bold text-subtle uppercase tracking-widest">Plan</th>
                <th className="px-5 py-3 text-[10px] font-bold text-subtle uppercase tracking-widest">Status</th>
                <th className="px-5 py-3 text-[10px] font-bold text-subtle uppercase tracking-widest">Expiry</th>
                <th className="px-5 py-3 text-[10px] font-bold text-subtle uppercase tracking-widest">Days</th>
                <th className="px-5 py-3 text-[10px] font-bold text-subtle uppercase tracking-widest">Docs</th>
                <th className="px-5 py-3 text-[10px] font-bold text-subtle uppercase tracking-widest">Chats</th>
                <th className="px-5 py-3 text-[10px] font-bold text-subtle uppercase tracking-widest">Quiz</th>
                <th className="px-5 py-3 text-[10px] font-bold text-subtle uppercase tracking-widest">Notes</th>
                <th className="px-5 py-3 text-[10px] font-bold text-subtle uppercase tracking-widest">Joined</th>
                <th className="px-5 py-3 text-[10px] font-bold text-subtle uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={12} className="px-5 py-5"><div className="h-4 bg-background rounded w-full" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-5 py-12 text-center">
                    <p className="text-sm font-bold text-subtle">No users found</p>
                  </td>
                </tr>
              ) : users.map(u => (
                <tr key={u.id} className="hover:bg-background/30 transition-all">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 text-xs font-bold shrink-0">
                        {(u.full_name || u.email || '?')[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate max-w-[150px]">{u.full_name || '—'}</p>
                        <p className="text-[10px] text-subtle truncate max-w-[150px]">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs font-bold text-foreground">{u.phone || '—'}</td>
                  <td className="px-5 py-4">
                    {u.plan ? (
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase border ${planBadge[u.plan] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {u.plan.replace('_', ' ')}
                      </span>
                    ) : <span className="text-xs text-subtle">—</span>}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase border ${statusBadge[u.plan_status] || statusBadge.free}`}>
                      {u.plan_status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs font-bold text-foreground">
                    {u.expires_at ? format(new Date(u.expires_at), 'MMM dd, yy') : '—'}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-sm font-black ${daysColor(u.days_remaining)}`}>
                      {u.days_remaining !== null ? u.days_remaining : '—'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs font-bold text-foreground text-center">{u.documents}</td>
                  <td className="px-5 py-4 text-xs font-bold text-foreground text-center">{u.chats}</td>
                  <td className="px-5 py-4 text-xs font-bold text-foreground text-center">{u.quizzes}</td>
                  <td className="px-5 py-4 text-xs font-bold text-foreground text-center">{u.notes}</td>
                  <td className="px-5 py-4 text-[10px] font-bold text-subtle">{format(new Date(u.created_at), 'MMM dd, yy')}</td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => setSelectedUserId(u.id)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-indigo-500/10 text-indigo-600 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-indigo-500/20 transition-all border border-indigo-500/20 ml-auto"
                    >
                      <Eye className="h-3 w-3" /> Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border-subtle flex items-center justify-between">
            <p className="text-xs text-subtle">Page {page} of {totalPages} • {total} users</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                className="p-2 bg-background border border-border-subtle rounded-lg text-subtle hover:text-foreground disabled:opacity-30 transition-all">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                className="p-2 bg-background border border-border-subtle rounded-lg text-subtle hover:text-foreground disabled:opacity-30 transition-all">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Panel */}
      <UserDetailPanel
        isOpen={!!selectedUserId}
        onClose={() => setSelectedUserId(null)}
        userId={selectedUserId}
      />
    </div>
  );
}
