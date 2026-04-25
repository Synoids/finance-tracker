'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatNumber } from '@/lib/utils';
import { DailyHistory } from '@/lib/utils';

interface CashFlowLineChartProps {
  data: DailyHistory[];
}

export default function CashFlowLineChart({ data }: CashFlowLineChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
            minTickGap={30}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
            tickFormatter={(value) => `Rp ${formatNumber(value)}`}
            width={80}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload as DailyHistory;
                return (
                  <div className="glass-card p-3 border border-indigo-500/20 shadow-xl">
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                      {data.date}
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-xs text-[var(--text-secondary)]">Saldo:</span>
                        <span className="text-sm font-bold text-indigo-400">Rp {formatNumber(data.balance)}</span>
                      </div>
                      {data.income > 0 && (
                        <div className="flex items-center justify-between gap-8">
                          <span className="text-[10px] text-[var(--text-muted)]">Masuk:</span>
                          <span className="text-xs font-medium text-green-400">+{formatNumber(data.income)}</span>
                        </div>
                      )}
                      {data.expense > 0 && (
                        <div className="flex items-center justify-between gap-8">
                          <span className="text-[10px] text-[var(--text-muted)]">Keluar:</span>
                          <span className="text-xs font-medium text-red-400">-{formatNumber(data.expense)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="balance"
            stroke="#6366f1"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorBalance)"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
