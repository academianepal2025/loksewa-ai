'use client';

import { useState, useEffect } from 'react';
import { Loader2, Save, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

export function StudyPrefsSection({ profile, markDirty, clearDirty }: any) {
  const prefs = profile?.study_preferences || {};
  const [dailyHours, setDailyHours] = useState(prefs.daily_study_hours ?? 4);
  const [sessionLength, setSessionLength] = useState(prefs.session_length ?? 45);
  const [languagePref, setLanguagePref] = useState(prefs.language_preference ?? 'english');
  const [flashcardMode, setFlashcardMode] = useState(prefs.flashcard_review_mode ?? 'manual');
  const [saving, setSaving] = useState(false);

  const isDirty = dailyHours !== (prefs.daily_study_hours ?? 4)
    || sessionLength !== (prefs.session_length ?? 45)
    || languagePref !== (prefs.language_preference ?? 'english')
    || flashcardMode !== (prefs.flashcard_review_mode ?? 'manual');

  useEffect(() => { if (isDirty) markDirty('study-prefs'); else clearDirty('study-prefs'); }, [isDirty, markDirty, clearDirty]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studyPreferences: { daily_study_hours: dailyHours, session_length: sessionLength, language_preference: languagePref, flashcard_review_mode: flashcardMode } })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      clearDirty('study-prefs');
      toast.success('Study preferences saved');
    } catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="bg-surface border border-border-subtle rounded-2xl p-6 sm:p-8">
      <h2 className="text-lg font-bold text-foreground tracking-tight mb-1">Study Preferences</h2>
      <p className="text-xs text-subtle font-medium mb-6">Customize your study experience and AI behavior.</p>

      <div className="space-y-6">
        {/* Daily Hours Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-[10px] font-bold text-subtle uppercase tracking-wider ml-1">Default Daily Study Hours</label>
            <span className="text-sm font-bold text-accent">{dailyHours}h</span>
          </div>
          <input type="range" min="1" max="10" value={dailyHours} onChange={e => setDailyHours(parseInt(e.target.value))} className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-orange-600" />
          <div className="flex justify-between text-[9px] text-subtle font-bold mt-1"><span>1h</span><span>5h</span><span>10h</span></div>
        </div>

        {/* Session Length */}
        <div>
          <label className="text-[10px] font-bold text-subtle uppercase tracking-wider mb-1.5 block ml-1">Preferred Study Session Length</label>
          <div className="relative">
            <select value={sessionLength} onChange={e => setSessionLength(parseInt(e.target.value))} className="w-full appearance-none bg-background border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-foreground outline-none focus:border-accent/50">
              <option value={25}>25 minutes (Pomodoro)</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
            </select>
            <ChevronDown className="absolute right-4 top-3.5 h-4 w-4 text-subtle pointer-events-none" />
          </div>
        </div>

        {/* Language Preference */}
        <div>
          <label className="text-[10px] font-bold text-subtle uppercase tracking-wider mb-2 block ml-1">Loksewa Guru Response Language</label>
          <div className="flex flex-col sm:flex-row gap-2">
            {[{ val: 'english', label: 'English Only' }, { val: 'nepali', label: 'Nepali Only' }, { val: 'mixed', label: 'Mixed' }].map(opt => (
              <button key={opt.val} onClick={() => setLanguagePref(opt.val)} className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all ${languagePref === opt.val ? 'border-accent bg-accent/5 text-accent' : 'bg-background border-border-subtle text-subtle'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Flashcard Mode */}
        <div>
          <label className="text-[10px] font-bold text-subtle uppercase tracking-wider mb-2 block ml-1">Flashcard Review Mode</label>
          <div className="flex gap-2">
            <button onClick={() => setFlashcardMode('manual')} className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all ${flashcardMode === 'manual' ? 'border-accent bg-accent/5 text-accent' : 'bg-background border-border-subtle text-subtle'}`}>Manual (Click to advance)</button>
            <button onClick={() => setFlashcardMode('auto')} className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all ${flashcardMode === 'auto' ? 'border-accent bg-accent/5 text-accent' : 'bg-background border-border-subtle text-subtle'}`}>Auto Advance</button>
          </div>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving || !isDirty} className="mt-6 flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed">
        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save Preferences
      </button>
    </div>
  );
}
