'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Transaction } from '@/lib/types';
import { groupByCategory, groupByMonth, formatCurrency } from '@/lib/utils';
import ExpensesPieChart from '@/components/Charts/ExpensesPieChart';
import IncomeExpenseBarChart from '@/components/Charts/IncomeExpenseBarChart';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';

export default function AnalyticsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      setTransactions(data as Transaction[] ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const categoryStats = groupByCategory(transactions);
  const monthlyStats  = groupByMonth(transactions);

  const totalIncome  = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const savingsRate  = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Analitik</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Ringkasan visual aktivitas keuangan Anda</p>
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
