'use client';

import { formatCurrency, formatNumber } from "@/lib/utils";
import { 
  TrendingUp, 
  TrendingDown,
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  Shield, 
  Info, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus,
  Lightbulb
} from "lucide-react";
import { ForecastData } from "@/lib/utils";

interface ForecastCardProps {
  currentExpenses: number;
  totalBudget: number;
  forecast: ForecastData;
}

export default function ForecastCard({ currentExpenses, totalBudget, forecast }: ForecastCardProps) {
  if (!forecast.hasEnoughData) {
    return (
      <div className="glass-card p-8 text-center flex flex-col items-center justify-center gap-4">
        <div className="p-3 rounded-full bg-indigo-500/10">
          <Info className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Data Belum Mencukupi</h3>
          <p className="text-sm max-w-xs mx-auto mt-1" style={{ color: 'var(--text-secondary)' }}>
            Sistem membutuhkan minimal 5 hari transaksi di bulan ini untuk memberikan prediksi yang akurat.
          </p>
        </div>
      </div>
    );
  }

  const riskColors = {
    safe: { text: '#22c55e', bg: 'rgba(34, 197, 94, 0.05)', border: 'rgba(34, 197, 94, 0.2)', icon: CheckCircle2, gradient: 'from-green-500/10 to-transparent' },
    warning: { text: '#f59e0b', bg: 'rgba(245, 158, 11, 0.05)', border: 'rgba(245, 158, 11, 0.2)', icon: AlertTriangle, gradient: 'from-amber-500/10 to-transparent' },
    danger: { text: '#ef4444', bg: 'rgba(239, 68, 68, 0.05)', border: 'rgba(239, 68, 68, 0.2)', icon: AlertTriangle, gradient: 'from-red-500/10 to-transparent' },
  }[forecast.riskLevel];

  const confidenceInfo = {
    low: { label: 'Rendah', color: '#94a3b8', description: 'Berdasarkan sedikit data harian.' },
    medium: { label: 'Menengah', color: '#6366f1', description: 'Data harian sudah mulai stabil.' },
    high: { label: 'Tinggi', color: '#22c55e', description: 'Prediksi sangat akurat mendekati akhir bulan.' },
  }[forecast.confidence];

  const TrendIcon = {
    up: ArrowUpRight,
    down: ArrowDownRight,
    stable: Minus
  }[forecast.trend];

  const trendColor = {
    up: '#ef4444',
    down: '#22c55e',
    stable: '#94a3b8'
  }[forecast.trend];

  const RiskIcon = riskColors.icon;

  return (
    <div className={`glass-card p-6 overflow-hidden relative border-t-2`} style={{ borderTopColor: riskColors.text }}>
      <div className={`absolute inset-0 bg-gradient-to-br ${riskColors.gradient} pointer-events-none`} />

      {/* Confidence & Trend Badges */}
      <div className="absolute top-6 right-6 flex flex-col items-end gap-2">
        <div className="group relative flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] shadow-sm cursor-help">
          <Shield className="w-3 h-3" style={{ color: confidenceInfo.color }} />
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Kepercayaan: <span style={{ color: confidenceInfo.color }}>{confidenceInfo.label}</span>
          </span>
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 w-48 p-2 rounded-lg bg-gray-900 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl border border-white/10">
            {confidenceInfo.description}
          </div>
        </div>

        {forecast.trend !== 'stable' && (
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] shadow-sm">
            <TrendIcon className="w-3 h-3" style={{ color: trendColor }} />
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Tren: <span style={{ color: trendColor }}>{forecast.trend === 'up' ? 'Meningkat' : 'Menurun'}</span>
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-8 relative z-10">
        <div className="p-2 rounded-lg bg-indigo-500/10">
          <Lightbulb className="w-4 h-4 text-indigo-400" />
        </div>
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>AI Spending Insights</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start relative z-10">
        <div className="space-y-6">
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Prediksi Pengeluaran Akhir Bulan</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black tracking-tight" style={{ color: riskColors.text }}>
                {formatCurrency(forecast.forecastedTotal)}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <div className="text-[10px] font-medium px-2 py-0.5 rounded bg-[var(--bg-secondary)]" style={{ color: 'var(--text-muted)' }}>
                Harian: {formatCurrency(forecast.dailyAverage)}
              </div>
              {totalBudget > 0 && (
                <div className="text-[10px] font-medium px-2 py-0.5 rounded bg-[var(--bg-secondary)]" style={{ color: 'var(--text-muted)' }}>
                  Anggaran: {formatCurrency(totalBudget)}
                </div>
              )}
            </div>
          </div>

          {/* Breakdown Section */}
          <div className="p-4 rounded-2xl bg-[var(--bg-secondary)]/50 border border-[var(--border)] space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Estimasi Sisa Bulan</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>Hari Kerja</p>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(forecast.breakdown.weekdayForecast)}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>Akhir Pekan</p>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(forecast.breakdown.weekendForecast)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Actionable Recommendations */}
          <div className="p-4 rounded-2xl border-l-4 shadow-sm" style={{ backgroundColor: riskColors.bg, borderColor: riskColors.text }}>
            <div className="flex items-start gap-3">
              <RiskIcon className="w-5 h-5 mt-0.5" style={{ color: riskColors.text }} />
              <div className="space-y-1">
                <p className="text-xs font-bold" style={{ color: riskColors.text }}>
                  {forecast.riskLevel === 'danger' ? 'Rekomendasi Pengetatan' : 
                   forecast.riskLevel === 'warning' ? 'Waspada Pengeluaran' : 'Saran Keuangan'}
                </p>
                <p className="text-[11px] leading-relaxed font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {forecast.recommendation}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
              <p className="text-[10px] uppercase font-bold tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Jatah Harian</p>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(forecast.remainingBudgetPerDay)}</p>
              <p className="text-[9px] mt-0.5 text-indigo-400">Agar tetap hemat</p>
            </div>
            <div className="p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
              <p className="text-[10px] uppercase font-bold tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Progres Waktu</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{forecast.percentOfMonthPassed.toFixed(0)}%</p>
                <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: `${forecast.percentOfMonthPassed}%` }} />
                </div>
              </div>
              <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{forecast.daysRemaining} hari lagi</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
