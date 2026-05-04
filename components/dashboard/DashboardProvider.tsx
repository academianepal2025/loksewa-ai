'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { translations, TranslationKey, Language } from '@/lib/translations';

interface DashboardContextType {
  language: Language;
  theme: 'indigo' | 'orange';
  fontScale: 'sm' | 'md' | 'lg';
  activeExamId: string | null;
  isAdmin: boolean;
  isPro: boolean;
  subscription: any | null;
  t: (key: TranslationKey) => string;
  updatePreference: (key: string, value: string) => Promise<void>;
  setActiveExamId: (id: string) => void;
  showOnboarding: boolean;
  completeOnboarding: (lang: Language) => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<'indigo' | 'orange'>('orange'); // Default to orange now
  const [fontScale, setFontScale] = useState<'sm' | 'md' | 'lg'>('md');
  const [activeExamId, setActiveExamId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [subscription, setSubscription] = useState<any | null>(null);

  // ── Translation Logic ────────────────────────────────────────────────
  const t = useCallback((key: TranslationKey) => {
    return translations[language][key] || translations['en'][key] || key;
  }, [language]);

  // ── Apply Preferences to DOM ──────────────────────────────────────────
  const applyPreferences = useCallback((l: Language, th: string, fs: string) => {
    const root = document.documentElement;
    root.classList.remove('theme-orange', 'theme-indigo', 'font-scale-sm', 'font-scale-md', 'font-scale-lg');
    root.classList.add(`theme-${th}`, `font-scale-${fs}`);
    setLanguage(l);
    setTheme(th as any);
    setFontScale(fs as any);
  }, []);

  // ── Sync Logic ────────────────────────────────────────────────────────
  const fetchPrefs = useCallback(async (uid: string) => {
    // 1. First, check LocalStorage for instant persistence
    const local = localStorage.getItem('loksewa_prefs');
    let initialPrefs = local ? JSON.parse(local) : null;

    if (initialPrefs) {
      applyPreferences(initialPrefs.language || 'en', initialPrefs.brand_theme || 'orange', initialPrefs.reading_font_scale || 'md');
      setShowOnboarding(false);
    }

    // 2. Then, fetch from DB to see if we have cloud updates
    const { data: prefsArr } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', uid)
      .order('updated_at', { ascending: false })
      .limit(1);
    
    const data = prefsArr?.[0];
    
    if (data) {
      applyPreferences(data.language || 'en', data.brand_theme || 'orange', data.reading_font_scale || 'md');
      setShowOnboarding(false);
      // Sync cloud to local
      localStorage.setItem('loksewa_prefs', JSON.stringify(data));
    } else if (!initialPrefs) {
      setShowOnboarding(true);
      applyPreferences('en', 'orange', 'md');
    }
  }, [supabase, applyPreferences]);

  useEffect(() => {
    let channel: any;
    let mounted = true;

    async function setupRealtime() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;

      const user = session?.user;
      if (user) {
        setUserId(user.id);
        fetchPrefs(user.id);

        // Fetch Profile & Subscription
        const [{ data: prof }, { data: sub }] = await Promise.all([
          supabase.from('profiles').select('is_admin').eq('id', user.id).single(),
          supabase.from('subscriptions').select('*').eq('user_id', user.id).eq('status', 'active').gt('expires_at', new Date().toISOString()).maybeSingle()
        ]);

        if (prof) setIsAdmin(!!prof.is_admin);
        if (sub) {
          setIsPro(true);
          setSubscription(sub);
        }

        const channelName = `prefs-${user.id}`;
        
        // Remove existing channel with same name if any
        const existingChannel = supabase.getChannels().find((c: any) => c.topic === `realtime:public:user_preferences:user_id=eq.${user.id}` || c.name === channelName);
        if (existingChannel) {
          await supabase.removeChannel(existingChannel);
        }

        if (!mounted) return;

        channel = supabase
          .channel(channelName)
          .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'user_preferences',
            filter: `user_id=eq.${user.id}` 
          }, (payload: any) => {
            if (!mounted) return;
            const newData = payload.new;
            if (newData) {
              applyPreferences(newData.language, newData.brand_theme, newData.reading_font_scale);
            }
          })
          .subscribe();
      }
    }

    setupRealtime();

    return () => {
      mounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [supabase, fetchPrefs, applyPreferences]);

  const updatePreference = async (key: string, value: string) => {
    if (!userId) return;
    
    const newPrefs = {
      user_id: userId,
      language: key === 'language' ? value : language,
      brand_theme: key === 'theme' ? value : theme,
      reading_font_scale: key === 'fontScale' ? value : fontScale,
      updated_at: new Date().toISOString()
    };

    applyPreferences(newPrefs.language as Language, newPrefs.brand_theme, newPrefs.reading_font_scale);
    
    // Save to LocalStorage immediately
    localStorage.setItem('loksewa_prefs', JSON.stringify(newPrefs));

    // Upsert to DB
    try {
      await supabase.from('user_preferences').upsert(newPrefs);
    } catch (e) {
      console.warn("DB Sync failed, persisting locally only", e);
    }
  };

  const completeOnboarding = async (lang: Language) => {
    if (!userId) return;
    // We manually set state here for speed, then sync
    setLanguage(lang);
    setShowOnboarding(false);
    await updatePreference('language', lang);
  };

  return (
    <DashboardContext.Provider value={{ 
      language, 
      theme, 
      fontScale, 
      activeExamId, 
      isAdmin,
      isPro,
      subscription,
      t, 
      updatePreference, 
      setActiveExamId,
      showOnboarding,
      completeOnboarding
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
