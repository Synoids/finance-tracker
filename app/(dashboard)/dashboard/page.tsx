import { createClient } from '@/lib/supabaseServer';
import { Transaction } from '@/lib/types';
import { calculateDashboardStats, formatCurrency, formatDate, getCategoryColor } from '@/lib/utils';
import {
  Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Plus,
} from 'lucide-react';
import Link from 'next/link';
import RealtimeDate from '@/components/RealtimeDate';

import { getAccounts } from '@/features/accounts/queries';
import { TotalBalanceCard } from '@/features/accounts/components/TotalBalanceCard';
import { AccountsOverview } from '@/features/accounts/components/AccountsOverview';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: transactions = [] } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user!.id)
    .order('date', { ascending: false });

  const accounts = await getAccounts();

  const transactionList = transactions || [];
  const stats = calculateDashboardStats(transactionList);
  const recent = transactionList.slice(0, 5);

  const statCards = [
    {
      id: 'card-balance',
      label: 'Total Saldo',
      value: formatCurrency(stats.balance),
      icon: Wallet,
      color: stats.balance >= 0 ? '#6366f1' : '#ef4444',
      bg: stats.balance >= 0 ? 'rgba(99,102,241,0.15)' : 'rgba(239,68,68,0.15)',
      trend: stats.balance >= 0 ? '+' : '',
    },
    {
      id: 'card-income',
      label: 'Total Pemasukan',
      value: formatCurrency(stats.totalIncome),
      icon: TrendingUp,
      color: '#22c55e',
      bg: 'rgba(34,197,94,0.15)',
      trend: '+',
    },
    {
      id: 'card-expense',
      label: 'Total Pengeluaran',
      value: formatCurrency(stats.totalExpense),
      icon: TrendingDown,
      color: '#ef4444',
      bg: 'rgba(239,68,68,0.15)',
      trend: '-',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Ringkasan keuangan</p>
          <RealtimeDate />
        </div>
        <Link href="/transactions/new" id="add-transaction-btn" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Tambah Transaksi
        </Link>
      </div>

      {/* Stat Cards */}
      <TotalBalanceCard accounts={accounts} />

      <div className="mb-4">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Your Accounts</h2>
      </div>
      
      <AccountsOverview accounts={accounts} />

      {/* Recent Transactions */}
      <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '240ms' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Transaksi Terbaru</h2>
          <Link href="/transactions" className="text-xs font-medium flex items-center gap-1" style={{ color: '#a5b4fc' }}>
            Lihat semua <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--bg-secondary)' }}>
              <Wallet className="w-7 h-7" style={{ color: 'var(--text-muted)' }} />
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Belum ada transaksi</p>
            <p className="text-xs mt-1 mb-4" style={{ color: 'var(--text-muted)' }}>Tambahkan transaksi pertama Anda untuk memulai</p>
            <Link href="/transactions/new" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Tambah Transaksi
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3 rounded-xl transition-colors"
                style={{ background: 'var(--bg-secondary)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={{ background: getCategoryColor(t.category) + '22', color: getCategoryColor(t.category) }}
                  >
                    {t.category.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t.description || t.category}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {t.category} · {accounts.find(a => a.id === t.account_id)?.name || '—'} · {formatDate(t.date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold flex items-center gap-1" style={{ color: t.type === 'income' ? '#22c55e' : '#ef4444' }}>
                    {t.type === 'income' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {formatCurrency(t.amount)}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${t.type === 'income' ? 'income-badge' : 'expense-badge'}`}>
                    {t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
