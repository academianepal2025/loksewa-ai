'use client';

import { useState } from 'react';
import { Lock, Loader2, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

function PasswordStrength({ password }: { password: string }) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const level = score <= 1 ? 'Weak' : score <= 3 ? 'Medium' : 'Strong';
  const color = score <= 1 ? 'bg-red-500' : score <= 3 ? 'bg-[#c9a84c]/50' : 'bg-[#c9a84c]';
  const textColor = score <= 1 ? 'text-red-500' : score <= 3 ? 'text-[#c9a84c]/80' : 'text-[#c9a84c]';
  const width = score <= 1 ? 'w-1/4' : score <= 3 ? 'w-2/3' : 'w-full';

  if (!password) return null;
  return (
    <div className="space-y-1 mt-2">
      <div className="h-1 w-full bg-background rounded-full overflow-hidden border border-border-subtle">
        <div className={`h-full ${color} ${width} rounded-full transition-all duration-300 shadow-sm`} />
      </div>
      <p className={`text-[9px] font-black uppercase tracking-widest ${textColor}`}>{level}</p>
    </div>
  );
}

export function SecuritySection({ user, markDirty, clearDirty }: any) {
  const [showPassword, setShowPassword] = useState(false);

  // Password change
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const handlePasswordChange = async () => {
    if (!currentPw || !newPw) { toast.error('Fill in all fields'); return; }
    if (newPw.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (newPw !== confirmPw) { toast.error('Passwords do not match'); return; }
    setPwSaving(true);
    try {
      const res = await fetch('/api/settings/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Password updated successfully');
      setCurrentPw(''); setNewPw(''); setConfirmPw(''); setShowPassword(false);
    } catch (err: any) { toast.error(err.message); }
    finally { setPwSaving(false); }
  };

  return (
    <div className="bg-surface border border-border-subtle rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-black text-foreground tracking-tighter mb-1 uppercase">Account & Security</h2>
      <p className="text-xs text-subtle font-black uppercase tracking-widest opacity-70 mb-6">Manage your account password and security.</p>

      {/* Current Email */}
      <div className="mb-6">
        <label className="text-[10px] font-black text-subtle uppercase tracking-widest mb-1.5 block ml-1">Account Email</label>
        <div className="flex items-center gap-3 bg-background border border-border-subtle rounded-xl px-4 py-3 shadow-sm">
          <Lock className="h-4 w-4 text-[#c9a84c]" />
          <span className="text-[13px] font-black text-subtle uppercase tracking-widest">{user?.email}</span>
        </div>
      </div>

      {/* Change Password */}
      <div className="border border-border-subtle rounded-xl overflow-hidden">
        <button onClick={() => setShowPassword(!showPassword)} className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-background/50 transition-all">
          <span className="text-xs font-bold text-foreground">Change Password</span>
          {showPassword ? <ChevronUp className="h-4 w-4 text-[#c9a84c]" /> : <ChevronDown className="h-4 w-4 text-[#c9a84c]" />}
        </button>
        {showPassword && (
          <div className="px-4 pb-4 space-y-3 border-t border-border-subtle pt-4 bg-background/30">
            <div className="relative">
              <input type={showCurrentPw ? 'text' : 'password'} value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="Current Password" className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 pr-10 text-sm font-semibold text-foreground outline-none focus:border-accent/50 placeholder:text-subtle/30 shadow-sm" />
              <button onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-3 text-subtle">{showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
            <div className="relative">
              <input type={showNewPw ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="New Password (min 8)" className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 pr-10 text-sm font-semibold text-foreground outline-none focus:border-accent/50 placeholder:text-subtle/30 shadow-sm" />
              <button onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-3 text-subtle">{showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              <PasswordStrength password={newPw} />
            </div>
            <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Confirm New Password" className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-sm font-semibold text-foreground outline-none focus:border-accent/50 placeholder:text-subtle/30 shadow-sm" />
            {newPw && confirmPw && newPw !== confirmPw && (
              <p className="text-[10px] font-bold text-red-500">Passwords do not match</p>
            )}
            <button onClick={handlePasswordChange} disabled={pwSaving} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-accent rounded-xl text-xs font-bold hover:opacity-90 disabled:opacity-40 shadow-lg shadow-primary/10">
              {pwSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Update Password
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
