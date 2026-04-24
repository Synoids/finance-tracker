import { createClient } from "@/lib/supabaseServer";
import { Budget } from "@/lib/types";

/**
 * Fetch budgets for a specific month
 * @param month format 'YYYY-MM-DD' (standard is the first day of the month)
 */
export async function getBudgetsByMonth(month: string): Promise<Budget[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return [];

  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', user.id)
    .eq('month', month);

  if (error) {
    console.error("Error fetching budgets:", error.message);
    return [];
  }

  return data as Budget[];
}

/**
 * Fetch and group expenses by category for a specific month
 * @param monthStr format 'YYYY-MM-DD'
 */
export async function getExpensesByCategory(monthStr: string): Promise<Record<string, number>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return {};

  // Ambil tanggal awal dan akhir bulan
  const startDate = monthStr.slice(0, 8) + '01';
  const [year, month] = startDate.split('-').map(Number);
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('transactions')
    .select('category, amount')
    .eq('user_id', user!.id)
    .eq('type', 'expense')
    .gte('date', startDate)
    .lte('date', endDate);

  if (error) {
    console.error("Error fetching expenses by category:", error.message);
    return {};
  }

  const result: Record<string, number> = {};
  data.forEach((item) => {
    result[item.category] = (result[item.category] || 0) + Number(item.amount);
  });

  return result;
}
