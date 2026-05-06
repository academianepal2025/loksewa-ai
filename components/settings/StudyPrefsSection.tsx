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


      <button onClick={handleSave} disabled={saving || !isDirty} className="mt-6 flex items-center gap-2 px-6 py-3 bg-[#1e3a5f] text-[#c9a84c] rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#1e3a5f]/10">
        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save Preferences
      </button>
    </div>
  );
}
