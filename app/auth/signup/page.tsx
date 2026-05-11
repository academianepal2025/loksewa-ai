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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#c9a84c]/10 rounded-full blur-[100px] -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1e3a5f]/5 rounded-full blur-[100px] -ml-48 -mb-48" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-surface border border-border-subtle p-6 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-primary/5 space-y-8">
          <div className="text-center space-y-2">
            <div className="h-14 w-14 bg-primary text-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary/10 relative group transition-transform hover:scale-110">
              <Sparkles className="h-7 w-7 relative z-10" />
            </div>
            <h1 className="text-3xl font-black text-primary tracking-tighter uppercase">Join Loksewa AI</h1>
            <p className="text-[10px] font-black text-subtle uppercase tracking-[0.2em]">Start your preparation mission today</p>
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
                <span className="w-full border-t border-border-subtle"></span>
              </div>
              <div className="relative flex justify-center text-[9px] uppercase tracking-[0.3em] font-black">
                <span className="bg-surface px-4 text-subtle">Registration</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-subtle uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle/50" />
                      <input
                        {...register('fullName')}
                        className={`w-full bg-background/30 border rounded-xl pl-10 pr-4 py-3 text-xs font-bold transition-all outline-none min-h-[44px] text-primary ${errors.fullName ? 'border-red-500/50 focus:border-red-500' : 'border-border-subtle focus:border-primary'}`}
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-subtle uppercase tracking-widest ml-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle/50" />
                      <input
                        {...register('phone')}
                        className={`w-full bg-background/30 border rounded-xl pl-10 pr-4 py-3 text-xs font-bold transition-all outline-none min-h-[44px] text-primary ${errors.phone ? 'border-red-500/50 focus:border-red-500' : 'border-border-subtle focus:border-primary'}`}
                        placeholder="+977..."
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-subtle uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle/50" />
                    <input
                      {...register('email')}
                      type="email"
                      className={`w-full bg-background/30 border rounded-xl pl-10 pr-4 py-3 text-xs font-bold transition-all outline-none min-h-[44px] text-primary ${errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-border-subtle focus:border-primary'}`}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-subtle uppercase tracking-widest ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle/50" />
                    <input
                      {...register('password')}
                      type="password"
                      className={`w-full bg-background/30 border rounded-xl pl-10 pr-4 py-3 text-xs font-bold transition-all outline-none min-h-[44px] text-primary ${errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-border-subtle focus:border-primary'}`}
                      placeholder="Min. 8 characters"
                    />
                  </div>
                </div>
              </div>

              <button
                disabled={isSubmitting}
                className="w-full bg-accent text-primary py-4 rounded-xl font-black text-xs hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-xl shadow-accent/10 active:scale-[0.98] min-h-[52px] disabled:opacity-50 uppercase tracking-[0.2em]"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>Create Account <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </form>
          </div>

          <div className="text-center pt-6 border-t border-border-subtle">
            <Link href="/auth/signin" className="text-[10px] font-black text-subtle hover:text-primary transition-colors uppercase tracking-[0.2em]">
              Already have an account? <span className="text-primary underline underline-offset-8 ml-2">Login Now</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
