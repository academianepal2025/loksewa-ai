'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, Loader2, ImageOff } from 'lucide-react';

interface ReceiptLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string | null;
}

export function ReceiptLightbox({ isOpen, onClose, requestId }: ReceiptLightboxProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const fetchReceipt = async () => {
    if (!requestId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/receipt/${requestId}`);
      const data = await res.json();
      if (data.signedUrl) {
        setImageUrl(data.signedUrl);
      } else {
        setError(data.error || 'No receipt available');
      }
    } catch {
      setError('Failed to load receipt');
    } finally {
      setLoading(false);
    }
  };

  // Fetch when opening
  if (isOpen && !imageUrl && !loading && !error) {
    fetchReceipt();
  }

  const handleClose = () => {
    setImageUrl(null);
    setError(null);
    setZoom(1);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-background/90 backdrop-blur-lg"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative max-w-3xl w-full max-h-[90vh] bg-surface border border-border-subtle rounded-3xl overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border-subtle">
              <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-foreground">Payment Receipt</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                  className="p-2 hover:bg-background rounded-lg text-subtle hover:text-foreground transition-all"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="text-xs font-bold text-subtle min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                  className="p-2 hover:bg-background rounded-lg text-subtle hover:text-foreground transition-all"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <div className="w-px h-5 bg-border-subtle mx-1" />
                <button onClick={handleClose} className="p-2 hover:bg-background rounded-lg text-subtle hover:text-foreground transition-all">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6 flex items-center justify-center min-h-[400px]">
              {loading && (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-accent" />
                  <p className="text-sm font-bold text-subtle">Loading receipt...</p>
                </div>
              )}
              {error && (
                <div className="flex flex-col items-center gap-3 text-center">
                  <ImageOff className="h-12 w-12 text-subtle" />
                  <p className="text-sm font-bold text-foreground">Receipt Unavailable</p>
                  <p className="text-xs text-subtle">{error}</p>
                </div>
              )}
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Payment Receipt"
                  className="max-w-full rounded-xl border border-border-subtle shadow-lg transition-transform duration-200"
                  style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
                />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
