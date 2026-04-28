'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Sparkles, ArrowRight, Mail, Lock, User, Phone, Loader2 } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-600/5 rounded-full blur-[100px] -ml-48 -mb-48" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-surface border border-border-subtle p-8 sm:p-10 rounded-3xl shadow-2xl shadow-primary/5 space-y-8">
          <div className="text-center space-y-2">
            <div className="h-12 w-12 bg-orange-600 text-background rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-600/20">
              <Sparkles className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-orange-600 tracking-tight">Create Workspace</h1>
            <p className="text-sm font-medium text-subtle">Initialize your Loksewa AI mission parameters.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-subtle uppercase tracking-wider ml-1">Full Identity</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle" />
                  <input
                    {...register('fullName')}
                    className={`w-full bg-background border rounded-2xl pl-11 pr-4 py-3.5 text-sm font-medium transition-all outline-none min-h-[44px] ${errors.fullName ? 'border-red-500/50 focus:border-red-500' : 'border-border-subtle focus:border-accent'}`}
                    placeholder="Enter full name"
                  />
                </div>
                {errors.fullName && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.fullName.message}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-subtle uppercase tracking-wider ml-1">Secure Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle" />
                  <input
                    {...register('email')}
                    type="email"
                    className={`w-full bg-background border rounded-2xl pl-11 pr-4 py-3.5 text-sm font-medium transition-all outline-none min-h-[44px] ${errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-border-subtle focus:border-accent'}`}
                    placeholder="name@example.com"
                  />
                </div>
                {errors.email && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-subtle uppercase tracking-wider ml-1">Access Protocol (Password)</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle" />
                  <input
                    {...register('password')}
                    type="password"
                    className={`w-full bg-background border rounded-2xl pl-11 pr-4 py-3.5 text-sm font-medium transition-all outline-none min-h-[44px] ${errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-border-subtle focus:border-accent'}`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.password.message}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-subtle uppercase tracking-wider ml-1">Mobile Uplink (+977)</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle" />
                  <input
                    {...register('phone')}
                    className={`w-full bg-background border rounded-2xl pl-11 pr-4 py-3.5 text-sm font-medium transition-all outline-none min-h-[44px] ${errors.phone ? 'border-red-500/50 focus:border-red-500' : 'border-border-subtle focus:border-accent'}`}
                    placeholder="+977XXXXXXXXXX"
                  />
                </div>
                {errors.phone && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.phone.message}</p>}
              </div>
            </div>

            <button
              disabled={isSubmitting}
              className="w-full bg-orange-600 text-background py-4 rounded-2xl font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-xl shadow-orange-600/10 active:scale-[0.98] min-h-[56px] disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>Deploy Workspace <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          <div className="text-center pt-4 border-t border-border-subtle">
            <Link href="/auth/signin" className="text-xs font-bold text-subtle hover:text-foreground transition-colors uppercase tracking-widest">
              Existing operative? <span className="text-accent underline underline-offset-4 ml-1">Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
