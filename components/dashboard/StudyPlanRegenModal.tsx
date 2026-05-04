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
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 rounded-full blur-[40px] -mr-16 -mt-16" />
                  
                  <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-subtle hover:text-foreground transition-all rounded-xl hover:bg-background"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <div className="h-14 w-14 bg-orange-600/10 text-orange-600 border border-orange-600/20 rounded-2xl flex items-center justify-center mb-8">
                    <RefreshCw className="h-7 w-7" />
                  </div>

                  <Dialog.Title className="text-2xl font-bold text-foreground tracking-tight mb-2">
                    Regenerate Roadmap
                  </Dialog.Title>
                  <Dialog.Description className="text-sm text-subtle font-medium mb-8 leading-relaxed">
                    Adjust your mission parameters. This will reset all current progress for this exam.
                  </Dialog.Description>

                  <div className="space-y-6 mb-10">
                    {/* Days Input */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-subtle uppercase tracking-wider ml-1 flex items-center gap-2">
                        <Calendar className="h-3 w-3" /> Study Duration (Days)
                      </label>
                      <div className="relative group">
                        <input
                          type="number"
                          value={days}
                          onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full bg-background border border-border-subtle rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 outline-none transition-all"
                          placeholder="Number of days"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-subtle uppercase">Days</div>
                      </div>
                    </div>

                    {/* Hours Input */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-subtle uppercase tracking-wider ml-1 flex items-center gap-2">
                        <Clock className="h-3 w-3" /> Daily Study Load (Hours)
                      </label>
                      <div className="relative group">
                        <input
                          type="number"
                          value={hours}
                          onChange={(e) => setHours(Math.max(1, Math.min(24, parseInt(e.target.value) || 1)))}
                          className="w-full bg-background border border-border-subtle rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 outline-none transition-all"
                          placeholder="Hours per day"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-subtle uppercase">Hrs/Day</div>
                      </div>
                    </div>

                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                      <p className="text-[11px] font-medium text-amber-600/90 leading-tight">
                        Warning: All checkmarks, notes, and progress logs for this plan will be permanently deleted.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={onClose}
                      className="flex-1 py-4 bg-background border border-border-subtle rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-surface-elevated transition-all active:scale-[0.98]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => onConfirm(days, hours)}
                      className="flex-1 py-4 bg-orange-600 text-background rounded-2xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-orange-600/20 hover:opacity-95 transition-all active:scale-[0.98]"
                    >
                      Regenerate
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
