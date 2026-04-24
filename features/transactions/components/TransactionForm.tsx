'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabaseClient';
import { Transaction, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/lib/types';
import { formatNumber } from '@/lib/utils';
import { Calendar, Tag, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AccountSelector } from '@/features/accounts/components/AccountSelector';
import { Account } from '@/features/accounts/queries';

const schema = z.object({
  amount: z.number().min(0.01, 'Jumlah harus lebih besar dari 0'),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Kategori wajib diisi'),
  description: z.string().optional(),
  date: z.string().min(1, 'Tanggal wajib diisi'),
  account_id: z.string().min(1, 'Pilih akun terlebih dahulu'),
  include_in_limit: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface TransactionFormProps {
  accounts: Account[];
  initial?: Partial<Transaction>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function TransactionForm({ accounts, initial, onSuccess, onCancel }: TransactionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [displayAmount, setDisplayAmount] = useState(initial?.amount ? formatNumber(initial.amount) : '');

  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: initial?.amount || 0,
      type: initial?.type || 'expense',
      category: initial?.category || '',
      description: initial?.description || '',
      date: initial?.date || new Date().toISOString().split('T')[0],
      account_id: initial?.account_id || '',
      include_in_limit: initial?.exclude_from_daily_limit === undefined ? true : !initial.exclude_from_daily_limit,
    },
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = methods;
  const selectedType = watch('type');
  const categories = selectedType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  useEffect(() => {
    setDisplayAmount(initial?.amount ? formatNumber(initial.amount) : '');
  }, [initial?.amount]);

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Anda harus masuk');

      const { include_in_limit, ...formData } = data;
      const transaction = {
        ...formData,
        description: formData.description || '',
        exclude_from_daily_limit: !include_in_limit,
        user_id: user.id,
      };

      if (initial?.id) {
        await supabase
          .from('transactions')
          .update(transaction)
          .eq('id', initial.id)
          .eq('user_id', user.id);
        toast.success('Transaksi berhasil diperbarui');
      } else {
        await supabase.from('transactions').insert(transaction);
        toast.success('Transaksi berhasil ditambahkan');
      }

      if (onSuccess) {
        onSuccess();
      } else {
        // Soft refresh router to re-fetch Server Components UI
        router.refresh();
        router.push('/transactions');
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan sistem');
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-3 rounded-lg text-sm bg-red-500/10 text-red-500 border border-red-500/30">
            {error}
          </div>
        )}

        <AccountSelector accounts={accounts} />

        {/* Existing Type Selector */}
        <div>
          <label className="label">Jenis Transaksi</label>
          <div className="flex gap-2">
            {[
              { value: 'expense', label: 'Pengeluaran', color: '#ef4444' },
              { value: 'income', label: 'Pemasukan', color: '#22c55e' },
            ].map(({ value, label, color }) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setValue('type', value as 'income' | 'expense');
                  setValue('category', ''); 
                }}
                className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                  selectedType === value ? 'border-current text-current' : 'border-transparent text-muted hover:border-current/20'
                }`}
                style={{
                  color: selectedType === value ? color : 'var(--text-secondary)',
                  borderColor: selectedType === value ? color : undefined,
                  background: selectedType === value ? `${color}15` : 'var(--bg-secondary)',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="label">Jumlah</label>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-indigo-500 flex-shrink-0 w-6 text-center">Rp</span>
            <input
              value={displayAmount}
              onChange={(e) => {
                const numValue = parseInt(e.target.value.replace(/[^\d]/g, '')) || 0;
                setDisplayAmount(formatNumber(numValue));
                setValue('amount', numValue);
              }}
              type="text"
              className="input-field flex-1 min-w-0"
              placeholder="0"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="label">Kategori</label>
          <div className="flex items-center gap-3">
            <Tag className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            <select {...register('category')} className="input-field flex-1 min-w-0">
              <option value="">Pilih kategori</option>
              {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="label">Tanggal</label>
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            <input {...register('date')} type="date" className="input-field flex-1 min-w-0" />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="label">Deskripsi</label>
          <div className="flex items-center gap-3">
            <FileText className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            <input 
              {...register('description')} 
              type="text" 
              className="input-field flex-1 min-w-0" 
              placeholder="Catatan tambahan (opsional)"
            />
          </div>
        </div>

        {/* Exclusion Checkbox (Only for expenses) */}
        {selectedType === 'expense' && (
          <div 
            className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:border-indigo-500/30 transition-colors cursor-pointer"
            onClick={() => setValue('include_in_limit', !watch('include_in_limit'))}
          >
            <div className="relative flex items-center justify-center w-5 h-5 rounded border-2 border-indigo-500/50">
              {watch('include_in_limit') && (
                <div className="w-3 h-3 bg-indigo-500 rounded-sm" />
              )}
              <input 
                type="checkbox" 
                {...register('include_in_limit')} 
                className="sr-only" 
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Masukkan ke limit harian?</p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                Matikan jika ini adalah pengeluaran tetap/besar (seperti cicilan)
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          {onCancel && <button type="button" onClick={onCancel} className="btn-secondary flex-1">Batal</button>}
          <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              initial?.id ? 'Perbarui Transaksi' : 'Tambah Transaksi'
            )}
          </button>
        </div>
      </form>
    </FormProvider>
  );
}
