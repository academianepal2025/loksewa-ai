'use client';

import { useState, useEffect } from 'react';
import { Loader2, Save, ChevronDown, Settings2 } from 'lucide-react';
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
    <div className="bg-surface border border-border-subtle rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-1">
        <Settings2 className="h-5 w-5 text-[#c9a84c]" />
        <h2 className="text-lg font-black text-foreground tracking-tighter uppercase">Study Preferences</h2>
      </div>
      <p className="text-xs text-subtle font-black uppercase tracking-widest opacity-70 mb-8">Fine-tune your daily learning rhythm and AI interactions.</p>

      <div className="space-y-8">
        {/* Daily Study Hours */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <label className="text-[10px] font-black text-subtle uppercase tracking-widest ml-1">Daily Commitment</label>
            <span className="text-sm font-black text-[#c9a84c] uppercase tracking-widest">{dailyHours} Hours</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="16" 
            value={dailyHours} 
            onChange={e => setDailyHours(parseInt(e.target.value))} 
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#c9a84c] bg-background border border-border-subtle shadow-inner" 
          />
        </div>

        {/* Session Length */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <label className="text-[10px] font-black text-subtle uppercase tracking-widest ml-1">Session Depth</label>
            <span className="text-sm font-black text-[#c9a84c] uppercase tracking-widest">{sessionLength} Minutes</span>
          </div>
          <input 
            type="range" 
            min="15" 
            max="120" 
            step="15"
            value={sessionLength} 
            onChange={e => setSessionLength(parseInt(e.target.value))} 
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#c9a84c] bg-background border border-border-subtle shadow-inner" 
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          {/* Language Preference */}
          <div className="relative">
            <label className="text-[10px] font-black text-subtle uppercase tracking-widest mb-2 block ml-1">AI Output Language</label>
            <select 
              value={languagePref} 
              onChange={e => setLanguagePref(e.target.value)} 
              className="w-full appearance-none bg-background border border-border-subtle rounded-xl px-4 py-3 text-[11px] font-black uppercase tracking-widest outline-none focus:border-[#c9a84c]/50 shadow-sm"
            >
              <option value="english">English (Standard)</option>
              <option value="nepali">Nepali (Native)</option>
              <option value="bilingual">Bilingual (Mixed)</option>
            </select>
            <ChevronDown className="absolute right-4 top-10 h-4 w-4 text-[#c9a84c] pointer-events-none" />
          </div>

          {/* Flashcard Mode */}
          <div className="relative">
            <label className="text-[10px] font-black text-subtle uppercase tracking-widest mb-2 block ml-1">Flashcard Algorithm</label>
            <select 
              value={flashcardMode} 
              onChange={e => setFlashcardMode(e.target.value)} 
              className="w-full appearance-none bg-background border border-border-subtle rounded-xl px-4 py-3 text-[11px] font-black uppercase tracking-widest outline-none focus:border-[#c9a84c]/50 shadow-sm"
            >
              <option value="manual">Manual Review</option>
              <option value="spaced">Spaced Repetition (AI)</option>
            </select>
            <ChevronDown className="absolute right-4 top-10 h-4 w-4 text-[#c9a84c] pointer-events-none" />
          </div>
        </div>
      </div>

      <button 
        onClick={handleSave} 
        disabled={saving || !isDirty} 
        className="mt-10 flex items-center gap-2 px-6 py-3.5 bg-[#1e3a5f] text-[#c9a84c] rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#1e3a5f]/10"
      >
        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Sync Strategy Preferences
      </button>
    </div>
  );
}
