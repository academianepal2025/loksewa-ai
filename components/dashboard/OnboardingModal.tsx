'use client';

import { Globe, ArrowRight, Check } from 'lucide-react';
import { useDashboard } from './DashboardProvider';

export function OnboardingModal() {
  const { showOnboarding, completeOnboarding, language } = useDashboard();

  if (!showOnboarding) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-md">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-zinc-200 dark:border-zinc-800 p-8 animate-zoom-in relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/10 rounded-full blur-3xl -mr-16 -mt-16" />
        
        <div className="relative z-10 text-center">
          <div className="h-16 w-16 bg-orange-600/10 rounded-2xl flex items-center justify-center text-orange-600 mx-auto mb-6">
            <Globe className="h-8 w-8" />
          </div>
          
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight">
            Choose Your Interface
          </h2>
          <p className="text-sm font-medium text-zinc-500 mb-8 leading-relaxed">
            Select your preferred language for the dashboard and AI generation. You can change this later in settings.
          </p>

          <div className="space-y-3 mb-10">
            <button
              onClick={() => completeOnboarding('en')}
              className="w-full p-4 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 hover:border-orange-600 dark:hover:border-orange-600 bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🇺🇸</span>
                <span className="text-sm font-bold text-zinc-900 dark:text-white">English (Standard)</span>
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-300 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => completeOnboarding('np')}
              className="w-full p-4 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 hover:border-orange-600 dark:hover:border-orange-600 bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🇳🇵</span>
                <span className="text-sm font-bold text-zinc-900 dark:text-white">नेपाली (Pure Nepali)</span>
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-300 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
            </button>
          </div>

          <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">
            Tactical Environment Initialization
          </p>
        </div>
      </div>
    </div>
  );
}
