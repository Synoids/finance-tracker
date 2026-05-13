import { RawFinancialData } from "./service";
import { formatCurrency } from "@/lib/utils";

export interface ComputedContext {
  totalBalance: number;
  dailyBurnRate: number;
  safeDailyLimit: number;
  projectedDepletionDate: string | null;
  priorityInsights: ScoredInsight[];
  aggregates: {
    topCategories: { category: string; amount: number; percentage: number }[];
    incomeVsExpense: { income: number; expense: number };
  };
}

export interface ScoredInsight {
  score: number; // 0.0 to 1.0
  type: 'danger' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  evidence: string;
}

export function buildFinancialContext(data: RawFinancialData): ComputedContext {
  const totalBalance = data.accounts.reduce((sum, acc) => sum + acc.balance, 0);
  
  // 1. Calculate Burn Rate (last 30 days)
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  const recentExpenses = data.recentTransactions.filter(t => 
    t.type === 'expense' && new Date(t.date) >= thirtyDaysAgo
  );
  const totalRecentExpense = recentExpenses.reduce((sum, t) => sum + t.amount, 0);
  const dailyBurnRate = totalRecentExpense / 30;

  // 2. Safe Daily Limit
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - now.getDate() + 1;
  // Simple formula: Remaining Balance / Days Remaining
  const safeDailyLimit = totalBalance / daysRemaining;

  // 3. Projected Depletion
  let projectedDepletionDate: string | null = null;
  if (dailyBurnRate > 0) {
    const daysUntilEmpty = totalBalance / dailyBurnRate;
    const depletionDate = new Date(now.getTime() + (daysUntilEmpty * 24 * 60 * 60 * 1000));
    projectedDepletionDate = depletionDate.toISOString().split('T')[0];
  }

  // 4. Aggregates
  const catTotals: Record<string, number> = {};
  let totalExpense = 0;
  let totalIncome = 0;
  
  data.currentMonthTransactions.forEach(t => {
    if (t.type === 'expense') {
      catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
      totalExpense += t.amount;
    } else {
      totalIncome += t.amount;
    }
  });

  const topCategories = Object.entries(catTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // 5. Scored Insights
  const priorityInsights: ScoredInsight[] = [];

  // Insight: Low Balance / High Burn
  if (projectedDepletionDate && (totalBalance / dailyBurnRate) < 7) {
    priorityInsights.push({
      score: 0.95,
      type: 'danger',
      title: 'Krisis Saldo Mendekat',
      description: `Berdasarkan pengeluaran rata-rata ${formatCurrency(dailyBurnRate)}/hari, saldo Anda akan habis dalam kurang dari 7 hari.`,
      evidence: `Saldo: ${formatCurrency(totalBalance)}, Burn Rate: ${formatCurrency(dailyBurnRate)}/hari.`
    });
  }

  // Insight: Budget Overrun
  data.budgets.forEach(b => {
    const spent = catTotals[b.category] || 0;
    if (spent > b.amount) {
      priorityInsights.push({
        score: 0.85,
        type: 'danger',
        title: `Anggaran ${b.category} Jebol`,
        description: `Kamu sudah melebihi budget ${b.category} sebesar ${formatCurrency(spent - b.amount)}.`,
        evidence: `Budget: ${formatCurrency(b.amount)}, Terpakai: ${formatCurrency(spent)}.`
      });
    } else if (spent > b.amount * 0.8) {
      priorityInsights.push({
        score: 0.6,
        type: 'warning',
        title: `Anggaran ${b.category} Hampir Habis`,
        description: `Pengeluaran ${b.category} sudah mencapai 80% dari budget.`,
        evidence: `Budget: ${formatCurrency(b.amount)}, Terpakai: ${formatCurrency(spent)}.`
      });
    }
  });

  // Insight: High Lifestyle Spending
  const lifestyleCats = ['Hiburan', 'Belanja', 'Makan-makan', 'Cafe'];
  const lifestyleSpent = topCategories
    .filter(c => lifestyleCats.includes(c.category))
    .reduce((sum, c) => sum + c.amount, 0);
  
  if (lifestyleSpent > totalExpense * 0.4) {
    priorityInsights.push({
      score: 0.7,
      type: 'warning',
      title: 'Pengeluaran Gaya Hidup Tinggi',
      description: 'Hampir separuh pengeluaran bulan ini dialokasikan untuk gaya hidup.',
      evidence: `${((lifestyleSpent / totalExpense) * 100).toFixed(0)}% dari total pengeluaran.`
    });
  }

  // Sort by score
  priorityInsights.sort((a, b) => b.score - a.score);

  return {
    totalBalance,
    dailyBurnRate,
    safeDailyLimit,
    projectedDepletionDate,
    priorityInsights,
    aggregates: {
      topCategories,
      incomeVsExpense: { income: totalIncome, expense: totalExpense }
    }
  };
}
