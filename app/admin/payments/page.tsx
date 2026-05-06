'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  CreditCard, Clock, CheckCircle2, XCircle, Check, X,
  Search, Download, ChevronLeft, ChevronRight, Eye,
  DollarSign, Loader2, Square, CheckSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { ReceiptLightbox } from '@/components/admin/ReceiptLightbox';
import { format } from 'date-fns';

interface PaymentRequest {
  id: string;
  user_id: string;
  user_email: string;
  payer_name: string;
  payer_phone: string;
  plan: string;
  plan_amount: number;
  receipt_url: string;
  status: string;
  admin_notes?: string;
  created_at: string;
  reviewed_at?: string;
}

const planColors: Record<string, string> = {
  pro_monthly: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  pro_quarterly: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  cycle_pack: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
};

export default function AdminPaymentsPage() {
  const supabase = createClient();
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, monthRevenue: 0 });
  const [page, setPage] = useState(1);
  const rowsPerPage = 20;

  // Date range filter
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Review modals
  const [reviewingRequest, setReviewingRequest] = useState<PaymentRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Receipt lightbox
  const [receiptRequestId, setReceiptRequestId] = useState<string | null>(null);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('payment_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) { toast.error('Failed to fetch'); }
    else {
      setRequests(data || []);
      // Calculate stats
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const s = { total: data?.length || 0, pending: 0, approved: 0, rejected: 0, monthRevenue: 0 };
      data?.forEach((r: any) => {
        if (r.status === 'pending') s.pending++;
        else if (r.status === 'approved') {
          s.approved++;
          if (r.reviewed_at && new Date(r.reviewed_at) >= monthStart) {
            s.monthRevenue += r.plan_amount || 0;
          }
        }
        else if (r.status === 'rejected') s.rejected++;
      });
      setStats(s);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('admin-payments-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'payment_requests'
      }, (payload: any) => {
        const newReq = payload.new as PaymentRequest;
        setRequests(prev => [newReq, ...prev]);
        setStats(prev => ({ ...prev, total: prev.total + 1, pending: prev.pending + 1 }));
        toast.info('New Payment Request', { description: `${newReq.user_email} — ${newReq.plan?.replace('_', ' ')}` });
        // Browser notification
        if (Notification.permission === 'granted') {
          new Notification('New Payment Request', { body: `${newReq.user_email} submitted a ${newReq.plan} payment` });
        }
      })
      .subscribe();

    // Request notification permission
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  const handleReview = async () => {
    if (!reviewingRequest || !reviewAction) return;
    if (reviewAction === 'rejected' && adminNotes.length < 10) {
      toast.error('Reason must be at least 10 characters');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentRequestId: reviewingRequest.id, action: reviewAction, adminNotes })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      // Update locally
      setRequests(prev => prev.map(r => r.id === reviewingRequest.id ? { ...r, status: reviewAction, admin_notes: adminNotes, reviewed_at: new Date().toISOString() } : r));
      // Recalculate stats
      setStats(prev => {
        const s = { ...prev, pending: prev.pending - 1 };
        if (reviewAction === 'approved') { s.approved++; s.monthRevenue += reviewingRequest.plan_amount; }
        else s.rejected++;
        return s;
      });
      toast.success(reviewAction === 'approved' ? `Plan activated for ${reviewingRequest.user_email}` : 'Payment rejected');
      setReviewingRequest(null); setReviewAction(null); setAdminNotes('');
    } catch (error: any) { 
      console.error('Payment review error:', error);
      toast.error(error.message || 'Operation failed'); 
    }
    finally { setIsSubmitting(false); }
  };

  const handleBulkApprove = async () => {
    const pendingSelected = [...selectedIds].filter(id => requests.find(r => r.id === id)?.status === 'pending');
    if (pendingSelected.length === 0) return;
    setBulkProcessing(true); setBulkProgress(0);
    for (let i = 0; i < pendingSelected.length; i++) {
      try {
        await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentRequestId: pendingSelected[i], action: 'approved', adminNotes: 'Bulk approved' })
        });
        setBulkProgress(i + 1);
      } catch { /* skip failed */ }
    }
    setBulkProcessing(false); setSelectedIds(new Set());
    fetchRequests();
    toast.success(`${pendingSelected.length} payments approved`);
  };

  const handleExport = async () => {
    try {
      const res = await fetch('/api/admin/export/payments');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payments_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV exported');
    } catch { toast.error('Export failed'); }
  };

  // Filtering
  let filtered = requests.filter(r => activeTab === 'all' || r.status === activeTab);
  if (dateFrom) filtered = filtered.filter(r => new Date(r.created_at) >= new Date(dateFrom));
  if (dateTo) filtered = filtered.filter(r => new Date(r.created_at) <= new Date(dateTo + 'T23:59:59'));

  // Pagination
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paged = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const pendingSelectedCount = [...selectedIds].filter(id => requests.find(r => r.id === id)?.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="admin-stat-card bg-surface border border-border-subtle p-4 rounded-2xl shadow-sm">
          <p className="text-[10px] font-black text-subtle uppercase tracking-widest mb-1">Total Requests</p>
          <p className="text-2xl font-black text-foreground tracking-tighter">{stats.total}</p>
        </div>
        <div className="admin-stat-card bg-accent/5 border border-accent/10 p-4 rounded-2xl shadow-sm">
          <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">Pending Verification</p>
          <p className="text-2xl font-black text-accent tracking-tighter">{stats.pending}</p>
        </div>
        <div className="admin-stat-card bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl shadow-sm">
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Approved Assets</p>
          <p className="text-2xl font-black text-emerald-600 tracking-tighter">{stats.approved}</p>
        </div>
        <div className="admin-stat-card bg-red-500/5 border border-red-500/10 p-4 rounded-2xl shadow-sm">
          <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Rejected Ops</p>
          <p className="text-2xl font-black text-red-600 tracking-tighter">{stats.rejected}</p>
        </div>
        <div className="admin-stat-card bg-[#1e3a5f]/5 border border-[#1e3a5f]/10 p-4 rounded-2xl shadow-sm">
          <p className="text-[10px] font-black text-[#1e3a5f] uppercase tracking-widest mb-1">Mission Revenue</p>
          <p className="text-2xl font-black text-[#1e3a5f] tracking-tighter">NPR {stats.monthRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-surface border border-border-subtle rounded-2xl overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-border-subtle flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Tabs */}
            <div className="flex bg-background p-1 rounded-xl border border-border-subtle">
              {(['pending', 'approved', 'rejected', 'all'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setPage(1); }}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === tab ? 'bg-[#1e3a5f] text-[#c9a84c] shadow-md' : 'text-subtle hover:text-foreground'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            {/* Bulk Approve */}
            {pendingSelectedCount > 0 && (
              <button
                onClick={handleBulkApprove}
                disabled={bulkProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-50"
              >
                {bulkProcessing ? (
                  <><Loader2 className="h-3 w-3 animate-spin" /> {bulkProgress}/{pendingSelectedCount}</>
                ) : (
                  <><CheckCircle2 className="h-3 w-3" /> Bulk Approve ({pendingSelectedCount})</>
                )}
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }}
              className="bg-background border border-border-subtle rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-accent text-foreground" />
            <span className="text-xs text-subtle">to</span>
            <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }}
              className="bg-background border border-border-subtle rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-accent text-foreground" />
            <button onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-background border border-border-subtle rounded-xl text-xs font-bold text-foreground hover:bg-surface transition-all">
              <Download className="h-3.5 w-3.5" /> CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto admin-table-scroll">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-background/50 border-b border-border-subtle">
              <tr>
                {activeTab === 'pending' && <th className="px-4 py-3 w-10"></th>}
                <th className="px-5 py-3 text-[10px] font-bold text-subtle uppercase tracking-widest">Ref / Date</th>
                <th className="px-5 py-3 text-[10px] font-bold text-subtle uppercase tracking-widest">User</th>
                <th className="px-5 py-3 text-[10px] font-bold text-subtle uppercase tracking-widest">Payer</th>
                <th className="px-5 py-3 text-[10px] font-bold text-subtle uppercase tracking-widest">Plan</th>
                <th className="px-5 py-3 text-[10px] font-bold text-subtle uppercase tracking-widest">Amount</th>
                <th className="px-5 py-3 text-[10px] font-bold text-subtle uppercase tracking-widest">Status</th>
                <th className="px-5 py-3 text-[10px] font-bold text-subtle uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {loading ? (
                [1,2,3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={8} className="px-5 py-6"><div className="h-4 bg-background rounded w-full" /></td>
                  </tr>
                ))
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center">
                    <p className="text-sm font-bold text-subtle">No requests found</p>
                  </td>
                </tr>
              ) : paged.map(req => (
                <tr key={req.id} className="hover:bg-background/30 transition-all">
                  {activeTab === 'pending' && (
                    <td className="px-4 py-4">
                      <button onClick={() => toggleSelect(req.id)} className="text-subtle hover:text-foreground">
                        {selectedIds.has(req.id) ? <CheckSquare className="h-4 w-4 text-indigo-500" /> : <Square className="h-4 w-4" />}
                      </button>
                    </td>
                  )}
                  <td className="px-5 py-4">
                    <p className="text-xs font-black text-foreground">{req.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-[10px] text-subtle">{format(new Date(req.created_at), 'MMM dd, HH:mm')}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-xs font-bold text-foreground truncate max-w-[160px]">{req.user_email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-xs font-bold text-foreground">{req.payer_name}</p>
                    <p className="text-[10px] text-accent">{req.payer_phone}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${planColors[req.plan] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {req.plan?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-xs font-black text-foreground">NPR {req.plan_amount}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      req.status === 'pending' ? 'bg-accent/10 text-accent border border-accent/20' :
                      req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                      req.status === 'manually_granted' ? 'bg-[#1e3a5f]/10 text-[#1e3a5f] border border-[#1e3a5f]/20' :
                      'bg-red-500/10 text-red-600 border border-red-500/20'
                    }`}>
                      {req.status === 'pending' ? <Clock className="h-3 w-3" /> : req.status === 'approved' || req.status === 'manually_granted' ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {req.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setReceiptRequestId(req.id)}
                        className="p-2 bg-background border border-border-subtle rounded-lg text-subtle hover:text-foreground transition-all"
                        title="View Receipt"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      {req.status === 'pending' && (
                        <>
                          <button
                            onClick={() => { setReviewingRequest(req); setReviewAction('approved'); }}
                            className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all"
                            title="Approve"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => { setReviewingRequest(req); setReviewAction('rejected'); }}
                            className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 hover:bg-red-500 hover:text-white transition-all"
                            title="Reject"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border-subtle flex items-center justify-between">
            <p className="text-xs text-subtle">Page {page} of {totalPages} • {filtered.length} results</p>
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

      {/* Review Modal */}
      <ConfirmModal
        isOpen={!!reviewingRequest}
        onClose={() => { setReviewingRequest(null); setReviewAction(null); setAdminNotes(''); }}
        onConfirm={handleReview}
        loading={isSubmitting}
        title={reviewAction === 'approved' ? 'Approve Payment' : 'Reject Payment'}
        confirmLabel={reviewAction === 'approved' ? 'Activate Plan' : 'Confirm Rejection'}
        variant={reviewAction === 'approved' ? 'default' : 'danger'}
        description={
          <div className="space-y-4 pt-2 text-left">
            {reviewingRequest && (
              <div className="bg-background border border-border-subtle rounded-xl p-4 space-y-2">
                <div className="flex justify-between"><span className="text-[10px] font-bold text-subtle uppercase">Email</span><span className="text-xs font-bold text-foreground">{reviewingRequest.user_email}</span></div>
                <div className="flex justify-between"><span className="text-[10px] font-bold text-subtle uppercase">Payer</span><span className="text-xs font-bold text-foreground">{reviewingRequest.payer_name}</span></div>
                <div className="flex justify-between"><span className="text-[10px] font-bold text-subtle uppercase">Phone</span><span className="text-xs font-bold text-foreground">{reviewingRequest.payer_phone}</span></div>
                <div className="flex justify-between"><span className="text-[10px] font-bold text-subtle uppercase">Plan</span><span className="text-xs font-bold text-foreground">{reviewingRequest.plan?.replace('_', ' ')}</span></div>
                <div className="flex justify-between"><span className="text-[10px] font-bold text-subtle uppercase">Amount</span><span className="text-xs font-bold text-accent">NPR {reviewingRequest.plan_amount}</span></div>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-subtle uppercase tracking-widest ml-1">
                {reviewAction === 'approved' ? 'Admin Notes (Optional)' : 'Rejection Reason (Min 10 chars)'}
              </label>
              <textarea
                className="w-full bg-background border border-border-subtle rounded-xl p-3 text-xs font-bold text-foreground focus:border-accent outline-none min-h-[80px]"
                placeholder={reviewAction === 'approved' ? 'Internal notes...' : 'Reason for rejection...'}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
              {reviewAction === 'rejected' && adminNotes.length > 0 && adminNotes.length < 10 && (
                <p className="text-[10px] text-red-500">{10 - adminNotes.length} more characters needed</p>
              )}
            </div>
          </div>
        }
      />

      {/* Receipt Lightbox */}
      <ReceiptLightbox
        isOpen={!!receiptRequestId}
        onClose={() => setReceiptRequestId(null)}
        requestId={receiptRequestId}
      />
    </div>
  );
}
