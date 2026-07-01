'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useDashboard } from './DashboardProvider';
import { Zap, Info } from 'lucide-react';
import { Tooltip } from '@/components/ui/tooltip';

interface UsageIndicatorProps {
  type: 'documents' | 'chat' | 'quizzes' | 'notes' | 'exams' | 'flashcards' | 'mock_tests';
}

export function UsageIndicator({ type }: UsageIndicatorProps) {
  const supabase = createClient();
  const { isPro, isAdmin } = useDashboard();
  const [usage, setUsage] = useState({ used: 0, max: 0 });
  const [loading, setLoading] = useState(true);

  const fetchUsage = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    if (type === 'documents') {
      const { count } = await supabase.from('documents').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
      setUsage({ used: count || 0, max: 3 });
    } else if (type === 'exams') {
      const { count } = await supabase.from('user_exams').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
      setUsage({ used: count || 0, max: 1 });
    } else if (type === 'notes') {
      const { count } = await supabase.from('study_notes').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('generation_status', 'ready');
      setUsage({ used: count || 0, max: 3 });
    } else if (type === 'mock_tests') {
      setUsage({ used: 0, max: 0 }); // Hard limit for free users
    } else {
      const { data } = await supabase.from('daily_usage').select('*').eq('user_id', user.id).eq('usage_date', today).maybeSingle();
      const map = { chat: 'chat_messages_sent', quizzes: 'quizzes_generated', flashcards: 'quizzes_generated' };
      const maxMap = { chat: 3, quizzes: 3, flashcards: 3 };
      setUsage({ used: data?.[map[type as keyof typeof map]] || 0, max: maxMap[type as keyof typeof map] });
    }
    setLoading(false);
  }, [supabase, type]);

  useEffect(() => {
    if (isPro || isAdmin) return;
    fetchUsage();
    
    // Real-time refresh on custom event
    window.addEventListener('usage-updated', fetchUsage);
    return () => window.removeEventListener('usage-updated', fetchUsage);
  }, [isPro, isAdmin, fetchUsage]);

  if (isPro || isAdmin || loading) return null;

  const pct = Math.min(100, (usage.used / usage.max) * 100);
  const isNearLimit = usage.used >= (usage.max * 0.8);
  const isExceeded = usage.used >= usage.max;

  return (
    <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-xl border transition-all duration-300 group shadow-sm ${
      isExceeded 
        ? 'bg-red-500/10 border-red-500/30 text-red-600' 
        : isNearLimit 
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-600' 
          : 'bg-accent/5 border-accent/20 text-accent'
    }`}>
      <div className="flex flex-col">
         <div className="flex items-center justify-between gap-4 mb-1.5">
            <div className="flex items-center gap-2">
               <Zap className={`h-3 w-3 ${isExceeded ? 'text-red-500' : isNearLimit ? 'text-amber-500 animate-pulse' : 'text-accent'}`} />
               <span className="text-[9px] font-black uppercase tracking-widest leading-none">
                  {type === 'documents' ? 'Storage' : type === 'exams' ? 'Missions' : type === 'chat' ? 'Daily Guru' : type === 'quizzes' ? 'Daily Quizzes' : type === 'notes' ? 'Study Notes' : 'Daily Usage'}: {usage.used}/{usage.max}
               </span>
            </div>
            {isExceeded && (
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('open-upgrade-modal'))}
                className="text-[8px] font-black uppercase tracking-[0.2em] bg-red-600 text-white px-1.5 py-0.5 rounded animate-pulse"
              >
                Upgrade
              </button>
            )}
         </div>
         <div className="h-1.5 w-full bg-background/50 rounded-full overflow-hidden border border-border-subtle/50">
            <div 
              className={`h-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(0,0,0,0.1)] ${
                isExceeded ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-accent'
              }`} 
              style={{ width: `${pct}%` }} 
            />
         </div>
      </div>
      {(isNearLimit || isExceeded) && (
        <Tooltip content={isExceeded ? "Daily limit exhausted. Upgrade to Pro for unlimited access." : "Approaching your daily limit."}>
           <Info className={`h-3.5 w-3.5 ${isExceeded ? 'text-red-500' : 'text-amber-500'}`} />
        </Tooltip>
      )}
    </div>
  );
}
