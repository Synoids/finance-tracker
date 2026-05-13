import { IntelligenceState } from "./intelligence-core";
import { formatCurrency } from "@/lib/utils";

export interface SynthesizedRecommendation {
  priority: 'critical' | 'warning' | 'optimization' | 'positive';
  title: string;
  advice: string;
  action: string;
}

export function synthesizeRecommendations(intel: IntelligenceState): SynthesizedRecommendation[] {
  const recommendations: SynthesizedRecommendation[] = [];
  const now = new Date();
  const dayOfMonth = now.getDate();

  // 1. Critical: Low Runway
  if (intel.deterministicMetrics.dailyBurnRate > 0) {
    const days = intel.deterministicMetrics.totalBalance / intel.deterministicMetrics.dailyBurnRate;
    if (days < 7) {
      // Rotate phrasing based on day of month to keep it fresh
      const advice = dayOfMonth % 2 === 0 
        ? `Saldo Anda diproyeksikan habis dalam ${Math.round(days)} hari jika pola pengeluaran tetap ${formatCurrency(intel.deterministicMetrics.dailyBurnRate)}/hari.`
        : `Dengan kecepatan belanja saat ini, dana Anda hanya cukup untuk sekitar ${Math.round(days)} hari ke depan.`;
      
      recommendations.push({
        priority: 'critical',
        title: 'Runway Kritis',
        advice,
        action: 'Segera prioritaskan pengeluaran hanya untuk kebutuhan pokok mutlak.'
      });
    }
  }

  // 2. Warning: Budget Leaks
  const leakingBudgets = intel.activeEvents.filter(e => e.type === 'budget_exceeded');
  if (leakingBudgets.length > 0) {
    recommendations.push({
      priority: 'warning',
      title: 'Kebocoran Anggaran',
      advice: `Anggaran di kategori ${leakingBudgets.map(e => e.data.category).join(', ')} sudah terlampaui.`,
      action: dayOfMonth % 2 === 0 
        ? 'Tinjau transaksi terakhir dan identifikasi apa yang bisa dipotong.' 
        : 'Gunakan sisa budget dari kategori lain jika memungkinkan, atau stop belanja di kategori ini.'
    });
  }

  // 3. Optimization: High Lifestyle
  if (intel.health.dimensions.risk < 60) {
    recommendations.push({
      priority: 'optimization',
      title: 'Evaluasi Gaya Hidup',
      advice: 'Pengeluaran non-esensial Anda bulan ini cukup tinggi dibandingkan baseline.',
      action: 'Coba terapkan aturan "tunda 24 jam" sebelum melakukan pembelian barang keinginan.'
    });
  }

  // 4. Positive: Stability or Savings
  if (intel.health.dimensions.stability > 70) {
    recommendations.push({
      priority: 'positive',
      title: 'Disiplin Terjaga',
      advice: 'Arus kas harian Anda terlihat stabil dan terkontrol dengan baik.',
      action: 'Manfaatkan momentum ini untuk menambah alokasi dana darurat Anda.'
    });
  }

  return recommendations;
}

