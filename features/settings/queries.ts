import { createClient } from "@/lib/supabaseServer";

/**
 * Get total expense amount for today
 */
export async function getTodayExpense(): Promise<number> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', user.id)
    .eq('type', 'expense')
    .eq('date', today)
    .eq('exclude_from_daily_limit', false);

  if (error) {
    console.error("Error fetching today's expense:", error.message);
    return 0;
  }

  return data.reduce((sum, item) => sum + Number(item.amount), 0);
}

/**
 * Get the daily spending limit from user_settings
 */
export async function getDailyLimit(): Promise<number> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data, error } = await supabase
    .from('user_settings')
    .select('daily_limit')
    .eq('user_id', user.id)
    .single();

  if (error) {
    // If settings don't exist yet, return 0 as default
    if (error.code !== 'PGRST116') {
      console.error("Error fetching daily limit:", error.message);
    }
    return 0;
  }

  return data?.daily_limit || 0;
}
