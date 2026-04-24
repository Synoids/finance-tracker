import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabaseServer';
import DashboardShell from '@/components/DashboardShell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Get user metadata from Google OAuth
  const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User';
  const userAvatar = user.user_metadata?.avatar_url;

  return (
    <DashboardShell
      userEmail={user.email ?? ''}
      userName={userName}
      userAvatar={userAvatar}
    >
      {children}
    </DashboardShell>
  );
}
