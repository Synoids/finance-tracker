'use server'

import { createClient } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// 1. Validation Schema (zod)
// Fields: category (required), amount (> 0), month (date string)
const budgetSchema = z.object({
  category: z.string().min(1, 'Kategori wajib diisi'),
  amount: z.number().positive('Jumlah harus lebih besar dari 0'),
  month: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid (YYYY-MM-DD)'),
});

export type BudgetFormData = z.infer<typeof budgetSchema>;

/**
 * createBudget Server Action
 * Supports both creating and updating (upsert-like behavior)
 */
export async function createBudget(data: BudgetFormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Validate data
  const validated = budgetSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message };
  }

  const { category, amount, month: rawMonth } = validated.data;
  const month = rawMonth.slice(0, 8) + '01'; // Selalu simpan sebagai tanggal 1

  // Pattern: Check exists first or use upsert if the ID is known.
  // Since we use category+month as unique logic for users, we check first.
  const { data: existing } = await supabase
    .from('budgets')
    .select('id')
    .eq('user_id', user.id)
    .eq('category', category)
    .eq('month', month)
    .single();

  let error;
  if (existing) {
    // Update existing budget
    const result = await supabase
      .from('budgets')
      .update({ amount })
      .eq('id', existing.id)
      .eq('user_id', user.id);
    error = result.error;
  } else {
    // Create new budget
    const result = await supabase.from('budgets').insert({
      user_id: user.id,
      category,
      amount,
      month
    });
    error = result.error;
  }

  if (error) {
    return { success: false, error: error.message };
  }

  // Revalidate relevant pages
  revalidatePath('/dashboard');
  revalidatePath('/analytics'); // Budget progress is likely shown here too
  
  return { success: true };
}

/**
 * deleteBudget Server Action
 */
export async function deleteBudget(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/analytics');

  return { success: true };
}
