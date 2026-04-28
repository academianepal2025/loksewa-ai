'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Sparkles, ArrowRight, Mail, Lock, Loader2, ShieldCheck } from 'lucide-react';

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
