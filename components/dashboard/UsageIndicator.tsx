'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useDashboard } from './DashboardProvider';
import { Zap, Info } from 'lucide-react';

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
    } else if (type === 'mock_tests') {
      setUsage({ used: 0, max: 0 }); // Hard limit for free users
    } else {
      const { data } = await supabase.from('daily_usage').select('*').eq('user_id', user.id).eq('usage_date', today).maybeSingle();
      const map = { chat: 'chat_messages_sent', quizzes: 'quizzes_generated', notes: 'notes_generated', flashcards: 'quizzes_generated' };
      const maxMap = { chat: 5, quizzes: 3, notes: 1, flashcards: 3 };
      setUsage({ used: data?.[map[type as keyof typeof map]] || 0, max: maxMap[type as keyof typeof maxMap] });
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
  const isNearLimit = usage.used >= usage.max;

  return (
    <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-xl border transition-all ${isNearLimit ? 'bg-red-500/5 border-red-500/20 text-red-600' : 'bg-[#c9a84c]/5 border-[#c9a84c]/20 text-[#c9a84c]'}`}>
      <div className="flex flex-col">
         <div className="flex items-center gap-2 mb-1">
            <Zap className={`h-3 w-3 ${isNearLimit ? 'animate-pulse' : ''}`} />
            <span className="text-[10px] font-black uppercase tracking-widest">
               {type === 'documents' ? 'Storage' : type === 'exams' ? 'Missions' : 'Daily Usage'}: {usage.used} / {usage.max}
            </span>
         </div>
         <div className="h-1 w-24 bg-background/50 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${isNearLimit ? 'bg-red-500' : 'bg-[#c9a84c]'}`} 
              style={{ width: `${pct}%` }} 
            />
         </div>
      </div>
      {isNearLimit && <Info className="h-4 w-4" />}
    </div>
  );
}
