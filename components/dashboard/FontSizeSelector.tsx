'use client';

import { useDashboard } from './DashboardProvider';
import { Type, Check } from 'lucide-react';

export function FontSizeSelector() {
  const { fontScale, updatePreference } = useDashboard();

  const scales = [
    { id: 'sm', label: 'COMPACT' },
    { id: 'md', label: 'STANDARD' },
    { id: 'lg', label: 'LEGIBILITY+' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <Type className="h-4 w-4 text-muted" />
        <h4 className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Reading Area Scaling</h4>
      </div>

      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-border-subtle">
        {scales.map((s) => (
          <button
            key={s.id}
            onClick={() => updatePreference('fontScale', s.id)}
            className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative ${
              fontScale === s.id 
                ? 'bg-white dark:bg-slate-700 text-primary shadow-sm ring-1 ring-black/5' 
                : 'text-muted hover:text-foreground'
            }`}
          >
            {s.label}
            {fontScale === s.id && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-accent rounded-full border-2 border-white dark:border-slate-700 flex items-center justify-center">
                <Check className="h-1.5 w-1.5 text-white" strokeWidth={4} />
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-border-subtle">
        <p className="reading-area font-bold text-foreground/80 leading-relaxed italic text-center">
          "Your reading area will match this size. Perfect for analyzing long syllabus documents or Guru notes."
        </p>
      </div>
    </div>
  );
}
