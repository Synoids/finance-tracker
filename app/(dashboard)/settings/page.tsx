import { createClient } from '@/lib/supabaseServer';
import { User, Shield, Bell } from 'lucide-react';
import { getDailyLimit } from '@/features/settings/queries';
import SettingsForm from '@/features/settings/components/SettingsForm';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const dailyLimit = await getDailyLimit();

  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Pengaturan</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Kelola preferensi akun Anda</p>
      </div>

      {/* Profile card */}
      <div className="glass-card p-6 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-5">
          <User className="w-4 h-4" style={{ color: '#a5b4fc' }} />
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Profil</h2>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.email}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Anggota sejak {createdAt}</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { label: 'Alamat Email', value: user?.email ?? 'N/A' },
            { label: 'ID Akun',    value: user?.id ? user.id.slice(0, 8) + '...' : 'N/A' },
            { label: 'Masuk Terakhir',  value: user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('id-ID') : 'N/A' },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Limit Settings */}
      <SettingsForm initialLimit={dailyLimit} />

      {/* Security */}
      <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center gap-3 mb-5">
          <Shield className="w-4 h-4" style={{ color: '#a5b4fc' }} />
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Keamanan</h2>
        </div>
        <div className="p-3 rounded-xl flex items-center justify-between" style={{ background: 'var(--bg-secondary)' }}>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Keamanan Tingkat Baris</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Data Anda dilindungi oleh Supabase RLS</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-medium income-badge">Diaktifkan</span>
        </div>
      </div>

      {/* Notifications placeholder */}
      <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '160ms' }}>
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-4 h-4" style={{ color: '#a5b4fc' }} />
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Info Aplikasi</h2>
        </div>
        <div className="space-y-2">
          {[
            { label: 'Versi',    value: '3.0.0 (Financial Control & UI Polish)' },
            { label: 'Kerangka Kerja', value: 'Next.js 16 App Router' },
            { label: 'Basis Data',  value: 'Supabase (PostgreSQL)' },
            { label: 'Otentikasi',      value: 'Supabase Auth' },
          ].map((row) => (
            <div key={row.label} className="flex justify-between p-2.5 rounded-lg text-sm" style={{ background: 'var(--bg-secondary)' }}>
              <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
              <span style={{ color: 'var(--text-secondary)' }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
