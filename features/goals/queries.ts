import { createClient } from "@/lib/supabaseServer";

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  category: string | null;
  deadline: string | null;
  status: 'active' | 'completed';
  created_at: string;
}

export async function getGoals(): Promise<Goal[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return [];

  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching goals:", error.message);
    return [];
  }

  return data as Goal[];
}

export async function getGoalById(id: string): Promise<Goal | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error("Error fetching goal:", error.message);
    return null;
  }

  return data as Goal;
}
