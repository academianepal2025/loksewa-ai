'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X, Clock, Calendar, AlertTriangle } from 'lucide-react';

interface StudyPlanRegenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (days: number, hours: number) => void;
  initialDays: number;
  initialHours: number;
}

export function StudyPlanRegenModal({
  isOpen,
  onClose,
  onConfirm,
  initialDays,
  initialHours
}: StudyPlanRegenModalProps) {
  const [days, setDays] = useState(initialDays);
  const [hours, setHours] = useState(initialHours);

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="bg-surface p-8 sm:p-10 rounded-[2.5rem] max-w-md w-full border border-border-subtle shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-[40px] -mr-16 -mt-16" />
                  
                  <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-subtle hover:text-foreground transition-all rounded-xl hover:bg-background"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <div className="h-14 w-14 bg-accent/10 text-accent border border-accent/20 rounded-2xl flex items-center justify-center mb-8 shadow-sm">
                    <RefreshCw className="h-7 w-7" />
                  </div>

                  <Dialog.Title className="text-2xl font-black text-foreground tracking-tighter mb-2 uppercase">
                    Reset Roadmap
                  </Dialog.Title>
                   <Dialog.Description className="text-[10px] text-subtle font-black uppercase tracking-widest mb-8 leading-relaxed opacity-70">
                    Adjust mission parameters. This protocol will purge all current progress logs for this exam.
                  </Dialog.Description>

                  <div className="space-y-6 mb-10">
                    {/* Days Input */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-subtle uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-accent" /> Study Duration
                      </label>
                      <div className="relative group">
                        <input
                          type="number"
                          value={days}
                          onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full bg-background border border-border-subtle rounded-2xl px-5 py-4 text-[13px] font-black uppercase tracking-widest text-foreground focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all shadow-sm"
                          placeholder="DAYS"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-subtle uppercase tracking-widest">Days</div>
                      </div>
                    </div>

                    {/* Hours Input */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-subtle uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Clock className="h-3 w-3 text-accent" /> Daily Load
                      </label>
                      <div className="relative group">
                        <input
                          type="number"
                          value={hours}
                          onChange={(e) => setHours(Math.max(1, Math.min(24, parseInt(e.target.value) || 1)))}
                          className="w-full bg-background border border-border-subtle rounded-2xl px-5 py-4 text-[13px] font-black uppercase tracking-widest text-foreground focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all shadow-sm"
                          placeholder="HOURS"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-subtle uppercase tracking-widest">Hrs/Day</div>
                      </div>
                    </div>

                    <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 flex gap-3 shadow-sm">
                      <AlertTriangle className="h-5 w-5 text-accent flex-shrink-0" />
                      <p className="text-[9px] font-black text-accent uppercase tracking-widest leading-tight">
                        Critical: All mission logs and performance data for this roadmap will be purged.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={onClose}
                      className="flex-1 py-4 bg-background border border-border-subtle rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-surface-elevated transition-all active:scale-[0.98] shadow-sm"
                    >
                      Abort
                    </button>
                    <button
                      onClick={() => onConfirm(days, hours)}
                      className="flex-1 py-4 bg-primary text-accent rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/10 hover:opacity-95 transition-all active:scale-[0.98]"
                    >
                      Re-Deploy
                    </button>
                  </div>
                </motion.div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </AnimatePresence>
  );
}
