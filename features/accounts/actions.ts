'use server'

import { createClient } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";

export async function createAccount(data: { name: string; type: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Akun baru selalu dimulai dengan saldo 0
  const { error } = await supabase.from('accounts').insert({
    user_id: user.id,
    name: data.name,
    type: data.type,
    balance: 0
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // Supaya UI otomatis diperbarui
  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  revalidatePath('/transactions/new');
  return { success: true };
}
