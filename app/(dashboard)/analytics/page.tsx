'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Transaction, TimeRange } from '@/lib/types';
import { groupByCategory, groupByMonth, formatCurrency, filterTransactionsByRange, groupByDay, calculateSpendingForecast } from '@/lib/utils';
import ExpensesPieChart from '@/components/Charts/ExpensesPieChart';
import IncomeExpenseBarChart from '@/components/Charts/IncomeExpenseBarChart';
import CashFlowLineChart from '@/components/Charts/CashFlowLineChart';
import ForecastCard from '@/features/analytics/components/ForecastCard';
import { getBudgetsByMonth } from '@/features/budgets/queries';
import { BarChart3, PieChart, TrendingUp, Calendar, LineChart } from 'lucide-react';

export default function AnalyticsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [range, setRange] = useState<TimeRange>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const currentMonthStr = new Date().toISOString().split('T')[0].slice(0, 8) + '01';

      const [txRes, budgetRes] = await Promise.all([
        supabase.from('transactions').select('*').order('date', { ascending: false }),
        supabase.from('budgets').select('amount').eq('month', currentMonthStr).eq('user_id', user.id)
      ]);

      setTransactions(txRes.data as Transaction[] ?? []);
      
      const totalB = (budgetRes.data as { amount: number }[] || []).reduce((sum, b) => sum + Number(b.amount), 0);
      setTotalBudget(totalB);
      
      setLoading(false);
    }
    load();
  }, []);

  const filteredTransactions = filterTransactionsByRange(transactions, range);
  const categoryStats = groupByCategory(filteredTransactions);
  const monthlyStats  = groupByMonth(filteredTransactions);
  const dailyStats    = groupByDay(filteredTransactions);

  const totalIncome  = filteredTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filteredTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const savingsRate  = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  const RANGES: { value: TimeRange; label: string }[] = [
    { value: '7days', label: '7 Hari' },
    { value: 'month', label: 'Bulan Ini' },
    { value: 'year', label: 'Tahun Ini' },
    { value: 'all', label: 'Semua' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Analitik</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Ringkasan visual aktivitas keuangan Anda</p>
        </div>

        {/* Time Filter Tabs */}
        <div className="flex p-1 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] self-start sm:self-center overflow-x-auto max-w-full no-scrollbar">
          <div className="flex flex-nowrap gap-1">
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                  range === r.value 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <span className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Belum ada data. Tambahkan transaksi untuk melihat analitik.</p>
        </div>
      ) : (
        <>
          {/* Summary metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Pemasukan',  val: formatCurrency(totalIncome),  color: '#22c55e' },
              { label: 'Total Pengeluaran', val: formatCurrency(totalExpense), color: '#ef4444' },
              { label: 'Tingkat Tabungan',  val: `${savingsRate.toFixed(1)}%`, color: '#6366f1' },
            ].map((s) => (
              <div key={s.label} className="glass-card p-5 animate-fade-in-up">
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
                <p className="text-2xl font-bold" style={{ color: s.color }}>{s.val}</p>
              </div>
            ))}
          </div>

          {/* Forecast Card - Only for Month range */}
          {range === 'month' && (
            <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <ForecastCard 
                currentExpenses={totalExpense} 
                totalBudget={totalBudget} 
                forecast={calculateSpendingForecast(filteredTransactions, totalExpense, totalBudget)} 
              />
            </div>
          )}

          {/* Cash Flow Chart */}
          <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-2 mb-6">
              <LineChart className="w-4 h-4" style={{ color: '#a5b4fc' }} />
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Tren Arus Kas (Saldo Kumulatif)</h2>
            </div>
            {dailyStats.length === 0 ? (
              <p className="text-sm text-center py-12" style={{ color: 'var(--text-muted)' }}>Tidak ada data harian untuk periode ini</p>
            ) : (
              <CashFlowLineChart data={dailyStats} />
            )}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Pie chart */}
            <div className="glass-card p-6 animate-fade-in-up">
              <div className="flex items-center gap-2 mb-5">
                <PieChart className="w-4 h-4" style={{ color: '#a5b4fc' }} />
                <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Pengeluaran berdasarkan Kategori</h2>
              </div>
              {categoryStats.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>Tidak ada data pengeluaran</p>
              ) : (
                <ExpensesPieChart data={categoryStats} />
              )}
            </div>

            {/* Bar chart */}
            <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center gap-2 mb-5">
                <BarChart3 className="w-4 h-4" style={{ color: '#a5b4fc' }} />
                <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Pemasukan vs Pengeluaran (Bulanan)</h2>
              </div>
              {monthlyStats.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>Tidak ada data bulanan</p>
              ) : (
                <IncomeExpenseBarChart data={monthlyStats} />
              )}
            </div>
          </div>

          {/* Category breakdown table */}
          {categoryStats.length > 0 && (
            <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp className="w-4 h-4" style={{ color: '#a5b4fc' }} />
                <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Rincian Pengeluaran</h2>
              </div>
              <div className="space-y-3">
                {categoryStats.map((stat) => {
                  const pct = totalExpense > 0 ? (stat.amount / totalExpense) * 100 : 0;
                  return (
                    <div key={stat.category}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{stat.category}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{pct.toFixed(1)}%</span>
                          <span className="text-sm font-semibold" style={{ color: stat.color }}>{formatCurrency(stat.amount)}</span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: stat.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
