import { createClient } from "@/lib/supabaseServer";
import { Insight, Transaction, Budget, Goal } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Account } from "@/features/accounts/queries";

export interface RawFinancialData {
  accounts: Account[];
  recentTransactions: Transaction[];
  currentMonthTransactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  userSettings: {
    daily_limit: number;
  } | null;
}

export async function getRawFinancialData(): Promise<RawFinancialData | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

  // Fetch all data in parallel
  const [
    { data: accounts },
    { data: recentTxs },
    { data: currentTxs },
    { data: budgets },
    { data: goals },
    { data: settings }
  ] = await Promise.all([
    supabase.from('accounts').select('*').eq('user_id', user.id),
    supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(50),
    supabase.from('transactions').select('*').eq('user_id', user.id).gte('date', currentMonthStart),
    supabase.from('budgets').select('*').eq('user_id', user.id).eq('month', currentMonthStart),
    supabase.from('goals').select('*').eq('user_id', user.id),
    supabase.from('user_settings').select('daily_limit').eq('user_id', user.id).single()
  ]);

  return {
    accounts: (accounts as Account[]) || [],
    recentTransactions: (recentTxs as Transaction[]) || [],
    currentMonthTransactions: (currentTxs as Transaction[]) || [],
    budgets: (budgets as Budget[]) || [],
    goals: (goals as Goal[]) || [],
    userSettings: settings || { daily_limit: 0 }
  };
}

export async function getFinancialInsights(): Promise<Insight[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];

  // 1. Fetch current month transactions
  const { data: currentTxs } = await supabase
    .from('transactions')
    .select('*')
    .gte('date', currentMonthStart)
    .eq('user_id', user.id);

  // 2. Fetch previous month transactions UP TO THE SAME DAY (for apple-to-apple comparison)
  const lastMonthSameDay = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString().split('T')[0];
  
  const { data: previousTxs } = await supabase
    .from('transactions')
    .select('*')
    .gte('date', lastMonthStart)
    .lte('date', lastMonthSameDay)
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
  const hasHistory = (previousTxs as Transaction[] || []).length > 0 || prevTotal > 0;

  if (prevTotal > 0) {
    const diff = currTotal - prevTotal;
    const pct = (diff / prevTotal) * 100;
    
    if (pct < -5) {
      insights.push({
        type: 'success',
        title: 'Lebih Hemat!',
        description: `Sampai hari ini, kamu sudah hemat ${formatCurrency(Math.abs(diff))} dibanding periode yang sama bulan lalu.`,
        icon: 'TrendingDown'
      });
    } else if (pct > 5) {
      insights.push({
        type: 'warning',
        title: 'Pengeluaran Lebih Awal',
        description: `Bulan ini kamu belanja ${formatCurrency(diff)} lebih banyak dibanding tanggal yang sama bulan lalu. Yuk, rem sedikit!`,
        icon: 'TrendingUp'
      });
    }
  } else if (currTotal > 0) {
    if (hasHistory) {
      // User has history but not in this specific early-month window
      insights.push({
        type: 'info',
        title: 'Awal Bulan yang Sibuk',
        description: `Kamu sudah mulai belanja ${formatCurrency(currTotal)} di awal bulan ini. Padahal bulan lalu kamu belum ada pengeluaran di tanggal ini.`,
        icon: 'Zap'
      });
    } else {
      // Truly a new user
      insights.push({
        type: 'info',
        title: 'Mulai Mencatat',
        description: `Langkah awal yang hebat! Kamu sudah mencatat ${formatCurrency(currTotal)} pertama kamu. Mari kita pantau terus!`,
        icon: 'Zap'
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
      const lifestyleCats = ['Hiburan', 'Belanja', 'Makan-makan', 'Hobi', 'Liburan', 'Kecantikan', 'Cafe', 'Rokok'];
      const isLifestyle = lifestyleCats.includes(topCat);
      
      let shareText = "";
      if (share >= 95) shareText = "Hampir seluruh";
      else if (share >= 50) shareText = "Lebih dari separuh";
      else shareText = "Cukup banyak";

      if (isLifestyle) {
        insights.push({
          type: 'warning',
          title: `Evaluasi ${topCat}`,
          description: `${shareText} uangmu (${share.toFixed(0)}%) habis untuk ${topCat}. Coba cek apakah ada yang bisa dikurangi untuk ditabung.`,
          icon: 'Target'
        });
      } else {
        insights.push({
          type: 'info',
          title: `Analisis ${topCat}`,
          description: `Pengeluaran di kategori ${topCat} mencapai ${share.toFixed(0)}% bulan ini. Tetap pantau agar tidak melebihi rencana ya!`,
          icon: 'BarChart'
        });
      }
    }
  }

  // --- INSIGHT 3: Budget Overrun ---
  if (budgets && budgets.length > 0) {
    const overrunCats: string[] = [];
    budgets.forEach((b: Budget) => {
      const spent = catTotals[b.category] || 0;
      if (spent > b.amount) overrunCats.push(b.category);
    });

    if (overrunCats.length > 0) {
      insights.push({
        type: 'danger',
        title: 'Ada Anggaran yang Bocor!',
        description: `Di kategori ${overrunCats.join(', ')}, kamu sudah belanja lebih dari rencana. Yuk, coba lebih 'ngerem' di sisa bulan ini agar tetap aman.`,
        icon: 'AlertCircle'
      });
    }
  }

  // --- INSIGHT 4: Daily Behavior (Small Wins) ---
  const daysWithExpenses = new Set(currExpenses.map(t => t.date)).size;
  const currentDay = now.getDate();
  const frugalDays = currentDay - daysWithExpenses;
  
  if (frugalDays > 5) {
    insights.push({
      type: 'success',
      title: 'Disiplin yang Mantap!',
      description: `Kamu punya ${frugalDays} 'Hari Bebas Belanja' bulan ini. Ini cara paling ampuh buat jaga tabunganmu tetap sehat.`,
      icon: 'Zap'
    });
  }

  return insights.slice(0, 4);
}

