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
  Sparkles,
  ChevronLeft,
  ChevronRight
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
  const [isCollapsed, setIsCollapsed] = useState(false);

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
      <aside className={`hidden md:flex ${isCollapsed ? 'w-20' : 'w-64'} flex-col fixed inset-y-0 z-50 bg-surface border-r border-border-subtle shadow-2xl shadow-primary/5 transition-all duration-300 ease-in-out group/sidebar`}>
        <div className={`flex items-center h-16 ${isCollapsed ? 'justify-center px-0' : 'px-6'} font-black text-2xl tracking-tighter text-[#1e3a5f] relative transition-all duration-300`}>
          {isCollapsed ? (
            <span className="flex items-center"><span className="text-[#1e3a5f]">L</span><span className="text-[#c9a84c]">A</span></span>
          ) : (
            <><span>Loksewa</span><span className="text-[#c9a84c] ml-0.5">AI</span></>
          )}
          
          {/* Toggle Button */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-[#1e3a5f] text-[#c9a84c] border border-[#c9a84c]/20 flex items-center justify-center shadow-lg hover:scale-110 transition-all opacity-0 group-hover/sidebar:opacity-100 z-50"
          >
            {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </div>
        
        <nav className={`flex-1 overflow-y-auto py-6 space-y-1 ${isCollapsed ? 'px-2' : 'px-4'} transition-all duration-300`}>
          {navItems.map((item) => {
            const isActive = currentPath === item.href || (item.href !== '/dashboard' && currentPath.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-4'} py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all group min-h-[44px] relative ${
                  isActive 
                  ? 'bg-[#1e3a5f] text-[#c9a84c] shadow-lg shadow-[#1e3a5f]/10 border border-[#c9a84c]/10' 
                  : 'text-subtle hover:bg-background hover:text-foreground'
                }`}
              >
                <item.icon className={`${isCollapsed ? 'mr-0' : 'mr-3'} h-4 w-4 transition-all ${isActive ? 'opacity-100 scale-110' : 'opacity-70 group-hover:opacity-100 group-hover:scale-110'}`} />
                {!isCollapsed && <span className="truncate">{t(item.key as any)}</span>}
                
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-3 py-2 bg-[#1e3a5f] text-[#c9a84c] text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[100] shadow-xl border border-[#c9a84c]/10">
                    {t(item.key as any)}
                  </div>
                )}
              </Link>
            );
          })}

          {isAdmin && (
            <div className={`pt-6 mt-6 border-t border-border-subtle ${isCollapsed ? 'px-0' : ''}`}>
               {!isCollapsed && <p className="px-4 text-[10px] font-black text-[#c9a84c] uppercase tracking-[0.2em] mb-2">Command Center</p>}
               <Link
                href="/admin"
                className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-between px-4'} py-2.5 text-sm font-black uppercase tracking-widest rounded-xl transition-all group min-h-[44px] relative ${
                  currentPath.startsWith('/admin') 
                  ? 'bg-[#1e3a5f] text-[#c9a84c] shadow-lg shadow-[#1e3a5f]/20' 
                  : 'text-subtle hover:bg-background hover:text-foreground'
                }`}
              >
                <div className="flex items-center">
                  <ShieldAlert className={`${isCollapsed ? 'mr-0' : 'mr-3'} h-4 w-4`} />
                  {!isCollapsed && <span>Admin Console</span>}
                </div>
                {pendingAdminCount > 0 && !isCollapsed && (
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black animate-pulse-badge ${
                    currentPath.startsWith('/admin')
                    ? 'bg-[#c9a84c] text-[#1e3a5f]'
                    : 'bg-red-500 text-white'
                  }`}>{pendingAdminCount}</span>
                )}
                
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-3 py-2 bg-[#1e3a5f] text-[#c9a84c] text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[100] shadow-xl border border-[#c9a84c]/10">
                    Admin Console {pendingAdminCount > 0 ? `(${pendingAdminCount})` : ''}
                  </div>
                )}
              </Link>
            </div>
          )}
        </nav>
        <div className={`p-4 border-t border-border-subtle transition-all duration-300 ${isCollapsed ? 'px-2' : 'px-4'}`}>
           <div className="flex items-center gap-3 mb-6 px-2">
             <div className="h-10 w-10 bg-[#c9a84c] rounded-xl flex items-center justify-center shadow-lg shadow-[#c9a84c]/20">
               <User className="h-5 w-5 text-[#1e3a5f]" />
             </div>
             {!isCollapsed && (
               <div className="truncate">
                 <p className="text-sm font-black text-foreground uppercase tracking-widest">{fullName}</p>
                 <p className="text-[9px] font-black text-[#c9a84c] uppercase tracking-widest">Premium Member</p>
               </div>
             )}
           </div>
           
           <div className="space-y-1 mt-4">
              <Link
                href="/dashboard/settings"
                className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-4'} py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all group min-h-[44px] relative ${
                  currentPath === '/dashboard/settings' 
                  ? 'bg-[#1e3a5f] text-[#c9a84c] shadow-lg shadow-[#1e3a5f]/20 border border-[#c9a84c]/10' 
                  : 'text-subtle hover:bg-background hover:text-foreground'
                }`}
              >
                <Settings className={`${isCollapsed ? 'mr-0' : 'mr-3'} h-4 w-4`} />
                {!isCollapsed && <span>{t('settings')}</span>}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-3 py-2 bg-[#1e3a5f] text-[#c9a84c] text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[100] shadow-xl border border-[#c9a84c]/10">
                    {t('settings')}
                  </div>
                )}
              </Link>

              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-4'} py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all group min-h-[44px] relative text-red-500 hover:bg-red-500/10`}
                >
                  <LogOut className={`${isCollapsed ? 'mr-0' : 'mr-3'} h-4 w-4`} />
                  {!isCollapsed && <span>{t('logout')}</span>}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-3 py-2 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[100] shadow-xl border border-red-500/10">
                      {t('logout')}
                    </div>
                  )}
                </button>
              </form>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col ${isCollapsed ? 'md:pl-20' : 'md:pl-64'} min-h-screen transition-all duration-300 ease-in-out`}>
        <PlanBanner />
        <UpgradeModal onSelectPlan={(plan) => { setSelectedPlan(plan); setIsPaymentModalOpen(true); }} />
        <PaymentFlowModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} selectedPlan={selectedPlan} />
        
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border-subtle h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link href="/dashboard" className="font-black text-[#1e3a5f] md:hidden">
              Loksewa <span className="text-[#c9a84c]">AI</span>
            </Link>
            <div className="hidden md:block">
              <h2 className="text-[10px] font-black text-[#1e3a5f]/40 uppercase tracking-[0.2em]">
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
                className="flex items-center gap-2 px-3 py-2 text-[10px] font-black text-muted hover:text-red-500 uppercase tracking-widest transition-colors min-h-[44px]"
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
