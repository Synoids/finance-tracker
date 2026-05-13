import { RawFinancialData } from "./service";
import { BehavioralProfile } from "./behavioral-profiler";

export interface FinancialEvent {
  type: string;
  priority: number;
  confidence: number;
  title: string;
  description: string;
  data: any;
}

export function detectEvents(data: RawFinancialData, profile: BehavioralProfile): FinancialEvent[] {
  const events: FinancialEvent[] = [];

  // 1. Spike Detector (Baseline Aware)
  data.currentMonthTransactions.forEach(t => {
    if (t.type === 'expense') {
      const baseline = profile.baselines[t.category];
      if (baseline && t.amount > baseline * 3) {
        events.push({
          type: 'spending_spike',
          priority: 0.8,
          confidence: profile.confidence,
          title: 'Lonjakan Pengeluaran Terdeteksi',
          description: `Transaksi di ${t.category} sebesar ${t.amount} jauh di atas rata-rata biasanya.`,
          data: { transaction_id: t.id, amount: t.amount, category: t.category }
        });
      }
    }
  });

  // 2. Budget Alerts
  const catTotals: Record<string, number> = {};
  data.currentMonthTransactions.forEach(t => {
    if (t.type === 'expense') catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
  });

  data.budgets.forEach(b => {
    const spent = catTotals[b.category] || 0;
    if (spent > b.amount) {
      events.push({
        type: 'budget_exceeded',
        priority: 0.9,
        confidence: 1.0,
        title: `Budget ${b.category} Terlampaui`,
        description: `Pengeluaran ${b.category} telah melewati batas anggaran Anda.`,
        data: { budget_id: b.id, category: b.category, limit: b.amount, actual: spent }
      });
    } else if (spent > b.amount * 0.8) {
      events.push({
        type: 'budget_warning',
        priority: 0.6,
        confidence: 1.0,
        title: `Budget ${b.category} Hampir Habis`,
        description: `Pengeluaran ${b.category} sudah mencapai 80% dari budget.`,
        data: { budget_id: b.id, category: b.category, limit: b.amount, actual: spent }
      });
    }
  });

  return events;
}
