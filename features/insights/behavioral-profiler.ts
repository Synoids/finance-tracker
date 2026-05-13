import { RawFinancialData } from "./service";

export interface BehavioralProfile {
  impulses: {
    score: number; // 0-100
    description: string;
  };
  baselines: Record<string, number>; // Average spending per category
  patterns: string[];
  confidence: number;
}

export function analyzeBehavior(data: RawFinancialData): BehavioralProfile {
  const baselines: Record<string, number> = {};
  const catCounts: Record<string, number> = {};
  
  // Calculate average per transaction in each category from recent data
  data.recentTransactions.forEach(t => {
    if (t.type === 'expense') {
      baselines[t.category] = (baselines[t.category] || 0) + t.amount;
      catCounts[t.category] = (catCounts[t.category] || 0) + 1;
    }
  });

  Object.keys(baselines).forEach(cat => {
    baselines[cat] = baselines[cat] / catCounts[cat];
  });

  // Impulse detection: Many small transactions in lifestyle categories
  const lifestyleCats = ['Hiburan', 'Belanja', 'Makan-makan', 'Cafe'];
  const lifestyleTxs = data.recentTransactions.filter(t => 
    t.type === 'expense' && lifestyleCats.includes(t.category)
  );
  
  const impulseScore = Math.max(0, 100 - (lifestyleTxs.length * 5));
  
  const patterns: string[] = [];
  if (lifestyleTxs.length > 10) patterns.push("Sering melakukan pengeluaran kecil untuk hiburan/belanja");
  
  // Weekend vs Weekday analysis (Placeholder)
  // ...

  return {
    impulses: {
      score: impulseScore,
      description: impulseScore < 50 ? "Tinggi" : "Rendah"
    },
    baselines,
    patterns,
    confidence: data.recentTransactions.length > 20 ? 0.9 : 0.5
  };
}
