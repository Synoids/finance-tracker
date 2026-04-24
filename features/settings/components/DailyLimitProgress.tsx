import { formatCurrency, cn } from "@/lib/utils";
import { Zap, AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface DailyLimitProgressProps {
  totalToday: number;
  dailyLimit: number;
}

export default function DailyLimitProgress({ totalToday, dailyLimit }: DailyLimitProgressProps) {
  // If limit is not set, we don't show the component
  if (!dailyLimit || dailyLimit <= 0) return null;

  const percentage = Math.min((totalToday / dailyLimit) * 100, 100);
  const isOverLimit = totalToday >= dailyLimit;

  let barColor = "bg-emerald-500";
  let textColor = "text-emerald-500";
  let bgIcon = "bg-emerald-500/10";
  let Icon = CheckCircle2;

  if (percentage >= 100) {
    barColor = "bg-red-500";
    textColor = "text-red-500";
    bgIcon = "bg-red-500/10";
    Icon = AlertTriangle;
  } else if (percentage >= 70) {
    barColor = "bg-amber-500";
    textColor = "text-amber-500";
    bgIcon = "bg-amber-500/10";
    Icon = AlertTriangle;
  }

  return (
    <div className="glass-card p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-xl", bgIcon)}>
            <Zap className={cn("w-5 h-5", textColor)} />
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Limit Harian</h3>
            <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>
              Daily Spending Control
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={cn("text-lg font-bold", textColor)}>
            {percentage.toFixed(0)}%
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-medium">
          <span style={{ color: 'var(--text-secondary)' }}>Penggunaan Hari Ini</span>
          <div className="flex items-center gap-1.5">
            <span style={{ color: 'var(--text-primary)' }}>{formatCurrency(totalToday)}</span>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            <span style={{ color: 'var(--text-muted)' }}>{formatCurrency(dailyLimit)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-3 w-full bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden p-0.5 border border-[var(--border)]">
          <div 
            className={cn("h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.2)]", barColor)}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--border)] mt-4">
          <div className="flex items-center gap-2">
            <Icon className={cn("w-3.5 h-3.5", textColor)} />
            <p className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
              {isOverLimit 
                ? "Waspada! Limit tercapai." 
                : `${formatCurrency(dailyLimit - totalToday)} lagi.`}
            </p>
          </div>
          <Link href="/settings" className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
            Ubah Limit di Pengaturan →
          </Link>
        </div>
      </div>
    </div>
  );
}
