'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Gift, Copy, Check, Share2, Sparkles, Users, Award } from 'lucide-react';
import { toast } from 'sonner';

export function ReferralWidget() {
  const supabase = createClient();
  const [code, setCode] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ total: 0, rewarded: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReferralData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch referral code from profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('referral_code')
          .eq('id', user.id)
          .single();

        if (profile?.referral_code) {
          setCode(profile.referral_code);
        }

        // Fetch referral stats
        const { data: referrals } = await supabase
          .from('referrals')
          .select('id, status')
          .eq('referrer_id', user.id);

        if (referrals) {
          const rewardedCount = referrals.filter(r => r.status === 'rewarded').length;
          setStats({
            total: referrals.length,
            rewarded: rewardedCount,
          });
        }
      } catch (err) {
        console.error('Error loading referral data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadReferralData();
  }, [supabase]);

  const referralLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/auth/signup?ref=${code}` 
    : `https://www.loksewaai.com/auth/signup?ref=${code}`;

  const copyToClipboard = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success('Referral Link Copied!', { description: 'Share with your friends to give 15% discount.' });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const shareWhatsApp = () => {
    const text = `Hey! Join Loksewa AI using my referral link and get 15% OFF on Pro plans: ${referralLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="bg-surface border border-border-subtle rounded-2xl p-6 shadow-sm animate-pulse space-y-4">
        <div className="h-6 w-48 bg-background rounded" />
        <div className="h-20 bg-background rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border-subtle rounded-2xl p-6 shadow-sm relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Gift className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-black text-foreground tracking-tighter uppercase">Refer & Earn Rewards</h2>
          </div>
          <p className="text-xs text-subtle font-medium">
            Invite friends to Loksewa AI. They get <span className="font-bold text-emerald-500">15% OFF</span>, and you get <span className="font-bold text-accent">+7 Days Pro Extension</span> when they upgrade!
          </p>
        </div>
      </div>

      {/* Code & Link Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2 bg-background border border-border-subtle rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
          <div className="w-full sm:w-auto overflow-hidden">
            <span className="text-[10px] font-black text-subtle uppercase tracking-widest block mb-0.5">Your Referral Link</span>
            <p className="text-xs font-bold text-foreground truncate max-w-[280px] sm:max-w-[360px]">{referralLink}</p>
          </div>
          <button
            onClick={copyToClipboard}
            className="w-full sm:w-auto px-4 py-2.5 bg-primary text-accent rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all shrink-0 shadow-md"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy Link'}
          </button>
        </div>

        {/* Code Box */}
        <div className="bg-accent/5 border border-accent/20 rounded-xl p-3 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-black text-subtle uppercase tracking-widest mb-1">Your Code</span>
          <span className="text-base font-black text-accent tracking-wider font-mono bg-accent/10 px-3 py-1 rounded-md border border-accent/30">{code || 'LOK-XXXXX'}</span>
        </div>
      </div>

      {/* Social Share Buttons */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="text-[10px] font-black text-subtle uppercase tracking-widest mr-2 flex items-center gap-1">
          <Share2 className="h-3.5 w-3.5" /> Share via:
        </span>
        <button
          onClick={shareWhatsApp}
          className="px-3.5 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-emerald-500/20 transition-all"
        >
          WhatsApp
        </button>
        <button
          onClick={shareFacebook}
          className="px-3.5 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-500/20 transition-all"
        >
          Facebook
        </button>
      </div>

      {/* Referral Stats */}
      <div className="grid grid-cols-2 gap-4 border-t border-border-subtle pt-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-subtle uppercase tracking-widest">Friends Invited</p>
            <p className="text-lg font-black text-foreground">{stats.total}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-subtle uppercase tracking-widest">Rewards Unlocked (+7 Days)</p>
            <p className="text-lg font-black text-accent">{stats.rewarded}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
