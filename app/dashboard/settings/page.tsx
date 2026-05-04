'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useDashboard } from '@/components/dashboard/DashboardProvider';
import { useUpgradeModal } from '@/lib/UpgradeModalContext';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { ProfileSection } from '@/components/settings/ProfileSection';
import { SecuritySection } from '@/components/settings/SecuritySection';
import { ExamsSection } from '@/components/settings/ExamsSection';
import { SubscriptionSection } from '@/components/settings/SubscriptionSection';
import { NotificationsSection } from '@/components/settings/NotificationsSection';
import { StudyPrefsSection } from '@/components/settings/StudyPrefsSection';
import { DataPrivacySection } from '@/components/settings/DataPrivacySection';
import { PrivacyPolicySection } from '@/components/settings/PrivacyPolicySection';
import { DangerZoneSection } from '@/components/settings/DangerZoneSection';
import { HelpSection } from '@/components/settings/HelpSection';

import {
  User, ShieldCheck, BookOpen, CreditCard, Bell,
  SlidersHorizontal, Database, FileText, AlertTriangle,
  HelpCircle
} from 'lucide-react';

const SECTIONS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Account & Security', icon: ShieldCheck },
  { id: 'exams', label: 'My Exams', icon: BookOpen },
  { id: 'subscription', label: 'Subscription & Billing', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'study-prefs', label: 'Study Preferences', icon: SlidersHorizontal },
  { id: 'data-privacy', label: 'Data & Privacy', icon: Database },
  { id: 'privacy-policy', label: 'Privacy Policy', icon: FileText },
  { id: 'danger-zone', label: 'Danger Zone', icon: AlertTriangle },
  { id: 'help', label: 'Help', icon: HelpCircle },
];

export default function SettingsPage() {
  const supabase = createClient();
  const dashboard = useDashboard();
  const { showUpgradeModal } = useUpgradeModal();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activeSection, setActiveSection] = useState('profile');
  const [dirtySet, setDirtySet] = useState<Set<string>>(new Set());
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const markDirty = useCallback((id: string) => {
    setDirtySet(prev => {
      if (prev.has(id)) return prev;
      return new Set(prev).add(id);
    });
  }, []);

  const clearDirty = useCallback((id: string) => {
    setDirtySet(prev => {
      if (!prev.has(id)) return prev;
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
  }, []);

  // Load user + profile
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(prof);
      setLoading(false);
    })();
  }, [supabase]);

  // Intersection observer for active section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-100px 0px -60% 0px', threshold: 0.1 }
    );
    Object.values(sectionRefs.current).forEach(el => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [loading]);

  // Warn on navigate away with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirtySet.size > 0) { e.preventDefault(); }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirtySet]);

  const scrollTo = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) return (
    <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
      <Skeleton className="h-10 w-64 rounded-xl" />
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-3 space-y-2">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-10 w-full rounded-xl" />)}</div>
        <div className="col-span-9"><Skeleton className="h-[600px] w-full rounded-2xl" /></div>
      </div>
    </div>
  );

  const sharedProps = { user, profile, supabase, markDirty, clearDirty, dashboard, showUpgradeModal, setProfile };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 px-1">
        <span className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Control Center</span>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mt-1">Settings</h1>
        <p className="text-sm text-subtle font-medium mt-1">Manage your profile, security, preferences, and account.</p>
      </div>

      {/* Mobile pill tabs */}
      <div className="md:hidden sticky top-16 z-30 bg-background/80 backdrop-blur-md border-b border-border-subtle -mx-4 px-4 py-2 mb-6">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeSection === s.id
                  ? 'bg-orange-600 text-white'
                  : 'bg-surface border border-border-subtle text-subtle'
              }`}
            >
              <s.icon className="h-3 w-3" />
              {s.label}
              {dirtySet.has(s.id) && <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Desktop sticky left nav */}
        <nav className="hidden md:block md:col-span-3 sticky top-24">
          <div className="space-y-1">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all text-left ${
                  activeSection === s.id
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20'
                    : 'text-subtle hover:bg-surface hover:text-foreground'
                } ${s.id === 'danger-zone' && activeSection !== s.id ? 'text-red-500' : ''}`}
              >
                <s.icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1">{s.label}</span>
                {dirtySet.has(s.id) && <span className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />}
              </button>
            ))}
          </div>
        </nav>

        {/* Main content */}
        <div className="md:col-span-9 space-y-8">
          <div ref={el => { sectionRefs.current['profile'] = el; }} id="profile">
            <ProfileSection {...sharedProps} />
          </div>
          <div ref={el => { sectionRefs.current['security'] = el; }} id="security">
            <SecuritySection {...sharedProps} />
          </div>
          <div ref={el => { sectionRefs.current['exams'] = el; }} id="exams">
            <ExamsSection {...sharedProps} />
          </div>
          <div ref={el => { sectionRefs.current['subscription'] = el; }} id="subscription">
            <SubscriptionSection {...sharedProps} />
          </div>
          <div ref={el => { sectionRefs.current['notifications'] = el; }} id="notifications">
            <NotificationsSection {...sharedProps} />
          </div>
          <div ref={el => { sectionRefs.current['study-prefs'] = el; }} id="study-prefs">
            <StudyPrefsSection {...sharedProps} />
          </div>
          <div ref={el => { sectionRefs.current['data-privacy'] = el; }} id="data-privacy">
            <DataPrivacySection {...sharedProps} />
          </div>
          <div ref={el => { sectionRefs.current['privacy-policy'] = el; }} id="privacy-policy">
            <PrivacyPolicySection />
          </div>
          <div ref={el => { sectionRefs.current['danger-zone'] = el; }} id="danger-zone">
            <DangerZoneSection {...sharedProps} />
          </div>
          <div ref={el => { sectionRefs.current['help'] = el; }} id="help">
            <HelpSection />
          </div>
        </div>
      </div>
    </div>
  );
}
