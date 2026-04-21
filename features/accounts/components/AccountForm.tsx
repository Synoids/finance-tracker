'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createAccount } from '../actions';
import { useRouter } from 'next/navigation';

const schema = z.object({
  name: z.string().min(1, 'Nama akun wajib diisi').max(50),
  type: z.enum(['cash', 'bank', 'ewallet'], { required_error: 'Tipe akun wajib dipilih' })
});

type FormData = z.infer<typeof schema>;

export default function AccountForm({ onSuccess, onCancel }: { onSuccess?: () => void, onCancel?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'cash' }
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError('');

    const result = await createAccount(data);
    if (!result.success) {
      setError(result.error || 'Terjadi kesalahan saat membuat akun');
      setLoading(false);
      return;
    }

    if (onSuccess) onSuccess();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg text-sm bg-red-500/10 text-red-500 border border-red-500/30">
          {error}
        </div>
      )}

      <div>
        <label className="label">Nama Akun</label>
        <input 
          {...register('name')} 
          type="text" 
          placeholder="Cth: Dompet Pribadi, BCA, OVO" 
          className="input-field w-full"
        />
        {errors.name && <p className="text-xs mt-1 text-red-500">{errors.name.message}</p>}
      </div>

      <div>
        <label className="label">Tipe Akun</label>
        <div className="relative">
          <select {...register('type')} className="input-field w-full appearance-none">
            <option value="cash">Tunai (Cash)</option>
            <option value="bank">Bank</option>
            <option value="ewallet">E-Wallet</option>
          </select>
        </div>
        {errors.type && <p className="text-xs mt-1 text-red-500">{errors.type.message}</p>}
      </div>

      <div className="flex gap-3 pt-4">
        {onCancel && <button type="button" onClick={onCancel} className="btn-secondary flex-1">Batal</button>}
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? 'Menyimpan...' : 'Tambah Akun'}
        </button>
      </div>
    </form>
  );
}
