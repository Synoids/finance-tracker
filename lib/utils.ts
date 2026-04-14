import { format, parseISO } from 'date-fns';
import { Transaction, CategoryStat, MonthlyComparison, DashboardStats } from './types';

// ─── Formatting ───────────────────────────────────────────────────────────────

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
  }).format(amount);
}

export function parseFormattedNumber(value: string): number {
  // Remove all non-digit characters except comma and dot
  const cleaned = value.replace(/[^\d,.-]/g, '').replace(/,/g, '');
  return parseFloat(cleaned) || 0;
}

export function formatDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(parseISO(dateStr));
  } catch {
    return dateStr;
  }
}

export function formatMonth(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'short',
    }).format(parseISO(dateStr + '-01'));
  } catch {
    return dateStr;
  }
}

// ─── Category Colors ──────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  'Makanan & Restoran': '#f97316',
  'Transportasi':       '#3b82f6',
  'Belanja':            '#a855f7',
  'Hiburan':            '#ec4899',
  'Tagihan & Utilitas': '#ef4444',
  'Kesehatan':          '#14b8a6',
  'Pendidikan':         '#6366f1',
  'Perjalanan':         '#f59e0b',
  'Sewa & Perumahan':   '#84cc16',
  'Pengeluaran Lain':   '#6b7280',
  'Gaji':               '#22c55e',
  'Freelance':          '#10b981',
  'Investasi':          '#06b6d4',
  'Bisnis':             '#8b5cf6',
  'Hadiah':             '#f472b6',
  'Pemasukan Lain':     '#94a3b8',
};

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? '#6b7280';
}

// ─── Analytics helpers ────────────────────────────────────────────────────────

export function calculateDashboardStats(transactions: Transaction[]): DashboardStats {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  };
}

export function groupByCategory(transactions: Transaction[]): CategoryStat[] {
  const expenses = transactions.filter((t) => t.type === 'expense');
  const map: Record<string, number> = {};

  for (const t of expenses) {
    map[t.category] = (map[t.category] ?? 0) + t.amount;
  }

  return Object.entries(map)
    .map(([category, amount]) => ({
      category,
      amount,
      color: getCategoryColor(category),
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function groupByMonth(transactions: Transaction[]): MonthlyComparison[] {
  const map: Record<string, { income: number; expense: number }> = {};

  for (const t of transactions) {
    const monthKey = t.date.slice(0, 7); // YYYY-MM
    if (!map[monthKey]) map[monthKey] = { income: 0, expense: 0 };
    if (t.type === 'income') map[monthKey].income += t.amount;
    else map[monthKey].expense += t.amount;
  }

  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6) // last 6 months
    .map(([month, data]) => ({
      month: formatMonth(month),
      income: data.income,
      expense: data.expense,
    }));
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
