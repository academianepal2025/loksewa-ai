'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Lock, ArrowRight, Loader2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';

const resetSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetValues = z.infer<typeof resetSchema>;

export default function ResetPassword() {
  const router = useRouter();
  const supabase = createClient();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
  });

  // Verify that the user has a valid recovery session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthorized(true);
      } else {
        toast.error('Invalid or Expired Link', {
          description: 'Please request a new password reset link.',
        });
        router.push('/auth/forgot');
      }
      setChecking(false);
    };
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data: ResetValues) => {
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      toast.error('Reset Failed', { description: error.message });
    } else {
      toast.success('Access Key Updated', {
        description: 'Your password has been reset successfully. Redirecting...',
      });
      // Sign out so they log in fresh with the new password
      await supabase.auth.signOut();
      setTimeout(() => {
        router.push('/auth/signin');
      }, 1500);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#1e3a5f]" />
          <span className="text-[10px] text-subtle font-black uppercase tracking-widest">Verifying Recovery Session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#1e3a5f]/5 rounded-full blur-[100px] -ml-48 -mt-48" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#c9a84c]/5 rounded-full blur-[100px] -mr-48 -mb-48" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-surface border border-border-subtle p-8 sm:p-12 rounded-[2.5rem] shadow-2xl shadow-primary/5 space-y-10">
          <div className="text-center space-y-3">
            <div className="h-14 w-14 bg-[#1e3a5f] text-[#c9a84c] rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-[#1e3a5f]/20 relative group border border-[#c9a84c]/20">
              <ShieldCheck className="h-7 w-7 relative z-10" />
              <div className="absolute inset-0 bg-white rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity" />
            </div>
            <h1 className="text-3xl font-black text-[#1e3a5f] tracking-tighter uppercase">
              New Access Key
            </h1>
            <p className="text-[10px] font-black text-subtle uppercase tracking-widest">
              Establish new secure credentials
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {/* New Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-subtle uppercase tracking-wider ml-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className={`w-full bg-background border rounded-2xl pl-12 pr-12 py-4 text-sm font-medium transition-all outline-none min-h-[44px] ${
                      errors.password
                        ? 'border-red-500/50 focus:border-red-500'
                        : 'border-border-subtle focus:border-accent'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-subtle hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[10px] font-bold text-red-500 ml-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-subtle uppercase tracking-wider ml-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle" />
                  <input
                    {...register('confirmPassword')}
                    type={showConfirm ? 'text' : 'password'}
                    className={`w-full bg-background border rounded-2xl pl-12 pr-12 py-4 text-sm font-medium transition-all outline-none min-h-[44px] ${
                      errors.confirmPassword
                        ? 'border-red-500/50 focus:border-red-500'
                        : 'border-border-subtle focus:border-accent'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-subtle hover:text-foreground transition-colors"
                  >
                    {showConfirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-[10px] font-bold text-red-500 ml-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-background border border-border-subtle rounded-2xl p-4">
              <p className="text-[10px] font-bold text-subtle uppercase tracking-wider mb-2">
                Password Requirements
              </p>
              <ul className="space-y-1">
                <li className="text-[10px] text-subtle flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-subtle" />
                  Minimum 8 characters
                </li>
                <li className="text-[10px] text-subtle flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-subtle" />
                  Use a mix of letters, numbers, and symbols
                </li>
              </ul>
            </div>

            <button
              disabled={isSubmitting}
              className="w-full bg-[#1e3a5f] text-[#c9a84c] py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:opacity-95 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-[#1e3a5f]/20 active:scale-[0.98] min-h-[56px] disabled:opacity-50 border border-[#c9a84c]/20"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Update Access Key <ArrowRight className="h-4.5 w-4.5" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-6 border-t border-border-subtle">
            <Link
              href="/auth/signin"
              className="text-xs font-bold text-subtle hover:text-foreground transition-colors uppercase tracking-widest"
            >
              Remember your password?{' '}
              <span className="text-accent underline underline-offset-4 ml-1">
                Sign In
              </span>
            </Link>
          </div>
        </div>

        <p className="mt-10 text-center text-[10px] font-bold text-subtle uppercase tracking-[0.2em] opacity-40">
          Protected by Loksewa AI Security Protocols
        </p>
      </div>
    </div>
  );
}
