'use server'

import { createClient } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const settingsSchema = z.object({
  dailyLimit: z.number().nonnegative('Limit harus 0 atau lebih'),
});

/**
 * Server Action to update the user's daily spending limit
 */
export async function updateDailyLimit(dailyLimit: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Validate
  const validated = settingsSchema.safeParse({ dailyLimit });
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message };
  }

  const { error } = await supabase
    .from('user_settings')
    .upsert({ 
      user_id: user.id, 
      daily_limit: dailyLimit,
      updated_at: new Date().toISOString()
    }, { 
      onConflict: 'user_id' 
    });

  if (error) {
    console.error("Error updating daily limit:", error.message);
    return { success: false, error: "Gagal memperbarui pengaturan." };
  }

  revalidatePath('/dashboard');
  revalidatePath('/settings');
  
  return { success: true };
}
