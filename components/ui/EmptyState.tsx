import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Reusable Empty State component for lists and dashboards
 */
export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  className 
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-12 text-center animate-fade-in",
      className
    )}>
      <div className="w-16 h-16 rounded-3xl bg-[var(--bg-secondary)] flex items-center justify-center mb-5 ring-8 ring-[rgba(255,255,255,0.02)] border border-[var(--border)]">
        <Icon className="w-8 h-8 text-[var(--text-muted)]" />
      </div>
      <h3 className="text-base font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      <p className="text-sm max-w-[260px] mx-auto mb-6 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        {description}
      </p>
      {action && (
        <div className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          {action}
        </div>
      )}
    </div>
  );
}
