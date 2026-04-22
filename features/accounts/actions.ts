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

export async function updateAccount(id: string, data: { name: string; type: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('accounts')
    .update({ name: data.name, type: data.type })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  revalidatePath('/transactions/new');
  return { success: true };
}

export async function deleteAccount(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Check if account is used in any transactions first
  const { count, error: countError } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .eq('account_id', id);

  if (countError) {
    return { success: false, error: 'Gagal memvalidasi data transaksi di akun ini.' };
  }

  if (count && count > 0) {
    return { 
      success: false, 
      error: `Tidak bisa menghapus akun. Terdapat ${count} transaksi yang menggunakan akun ini.` 
    };
  }

  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  revalidatePath('/transactions/new');
  return { success: true };
}
