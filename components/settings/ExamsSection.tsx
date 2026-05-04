'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit3, Trash2, Pause, Play, Loader2, X, ChevronDown, Save } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmModal } from '@/components/ui/confirm-modal';

const EXAM_CATEGORIES = ['Kharidar', 'Nayab Subba', 'Section Officer', 'Sakha Adhikrit', 'Engineering', 'Health', 'Teaching', 'Other'];
const DURATION_PRESETS = [30, 45, 60, 90];

function getDaysRemaining(d: string) { return Math.max(0, Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)); }
function computeExamDate(days: number) { const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString().split('T')[0]; }

interface Exam { id: string; exam_name: string; exam_category: string; exam_date: string; daily_study_hours: number; total_papers: number; status: string; }

export function ExamsSection({ user, supabase }: any) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Exam>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ exam_category: '', exam_name: '', study_days: 60, custom_days: '', daily_study_hours: 3, total_papers: 1 });
  const [addSaving, setAddSaving] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  const fetchExams = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('user_exams').select('*').eq('user_id', user.id).order('exam_date', { ascending: true });
    setExams(data || []);
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => { fetchExams(); }, [fetchExams]);

  const toggleStatus = async (exam: Exam) => {
    const newStatus = exam.status === 'active' ? 'paused' : 'active';
    const { error } = await supabase.from('user_exams').update({ status: newStatus }).eq('id', exam.id);
    if (error) toast.error(error.message);
    else { toast.success(`Exam ${newStatus === 'active' ? 'resumed' : 'paused'}`); fetchExams(); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase.from('user_exams').delete().eq('id', deleteId);
    if (error) toast.error(error.message);
    else { toast.success('Exam deleted'); fetchExams(); }
    setDeleteId(null); setDeleting(false);
  };

  const handleEdit = async () => {
    if (!editingId) return;
    setEditSaving(true);
    const { error } = await supabase.from('user_exams').update(editForm).eq('id', editingId);
    if (error) toast.error(error.message);
    else { toast.success('Exam updated'); setEditingId(null); fetchExams(); }
    setEditSaving(false);
  };

  const handleAdd = async () => {
    if (!addForm.exam_category || !addForm.exam_name) { toast.error('Fill required fields'); return; }
    const days = addForm.study_days || parseInt(addForm.custom_days) || 0;
    if (days < 7) { toast.error('At least 7 days required'); return; }
    setAddSaving(true);
    const { error } = await supabase.from('user_exams').insert({
      user_id: user.id, exam_name: addForm.exam_name.trim(), exam_category: addForm.exam_category,
      exam_date: computeExamDate(days), daily_study_hours: addForm.daily_study_hours,
      total_papers: addForm.total_papers, status: 'active'
    });
    if (error) toast.error(error.message);
    else { toast.success('Exam added'); setShowAdd(false); setAddForm({ exam_category: '', exam_name: '', study_days: 60, custom_days: '', daily_study_hours: 3, total_papers: 1 }); fetchExams(); }
    setAddSaving(false);
  };

  return (
    <div className="bg-surface border border-border-subtle rounded-2xl p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight mb-1">My Exams</h2>
          <p className="text-xs text-subtle font-medium">Manage your exam targets and study timelines.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:opacity-90">
          <Plus className="h-3.5 w-3.5" /> Add Exam
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-24 bg-background animate-pulse rounded-xl" />)}</div>
      ) : exams.length === 0 ? (
        <div className="text-center py-12 bg-background/50 border border-dashed border-border-subtle rounded-xl">
          <p className="text-xs font-bold text-subtle">No exams added yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {exams.map(exam => (
            <div key={exam.id} className="bg-background border border-border-subtle rounded-xl p-4 sm:p-5">
              {editingId === exam.id ? (
                <div className="space-y-3">
                  <input value={editForm.exam_name || ''} onChange={e => setEditForm(f => ({...f, exam_name: e.target.value}))} className="w-full bg-surface border border-border-subtle rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-accent/50" />
                  <div className="flex gap-2">
                    <button onClick={() => setEditingId(null)} className="px-4 py-2 text-[10px] font-bold text-subtle uppercase">Cancel</button>
                    <button onClick={handleEdit} disabled={editSaving} className="px-4 py-2 bg-orange-600 text-white rounded-xl text-[10px] font-bold uppercase flex items-center gap-1.5 disabled:opacity-40">
                      {editSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-foreground">{exam.exam_name}</h3>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-accent/10 text-accent uppercase tracking-wider">{exam.exam_category}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${exam.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-yellow-500/10 text-yellow-600'}`}>{exam.status}</span>
                    </div>
                    <p className="text-[10px] font-bold text-subtle uppercase tracking-wider mt-1">{getDaysRemaining(exam.exam_date)} Days Remaining · {exam.daily_study_hours}h/day · {exam.total_papers} papers</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => toggleStatus(exam)} className="p-2.5 text-subtle hover:text-foreground hover:bg-surface border border-border-subtle rounded-xl transition-all" title={exam.status === 'active' ? 'Pause' : 'Resume'}>
                      {exam.status === 'active' ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    </button>
                    <button onClick={() => { setEditingId(exam.id); setEditForm({ exam_name: exam.exam_name }); }} className="p-2.5 text-subtle hover:text-accent hover:bg-accent/5 border border-border-subtle rounded-xl transition-all">
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setDeleteId(exam.id)} className="p-2.5 text-subtle hover:text-red-500 hover:bg-red-500/5 border border-border-subtle rounded-xl transition-all">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Exam Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-[110] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-surface border border-border-subtle rounded-2xl p-8 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-foreground">Add New Exam</h3>
              <button onClick={() => setShowAdd(false)} className="text-subtle hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <label className="text-[10px] font-bold text-subtle uppercase tracking-wider mb-1.5 block ml-1">Category</label>
                <select value={addForm.exam_category} onChange={e => setAddForm(f => ({...f, exam_category: e.target.value}))} className="w-full appearance-none bg-background border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-accent/50">
                  <option value="">Select...</option>
                  {EXAM_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-9 h-4 w-4 text-subtle pointer-events-none" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-subtle uppercase tracking-wider mb-1.5 block ml-1">Exam Name</label>
                <input value={addForm.exam_name} onChange={e => setAddForm(f => ({...f, exam_name: e.target.value}))} className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-accent/50" placeholder="e.g., Kharidar 2081" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-subtle uppercase tracking-wider mb-1.5 block ml-1">Study Duration</label>
                <div className="grid grid-cols-4 gap-2">
                  {DURATION_PRESETS.map(d => (
                    <button key={d} type="button" onClick={() => setAddForm(f => ({...f, study_days: d, custom_days: ''}))} className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${addForm.study_days === d && !addForm.custom_days ? 'border-accent bg-accent/5 text-accent' : 'bg-background border-border-subtle text-subtle'}`}>{d}d</button>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-subtle uppercase tracking-wider ml-1">Daily Hours: <span className="text-accent">{addForm.daily_study_hours}h</span></label>
              </div>
              <input type="range" min="1" max="14" value={addForm.daily_study_hours} onChange={e => setAddForm(f => ({...f, daily_study_hours: parseInt(e.target.value)}))} className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-orange-600" />
              <button onClick={handleAdd} disabled={addSaving} className="w-full py-3.5 bg-orange-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2">
                {addSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Add Exam
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Exam?" description="This will permanently delete this exam and all its related data." confirmLabel="Delete" variant="danger" loading={deleting} />
    </div>
  );
}
