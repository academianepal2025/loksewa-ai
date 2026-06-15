'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Upload, 
  CheckCircle2, 
  Smartphone, 
  Info, 
  QrCode,
  Image as ImageIcon,
  Copy,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface PaymentFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: {
    id: string;
    name: string;
    price: string;
  } | null;
}

export function PaymentFlowModal({ isOpen, onClose, selectedPlan }: PaymentFlowModalProps) {
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [qrUrl, setQrUrl] = useState<string>('https://bgvezddpaxxqtaskueuw.supabase.co/storage/v1/object/public/system/esewa_qr.jpg');
  const [qrLoading, setQrLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
  });
  const [requestId, setRequestId] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      const fetchQR = async () => {
        try {
          const { data, error } = await supabase
            .from('app_settings')
            .select('value')
            .eq('key', 'payment_qr_url')
            .maybeSingle();
          
          if (data?.value) {
            setQrUrl(`${data.value}?t=${Date.now()}`);
          }
        } catch (err) {
          console.error('Error fetching QR:', err);
        } finally {
          setQrLoading(false);
        }
      };
      fetchQR();
    }
  }, [isOpen, supabase]);

  if (!selectedPlan) return null;

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.phone) {
      toast.error('Incomplete Request', { description: 'Please enter your name and phone number.' });
      return;
    }

    // Strict 10-digit phone validation
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      toast.error('Invalid Phone', { description: 'Phone number must be exactly 10 digits.' });
      return;
    }

    setLoading(true);
    try {
      // 1. Get user session
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required');

      // 2. Submit request record
      const res = await fetch('/api/initiate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payerName: formData.fullName,
          payerPhone: cleanPhone,
          plan: selectedPlan.id,
          receiptUrl: null, // No longer required
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to submit request');

      setRequestId(result.id);
      setStep(3);
      toast.success('Request Submitted Successfully');
    } catch (error: any) {
      console.error('Payment Error:', error);
      toast.error('Submission Failed', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (step === 3) {
      // Redirect to dashboard on success close
      window.location.href = '/dashboard';
      return;
    }
    setStep(1);
    setFormData({ fullName: '', phone: '' });
    setRequestId(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg md:max-w-xl bg-surface border border-border-subtle rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Step Indicator */}
            <div className="flex h-1.5 w-full bg-background/50 flex-shrink-0">
               <div className={`h-full bg-[#c9a84c] transition-all duration-500 ${step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'}`} />
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto flex-1 scrollbar-hide">
               <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                     {step > 1 && step < 3 && (
                       <button onClick={() => setStep(step - 1)} className="p-1 hover:bg-background rounded-lg transition-all">
                          <ChevronLeft className="h-5 w-5 text-subtle" />
                       </button>
                     )}
                     <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-accent">
                        {step === 1 ? 'STEP 1: PAYMENT' : step === 2 ? 'STEP 2: VERIFICATION' : 'STEP 3: CONFIRMED'}
                     </h3>
                  </div>
                  <button onClick={handleClose} className="p-1 hover:bg-background rounded-lg transition-all">
                     <X className="h-5 w-5 text-subtle" />
                  </button>
               </div>

               {/* STEP 1: QR & INSTRUCTIONS */}
               {step === 1 && (
                 <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="text-center">
                       <h4 className="text-xl font-bold text-foreground mb-1">Complete Your Payment</h4>
                       <p className="text-xs font-medium text-subtle">Plan: <span className="text-foreground font-bold">{selectedPlan.name}</span> • Amount: <span className="text-[#c9a84c] font-bold">NPR {selectedPlan.price}</span></p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Khalti Card */}
                      <div className="flex flex-col items-center p-4 bg-white dark:bg-background border border-border-subtle rounded-2xl shadow-inner group/khalti relative overflow-hidden transition-all duration-300 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/[0.02]">
                         <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-600" />
                         <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-1.5">
                           <Smartphone className="h-3.5 w-3.5" /> Khalti QR
                         </span>
                         {qrLoading ? (
                           <div className="flex flex-col items-center justify-center h-40 w-40 bg-gray-100 dark:bg-surface/50 animate-pulse rounded-xl">
                             <p className="text-[9px] font-black text-subtle uppercase animate-pulse">Loading...</p>
                           </div>
                         ) : (
                           <div className="relative h-40 w-40">
                              <img 
                                src={qrUrl} 
                                alt="Khalti Payment QR" 
                                className="h-full w-full object-contain rounded-lg"
                                onError={(e) => {
                                  (e.target as any).src = "https://placehold.co/400x400/5c2d91/ffffff?text=KHALTI+QR";
                                }}
                              />
                           </div>
                         )}
                         <p className="text-[9px] font-black text-subtle uppercase tracking-widest mt-3">Scan to Pay via Khalti</p>
                      </div>

                      {/* eSewa Card */}
                      <div className="flex flex-col items-center p-4 bg-white dark:bg-background border border-border-subtle rounded-2xl shadow-inner group/esewa relative overflow-hidden transition-all duration-300 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/[0.02]">
                         <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-green-600" />
                         <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-1.5">
                           <Smartphone className="h-3.5 w-3.5" /> eSewa QR
                         </span>
                         <div className="relative h-40 w-40">
                            <img 
                              src="/esewa_qr.jpg" 
                              alt="eSewa Payment QR" 
                              className="h-full w-full object-contain rounded-lg"
                              onError={(e) => {
                                (e.target as any).src = "https://placehold.co/400x400/60b524/ffffff?text=ESEWA+QR";
                              }}
                            />
                         </div>
                         <p className="text-[9px] font-black text-subtle uppercase tracking-widest mt-3">Scan to Pay via eSewa</p>
                      </div>
                    </div>

                    <div className="p-5 bg-[#c9a84c]/[0.03] border border-[#c9a84c]/10 rounded-2xl space-y-4">
                       <div className="flex items-start gap-3">
                          <div className="h-5 w-5 rounded-full bg-[#1e3a5f] text-[#c9a84c] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</div>
                          <p className="text-xs font-medium text-foreground/80 leading-relaxed">Open <span className="font-bold">eSewa or Khalti</span> and scan either of the QR codes above.</p>
                       </div>
                       <div className="flex items-start gap-3">
                          <div className="h-5 w-5 rounded-full bg-[#1e3a5f] text-[#c9a84c] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</div>
                          <p className="text-xs font-medium text-foreground/80 leading-relaxed">Pay exact amount <span className="font-bold text-[#c9a84c]">NPR {selectedPlan.price}</span>. In remarks, write your full name.</p>
                       </div>
                       <div className="flex items-start gap-3">
                          <div className="h-5 w-5 rounded-full bg-[#1e3a5f] text-[#c9a84c] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</div>
                          <p className="text-xs font-medium text-foreground/80 leading-relaxed">Enter your details in the next step to notify our team.</p>
                       </div>
                    </div>

                    <button 
                      onClick={() => setStep(2)}
                      className="w-full py-4 bg-[#1e3a5f] text-[#c9a84c] rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all min-h-[52px]"
                    >
                       I have paid, Next <ArrowRight className="h-4 w-4" />
                    </button>
                 </div>
               )}

               {/* STEP 2: FORM */}
               {step === 2 && (
                 <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="text-center">
                       <h4 className="text-xl font-bold text-foreground mb-1">Payment Information</h4>
                       <p className="text-xs font-medium text-subtle">Provide your details to verify the transaction.</p>
                    </div>

                    <div className="space-y-4">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-subtle uppercase tracking-widest ml-1">Payer Full Name</label>
                          <input 
                            type="text"
                            placeholder="Your name as used in payment"
                            className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-foreground outline-none focus:border-accent transition-all min-h-[44px]"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-subtle uppercase tracking-widest ml-1">Payer Phone Number</label>
                          <input 
                            type="tel"
                            maxLength={10}
                            placeholder="98XXXXXXXX (10 Digits)"
                            className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-foreground outline-none focus:border-accent transition-all min-h-[44px]"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                          />
                       </div>
                    </div>

                    <button 
                      onClick={handleSubmit}
                      disabled={loading}
                      className="w-full py-4 bg-[#1e3a5f] text-[#c9a84c] rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all min-h-[52px]"
                    >
                       {loading ? 'Processing...' : 'Notify Admin of Payment'} 
                       {!loading && <CheckCircle2 className="h-4 w-4" />}
                    </button>
                 </div>
               )}

               {/* STEP 3: CONFIRMATION */}
               {step === 3 && (
                 <div className="py-8 text-center space-y-8 animate-in zoom-in-95 duration-300">
                    <div className="flex justify-center">
                       <div className="h-24 w-24 rounded-full bg-emerald-500/10 flex items-center justify-center border-4 border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <h4 className="text-2xl font-bold text-foreground tracking-tight">Payment Request Submitted</h4>
                       <p className="text-sm font-medium text-subtle leading-relaxed">
                          Thank you <span className="text-foreground font-bold">{formData.fullName}</span>. We will verify your payment against your phone number <span className="font-bold text-[#c9a84c]">{formData.phone}</span>.
                       </p>
                    </div>

                    <div className="bg-background border border-border-subtle p-5 rounded-2xl space-y-4">
                       <div className="flex flex-col items-center">
                          <span className="text-[10px] font-bold text-subtle uppercase tracking-[0.2em] mb-1">REQUEST REFERENCE ID</span>
                          <div className="flex items-center gap-2">
                             <code className="text-sm font-black text-[#c9a84c] bg-[#c9a84c]/5 px-3 py-1 rounded-lg border border-[#c9a84c]/20">{requestId?.slice(0, 8).toUpperCase()}</code>
                             <button 
                               onClick={() => {
                                 navigator.clipboard.writeText(requestId || '');
                                 toast.success('ID Copied');
                               }}
                               className="p-1.5 hover:bg-surface rounded-md text-subtle"
                             >
                                <Copy className="h-3.5 w-3.5" />
                             </button>
                          </div>
                       </div>
                       <div className="flex items-center gap-3 text-left p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                          <Info className="h-4 w-4 text-blue-500 shrink-0" />
                          <p className="text-[10px] font-medium text-blue-700 leading-normal">Our team will verify your payment within 24 hours. You will see your Pro status on the dashboard once activated.</p>
                       </div>
                    </div>

                    <button 
                      onClick={handleClose}
                      className="w-full py-4 bg-foreground text-background rounded-2xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all min-h-[52px]"
                    >
                       Close Window
                    </button>
                 </div>
               )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
