'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MonthlyComparison } from '@/lib/types';

interface IncomeExpenseBarChartProps {
  data: MonthlyComparison[];
}

export default function IncomeExpenseBarChart({ data }: IncomeExpenseBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No monthly data to display</p>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="month"
            stroke="var(--text-muted)"
            fontSize={12}
            tick={{ fill: 'var(--text-muted)' }}
          />
          <YAxis
            stroke="var(--text-muted)"
            fontSize={12}
            tick={{ fill: 'var(--text-muted)' }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip
            labelStyle={{ color: 'var(--text-primary)' }}
            contentStyle={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
            }}
          />
          <Bar dataKey="income" fill="#22c55e" radius={[2, 2, 0, 0]} />
          <Bar dataKey="expense" fill="#ef4444" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}