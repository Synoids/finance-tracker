'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formatNumber, cn } from '@/lib/utils';
import { Settings2, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { updateDailyLimit } from '../actions';
import { toast } from 'sonner';

const schema = z.object({
  dailyLimit: z.number().min(0, 'Limit tidak boleh negatif'),
});

type FormData = z.infer<typeof schema>;

interface SettingsFormProps {
  initialLimit: number;
}

export default function SettingsForm({ initialLimit }: SettingsFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [displayAmount, setDisplayAmount] = useState(formatNumber(initialLimit));

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      dailyLimit: initialLimit,
    },
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const result = await updateDailyLimit(data.dailyLimit);
      if (result.success) {
        toast.success('Pengaturan limit berhasil diperbarui');
        setSuccess(true);
        // Success message stays for 3s
        setTimeout(() => setSuccess(false), 3000);
      } else {
        toast.error(result.error || 'Gagal memperbarui pengaturan');
        setError(result.error || 'Gagal memperbarui pengaturan');
      }
    } catch (err) {
      toast.error('Terjadi kesalahan sistem');
      setError('Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-card p-6 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-500">
          <Settings2 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Limit Belanja Harian</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Beritahu kami berapa batas aman pengeluaran Anda per hari</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg text-xs bg-red-500/10 text-red-500 border border-red-500/30">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 rounded-lg text-xs bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center gap-2 animate-bounce-subtle">
            <CheckCircle2 className="w-4 h-4" />
            Pengaturan berhasil diperbarui!
          </div>
        )}

        <div>
          <label className="label text-[11px] uppercase tracking-wider font-bold mb-2 block" style={{ color: 'var(--text-muted)' }}>
            Target Limit Harian
          </label>
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold text-indigo-500 w-8 text-center flex-shrink-0">Rp</span>
            <input
              value={displayAmount}
              onChange={(e) => {
                const numValue = parseInt(e.target.value.replace(/[^\d]/g, '')) || 0;
                setDisplayAmount(formatNumber(numValue));
                setValue('dailyLimit', numValue, { shouldValidate: true });
              }}
              className={cn(
                "input-field flex-1 h-12 text-base font-bold bg-[var(--bg-secondary)] border-[var(--border)] focus:border-indigo-500",
                errors.dailyLimit && "border-red-500/50"
              )}
              placeholder="0"
            />
          </div>
          {errors.dailyLimit && <p className="text-xs text-red-500 mt-1.5 ml-1">{errors.dailyLimit.message}</p>}
        </div>

        <div className="pt-2">
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full h-12 flex items-center justify-center gap-2 group active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="font-semibold">Simpan Pengaturan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
