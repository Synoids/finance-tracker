import { format, parseISO } from 'date-fns';
import { Transaction, CategoryStat, MonthlyComparison, DashboardStats, TimeRange } from './types';

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

export function filterTransactionsByRange(transactions: Transaction[], range: TimeRange): Transaction[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  return transactions.filter(t => {
    const tDate = parseISO(t.date);
    
    if (range === '7days') {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return tDate >= sevenDaysAgo;
    }
    
    if (range === 'month') {
      return tDate.getMonth() === today.getMonth() && tDate.getFullYear() === today.getFullYear();
    }
    
    if (range === 'year') {
      return tDate.getFullYear() === today.getFullYear();
    }
    
    return true; // 'all'
  });
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

export interface DailyHistory {
  date: string;
  balance: number;
  income: number;
  expense: number;
}

export function groupByDay(transactions: Transaction[]): DailyHistory[] {
  const map: Record<string, { income: number; expense: number }> = {};
  
  // Group by date
  for (const t of transactions) {
    const dateKey = t.date; // YYYY-MM-DD
    if (!map[dateKey]) map[dateKey] = { income: 0, expense: 0 };
    if (t.type === 'income') map[dateKey].income += t.amount;
    else map[dateKey].expense += t.amount;
  }

  // Sort dates
  const sortedDates = Object.keys(map).sort();
  
  const history: DailyHistory[] = [];
  let cumulativeBalance = 0;

  for (const date of sortedDates) {
    const { income, expense } = map[date];
    cumulativeBalance += (income - expense);
    history.push({
      date: formatDate(date),
      balance: cumulativeBalance,
      income,
      expense
    });
  }

  return history;
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export interface ForecastData {
  forecastedTotal: number;
  dailyAverage: number;
  daysRemaining: number;
  percentOfMonthPassed: number;
  confidence: 'low' | 'medium' | 'high';
  riskLevel: 'safe' | 'warning' | 'danger';
  remainingBudgetPerDay: number;
  estimatedOverspend: number;
  hasEnoughData: boolean;
  trend: 'up' | 'down' | 'stable';
  breakdown: {
    weekdayForecast: number;
    weekendForecast: number;
  };
  recommendation: string;
}

export function calculateSpendingForecast(
  transactions: Transaction[], 
  currentExpenses: number,
  totalBudget: number
): ForecastData {
  const now = new Date();
  const today = now.getDate();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // 1. Exclude transactions flagged with exclude_from_daily_limit
  const validExpenses = transactions.filter(t => t.type === 'expense' && !t.exclude_from_daily_limit);
  const currentValidExpenses = validExpenses.reduce((sum, t) => sum + t.amount, 0);

  // Threshold check
  const hasEnoughData = today >= 5;

  // 2. Trend Detection (Last 7 days vs Previous 7 days)
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (today >= 14) {
    const last7Days = validExpenses.filter(t => {
      const d = parseISO(t.date);
      return d >= new Date(year, month, today - 7) && d < new Date(year, month, today);
    }).reduce((sum, t) => sum + t.amount, 0) / 7;

    const prev7Days = validExpenses.filter(t => {
      const d = parseISO(t.date);
      return d >= new Date(year, month, today - 14) && d < new Date(year, month, today - 7);
    }).reduce((sum, t) => sum + t.amount, 0) / 7;

    if (last7Days > prev7Days * 1.1) trend = 'up';
    else if (last7Days < prev7Days * 0.9) trend = 'down';
  }

  // 3. Weighted Forecasting (Weekday vs Weekend)
  let weekdayExpenses = 0;
  let weekendExpenses = 0;
  let weekdaysPassed = 0;
  let weekendsPassed = 0;

  for (let i = 1; i <= today; i++) {
    const date = new Date(year, month, i);
    const day = date.getDay();
    const isWeekend = day === 0 || day === 6;
    if (isWeekend) weekendsPassed++; else weekdaysPassed++;

    const dateStr = date.toISOString().split('T')[0];
    const dailyExpenses = validExpenses
      .filter(t => t.date === dateStr)
      .reduce((sum, t) => sum + t.amount, 0);
    
    if (isWeekend) weekendExpenses += dailyExpenses;
    else weekdayExpenses += dailyExpenses;
  }

  const avgWeekday = weekdaysPassed > 0 ? weekdayExpenses / weekdaysPassed : 0;
  const avgWeekend = weekendsPassed > 0 ? weekendExpenses / weekendsPassed : 0;

  let remainingWeekdays = 0;
  let remainingWeekends = 0;
  for (let i = today + 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    const day = date.getDay();
    if (day === 0 || day === 6) remainingWeekends++; else remainingWeekdays++;
  }

  const weekdayForecast = avgWeekday * remainingWeekdays;
  const weekendForecast = avgWeekend * remainingWeekends;
  const forecastedTotal = currentValidExpenses + weekdayForecast + weekendForecast;
  
  // 4. Risk Levels
  const budgetRatio = totalBudget > 0 ? (forecastedTotal / totalBudget) * 100 : 0;
  let riskLevel: 'safe' | 'warning' | 'danger' = 'safe';
  if (budgetRatio > 100) riskLevel = 'danger';
  else if (budgetRatio > 80) riskLevel = 'warning';

  // 5. Actionable Insights & Recommendations
  const daysRemaining = daysInMonth - today;
  const remainingBudget = Math.max(totalBudget - currentValidExpenses, 0);
  const remainingBudgetPerDay = daysRemaining > 0 ? remainingBudget / daysRemaining : 0;
  const estimatedOverspend = Math.max(forecastedTotal - totalBudget, 0);

  let recommendation = "Pertahankan pola belanjamu saat ini.";
  if (riskLevel === 'danger') {
    recommendation = `Kurangi belanja harian menjadi ${formatCurrency(remainingBudgetPerDay)} agar tidak over-budget.`;
  } else if (trend === 'up') {
    recommendation = "Pengeluaranmu sedang naik. Coba batasi belanja yang tidak mendesak.";
  }

  // Confidence Level
  let confidence: 'low' | 'medium' | 'high' = 'low';
  if (today >= 20) confidence = 'high';
  else if (today >= 10) confidence = 'medium';

  return {
    forecastedTotal,
    dailyAverage: currentValidExpenses / today,
    daysRemaining,
    percentOfMonthPassed: (today / daysInMonth) * 100,
    confidence,
    riskLevel,
    remainingBudgetPerDay,
    estimatedOverspend,
    hasEnoughData,
    trend,
    breakdown: {
      weekdayForecast,
      weekendForecast
    },
    recommendation
  };
}
