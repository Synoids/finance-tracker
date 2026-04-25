import { createClient } from "@/lib/supabaseServer";
import { Insight, Transaction, Budget } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export async function getFinancialInsights(): Promise<Insight[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];

  // 1. Fetch current month transactions
  const { data: currentTxs } = await supabase
    .from('transactions')
    .select('*')
    .gte('date', currentMonthStart)
    .eq('user_id', user.id);

  // 2. Fetch previous month transactions
  const { data: previousTxs } = await supabase
    .from('transactions')
    .select('*')
    .gte('date', lastMonthStart)
    .lte('date', lastMonthEnd)
    .eq('user_id', user.id);

  // 3. Fetch budgets
  const { data: budgets } = await supabase
    .from('budgets')
    .select('*')
    .eq('month', currentMonthStart)
    .eq('user_id', user.id);

  const insights: Insight[] = [];

  const currExpenses = (currentTxs as Transaction[] || []).filter(t => t.type === 'expense');
  const prevExpenses = (previousTxs as Transaction[] || []).filter(t => t.type === 'expense');
  
  const currTotal = currExpenses.reduce((sum, t) => sum + t.amount, 0);
  const prevTotal = prevExpenses.reduce((sum, t) => sum + t.amount, 0);

  // --- INSIGHT 1: Month-over-Month Comparison ---
  if (prevTotal > 0) {
    const diff = currTotal - prevTotal;
    const pct = (diff / prevTotal) * 100;
    
    if (pct < -5) {
      insights.push({
        type: 'success',
        title: 'Pengeluaran Menurun!',
        description: `Hebat! Pengeluaranmu bulan ini ${Math.abs(pct).toFixed(1)}% lebih rendah dibanding bulan lalu.`,
        icon: 'TrendingDown'
      });
    } else if (pct > 10) {
      insights.push({
        type: 'warning',
        title: 'Pengeluaran Meningkat',
        description: `Waspada, pengeluaranmu naik ${pct.toFixed(1)}% dari bulan lalu. Periksa kembali daftar belanjaanmu.`,
        icon: 'TrendingUp'
      });
    }
  }

  // --- INSIGHT 2: Top Category Spending ---
  const catTotals: Record<string, number> = {};
  currExpenses.forEach(t => {
    catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
  });

  const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
  if (sortedCats.length > 0 && currTotal > 0) {
    const [topCat, topAmount] = sortedCats[0];
    const share = (topAmount / currTotal) * 100;
    if (share > 30) {
      insights.push({
        type: 'info',
        title: `Fokus pada ${topCat}`,
        description: `Kategori ${topCat} memakan ${share.toFixed(0)}% dari total pengeluaranmu bulan ini (${formatCurrency(topAmount)}).`,
        icon: 'Target'
      });
    }
  }

  // --- INSIGHT 3: Budget Overrun ---
  if (budgets && budgets.length > 0) {
    let overrunCount = 0;
    budgets.forEach((b: Budget) => {
      const spent = catTotals[b.category] || 0;
      if (spent > b.amount) overrunCount++;
    });

    if (overrunCount > 0) {
      insights.push({
        type: 'danger',
        title: 'Anggaran Terlampaui',
        description: `Ada ${overrunCount} kategori yang sudah melebihi anggaran yang kamu tetapkan bulan ini.`,
        icon: 'AlertCircle'
      });
    }
  }

  // --- INSIGHT 4: Daily Behavior (Small Wins) ---
  const daysWithExpenses = new Set(currExpenses.map(t => t.date)).size;
  const currentDay = now.getDate();
  const frugalDays = currentDay - daysWithExpenses;
  
  if (frugalDays > currentDay / 2) {
    insights.push({
      type: 'success',
      title: 'Disiplin Mencatat',
      description: `Kamu berhasil melewati ${frugalDays} hari tanpa pengeluaran besar bulan ini. Pertahankan!`,
      icon: 'Zap'
    });
  }

  // Handle empty data case
  if (insights.length === 0) {
    insights.push({
      type: 'info',
      title: 'Mulai Mencatat',
      description: 'Terus catat transaksimu untuk mendapatkan analisis keuangan yang lebih mendalam.',
      icon: 'PieChart'
    });
  }

  return insights.slice(0, 4);
}
