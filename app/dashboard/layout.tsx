'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';

import { 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  FileText, 
  Lightbulb, 
  PenTool, 
  BarChart3, 
  Settings,
  LogOut,
  User,
  Sun,
  Moon,
  Menu,
  X,
  Sparkles
} from 'lucide-react';

import { DashboardProvider, useDashboard } from '@/components/dashboard/DashboardProvider';
import { OnboardingModal } from '@/components/dashboard/OnboardingModal';
import { BottomNav } from '@/components/dashboard/BottomNav';
import { InstallPrompt } from '@/components/dashboard/InstallPrompt';
import { UpgradeModalProvider, useUpgradeModal } from '@/lib/UpgradeModalContext';
import { UpgradeModal } from '@/components/UpgradeModal';
import { PaymentFlowModal } from '@/components/PaymentFlowModal';
import { PlanBanner } from '@/components/dashboard/PlanBanner';
import { ShieldAlert } from 'lucide-react';

const navItems = [
  { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'exams', href: '/dashboard/exams', icon: BookOpen },
  { key: 'study_plan', href: '/dashboard/study-plan', icon: Calendar },
  { key: 'documents', href: '/dashboard/documents', icon: FileText },
  { key: 'guru', href: '/dashboard/guru', icon: Lightbulb },
  { key: 'practice', href: '/dashboard/practice', icon: PenTool },
  { key: 'study_notes', href: '/dashboard/study-notes', icon: BookOpen },
  { key: 'performance', href: '/dashboard/performance', icon: BarChart3 },
  { key: 'intelligence', href: '/dashboard/intelligence', icon: Sparkles },
  { key: 'settings', href: '/dashboard/settings', icon: Settings },
];

function DashboardContent({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const router = useRouter();
  const currentPath = usePathname() || '/dashboard';
  const { theme, setTheme } = useTheme();
  const { t, language, isAdmin } = useDashboard();
  const { setSelectedPlan, selectedPlan } = useUpgradeModal();
  const [mounted, setMounted] = useState(false);
  const [fullName, setFullName] = useState('User');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [pendingAdminCount, setPendingAdminCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/auth/signin';
        return;
      }
      setFullName(session.user.user_metadata?.full_name || 'User');
      // Fetch pending count for admin badge
      if (isAdmin) {
        const { count } = await supabase
          .from('payment_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
        setPendingAdminCount(count || 0);
      }
    };
    init();
  }, [supabase, router, isAdmin]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row transition-colors duration-300">
      <OnboardingModal />
      <InstallPrompt />
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 bg-surface border-r border-border-subtle">
        <div className="flex items-center h-16 px-6 font-bold text-xl tracking-tighter text-orange-600">
          <span>Loksewa</span><span className="text-orange-800 ml-0.5">AI</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-6 space-y-1 px-4">
          {navItems.map((item) => {
            const isActive = currentPath === item.href || (item.href !== '/dashboard' && currentPath.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-2.5 text-sm font-bold rounded-xl transition-all group min-h-[44px] ${
                  isActive 
                  ? 'bg-orange-600 text-background shadow-lg shadow-primary/20' 
                  : 'text-subtle hover:bg-background hover:text-foreground'
                }`}
              >
                <item.icon className={`mr-3 h-4 w-4 transition-all ${isActive ? 'opacity-100 scale-110' : 'opacity-70 group-hover:opacity-100 group-hover:scale-110'}`} />
                {t(item.key as any)}
              </Link>
            );
          })}

          {isAdmin && (
            <div className="pt-6 mt-6 border-t border-border-subtle">
               <p className="px-4 text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-2">Command Center</p>
               <Link
                href="/admin"
                className={`flex items-center justify-between px-4 py-2.5 text-sm font-bold rounded-xl transition-all group min-h-[44px] ${
                  currentPath.startsWith('/admin') 
                  ? 'bg-orange-600 text-background shadow-lg shadow-primary/20' 
                  : 'text-subtle hover:bg-background hover:text-foreground'
                }`}
              >
                <div className="flex items-center">
                  <ShieldAlert className="mr-3 h-4 w-4" />
                  Admin Console
                </div>
                {pendingAdminCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold animate-pulse-badge ${
                    currentPath.startsWith('/admin')
                    ? 'bg-background text-orange-600'
                    : 'bg-red-500 text-white'
                  }`}>{pendingAdminCount}</span>
                )}
              </Link>
            </div>
          )}
        </nav>
        <div className="p-4 border-t border-border-subtle">
           <div className="bg-background rounded-xl p-3 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-surface border border-border-subtle flex items-center justify-center">
                <User className="h-4 w-4 text-muted" />
              </div>
               <div className="flex-1 min-w-0">
                <p className="text-[9px] font-bold truncate text-subtle uppercase tracking-wider">PROFILE</p>
                <p className="text-xs font-bold truncate text-foreground">{fullName}</p>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-h-screen">
        <PlanBanner />
        <UpgradeModal onSelectPlan={(plan) => { setSelectedPlan(plan); setIsPaymentModalOpen(true); }} />
        <PaymentFlowModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} selectedPlan={selectedPlan as any} />
        
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border-subtle h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link href="/dashboard" className="font-bold text-orange-600 md:hidden">
              Loksewa <span className="text-orange-800">AI</span>
            </Link>
            <div className="hidden md:block">
              <h2 className="text-[10px] font-bold text-orange-600/60 uppercase tracking-[0.2em]">
                {t('dashboard')} WORKSPACE
              </h2>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center gap-1 sm:gap-2">
               <button 
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 text-muted hover:text-foreground transition-colors rounded-lg hover:bg-background min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Toggle Theme"
               >
                 {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
               </button>
               
               <Link 
                  href="/dashboard/settings"
                  className="md:hidden p-2 text-muted hover:text-foreground transition-colors rounded-lg hover:bg-background min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Settings"
               >
                 <Settings className="h-4 w-4" />
               </Link>
            </div>

            <div className="h-6 w-px bg-border-subtle" />

            <form action="/auth/signout" method="post">
               <button
                type="submit"
                className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-muted hover:text-red-500 uppercase tracking-widest transition-colors min-h-[44px]"
                title={t('logout')}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{t('logout')}</span>
              </button>
            </form>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-8 lg:p-10 pb-32 md:pb-12 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      <BottomNav />
      <UpgradeModal onSelectPlan={(plan) => { setSelectedPlan(plan); setIsPaymentModalOpen(true); }} />
      <PaymentFlowModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} selectedPlan={selectedPlan} />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <UpgradeModalProvider>
        <DashboardContent>{children}</DashboardContent>
      </UpgradeModalProvider>
    </DashboardProvider>
  );
}
