'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabaseClient';
import { TransactionInsert, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/lib/types';
import { formatNumber, parseFormattedNumber } from '@/lib/utils';
import { Calendar, Tag, FileText, ArrowRight } from 'lucide-react';

const schema = z.object({
  amount: z.number().min(0.01, 'Jumlah harus lebih besar dari 0'),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Kategori wajib diisi'),
  description: z.string().optional(),
  date: z.string().min(1, 'Tanggal wajib diisi'),
});

type FormData = z.infer<typeof schema>;

interface TransactionFormProps {
  initial?: Partial<FormData & { id?: string }>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function TransactionForm({ initial, onSuccess, onCancel }: TransactionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [amountIconVisible, setAmountIconVisible] = useState(!initial?.amount || initial.amount === 0);
  const [displayAmount, setDisplayAmount] = useState(initial?.amount ? formatNumber(initial.amount) : '');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: initial?.amount || 0,
      type: initial?.type || 'expense',
      category: initial?.category || '',
      description: initial?.description || '',
      date: initial?.date || new Date().toISOString().split('T')[0],
    },
  });

  const selectedType = watch('type');
  const categories = selectedType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  useEffect(() => {
    if (initial?.amount) {
      setDisplayAmount(formatNumber(initial.amount));
      setAmountIconVisible(false);
    } else {
      setDisplayAmount('');
      setAmountIconVisible(true);
    }
  }, [initial?.amount]);

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('Anda harus masuk');
        return;
      }

      const transaction: TransactionInsert = {
        ...data,
        description: data.description || '',
        user_id: user.id,
      };

      if (initial?.amount !== undefined) {
        // Update existing
        await supabase
          .from('transactions')
          .update(transaction)
          .eq('id', initial.id)
          .eq('user_id', user.id);
      } else {
        // Create new
        await supabase.from('transactions').insert(transaction);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/transactions');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
          {error}
        </div>
      )}

      {/* Type selector */}
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
                setValue('category', ''); // Reset category when type changes
              }}
              className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                selectedType === value
                  ? 'border-current text-current'
                  : 'border-transparent text-muted hover:border-current/20'
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
        {errors.type && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.type.message}</p>}
      </div>

      {/* Amount */}
      <div>
        <label className="label">Jumlah</label>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium flex-shrink-0" style={{ color: 'var(--text-muted)' }}>Rp</span>
          <input
            value={displayAmount}
            onChange={(e) => {
              const rawValue = e.target.value.replace(/[^\d]/g, ''); // Only digits
              const numValue = parseInt(rawValue) || 0;
              setDisplayAmount(formatNumber(numValue));
              setValue('amount', numValue);
              setAmountIconVisible(rawValue === '');
            }}
            type="text"
            className="input-field flex-1"
            placeholder="0"
          />
        </div>
        {errors.amount && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.amount.message}</p>}
      </div>

      {/* Category */}
      <div>
        <label className="label">Kategori</label>
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
          <div className="flex-1 relative">
            <select {...register('category')} className="input-field w-full pr-8 appearance-none">
              <option value="">Pilih kategori</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ArrowRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rotate-90 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          </div>
        </div>
        {errors.category && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.category.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="label">Deskripsi (Opsional)</label>
        <div className="flex gap-2">
          <FileText className="w-4 h-4 mt-3 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
          <textarea
            {...register('description')}
            className="input-field flex-1 min-h-[80px] resize-none"
            placeholder="Tambahkan catatan tentang transaksi ini..."
            rows={3}
          />
        </div>
        {errors.description && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.description.message}</p>}
      </div>

      {/* Date */}
      <div>
        <label className="label">Tanggal</label>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
          <input
            {...register('date')}
            type="date"
            className="input-field flex-1"
          />
        </div>
        {errors.date && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.date.message}</p>}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary flex-1">
            Batal
          </button>
        )}
        <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
          {loading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {initial ? 'Perbarui' : 'Tambah'} Transaksi
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}