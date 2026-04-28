'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary'
}: ConfirmModalProps) {
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
                className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm" 
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="bg-surface p-8 sm:p-10 rounded-3xl max-w-sm w-full border border-border-subtle shadow-2xl overflow-hidden relative"
                >
                  <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-subtle hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className={`h-16 w-16 ${variant === 'danger' ? 'bg-red-500/5 text-red-500 border-red-500/20' : 'bg-accent/5 text-accent border-accent/20'} border rounded-2xl flex items-center justify-center mx-auto mb-8`}>
                    <AlertCircle className="h-8 w-8" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-center mb-2 tracking-tight text-foreground">{title}</h3>
                  <p className="text-sm text-center text-subtle font-medium mb-10 leading-relaxed px-2">
                    {description}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                      onClick={onClose}
                      className="flex-1 py-3.5 bg-background border border-border-subtle rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-surface transition-all"
                    >
                      {cancelLabel}
                    </button>
                    <button 
                      onClick={() => {
                        onConfirm();
                        onClose();
                      }}
                      className={`flex-1 py-3.5 ${variant === 'danger' ? 'bg-red-500 shadow-red-500/20 hover:bg-red-600' : 'bg-foreground hover:opacity-90'} text-white rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-lg transition-all`}
                    >
                      {confirmLabel}
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
