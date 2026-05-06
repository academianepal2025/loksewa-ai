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
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#1e3a5f]/5 rounded-full blur-[100px] -ml-48 -mt-48" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#c9a84c]/10 rounded-full blur-[100px] -mr-48 -mb-48" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white border border-gray-100 p-8 sm:p-12 rounded-[2.5rem] shadow-2xl shadow-indigo-100/20 space-y-10">
          <div className="text-center space-y-3">
            <div className="h-16 w-16 bg-[#1e3a5f] text-[#c9a84c] rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-100 relative group transition-transform hover:scale-105">
              <ShieldCheck className="h-8 w-8 relative z-10" />
              <div className="absolute inset-0 bg-white rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity" />
            </div>
            <h1 className="text-3xl font-black text-[#1e3a5f] tracking-tighter uppercase">System Login</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Authorized Access Only • Encrypted Session</p>
          </div>

          <div className="space-y-6">
            <button
              onClick={handleGoogleSignIn}
              className="w-full bg-white border border-gray-100 py-4 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-3 shadow-sm active:scale-[0.98] min-h-[56px] text-[#1e3a5f]"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-100"></span>
              </div>
              <div className="relative flex justify-center text-[9px] uppercase tracking-[0.3em] font-black">
                <span className="bg-white px-4 text-gray-300">Secure Entry</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Identity Identifier</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                    <input
                      {...register('email')}
                      type="email"
                      className={`w-full bg-gray-50/50 border rounded-2xl pl-12 pr-4 py-4 text-sm font-bold transition-all outline-none min-h-[44px] text-[#1e3a5f] ${errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-gray-100 focus:border-[#1e3a5f]'}`}
                      placeholder="operative@loksewai.com"
                    />
                  </div>
                  {errors.email && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase tracking-tight">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Access Key</label>
                    <Link href="/auth/forgot" className="text-[9px] font-black text-[#1e3a5f] uppercase tracking-widest hover:underline underline-offset-4">Lost Key?</Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                    <input
                      {...register('password')}
                      type="password"
                      className={`w-full bg-gray-50/50 border rounded-2xl pl-12 pr-4 py-4 text-sm font-bold transition-all outline-none min-h-[44px] text-[#1e3a5f] ${errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-gray-100 focus:border-[#1e3a5f]'}`}
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.password && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase tracking-tight">{errors.password.message}</p>}
                </div>
              </div>

              <button
                disabled={isSubmitting}
                className="w-full bg-[#c9a84c] text-[#1e3a5f] py-5 rounded-2xl font-black text-sm hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-indigo-100 active:scale-[0.98] min-h-[64px] disabled:opacity-50 uppercase tracking-[0.2em]"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>Authorize Access <ArrowRight className="h-5 w-5" /></>
                )}
              </button>
            </form>
          </div>

          <div className="text-center pt-8 border-t border-gray-50">
            <Link href="/auth/signup" className="text-[10px] font-black text-gray-400 hover:text-[#1e3a5f] transition-colors uppercase tracking-[0.2em]">
              New Operative? <span className="text-[#1e3a5f] underline underline-offset-8 ml-2">Register Identity</span>
            </Link>
          </div>
        </div>

        <p className="mt-12 text-center text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] opacity-60">
          Protected by Loksewa AI Security • v2.0
        </p>
      </div>
    </div>
  );
}
