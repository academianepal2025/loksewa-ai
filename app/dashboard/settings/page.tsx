'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useDashboard } from '@/components/dashboard/DashboardProvider';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip } from '@/components/ui/tooltip';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { motion, AnimatePresence } from 'framer-motion';

import { 
  User, 
  Trash2, 
  Palette, 
  Type, 
  Globe, 
  ShieldCheck, 
  LogOut,
  AlertCircle,
  Database,
  ChevronRight,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Edit3,
  Save,
  Timer,
  Plus,
  Target
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────
interface Exam {
  id: string;
  exam_name: string;
  exam_date: string;
}

const DURATION_PRESETS = [30, 45, 60, 90];

function computeExamDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function getDaysRemaining(dateString: string) {
  const target = new Date(dateString);
  const now = new Date();
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

export default function SettingsPage() {
  const supabase = createClient();
  const { theme, language, fontScale, updatePreference, t } = useDashboard();
  
  const [activeTab, setActiveTab] = useState<'account' | 'missions' | 'appearance' | 'region'>('account');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [isAddingMission, setIsAddingMission] = useState(false);

  // New Mission Form
  const [newMissionName, setNewMissionName] = useState('');
  const [newMissionDays, setNewMissionDays] = useState(60);
  const [newMissionCustomDays, setNewMissionCustomDays] = useState('');
  const [dailyHours, setDailyHours] = useState(4);

  // 1. Initial Load
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      // Fetch Exams
      const { data: examData } = await supabase.from('user_exams').select('*').eq('user_id', user.id);
      setExams(examData || []);
      setLoading(false);
    }
    loadData();
  }, [supabase]);

  const handleUpdatePreference = async (key: string, value: string) => {
    setSaving(true);
    try {
      await updatePreference(key, value);
      toast.success('Preferences Synchronized', { description: `${key.charAt(0).toUpperCase() + key.slice(1)} has been updated globally.` });
    } catch (error) {
      toast.error('Sync Malfunction', { description: 'Failed to update preferences.' });
    } finally {
      setSaving(false);
    }
  };

  const deleteExam = async (id: string) => {
    const { error } = await supabase.from('user_exams').delete().eq('id', id);
    if (!error) {
       toast.success('Mission Aborted', { description: 'All mission logs have been purged.' });
       setExams(exams.filter(e => e.id !== id));
       setShowDeleteConfirm(null);
    } else {
       toast.error('Abort Failed', { description: error.message });
    }
  };

  const saveExamEdit = async () => {
    if (!editingExam) return;
    const { error } = await supabase
      .from('user_exams')
      .update({ exam_name: editingExam.exam_name })
      .eq('id', editingExam.id);
    
    if (!error) {
      toast.success('Mission Protocol Updated');
      setExams(exams.map(e => e.id === editingExam.id ? editingExam : e));
      setEditingExam(null);
    } else {
      toast.error('Update Failed', { description: error.message });
    }
  };

  const handleAddMission = async () => {
    if (!newMissionName) {
      toast.error('Incomplete Parameters', { description: 'Please define a mission name.' });
      return;
    }
    const effectiveDays = newMissionDays || parseInt(newMissionCustomDays) || 0;
    if (!effectiveDays || effectiveDays < 7) {
      toast.error('Invalid Duration', { description: 'Please select at least 7 days.' });
      return;
    }

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('user_exams')
      .insert({
        user_id: user.id,
        exam_name: newMissionName,
        exam_date: computeExamDate(effectiveDays),
        daily_study_hours: dailyHours
      })
      .select();

    if (!error && data?.length) {
      toast.success('Mission Initialized', { description: `${newMissionName} protocol is now active.` });
      setExams([...exams, ...data]);
      setIsAddingMission(false);
      setNewMissionName('');
      setNewMissionDays(60);
      setNewMissionCustomDays('');
    } else {
      toast.error('Initialization Failed', { description: error.message });
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto space-y-10 animate-pulse">
      <Skeleton className="h-24 w-full rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-4 space-y-3">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <Skeleton className="md:col-span-8 h-96 w-full rounded-2xl" />
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-10 pb-12">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 px-2">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Control Center</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
            {t('settings')}
          </h1>
          <p className="text-sm font-medium text-subtle max-w-sm">Personalize your LoksewaAI workspace and mission parameters.</p>
        </div>
        {saving && (
          <div className="flex items-center gap-2 text-accent text-[10px] font-bold uppercase tracking-wider bg-accent/5 border border-accent/20 px-3 py-1.5 rounded-xl animate-pulse">
            <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Syncing...
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-10 items-start">
        {/* ── Sidebar Navigation ──────────────────────────────────── */}
        <div className="md:col-span-4 space-y-2">
           <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 gap-2 scrollbar-hide">
              {[
                { id: 'account', label: t('dashboard') === 'ड्यासबोर्ड' ? 'खाता ' : 'Account Identity', icon: User },
                { id: 'missions', label: t('dashboard') === 'ड्यासबोर्ड' ? 'मिशन नियन्त्रण' : 'Mission Control', icon: Database },
                { id: 'appearance', label: t('dashboard') === 'ड्यासबोर्ड' ? 'दृश्य' : 'Visual Interface', icon: Palette },
                { id: 'region', label: t('dashboard') === 'ड्यासबोर्ड' ? 'क्षेत्रीय कन्फिग' : 'Regional Config', icon: Globe },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 sm:py-3.5 rounded-xl text-[13px] font-bold transition-all min-h-[44px] ${
                    activeTab === tab.id 
                    ? 'bg-orange-600 text-background shadow-sm' 
                    : 'text-subtle hover:bg-surface border border-transparent'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              ))}
           </div>
           
           <div className="pt-6 px-2 border-t border-border-subtle mt-4 md:mt-6">
              <form action="/api/auth/signout" method="post">
                 <button type="submit" className="flex items-center gap-2 text-[10px] font-bold text-red-500 uppercase tracking-wider hover:opacity-80 transition-opacity min-h-[44px]">
                    <LogOut className="h-4 w-4" /> {t('logout')}
                 </button>
              </form>
           </div>
        </div>

        {/* ── Main Content Area ───────────────────────────────────── */}
        <div className="md:col-span-8 bg-surface border border-border-subtle rounded-2xl overflow-hidden min-h-[400px]">
           
           {/* Tab: Account */}
           {activeTab === 'account' && (
             <div className="p-6 sm:p-10 space-y-10 animate-fade-in">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                   <div className="h-20 w-20 rounded-2xl bg-orange-600 text-background flex items-center justify-center text-3xl font-bold flex-shrink-0">
                      {user?.email?.[0].toUpperCase()}
                   </div>
                   <div>
                      <h3 className="text-xl font-bold text-foreground tracking-tight">{user?.user_metadata?.full_name || 'Loksewa Candidate'}</h3>
                      <p className="text-sm font-medium text-subtle">{user?.email}</p>
                      <span className="inline-block mt-3 px-2 py-0.5 bg-emerald-500/5 border border-emerald-500/20 text-emerald-600 text-[10px] font-bold uppercase tracking-wider rounded">Verified Intelligence</span>
                   </div>
                </div>

                <div className="space-y-4">
                   <h4 className="text-[10px] font-bold uppercase tracking-wider text-subtle px-1">Security Protocols</h4>
                   <button className="flex items-center justify-between w-full p-4 sm:p-5 bg-background border border-border-subtle rounded-2xl group transition-all hover:bg-surface min-h-[64px]">
                      <div className="flex items-center gap-4">
                         <div className="p-2.5 bg-surface border border-border-subtle rounded-xl flex-shrink-0"><ShieldCheck className="h-4 w-4 text-accent" /></div>
                         <div className="text-left">
                            <p className="text-sm font-bold text-foreground">Update Workspace Password</p>
                            <p className="text-[10px] text-subtle font-medium">Standard encryption remains active</p>
                         </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-subtle group-hover:translate-x-1 transition-transform" />
                   </button>
                </div>
             </div>
           )}

           {/* Tab: Missions */}
           {activeTab === 'missions' && (
             <div className="p-6 sm:p-10 space-y-8 animate-fade-in">
                <div className="flex items-center justify-between px-2">
                   <h3 className="text-lg font-bold text-foreground tracking-tight">Active Missions</h3>
                   <button 
                     onClick={() => setIsAddingMission(true)}
                     className="flex items-center gap-2 px-3 py-1.5 bg-orange-600 text-background rounded-lg text-[10px] font-bold uppercase tracking-wider hover:opacity-90 transition-all min-h-[36px]"
                   >
                     <Plus className="h-3.5 w-3.5" /> Initialize New
                   </button>
                </div>

                <div className="space-y-3">
                   {exams.length > 0 ? exams.map(e => (
                     <div key={e.id} className="p-4 sm:p-5 bg-background border border-border-subtle rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface transition-all group">
                        {editingExam?.id === e.id ? (
                           <div className="flex-1 space-y-4 w-full">
                              <input 
                                className="w-full bg-surface border border-border-subtle rounded-xl px-4 py-2.5 text-sm font-bold text-foreground outline-none focus:border-accent/50 transition-all min-h-[44px]"
                                value={editingExam.exam_name}
                                onChange={ev => setEditingExam({...editingExam, exam_name: ev.target.value})}
                              />
                              <div className="flex gap-3 pt-2">
                                 <button onClick={() => setEditingExam(null)} className="px-4 py-2 text-[10px] font-bold text-subtle uppercase tracking-wider hover:text-foreground min-h-[44px]">Cancel</button>
                                 <button onClick={saveExamEdit} className="bg-orange-600 text-background px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 hover:opacity-90 min-h-[44px]"><Save className="h-3.5 w-3.5" /> Save Changes</button>
                              </div>
                           </div>
                        ) : (
                           <>
                              <div className="flex-1">
                                 <p className="text-sm font-bold text-foreground tracking-tight">{e.exam_name}</p>
                                 <p className="text-[10px] font-bold text-subtle uppercase tracking-wider mt-1">{getDaysRemaining(e.exam_date)} Days Remaining</p>
                              </div>
                              <div className="flex gap-2 sm:opacity-0 group-hover:opacity-100 transition-all">
                                 <button 
                                   onClick={() => setEditingExam(e)}
                                   className="p-3 text-subtle hover:text-accent hover:bg-accent/5 border border-border-subtle sm:border-transparent hover:border-accent/20 rounded-xl transition-all flex-1 sm:flex-none flex items-center justify-center min-h-[44px]"
                                 >
                                     <Edit3 className="h-4 w-4" />
                                 </button>
                                 <button 
                                   onClick={() => setShowDeleteConfirm(e.id)}
                                   className="p-3 text-subtle hover:text-red-500 hover:bg-red-500/5 border border-border-subtle sm:border-transparent hover:border-red-500/20 rounded-xl transition-all flex-1 sm:flex-none flex items-center justify-center min-h-[44px]"
                                 >
                                     <Trash2 className="h-4 w-4" />
                                 </button>
                              </div>
                           </>
                        )}
                     </div>
                   )) : (
                      <EmptyState 
                        icon={Database}
                        title="No Missions Logged"
                        description="You haven't initialized any exam missions yet. Head to the dashboard to start."
                      />
                   )}
                </div>

                <ConfirmModal 
                   isOpen={!!showDeleteConfirm}
                   onClose={() => setShowDeleteConfirm(null)}
                   onConfirm={() => {
                     if (showDeleteConfirm) deleteExam(showDeleteConfirm);
                   }}
                   title="Abort Mission?"
                   description="This will permanently delete all logs, progress, and intelligence for this exam. This action is irreversible."
                   variant="danger"
                   confirmLabel="Delete Forever"
                 />

                 {/* Add Mission Modal */}
                 <AnimatePresence>
                   {isAddingMission && (
                     <div className="fixed inset-0 z-[110] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                       <motion.div 
                         initial={{ opacity: 0, scale: 0.95 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0, scale: 0.95 }}
                         className="bg-surface border border-border-subtle rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl relative overflow-hidden"
                       >
                         <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16" />
                         
                         <div className="relative z-10 space-y-6">
                            <div className="space-y-1">
                               <h3 className="text-xl font-bold text-foreground tracking-tight">Initialize Mission</h3>
                               <p className="text-xs font-medium text-subtle">Define the tactical parameters for your next exam.</p>
                            </div>

                            <div className="space-y-4">
                               <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-subtle uppercase tracking-wider ml-1">Mission Name</label>
                                  <input 
                                    className="w-full bg-background border border-border-subtle rounded-2xl px-4 py-3 text-sm font-bold text-foreground outline-none focus:border-accent transition-all min-h-[44px]"
                                    placeholder="e.g., Kharidar 2081"
                                    value={newMissionName}
                                    onChange={e => setNewMissionName(e.target.value)}
                                  />
                               </div>
                               <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-subtle uppercase tracking-wider ml-1">Study Duration</label>
                                  <div className="grid grid-cols-4 gap-2">
                                    {DURATION_PRESETS.map((d) => (
                                      <button
                                        key={d}
                                        type="button"
                                        onClick={() => { setNewMissionDays(d); setNewMissionCustomDays(''); }}
                                        className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                                          newMissionDays === d && !newMissionCustomDays ? 'border-accent bg-accent/5 text-accent' : 'bg-background border-border-subtle text-subtle'
                                        }`}
                                      >
                                        {d}d
                                      </button>
                                    ))}
                                  </div>
                                  <div className="flex items-center gap-2 mt-2">
                                    <input 
                                      type="number"
                                      min={7}
                                      max={365}
                                      placeholder="Custom"
                                      className={`flex-1 bg-background border rounded-xl px-3 py-2.5 text-sm font-bold text-foreground outline-none focus:border-accent transition-all min-h-[40px] ${
                                        newMissionCustomDays ? 'border-accent' : 'border-border-subtle'
                                      }`}
                                      value={newMissionCustomDays}
                                      onChange={e => { setNewMissionCustomDays(e.target.value); setNewMissionDays(0); }}
                                    />
                                    <span className="text-[10px] font-bold text-subtle uppercase">days</span>
                                  </div>
                               </div>
                               <div className="space-y-1.5">
                                  <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-bold text-subtle uppercase tracking-wider">Daily Focus Hours</label>
                                    <span className="text-xs font-bold text-accent">{dailyHours}H</span>
                                  </div>
                                  <input 
                                    type="range"
                                    min="1"
                                    max="12"
                                    step="1"
                                    className="w-full accent-accent bg-background h-2 rounded-lg appearance-none cursor-pointer"
                                    value={dailyHours}
                                    onChange={e => setDailyHours(parseInt(e.target.value))}
                                  />
                               </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                               <button onClick={() => setIsAddingMission(false)} className="flex-1 py-3.5 rounded-2xl bg-background border border-border-subtle text-[10px] font-bold uppercase tracking-wider hover:bg-surface transition-all min-h-[44px]">Cancel</button>
                               <button onClick={handleAddMission} className="flex-1 py-3.5 rounded-2xl bg-orange-600 text-background text-[10px] font-bold uppercase tracking-wider hover:opacity-90 transition-all min-h-[44px] flex items-center justify-center gap-2 shadow-lg shadow-primary/10">Deploy Mission <Target className="h-3.5 w-3.5" /></button>
                            </div>
                         </div>
                       </motion.div>
                     </div>
                   )}
                 </AnimatePresence>
             </div>
           )}

           {/* Tab: Appearance */}
           {activeTab === 'appearance' && (
             <div className="p-6 sm:p-10 space-y-12 animate-fade-in">
                {/* Brand Color */}
                <div className="space-y-6">
                   <h4 className="text-[10px] font-bold uppercase tracking-wider text-subtle flex items-center gap-2 px-1">
                     <Palette className="h-3.5 w-3.5" /> Command Theme
                   </h4>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button 
                        onClick={() => handleUpdatePreference('theme', 'indigo')}
                        className={`p-5 rounded-2xl border transition-all relative overflow-hidden min-h-[64px] ${theme === 'indigo' ? 'border-accent bg-accent/5' : 'border-border-subtle hover:border-accent/20 bg-background'}`}
                      >
                         <div className="flex items-center justify-between relative z-10">
                            <span className="text-sm font-bold text-foreground">Classic Indigo</span>
                            {theme === 'indigo' && <CheckCircle2 className="h-4 w-4 text-accent" />}
                         </div>
                         <div className="mt-4 flex gap-1.5">
                            <div className="h-1.5 w-6 bg-indigo-600 rounded-full" />
                            <div className="h-1.5 w-1.5 bg-orange-500 rounded-full" />
                         </div>
                      </button>

                      <button 
                        onClick={() => handleUpdatePreference('theme', 'orange')}
                        className={`p-5 rounded-2xl border transition-all relative overflow-hidden min-h-[64px] ${theme === 'orange' ? 'border-accent bg-accent/5' : 'border-border-subtle hover:border-accent/20 bg-background'}`}
                      >
                         <div className="flex items-center justify-between relative z-10">
                            <span className="text-sm font-bold text-foreground">Modern Orange</span>
                            {theme === 'orange' && <CheckCircle2 className="h-4 w-4 text-accent" />}
                         </div>
                         <div className="mt-4 flex gap-1.5">
                            <div className="h-1.5 w-6 bg-orange-600 rounded-full" />
                            <div className="h-1.5 w-1.5 bg-indigo-500 rounded-full" />
                         </div>
                      </button>
                   </div>
                </div>

                {/* Font Scaling */}
                <div className="space-y-6">
                   <h4 className="text-[10px] font-bold uppercase tracking-wider text-subtle flex items-center gap-2 px-1">
                     <Type className="h-3.5 w-3.5" /> Reading Scaling
                   </h4>
                   <div className="flex flex-col sm:flex-row bg-background border border-border-subtle p-1.5 rounded-2xl gap-1">
                      {['sm', 'md', 'lg'].map((sz: any) => (
                        <button
                          key={sz}
                          onClick={() => handleUpdatePreference('fontScale', sz)}
                          className={`flex-1 py-3.5 rounded-xl text-[10px] font-bold transition-all uppercase tracking-wider min-h-[44px] ${
                            fontScale === sz 
                            ? 'bg-orange-600 text-background shadow-sm' 
                            : 'text-subtle hover:text-foreground'
                          }`}
                        >
                          {sz === 'sm' ? 'Compact' : sz === 'md' ? 'Standard' : 'Legibility+'}
                        </button>
                      ))}
                   </div>
                   <div className={`p-6 bg-background rounded-2xl border border-dashed border-border-subtle reading-area font-scale-${fontScale}`}>
                      <p className="font-medium text-foreground leading-relaxed italic">
                        "Your reading area will match this size. Optimized for deep focus and syllabus analysis sessions."
                      </p>
                   </div>
                </div>
             </div>
           )}

           {/* Tab: Region */}
           {activeTab === 'region' && (
             <div className="p-6 sm:p-10 space-y-10 animate-fade-in">
                <div className="space-y-6">
                   <h4 className="text-[10px] font-bold uppercase tracking-wider text-subtle flex items-center gap-2 px-1">
                     <Globe className="h-3.5 w-3.5" /> Localization Override
                   </h4>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button 
                        onClick={() => handleUpdatePreference('language', 'en')}
                        className={`p-5 rounded-2xl border flex items-center justify-between group transition-all min-h-[64px] ${language === 'en' ? 'border-accent bg-accent/5' : 'border-border-subtle bg-background hover:bg-surface'}`}
                      >
                         <span className="text-sm font-bold text-foreground">English (Global)</span>
                         {language === 'en' && <CheckCircle2 className="h-5 w-5 text-accent" />}
                      </button>
                      <button 
                        onClick={() => handleUpdatePreference('language', 'np')}
                        className={`p-5 rounded-2xl border flex items-center justify-between group transition-all min-h-[64px] ${language === 'np' ? 'border-accent bg-accent/5' : 'border-border-subtle bg-background hover:bg-surface'}`}
                      >
                         <span className="text-sm font-bold text-foreground">Nepali (Local)</span>
                         {language === 'np' && <CheckCircle2 className="h-5 w-5 text-accent" />}
                      </button>
                   </div>
                   <div className="p-4 bg-orange-500/5 border border-orange-500/20 text-[10px] font-bold text-orange-700 rounded-xl leading-relaxed flex items-start gap-3">
                     <Sparkles className="h-4 w-4 flex-shrink-0 mt-0.5" /> 
                     <span>NOTE: UI labels translate instantly. AI generation will adapt to this setting for new content.</span>
                   </div>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
