export type TransactionType = 'income' | 'expense';
export type TimeRange = '7days' | 'month' | 'year' | 'all';

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  exclude_from_daily_limit: boolean;
  date: string; // ISO date string YYYY-MM-DD
  created_at: string;
}

export type TransactionInsert = Omit<Transaction, 'id' | 'created_at'>;
export type TransactionUpdate = Partial<TransactionInsert>;

export const INCOME_CATEGORIES = [
  'Gaji',
  'Freelance',
  'Investasi',
  'Bisnis',
  'Hadiah',
  'Pemasukan Lain',
] as const;

export const EXPENSE_CATEGORIES = [
  'Makanan & Restoran',
  'Transportasi',
  'Belanja',
  'Hiburan',
  'Tagihan & Utilitas',
  'Kesehatan',
  'Pendidikan',
  'Perjalanan',
  'Sewa & Perumahan',
  'Tabungan',
  'Pengeluaran Lain',
] as const;

export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface CategoryStat {
  category: string;
  amount: number;
  color: string;
}

export interface MonthlyComparison {
  month: string;
  income: number;
  expense: number;
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  month: string; // ISO date string YYYY-MM-DD
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  category: string | null;
  deadline: string | null;
  status: 'active' | 'completed';
  created_at: string;
}

export interface Insight {
  type: 'success' | 'warning' | 'info' | 'danger';
  title: string;
  description: string;
  icon: string;
}
