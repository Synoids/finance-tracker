import { createClient } from "@/lib/supabaseServer";

export interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'ewallet';
  balance: number;
}

export async function getAccounts(): Promise<Account[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('accounts')
    .select('id, name, type, balance')
    .eq('user_id', user.id);

  if (error) {
    console.error("Error fetching accounts:", error.message);
    return [];
  }

  return data as Account[];
}
