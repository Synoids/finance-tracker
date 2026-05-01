'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';
import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart3,
  Settings,
  TrendingUp,
  LogOut,
  X,
  PiggyBank,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard',     label: 'Dasbor',     icon: LayoutDashboard },
  { href: '/transactions',  label: 'Transaksi',  icon: ArrowLeftRight },
  { href: '/goals',         label: 'Target Menabung', icon: PiggyBank },
  { href: '/analytics',     label: 'Analitik',     icon: BarChart3 },
  { href: '/settings',      label: 'Pengaturan',      icon: Settings },
];

export { NAV_ITEMS };

interface SidebarProps {
  userEmail: string;
}

export default function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <>
      <aside
        className="hidden lg:flex static inset-y-0 left-0 w-64 bg-[var(--bg-secondary)] border-r border-[var(--border)] z-50 flex-col p-4 h-full"
      >
        {/* Header/Logo */}
        <div className="flex items-center justify-between mb-6 px-2 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>FinanceFlow</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Finance Tracker</p>
            </div>
          </div>
          

        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider px-3 mb-2" style={{ color: 'var(--text-muted)' }}>
            Menu
          </p>
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                id={`nav-${label.toLowerCase()}`}
                className={cn(
                  "sidebar-link",
                  isActive && "active"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="mt-auto pt-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl mb-2 bg-[var(--bg-card)]">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{userEmail}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Personal Account</p>
            </div>
          </div>
          <button
            id="sidebar-logout"
            onClick={handleLogout}
            className="sidebar-link w-full text-left font-medium text-red-400 hover:text-red-300"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
