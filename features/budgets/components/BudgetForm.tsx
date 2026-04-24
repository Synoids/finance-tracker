'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EXPENSE_CATEGORIES } from '@/lib/types';
import { formatNumber, cn } from '@/lib/utils';
import { Tag, Wallet, Calendar, Plus, Loader2 } from 'lucide-react';
import { createBudget } from '../actions';
import { useRouter } from 'next/navigation';

const schema = z.object({
  category: z.string().min(1, 'Kategori wajib diisi'),
  amount: z.number().positive('Jumlah harus lebih besar dari 0'),
  month: z.string().min(1, 'Bulan wajib diisi'),
});

type FormData = z.infer<typeof schema>;

export default function BudgetForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [displayAmount, setDisplayAmount] = useState('');

  // Default to first day of current month
  const currentMonth = new Date().toISOString().split('T')[0].slice(0, 8) + '01';

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: '',
      amount: 0,
      month: currentMonth,
    },
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError('');

    try {
      const result = await createBudget(data);
      if (result.success) {
        reset();
        setDisplayAmount('');
        router.refresh();
      } else {
        setError(result.error || 'Terjadi kesalahan');
      }
    } catch (err: any) {
      setError('Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
          <Wallet className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Tambah Anggaran</h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Atur batasan untuk kategori pengeluaran</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg text-xs bg-red-500/10 text-red-500 border border-red-500/30">
            {error}
          </div>
        )}

        {/* Category */}
        <div>
          <label className="label text-xs mb-1.5 block">Kategori</label>
          <div className="flex items-center gap-3">
            <Tag className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            <select 
              {...register('category')} 
              className={cn(
                "input-field flex-1 h-10 text-sm",
                errors.category && "border-red-500/50 focus:border-red-500"
              )}
            >
              <option value="">Pilih kategori</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          {errors.category && <p className="text-[10px] text-red-500 mt-1 pl-1">{errors.category.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Amount */}
          <div>
            <label className="label text-xs mb-2 block">Target Nominal</label>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-indigo-500 flex-shrink-0">Rp</span>
              <input
                value={displayAmount}
                onChange={(e) => {
                  const numValue = parseInt(e.target.value.replace(/[^\d]/g, '')) || 0;
                  setDisplayAmount(formatNumber(numValue));
                  setValue('amount', numValue, { shouldValidate: true });
                }}
                type="text"
                className={cn(
                  "input-field flex-1 min-w-0 h-11 text-sm bg-[var(--bg-secondary)]",
                  errors.amount && "border-red-500/50 focus:border-red-500"
                )}
                placeholder="0"
              />
            </div>
            {errors.amount && <p className="text-[10px] text-red-500 mt-1 pl-1">{errors.amount.message}</p>}
          </div>

          {/* Month */}
          <div>
            <label className="label text-xs mb-2 block">Bulan</label>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-indigo-500 flex-shrink-0" />
              <input 
                {...register('month')} 
                type="date" 
                className={cn(
                  "input-field flex-1 min-w-0 h-11 text-sm bg-[var(--bg-secondary)]",
                  errors.month && "border-red-500/50 focus:border-red-500"
                )} 
              />
            </div>
            {errors.month && <p className="text-[10px] text-red-500 mt-1 pl-1">{errors.month.message}</p>}
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          className="btn-primary w-full h-10 mt-2 flex items-center justify-center gap-2 group"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Simpan Anggaran</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
