'use client';

import { useState, useEffect } from 'react';
import { Loader2, Save, Bell } from 'lucide-react';
import { toast } from 'sonner';

export function NotificationsSection({ profile, markDirty, clearDirty }: any) {
  const prefs = profile?.notification_preferences || {};
  const [dailyReminder, setDailyReminder] = useState(prefs.daily_reminder ?? false);
  const [reminderTime, setReminderTime] = useState(prefs.reminder_time || '08:00');
  const [weeklyReport, setWeeklyReport] = useState(prefs.weekly_report ?? false);
  const [examCountdown, setExamCountdown] = useState(prefs.exam_countdown ?? true);
  const [docComplete, setDocComplete] = useState(prefs.doc_processing_complete ?? true);
  const [saving, setSaving] = useState(false);

  const isDirty = dailyReminder !== (prefs.daily_reminder ?? false)
    || reminderTime !== (prefs.reminder_time || '08:00')
    || weeklyReport !== (prefs.weekly_report ?? false)
    || examCountdown !== (prefs.exam_countdown ?? true)
    || docComplete !== (prefs.doc_processing_complete ?? true);

  useEffect(() => { if (isDirty) markDirty('notifications'); else clearDirty('notifications'); }, [isDirty, markDirty, clearDirty]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: { daily_reminder: dailyReminder, reminder_time: reminderTime, weekly_report: weeklyReport, exam_countdown: examCountdown, doc_processing_complete: docComplete } })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      clearDirty('notifications');
      toast.success('Notification preferences saved');
    } catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const Toggle = ({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-bold text-foreground">{label}</p>
        {description && <p className="text-[10px] text-subtle font-medium">{description}</p>}
      </div>
      <button onClick={() => onChange(!checked)} className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-orange-600' : 'bg-border-subtle'}`}>
        <span className={`absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full transition-transform shadow-sm ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  );

  return (
    <div className="bg-surface border border-border-subtle rounded-2xl p-6 sm:p-8">
      <h2 className="text-lg font-bold text-foreground tracking-tight mb-1">Notifications</h2>
      <p className="text-xs text-subtle font-medium mb-6">Configure how you receive reminders and updates.</p>

      <div className="divide-y divide-border-subtle">
        <Toggle checked={dailyReminder} onChange={setDailyReminder} label="Daily Study Reminder" description="Get reminded to study every day" />
        {dailyReminder && (
          <div className="py-3 pl-4">
            <label className="text-[10px] font-bold text-subtle uppercase tracking-wider mb-1.5 block">Reminder Time</label>
            <input type="time" value={reminderTime} onChange={e => setReminderTime(e.target.value)} className="bg-background border border-border-subtle rounded-xl px-4 py-2.5 text-sm font-bold text-foreground outline-none focus:border-accent/50" />
          </div>
        )}
        <Toggle checked={weeklyReport} onChange={setWeeklyReport} label="Weekly Feedback Report" description="Receive a summary of your study progress" />
        <Toggle checked={examCountdown} onChange={setExamCountdown} label="Exam Countdown Alerts" description="Alerts at 30, 15, 7, and 1 day before exam" />
        <Toggle checked={docComplete} onChange={setDocComplete} label="Document Processing Complete" description="Notify when uploaded documents are ready" />
      </div>

      <div className="mt-4 p-3 bg-accent/5 border border-accent/20 rounded-xl text-[10px] font-bold text-accent flex items-start gap-2">
        <Bell className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
        Push notifications coming soon — your preferences are saved for when the feature launches.
      </div>

      <button onClick={handleSave} disabled={saving || !isDirty} className="mt-4 flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed">
        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save Notifications
      </button>
    </div>
  );
}
