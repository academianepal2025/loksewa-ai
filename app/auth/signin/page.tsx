'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Sparkles, ArrowRight, Mail, Lock, Loader2, ShieldCheck } from 'lucide-react';
import { getURL } from '@/lib/utils';

const signinSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type SigninValues = z.infer<typeof signinSchema>;

export default function SignIn() {
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SigninValues>({
    resolver: zodResolver(signinSchema),
  });

  const onSubmit = async (data: SigninValues) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast.error('Authentication Error', { description: error.message });
    } else {
      toast.success('Access Granted', { description: 'Welcome back to Mission Command.' });
      router.push('/dashboard');
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${getURL()}auth/callback`,
      },
    });

    if (error) {
      toast.error('Google Auth Error', { description: error.message });
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
              <ShieldCheck className="h-7 w-7 relative z-10" />
              <div className="absolute inset-0 bg-white rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity" />
            </div>
            <h1 className="text-3xl font-bold text-orange-600 tracking-tight">System Login</h1>
            <p className="text-sm font-medium text-subtle">Authorized personnel only. Access encrypted.</p>
          </div>

          <div className="space-y-6">
            <button
              onClick={handleGoogleSignIn}
              className="w-full bg-background border border-border-subtle py-4 rounded-2xl font-bold text-sm hover:bg-surface-elevated transition-all flex items-center justify-center gap-3 shadow-sm active:scale-[0.98] min-h-[56px]"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border-subtle"></span>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                <span className="bg-surface px-4 text-subtle">Or manual entry</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-subtle uppercase tracking-wider ml-1">Identity (Email)</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle" />
                    <input
                      {...register('email')}
                      type="email"
                      className={`w-full bg-background border rounded-2xl pl-12 pr-4 py-4 text-sm font-medium transition-all outline-none min-h-[44px] ${errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-border-subtle focus:border-accent'}`}
                      placeholder="name@example.com"
                    />
                  </div>
                  {errors.email && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.email.message}</p>}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-bold text-subtle uppercase tracking-wider">Access Key</label>
                    <Link href="/auth/forgot" className="text-[9px] font-bold text-accent uppercase tracking-wider hover:underline underline-offset-4">Lost Key?</Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle" />
                    <input
                      {...register('password')}
                      type="password"
                      className={`w-full bg-background border rounded-2xl pl-12 pr-4 py-4 text-sm font-medium transition-all outline-none min-h-[44px] ${errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-border-subtle focus:border-accent'}`}
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.password && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.password.message}</p>}
                </div>
              </div>

              <button
                disabled={isSubmitting}
                className="w-full bg-orange-600 text-background py-4.5 rounded-2xl font-bold text-sm hover:opacity-95 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-orange-600/10 active:scale-[0.98] min-h-[60px] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>Authorize Access <ArrowRight className="h-4.5 w-4.5" /></>
                )}
              </button>
            </form>
          </div>

          <div className="text-center pt-6 border-t border-border-subtle">
            <Link href="/auth/signup" className="text-xs font-bold text-subtle hover:text-foreground transition-colors uppercase tracking-widest">
              New operative? <span className="text-accent underline underline-offset-4 ml-1">Create Account</span>
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
