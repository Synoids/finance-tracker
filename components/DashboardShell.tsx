'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Menu } from 'lucide-react';

interface DashboardShellProps {
  children: React.ReactNode;
  userEmail: string;
  userName: string;
  userAvatar?: string;
}

export default function DashboardShell({ 
  children, 
  userEmail, 
  userName, 
  userAvatar 
}: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar 
        userEmail={userEmail} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 md:px-6 py-4 flex-shrink-0" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 lg:hidden rounded-lg hover:bg-[var(--bg-card)] transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>

            {userAvatar && (
              <img
                src={userAvatar}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover hidden sm:block"
              />
            )}
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Welcome back, {userName} 👋
              </p>
              <p className="text-xs hidden xs:block" style={{ color: 'var(--text-muted)' }}>{userEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs px-2 sm:py-1 rounded-full font-medium" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
              ● Live
            </span>
          </div>
        </header>

        {/* Main scrollable content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
