'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Sparkles, ArrowRight, Mail, Lock, User, Phone, Loader2 } from 'lucide-react';
import { getURL } from '@/lib/utils';

const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().regex(/^\+977\d{10}$/, 'Format: +977 followed by 10 digits'),
});

type SignupValues = z.infer<typeof signupSchema>;

export default function SignUp() {
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupValues) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          phone_number: data.phone,
        },
      },
    });

    if (error) {
      toast.error('Initialization Failed', { description: error.message });
    } else {
      toast.success('Mission Protocol Initialized', { description: 'Please verify your email to activate your workspace.' });
      router.push('/onboarding');
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
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#c9a84c]/10 rounded-full blur-[100px] -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1e3a5f]/5 rounded-full blur-[100px] -ml-48 -mb-48" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white border border-gray-100 p-6 sm:p-8 rounded-3xl shadow-2xl shadow-indigo-100/20 space-y-6">
          <div className="text-center space-y-1">
            <div className="h-12 w-12 bg-[#1e3a5f] text-[#c9a84c] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xl shadow-indigo-100 relative group transition-transform hover:scale-105">
              <Sparkles className="h-6 w-6 relative z-10" />
              <div className="absolute inset-0 bg-white rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity" />
            </div>
            <h1 className="text-2xl font-black text-[#1e3a5f] tracking-tighter uppercase">Create Workspace</h1>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Initialize your Loksewa AI parameters</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              className="w-full bg-white border border-gray-100 py-3 rounded-xl font-bold text-xs hover:bg-gray-50 transition-all flex items-center justify-center gap-3 shadow-sm active:scale-[0.98] min-h-[44px] text-[#1e3a5f]"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
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
              <div className="relative flex justify-center text-[8px] uppercase tracking-[0.3em] font-black">
                <span className="bg-white px-3 text-gray-300">New Registration</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Identity</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300" />
                      <input
                        {...register('fullName')}
                        className={`w-full bg-gray-50/50 border rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold transition-all outline-none min-h-[36px] text-[#1e3a5f] ${errors.fullName ? 'border-red-500/50 focus:border-red-500' : 'border-gray-100 focus:border-[#1e3a5f]'}`}
                        placeholder="Full name"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Mobile Uplink</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300" />
                      <input
                        {...register('phone')}
                        className={`w-full bg-gray-50/50 border rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold transition-all outline-none min-h-[36px] text-[#1e3a5f] ${errors.phone ? 'border-red-500/50 focus:border-red-500' : 'border-gray-100 focus:border-[#1e3a5f]'}`}
                        placeholder="+977..."
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Secure Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300" />
                    <input
                      {...register('email')}
                      type="email"
                      className={`w-full bg-gray-50/50 border rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold transition-all outline-none min-h-[36px] text-[#1e3a5f] ${errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-gray-100 focus:border-[#1e3a5f]'}`}
                      placeholder="operative@loksewai.com"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Access Protocol</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300" />
                    <input
                      {...register('password')}
                      type="password"
                      className={`w-full bg-gray-50/50 border rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold transition-all outline-none min-h-[36px] text-[#1e3a5f] ${errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-gray-100 focus:border-[#1e3a5f]'}`}
                      placeholder="Min. 8 chars"
                    />
                  </div>
                </div>
              </div>

              <button
                disabled={isSubmitting}
                className="w-full bg-[#c9a84c] text-[#1e3a5f] py-3.5 rounded-xl font-black text-xs hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 active:scale-[0.98] min-h-[48px] disabled:opacity-50 uppercase tracking-[0.2em]"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>Deploy Workspace <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </form>
          </div>

          <div className="text-center pt-4 border-t border-gray-50">
            <Link href="/auth/signin" className="text-[9px] font-black text-gray-400 hover:text-[#1e3a5f] transition-colors uppercase tracking-[0.2em]">
              Already Registered? <span className="text-[#1e3a5f] underline underline-offset-8 ml-2">Secure Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
