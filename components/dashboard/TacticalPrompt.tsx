'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Info, Zap } from 'lucide-react';

interface TacticalPromptProps {
  id: string;
  title: string;
  message: string;
  type?: 'info' | 'tactical' | 'intel';
  delay?: number;
}

export function TacticalPrompt({ id, title, message, type = 'info', delay = 1000 }: TacticalPromptProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem(`prompt_dismissed_${id}`);
    if (!dismissed) {
      setIsDismissed(false);
      const timer = setTimeout(() => setIsVisible(true), delay);
      return () => clearTimeout(timer);
    }
  }, [id, delay]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(`prompt_dismissed_${id}`, 'true');
    setTimeout(() => setIsDismissed(true), 500);
  };

  if (isDismissed) return null;

  const styles = {
    info: 'bg-[#1e3a5f] border-[#c9a84c]/20 text-[#c9a84c]',
    tactical: 'bg-[#c9a84c] border-[#1e3a5f]/20 text-[#1e3a5f]',
    intel: 'bg-emerald-600 border-emerald-400/20 text-white',
  };

  const icons = {
    info: <Info className="h-4 w-4" />,
    tactical: <Zap className="h-4 w-4" />,
    intel: <Sparkles className="h-4 w-4" />,
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className={`fixed bottom-6 right-6 z-[60] max-w-xs p-5 rounded-2xl shadow-2xl border ${styles[type]} overflow-hidden`}
        >
          <div className="absolute top-0 right-0 p-2">
            <button 
              onClick={handleDismiss}
              className="p-1 hover:bg-black/10 rounded-full transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          <div className="flex gap-4">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 bg-white/10`}>
              {icons[type]}
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest leading-none mb-1.5 opacity-90">
                {title}
              </h4>
              <p className="text-[11px] font-bold leading-relaxed tracking-tight">
                {message}
              </p>
              
              <div className="mt-3 flex items-center gap-2">
                 <div className="h-1 w-8 bg-white/20 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ x: '-100%' }}
                      animate={{ x: '0%' }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="h-full bg-white/40"
                    />
                 </div>
                 <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-60">Quick Tip</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
