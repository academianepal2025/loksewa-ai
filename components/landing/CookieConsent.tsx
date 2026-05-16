'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X } from 'lucide-react';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('loksewa_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('loksewa_cookie_consent', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-md z-[200]"
        >
          <div className="bg-[#1e3a5f] text-white p-6 rounded-[2rem] shadow-2xl border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#c9a84c]/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            
            <div className="flex items-start gap-4 relative z-10">
              <div className="h-10 w-10 bg-[#c9a84c] rounded-xl flex items-center justify-center text-[#1e3a5f] shrink-0 shadow-lg">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-black uppercase tracking-widest text-[#c9a84c]">Cookie Policy</h4>
                  <button onClick={() => setIsVisible(false)} className="text-white/40 hover:text-white transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-white/70 font-medium leading-relaxed mb-6">
                  We use cookies to personalize your study experience, analyze traffic, and ensure seamless authentication. By continuing, you agree to our use of preparation-enhancing cookies.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAccept}
                    className="flex-1 px-6 py-3 bg-[#c9a84c] text-[#1e3a5f] text-[10px] font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-[#c9a84c]/20"
                  >
                    Accept Protocols
                  </button>
                  <button
                    onClick={() => setIsVisible(false)}
                    className="flex-1 px-6 py-3 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all"
                  >
                    Preferences
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
