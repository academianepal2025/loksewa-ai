'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Calendar, 
  Lightbulb, 
  PenTool, 
  BookOpen 
} from 'lucide-react';
import { useDashboard } from './DashboardProvider';

const navItems = [
  { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'study_plan', href: '/dashboard/study-plan', icon: Calendar },
  { key: 'guru', href: '/dashboard/guru', icon: Lightbulb },
  { key: 'practice', href: '/dashboard/practice', icon: PenTool },
  { key: 'study_notes', href: '/dashboard/study-notes', icon: BookOpen },
];

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useDashboard();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      // Hide bottom nav if viewport height is small (likely keyboard open)
      if (window.innerHeight < 500) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isVisible) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[60] bg-surface/80 backdrop-blur-lg border-t border-border-subtle md:hidden h-20 px-2 sm:px-4 px-safe flex items-center justify-around pb-safe animate-in slide-in-from-bottom duration-300">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] gap-1 transition-all ${
              isActive ? 'text-[#c9a84c]' : 'text-subtle'
            }`}
          >
            <item.icon className={`h-5 w-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {t(item.key as any).split(' ')[0]} {/* Keep it short for mobile */}
            </span>
            {isActive && (
              <span className="absolute bottom-2 h-1 w-1 rounded-full bg-[#c9a84c] shadow-[0_0_8px_rgba(201,168,76,0.5)]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
