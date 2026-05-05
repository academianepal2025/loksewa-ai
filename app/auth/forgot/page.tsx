'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { toast } from 'sonner';
import { Mail, ArrowLeft, Loader2, KeyRound, CheckCircle2 } from 'lucide-react';
import { getURL } from '@/lib/utils';
import { useState } from 'react';

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotValues = z.infer<typeof forgotSchema>;

export default function ForgotPassword() {
  const supabase = createClient();
  const [emailSent, setEmailSent] = useState(false);
  const [sentTo, setSentTo] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotValues) => {
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${getURL()}auth/callback?type=recovery`,
    });

    if (error) {
      toast.error('Request Failed', { description: error.message });
    } else {
      setSentTo(data.email);
      setEmailSent(true);
      toast.success('Reset Link Sent', { description: 'Check your email inbox.' });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-orange-600/5 rounded-full blur-[100px] -ml-48 -mt-48" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] -mr-48 -mb-48" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-surface border border-border-subtle p-8 sm:p-12 rounded-[2.5rem] shadow-2xl shadow-primary/5 space-y-10">
          <div className="text-center space-y-3">
            <div className="h-14 w-14 bg-orange-600 text-background rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-orange-600/20 relative group">
              <KeyRound className="h-7 w-7 relative z-10" />
              <div className="absolute inset-0 bg-white rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity" />
            </div>
            <h1 className="text-3xl font-bold text-orange-600 tracking-tight">
              {emailSent ? 'Check Your Email' : 'Reset Access Key'}
            </h1>
            <p className="text-sm font-medium text-subtle">
              {emailSent
                ? 'We\'ve sent a secure reset link to your email.'
                : 'Enter your email to receive a password reset link.'}
            </p>
          </div>

          {emailSent ? (
            <div className="space-y-8">
              {/* Success State */}
              <div className="flex flex-col items-center space-y-6">
                <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Reset link sent to
                  </p>
                  <p className="text-sm font-bold text-accent break-all">
                    {sentTo}
                  </p>
                </div>
                <div className="bg-background border border-border-subtle rounded-2xl p-4 w-full">
                  <p className="text-[10px] font-bold text-subtle uppercase tracking-wider text-center leading-relaxed">
                    Didn&apos;t receive it? Check your spam folder or{' '}
                    <button
                      onClick={() => setEmailSent(false)}
                      className="text-accent underline underline-offset-4 hover:text-orange-600 transition-colors"
                    >
                      try again
                    </button>
                  </p>
                </div>
              </div>

              <div className="text-center pt-6 border-t border-border-subtle">
                <Link
                  href="/auth/signin"
                  className="text-xs font-bold text-subtle hover:text-foreground transition-colors uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to Login
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-subtle uppercase tracking-wider ml-1">
                    Registered Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle" />
                    <input
                      {...register('email')}
                      type="email"
                      className={`w-full bg-background border rounded-2xl pl-12 pr-4 py-4 text-sm font-medium transition-all outline-none min-h-[44px] ${
                        errors.email
                          ? 'border-red-500/50 focus:border-red-500'
                          : 'border-border-subtle focus:border-accent'
                      }`}
                      placeholder="name@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[10px] font-bold text-red-500 ml-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <button
                  disabled={isSubmitting}
                  className="w-full bg-orange-600 text-background py-4.5 rounded-2xl font-bold text-sm hover:opacity-95 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-orange-600/10 active:scale-[0.98] min-h-[60px] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>

              <div className="text-center pt-6 border-t border-border-subtle">
                <Link
                  href="/auth/signin"
                  className="text-xs font-bold text-subtle hover:text-foreground transition-colors uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>

        <p className="mt-10 text-center text-[10px] font-bold text-subtle uppercase tracking-[0.2em] opacity-40">
          Protected by Loksewa AI Security Protocols
        </p>
      </div>
    </div>
  );
}
