'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/components/Sidebar';
import { cn } from '@/lib/utils';
import { Plus, LucideIcon } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export default function MobileBottomNav() {
  const pathname = usePathname();

  // Split NAV_ITEMS: First 2 on left, next 2 on right
  const leftItems = NAV_ITEMS.slice(0, 2);
  const rightItems = NAV_ITEMS.slice(2, 4);

  const renderNavItem = ({ href, label, icon: Icon }: NavItem) => {
    const isActive = pathname === href || pathname.startsWith(href + '/');
    return (
      <Link
        key={href}
        href={href}
        className={cn(
          "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
          isActive ? "text-indigo-500" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        )}
      >
        <Icon className="w-5 h-5" />
        <span className="text-[10px] font-medium truncate w-full text-center px-1">{label}</span>
      </Link>
    );
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-secondary)] border-t border-[var(--border)] pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_20px_-6px_rgba(0,0,0,0.3)]">
      <div className="flex justify-between items-center h-16 px-2 relative">
        {/* Left Nav Items */}
        <div className="flex flex-1 justify-around h-full">
          {leftItems.map(renderNavItem)}
        </div>

        {/* Center FAB */}
        <div className="relative flex justify-center w-16 -mt-10">
          <Link
            href="/transactions/new"
            className="flex items-center justify-center w-14 h-14 rounded-full shadow-[0_8px_16px_rgba(99,102,241,0.4)] transition-transform active:scale-90"
            style={{ 
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: '4px solid var(--bg-secondary)'
            }}
          >
            <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
          </Link>
        </div>

        {/* Right Nav Items */}
        <div className="flex flex-1 justify-around h-full">
          {rightItems.map(renderNavItem)}
        </div>
      </div>
    </nav>
  );
}
