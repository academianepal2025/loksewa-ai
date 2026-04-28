'use client';

import { useState, useEffect } from 'react';
import { Download, X, Sparkles } from 'lucide-react';

export function InstallPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // 1. Visit tracking logic
    const visits = parseInt(localStorage.getItem('loksewa_visits') || '0');
    const newVisits = visits + 1;
    localStorage.setItem('loksewa_visits', newVisits.toString());

    // 2. Show prompt only on 2nd visit or more
    if (newVisits >= 2) {
      const isDismissed = localStorage.getItem('pwa_prompt_dismissed');
      if (!isDismissed) {
        // Listen for beforeinstallprompt
        window.addEventListener('beforeinstallprompt', (e) => {
          e.preventDefault();
          setDeferredPrompt(e);
          setIsVisible(true);
        });
      }
    }

    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsVisible(false);
    }
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[70] md:hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-foreground text-background p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center text-background">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest leading-none mb-1">Loksewa AI</p>
            <p className="text-[10px] font-medium opacity-80 leading-tight">Install app for offline study & faster access</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleInstall}
            className="px-4 py-2 bg-accent text-background rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg shadow-accent/20"
          >
            Install
          </button>
          <button 
            onClick={handleDismiss}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
