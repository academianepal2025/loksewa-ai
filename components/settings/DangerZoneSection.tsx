'use client';

import { useState } from 'react';
import { AlertTriangle, Loader2, Trash2, ArrowRight, ArrowLeft, X } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export function DangerZoneSection({ user }: any) {
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pwError, setPwError] = useState('');

  const deleteItems = [
    'Your profile and all personal information',
    'All uploaded documents and study materials',
    'Your study plans and progress history',
    'All quiz attempts and performance data',
    'All Loksewa Guru chat history',
    'All generated study notes and flashcards',
    'Your subscription information'
  ];

  const handleVerify = async () => {
    if (!password) { setPwError('Password is required'); return; }
    setVerifying(true); setPwError('');
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email: user.email!, password });
      if (error) { setPwError('Incorrect password'); setVerifying(false); return; }
      setStep(3);
    } catch (err: any) { setPwError(err.message); }
    finally { setVerifying(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch('/api/settings/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: password, confirmationString: 'DELETE MY ACCOUNT' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = '/auth/signup?deleted=true';
    } catch (err: any) {
      toast.error(err.message || 'Deletion failed');
      setDeleting(false);
    }
  };

  const reset = () => { setShowModal(false); setStep(1); setPassword(''); setConfirmText(''); setPwError(''); };

  return (
    <div className="border-2 border-red-500/30 rounded-2xl p-6 sm:p-8 bg-red-500/[0.02]">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 bg-red-500/10 rounded-xl flex items-center justify-center"><AlertTriangle className="h-5 w-5 text-red-500" /></div>
        <div>
          <h2 className="text-lg font-bold text-red-600 tracking-tight">Delete My Account</h2>
          <p className="text-xs text-subtle font-medium">Permanently remove your account and all data.</p>
        </div>
      </div>

      <p className="text-[12px] text-foreground/70 mb-4 leading-relaxed">Deleting your account is permanent and irreversible. All your data will be permanently removed from our systems.</p>

      <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider hover:bg-red-600 transition-all">
        <Trash2 className="h-3.5 w-3.5" /> Delete Account
      </button>

      {/* 3-step modal */}
      {showModal && (
        <div className="fixed inset-0 z-[110] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border-subtle rounded-2xl p-8 max-w-md w-full shadow-2xl relative">
            <button onClick={reset} className="absolute top-4 right-4 text-subtle hover:text-foreground"><X className="h-5 w-5" /></button>

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {[1,2,3].map(s => (
                <div key={s} className={`h-2 w-8 rounded-full transition-all ${step >= s ? 'bg-red-500' : 'bg-border-subtle'}`} />
              ))}
            </div>

            {step === 1 && (
              <div>
                <h3 className="text-lg font-bold text-foreground mb-2">Read Carefully</h3>
                <p className="text-xs text-subtle mb-4">The following will be permanently deleted:</p>
                <div className="space-y-2 mb-6">
                  {deleteItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-[12px] text-foreground/80">
                      <span className="text-red-500 font-bold mt-0.5">✕</span>{item}
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={reset} className="flex-1 py-3 bg-background border border-border-subtle rounded-xl text-[10px] font-bold uppercase">Cancel</button>
                  <button onClick={() => setStep(2)} className="flex-1 py-3 bg-red-500 text-white rounded-xl text-[10px] font-bold uppercase flex items-center justify-center gap-1">Next <ArrowRight className="h-3 w-3" /></button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h3 className="text-lg font-bold text-foreground mb-2">Verify Your Identity</h3>
                <p className="text-xs text-subtle mb-4">Enter your current password to confirm.</p>
                <input type="password" value={password} onChange={e => { setPassword(e.target.value); setPwError(''); }} placeholder="Current password" className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-foreground outline-none focus:border-red-500/50 mb-2" />
                {pwError && <p className="text-[10px] font-bold text-red-500 mb-3">{pwError}</p>}
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setStep(1)} className="flex-1 py-3 bg-background border border-border-subtle rounded-xl text-[10px] font-bold uppercase flex items-center justify-center gap-1"><ArrowLeft className="h-3 w-3" /> Back</button>
                  <button onClick={handleVerify} disabled={verifying} className="flex-1 py-3 bg-red-500 text-white rounded-xl text-[10px] font-bold uppercase flex items-center justify-center gap-1 disabled:opacity-40">
                    {verifying ? <Loader2 className="h-3 w-3 animate-spin" /> : null} Verify & Continue
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h3 className="text-lg font-bold text-foreground mb-2">Final Confirmation</h3>
                <p className="text-xs text-subtle mb-4">Type <span className="font-bold text-red-500">DELETE MY ACCOUNT</span> exactly to confirm.</p>
                <input value={confirmText} onChange={e => setConfirmText(e.target.value)} placeholder="Type DELETE MY ACCOUNT" className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-foreground outline-none focus:border-red-500/50 mb-2" />
                <p className="text-[10px] font-bold text-red-500 mb-4">⚠ This cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={reset} className="flex-1 py-3 bg-background border border-border-subtle rounded-xl text-[10px] font-bold uppercase">Cancel</button>
                  <button onClick={handleDelete} disabled={confirmText !== 'DELETE MY ACCOUNT' || deleting} className="flex-1 py-3 bg-red-500 text-white rounded-xl text-[10px] font-bold uppercase flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed">
                    {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />} Confirm Permanent Deletion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
