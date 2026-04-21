import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import TransactionForm from '@/features/transactions/components/TransactionForm';
import { getAccounts } from '@/features/accounts/queries';

export default async function NewTransactionPage() {
  const accounts = await getAccounts();

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-4">
        <Link href="/transactions" className="p-2 rounded-lg transition-colors" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Tambah Transaksi</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Catat pendapatan atau pengeluaran baru</p>
        </div>
      </div>

      <div className="glass-card p-6">
        <TransactionForm accounts={accounts} />
      </div>
    </div>
  );
}
