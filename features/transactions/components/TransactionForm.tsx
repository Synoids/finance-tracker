'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabaseClient';
import { TransactionInsert, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/lib/types';
import { formatNumber } from '@/lib/utils';
import { Calendar, Tag, FileText, ArrowRight } from 'lucide-react';
import { AccountSelector } from '@/features/accounts/components/AccountSelector';
import { Account } from '@/features/accounts/queries';

const schema = z.object({
  amount: z.number().min(0.01, 'Jumlah harus lebih besar dari 0'),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Kategori wajib diisi'),
  description: z.string().optional(),
  date: z.string().min(1, 'Tanggal wajib diisi'),
  account_id: z.string().min(1, 'Pilih akun terlebih dahulu'),
});

type FormData = z.infer<typeof schema>;

interface TransactionFormProps {
  accounts: Account[];
  initial?: Partial<FormData & { id?: string }>;
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

      const transaction = {
        ...data,
        description: data.description || '',
        user_id: user.id,
      };

      if (initial?.amount !== undefined) {
        await supabase
          .from('transactions')
          .update(transaction)
          .eq('id', initial.id)
          .eq('user_id', user.id);
      } else {
        await supabase.from('transactions').insert(transaction);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        // Soft refresh router to re-fetch Server Components UI
        router.refresh();
        router.push('/transactions');
      }
    } catch (err: any) {
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
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium flex-shrink-0 text-[var(--text-muted)]">Rp</span>
            <input
              value={displayAmount}
              onChange={(e) => {
                const numValue = parseInt(e.target.value.replace(/[^\d]/g, '')) || 0;
                setDisplayAmount(formatNumber(numValue));
                setValue('amount', numValue);
              }}
              type="text"
              className="input-field flex-1"
              placeholder="0"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="label">Kategori</label>
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 flex-shrink-0 text-[var(--text-muted)]" />
            <select {...register('category')} className="input-field w-full">
              <option value="">Pilih kategori</option>
              {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="label">Tanggal</label>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 flex-shrink-0 text-[var(--text-muted)]" />
            <input {...register('date')} type="date" className="input-field flex-1" />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="label">Deskripsi</label>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 flex-shrink-0 text-[var(--text-muted)]" />
            <input 
              {...register('description')} 
              type="text" 
              className="input-field flex-1" 
              placeholder="Catatan tambahan (opsional)"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          {onCancel && <button type="button" onClick={onCancel} className="btn-secondary flex-1">Batal</button>}
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? 'Menyimpan...' : (initial ? 'Perbarui Transaksi' : 'Tambah Transaksi')}
          </button>
        </div>
      </form>
    </FormProvider>
  );
}
