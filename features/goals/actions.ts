'use server';

import { createClient } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";

export async function createGoal(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const name = formData.get('name') as string;
  const target_amount = parseFloat(formData.get('target_amount') as string);
  const category = formData.get('category') as string;
  const deadline = formData.get('deadline') as string || null;

  const { error } = await supabase
    .from('goals')
    .insert({
      user_id: user.id,
      name,
      target_amount,
      category,
      deadline,
    });

  if (error) throw new Error(error.message);

  revalidatePath('/goals');
  revalidatePath('/dashboard');
}

export async function updateGoalProgress(
  goalId: string, 
  amount: number, 
  accountId?: string, 
  shouldDeduct: boolean = false,
  mode: 'add' | 'withdraw' = 'add'
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Get current goal details
  const { data: goal, error: fetchError } = await supabase
    .from('goals')
    .select('name, current_amount, target_amount')
    .eq('id', goalId)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  const finalAmount = mode === 'add' ? amount : -amount;

  if (shouldDeduct && accountId) {
    // Create transaction
    // If 'add', it's an expense (out of account)
    // If 'withdraw', it's an income (into account)
    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        account_id: accountId,
        amount: amount, // Positive amount always
        type: mode === 'add' ? 'expense' : 'income',
        category: 'Tabungan',
        description: mode === 'add' 
          ? `Isi celengan: ${goal.name}` 
          : `Ambil dari celengan: ${goal.name}`,
        date: new Date().toISOString().split('T')[0],
        exclude_from_daily_limit: true,
      });

    if (txError) throw new Error("Gagal membuat transaksi: " + txError.message);
  }

  const newAmount = (goal.current_amount || 0) + finalAmount;
  
  if (newAmount < 0) throw new Error("Saldo celengan tidak cukup");

  const status = newAmount >= goal.target_amount ? 'completed' : 'active';

  const { error } = await supabase
    .from('goals')
    .update({ 
      current_amount: newAmount,
      status: status
    })
    .eq('id', goalId);

  if (error) throw new Error(error.message);

  revalidatePath('/goals');
  revalidatePath('/dashboard');
  revalidatePath('/transactions');
}

export async function deleteGoal(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);

  revalidatePath('/goals');
}
