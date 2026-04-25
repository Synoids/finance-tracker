'use client';

import { Insight } from "@/lib/types";
import { 
  TrendingDown, 
  TrendingUp, 
  Target, 
  AlertCircle, 
  Zap, 
  PieChart,
  LucideIcon 
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  TrendingDown,
  TrendingUp,
  Target,
  AlertCircle,
  Zap,
  PieChart
};

interface InsightCardProps {
  insights: Insight[];
}

export default function InsightCard({ insights }: InsightCardProps) {
  return (
    <div className="glass-card p-5 md:p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4 md:mb-6">
        <div className="p-2 rounded-lg bg-indigo-500/10">
          <Zap className="w-4 h-4 text-indigo-400" />
        </div>
        <h2 className="text-base md:text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Smart Insights</h2>
      </div>

      <div className="space-y-4 md:space-y-5 flex-1">
        {insights.map((insight, idx) => {
          const Icon = ICON_MAP[insight.icon] || PieChart;
          
          const colors = {
            success: { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e' },
            warning: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b' },
            danger: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' },
            info: { bg: 'rgba(99, 102, 241, 0.1)', text: '#6366f1' },
          }[insight.type];

          return (
            <div 
              key={idx} 
              className="flex gap-4 animate-fade-in-up" 
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: colors.bg, color: colors.text }}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  {insight.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {insight.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 pt-5 border-t border-[var(--border)]">
        <p className="text-[10px] uppercase font-bold tracking-widest text-center" style={{ color: 'var(--text-muted)' }}>
          Powered by Finance AI
        </p>
      </div>
    </div>
  );
}
