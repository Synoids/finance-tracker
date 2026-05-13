import { RawFinancialData } from "./service";

export interface HealthScore {
  total: number; // 0-100
  dimensions: {
    stability: number;   // Daily spending variance
    discipline: number;  // Budget adherence
    consistency: number; // Regularity of savings/income
    runway: number;      // Days of cash available
    risk: number;        // Lifestyle vs Essentials ratio
  };
  factors: string[];
  trend: 'improving' | 'stable' | 'declining';
}

export function calculateFinancialHealth(data: RawFinancialData, totalBalance: number, dailyBurnRate: number): HealthScore {
  // 1. Stability (0-100): Lower variance is better
  // Mock logic for now: simpler stability based on recent expense frequency
  const expenseCount = data.recentTransactions.filter(t => t.type === 'expense').length;
  const stability = Math.min(100, (expenseCount / 30) * 100); 

  // 2. Discipline (0-100): Based on budget utilization
  let budgetScore = 100;
  if (data.budgets.length > 0) {
    let totalBudget = 0;
    let totalSpent = 0;
    data.budgets.forEach(b => {
      totalBudget += b.amount;
      const spent = data.currentMonthTransactions
        .filter(t => t.type === 'expense' && t.category === b.category)
        .reduce((sum, t) => sum + t.amount, 0);
      totalSpent += spent;
    });
    const ratio = totalSpent / totalBudget;
    budgetScore = Math.max(0, 100 - (ratio > 1 ? (ratio - 1) * 200 : 0));
  }

  // 3. Consistency (0-100): Based on income presence
  const hasIncome = data.currentMonthTransactions.some(t => t.type === 'income');
  const consistency = hasIncome ? 100 : 40;

  // 4. Runway (0-100): Cash buffer
  // > 30 days = 100, < 7 days = 0
  const daysOfRunway = dailyBurnRate > 0 ? totalBalance / dailyBurnRate : 999;
  const runway = Math.min(100, Math.max(0, (daysOfRunway / 30) * 100));

  // 5. Risk (0-100): Inverse of Lifestyle ratio
  const lifestyleCats = ['Hiburan', 'Belanja', 'Makan-makan', 'Cafe'];
  const lifestyleSpent = data.currentMonthTransactions
    .filter(t => t.type === 'expense' && lifestyleCats.includes(t.category))
    .reduce((sum, t) => sum + t.amount, 0);
  const totalSpent = data.currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const riskRatio = totalSpent > 0 ? lifestyleSpent / totalSpent : 0;
  const risk = Math.max(0, 100 - (riskRatio * 150));

  const total = Math.round((stability + budgetScore + consistency + runway + risk) / 5);

  const factors: string[] = [];
  if (runway < 50) factors.push("Saldo cadangan (runway) menipis");
  if (budgetScore < 70) factors.push("Beberapa anggaran melebihi batas");
  if (risk < 60) factors.push("Porsi pengeluaran gaya hidup cukup tinggi");

  return {
    total,
    dimensions: { stability, discipline: budgetScore, consistency, runway, risk },
    factors,
    trend: 'stable' // Default to stable for now
  };
}
