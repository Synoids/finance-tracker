'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/components/Sidebar';
import { cn } from '@/lib/utils';

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-secondary)] border-t border-[var(--border)] pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16 px-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
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
        })}
      </div>
    </nav>
  );
}
