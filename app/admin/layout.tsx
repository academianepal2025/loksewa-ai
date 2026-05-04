'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import {
  ShieldCheck,
  CreditCard,
  Users,
  LayoutDashboard,
  ChevronLeft,
  Bell,
  BarChart3,
  Sun,
  Moon
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const navItems = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Payments', href: '/admin/payments', icon: CreditCard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Stats', href: '/admin/stats', icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/signin'); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (!profile?.is_admin) { router.push('/dashboard'); return; }

      const { count } = await supabase
        .from('payment_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      setPendingCount(count || 0);
      setLoading(false);
    }
    checkAdmin();
  }, [supabase, router]);

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <Skeleton className="h-4 w-48" />
      <p className="text-[10px] font-bold text-subtle uppercase tracking-widest mt-4">Verifying Admin Access...</p>
    </div>
  );

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname?.startsWith(href) || false;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 bg-surface border-r border-border-subtle">
        <div className="p-6 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <ShieldCheck className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground tracking-tight">Admin Panel</p>
              <p className="text-[9px] font-bold text-subtle uppercase tracking-widest">Command Center</p>
            </div>
          </div>
          <Link href="/dashboard" className="p-2 hover:bg-background rounded-xl transition-all text-subtle hover:text-foreground" title="Back to Dashboard">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  active
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-subtle hover:bg-background hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </div>
                {item.href === '/admin/payments' && pendingCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${active ? 'bg-white text-indigo-600' : 'bg-red-500 text-white animate-pulse-badge'}`}>
                    {pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border-subtle space-y-3">
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-subtle hover:text-foreground hover:bg-background transition-all"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
          )}
          <div className="bg-indigo-600/5 border border-indigo-600/10 rounded-xl p-4">
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">SYSTEM STATUS</p>
            <p className="text-xs font-medium text-foreground">Operational • v2.0</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:pl-64 min-h-screen pb-20 md:pb-0">
        <header className={`h-14 ${theme === 'dark' ? 'admin-header' : 'admin-header-light'} flex items-center justify-between px-6 sm:px-8 sticky top-0 z-40`}>
          <h2 className={`text-xs font-bold uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-700'}`}>
            {navItems.find(i => isActive(i.href))?.label || 'Administration'}
          </h2>
          <div className="flex items-center gap-4">
            <button className="p-2 text-indigo-400 hover:text-white transition-all relative">
              <Bell className="h-4 w-4" />
              {pendingCount > 0 && <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full animate-pulse-badge" />}
            </button>
            <div className="h-7 w-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shadow-lg shadow-indigo-600/20">
              AD
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-lg border-t border-border-subtle flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl min-w-[60px] transition-all relative ${
                active ? 'text-indigo-600' : 'text-subtle'
              }`}
            >
              <item.icon className={`h-5 w-5 ${active ? 'scale-110' : ''} transition-transform`} />
              <span className="text-[9px] font-bold uppercase tracking-wider mt-1">{item.label}</span>
              {item.href === '/admin/payments' && pendingCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white rounded-full text-[8px] font-bold flex items-center justify-center animate-pulse-badge">
                  {pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
