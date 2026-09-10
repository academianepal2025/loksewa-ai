'use client';

import React from 'react';
import Link from 'next/link';
import { Gift, Share2, Sparkles, UserCheck, Award, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/landing/ScrollReveal';

export function ReferralProgramSection() {
  const steps = [
    {
      step: '01',
      title: 'Get Your Link',
      desc: 'Find your unique referral code or link in your Dashboard Settings under Refer & Earn.',
      icon: Gift,
      color: 'bg-indigo-50 text-[#1e3a5f]',
    },
    {
      step: '02',
      title: 'Share with Friends',
      desc: 'Share your link via WhatsApp, Facebook, or study groups with fellow PSC aspirants.',
      icon: Share2,
      color: 'bg-[#c9a84c]/10 text-[#c9a84c]',
    },
    {
      step: '03',
      title: 'Friend Gets 15% OFF',
      desc: 'When your friend uses your link during checkout, they get an instant 15% discount on Pro plans.',
      icon: UserCheck,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      step: '04',
      title: 'Earn +7 Days Pro',
      desc: 'Once your friend upgrades, your Pro subscription is automatically extended by 7 full days!',
      icon: Award,
      color: 'bg-amber-50 text-amber-600',
    },
  ];

  return (
    <section id="referral-program" className="py-28 bg-gradient-to-b from-gray-50/50 to-background border-t border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#c9a84c]/10 text-[#1e3a5f] text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-[#c9a84c]/30 shadow-sm">
            <Gift className="h-3.5 w-3.5 text-[#c9a84c] mr-2" />
            Refer & Earn Program
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-[#1e3a5f] tracking-tight leading-tight mb-6">
            Share Loksewa AI, <span className="text-[#c9a84c]">Earn Free Pro Days!</span>
          </h2>
          <p className="text-gray-500 font-medium text-lg leading-relaxed">
            Help your fellow aspirants prepare smarter. When you invite friends, they get an instant <strong className="text-emerald-600">15% discount</strong> and you earn <strong className="text-[#1e3a5f]">+7 days of Pro subscription extension</strong> for every friend who upgrades.
          </p>
        </ScrollReveal>

        {/* How it Works Grid */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((item, index) => (
            <StaggerItem key={index} className="h-full">
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#c9a84c]/30 transition-all hover:-translate-y-2 group h-full flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-4 right-6 text-3xl font-black text-gray-100 group-hover:text-[#c9a84c]/20 transition-colors">
                  {item.step}
                </div>
                <div>
                  <div className={`h-14 w-14 rounded-2xl ${item.color} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform`}>
                    <item.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-black text-[#1e3a5f] mb-3 tracking-tight">{item.title}</h3>
                  <p className="text-gray-500 font-medium text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Win-Win Highlights Banner */}
        <ScrollReveal scaleOffset={0.97} className="bg-[#1e3a5f] rounded-[3rem] p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#c9a84c]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#c9a84c]/20 border border-[#c9a84c]/40 text-[#c9a84c] text-[10px] font-black uppercase tracking-widest">
                <Sparkles className="h-3.5 w-3.5" /> Unlimited Rewards
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                No cap on referral rewards. Refer 4 friends = <span className="text-[#c9a84c]">28 Days of Pro FREE!</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-bold text-gray-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#c9a84c]" />
                  <span>Instant 15% discount for your friend</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#c9a84c]" />
                  <span>+7 Days Pro added automatically to your account</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#c9a84c]" />
                  <span>1-click WhatsApp & Facebook sharing</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#c9a84c]" />
                  <span>Real-time status tracking in Dashboard</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-start lg:justify-end">
              <Link
                href="/auth/signup"
                className="w-full sm:w-auto px-8 py-4 bg-[#c9a84c] text-[#1e3a5f] text-xs font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-2"
              >
                Start Refer & Earn <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}
