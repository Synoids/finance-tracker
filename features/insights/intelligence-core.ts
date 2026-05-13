import { RawFinancialData } from "./service";
import { calculateFinancialHealth, HealthScore } from "./health-scorer";
import { analyzeBehavior, BehavioralProfile } from "./behavioral-profiler";
import { detectEvents, FinancialEvent } from "./event-engine";
import { synthesizeRecommendations, SynthesizedRecommendation } from "./recommendation-synthesizer";

export interface IntelligenceState {
  health: HealthScore;
  behavior: BehavioralProfile;
  activeEvents: FinancialEvent[];
  recommendations: SynthesizedRecommendation[];
  deterministicMetrics: {
    totalBalance: number;
    dailyBurnRate: number;
    safeDailyLimit: number;
    projectedDepletionDate: string | null;
  };
}

export function generateIntelligence(data: RawFinancialData): IntelligenceState {
  const totalBalance = data.accounts.reduce((sum, acc) => sum + acc.balance, 0);
  
  // Basic metrics
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  const recentExpenses = data.recentTransactions.filter(t => 
    t.type === 'expense' && new Date(t.date) >= thirtyDaysAgo
  );
  const totalRecentExpense = recentExpenses.reduce((sum, t) => sum + t.amount, 0);
  const dailyBurnRate = totalRecentExpense / 30;

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - now.getDate() + 1;
  const safeDailyLimit = totalBalance / daysRemaining;

  let projectedDepletionDate: string | null = null;
  if (dailyBurnRate > 0) {
    const daysUntilEmpty = totalBalance / dailyBurnRate;
    const depletionDate = new Date(now.getTime() + (daysUntilEmpty * 24 * 60 * 60 * 1000));
    projectedDepletionDate = depletionDate.toISOString().split('T')[0];
  }

  // 1. Analyze Behavior & Baselines
  const behavior = analyzeBehavior(data);

  // 2. Detect Events
  const activeEvents = detectEvents(data, behavior);

  // 3. Calculate Health
  const health = calculateFinancialHealth(data, totalBalance, dailyBurnRate);

  // 4. Synthesize Recommendations
  const intelWithoutRecs = {
    health,
    behavior,
    activeEvents,
    deterministicMetrics: {
      totalBalance,
      dailyBurnRate,
      safeDailyLimit,
      projectedDepletionDate
    }
  } as IntelligenceState;

  const recommendations = synthesizeRecommendations(intelWithoutRecs);

  return {
    ...intelWithoutRecs,
    recommendations
  };
}

