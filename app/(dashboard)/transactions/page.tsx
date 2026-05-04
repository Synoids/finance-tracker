'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Transaction, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/lib/types';
import { formatDate, formatCurrency, getCategoryColor } from '@/lib/utils';
import { Plus, Pencil, Trash2, Search, X, ArrowUpRight, ArrowDownRight, ChevronDown, FileDown } from 'lucide-react';
import Link from 'next/link';
import TransactionForm from '@/features/transactions/components/TransactionForm';
import ExportModal, { ExportOptions } from '@/features/transactions/components/ExportModal';
import Modal from '@/components/Modal';
import { Account } from '@/features/accounts/queries';
import EmptyState from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { exportTransactionsToPDF } from '@/lib/export';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts]         = useState<Account[]>([]);
  const [user, setUser]                 = useState<any>(null);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [filterType, setFilterType]     = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDate, setFilterDate]     = useState('');
  const [editTarget, setEditTarget]     = useState<Transaction | null>(null);
  const [deleteId, setDeleteId]         = useState<string | null>(null);
  const [deleting, setDeleting]         = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const allCategories = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    
    // Fetch both transactions, accounts and user simultaneously
    const [{ data: txs }, { data: accs }, { data: { user: userData } }] = await Promise.all([
      supabase.from('transactions').select('*').order('date', { ascending: false }),
      supabase.from('accounts').select('id, name, type, balance'),
      supabase.auth.getUser()
    ]);

    setTransactions(txs as Transaction[] ?? []);
    setAccounts(accs as Account[] ?? []);
    setUser(userData);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filtered = useMemo(() => {
    let result = [...transactions];
    if (filterType !== 'all')     result = result.filter((t) => t.type === filterType);
    if (filterCategory !== 'all') result = result.filter((t) => t.category === filterCategory);
    if (filterDate)               result = result.filter((t) => t.date === filterDate);
    if (search.trim())            result = result.filter((t) =>
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
    );
    return result;
  }, [transactions, filterType, filterCategory, filterDate, search]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    const supabase = createClient();
    await supabase.from('transactions').delete().eq('id', deleteId);
    setDeleteId(null);
    setDeleting(false);
    fetchTransactions();
  }

  function handleExport(options: ExportOptions) {
    let dataToExport = [...transactions];
    const now = new Date();
    
    // 1. Filter by Period
    if (options.period === 'current_month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      dataToExport = dataToExport.filter(t => new Date(t.date) >= start);
    } else if (options.period === 'last_month') {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      dataToExport = dataToExport.filter(t => {
        const d = new Date(t.date);
        return d >= start && d <= end;
      });
    } else if (options.period === 'last_3_months') {
      const start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      dataToExport = dataToExport.filter(t => new Date(t.date) >= start);
    }

    // 2. Filter by Category
    if (options.category !== 'all') {
      dataToExport = dataToExport.filter(t => t.category === options.category);
    }

    // 3. Filter by Type
    if (options.type !== 'all') {
      dataToExport = dataToExport.filter(t => t.type === options.type);
    }

    const periodLabelMap = {
      'current_month': 'Bulan Ini',
      'last_month': 'Bulan Lalu',
      'last_3_months': '3 Bulan Terakhir',
      'all': 'Keseluruhan'
    };

    const label = `Laporan Transaksi - ${periodLabelMap[options.period]}${options.category !== 'all' ? ` (${options.category})` : ''}`;
        
    exportTransactionsToPDF(dataToExport, user?.email, label);
    setShowExportModal(false);
  }

  function clearFilters() {
    setFilterType('all');
    setFilterCategory('all');
    setFilterDate('');
    setSearch('');
  }

  const hasFilters = filterType !== 'all' || filterCategory !== 'all' || filterDate || search;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Transaksi</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{filtered.length} transaksi</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExportModal(true)}
            className="btn-secondary h-11 px-4 flex items-center gap-2"
          >
            <FileDown className="w-4 h-4" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
          <Link 
            href="/transactions/new" 
            id="new-transaction-btn" 
            className="btn-primary w-full sm:w-auto h-11 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" /> 
            <span>Tambah Transaksi</span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 lg:col-span-2">
            <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
            <input id="filter-search" type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="input-field flex-1" placeholder="Cari transaksi..." />
          </div>

          {/* Type filter */}
          <div className="relative">
            <select id="filter-type" value={filterType} onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')} className="input-field appearance-none pr-8">
              <option value="all">Semua Jenis</option>
              <option value="income">Pemasukan</option>
              <option value="expense">Pengeluaran</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          </div>

          {/* Category filter */}
          <div className="relative">
            <select id="filter-category" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="input-field appearance-none pr-8">
              <option value="all">Semua Kategori</option>
              {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          </div>

          {/* Date filter */}
          <div className="flex items-center gap-2">
            <input id="filter-date" type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="input-field flex-1" title="Tanggal transaksi" />
          </div>
        </div>

        {hasFilters && (
          <button id="clear-filters-btn" onClick={clearFilters} className="mt-3 flex items-center gap-2 text-xs" style={{ color: '#a5b4fc', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X className="w-3 h-3" /> Hapus filter
          </button>
        )}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title={hasFilters ? "Tidak ada transaksi ditemukan" : "Belum ada transaksi"}
            description={hasFilters 
              ? "Coba sesuaikan filter atau pencarian Anda untuk menemukan data yang diinginkan." 
              : "Mulai catat pengeluaran atau pemasukan pertama Anda untuk memantau keuangan."}
            action={hasFilters ? (
              <button 
                onClick={clearFilters} 
                className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Hapus filter & tampilkan semua
              </button>
            ) : null}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Tanggal', 'Kategori', 'Deskripsi', 'Akun', 'Jenis', 'Jumlah', 'Aksi'].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)', background: 'var(--bg-secondary)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => (
                  <tr
                    key={t.id}
                    className="transition-colors"
                    style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)')}
                  >
                    <td className="px-5 py-3.5 text-sm whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>{formatDate(t.date)}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg" style={{ background: getCategoryColor(t.category) + '22', color: getCategoryColor(t.category) }}>
                        {t.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm max-w-[160px] truncate" style={{ color: 'var(--text-primary)' }}>{t.description || '—'}</td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {accounts.find(a => a.id === t.account_id)?.name || '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${t.type === 'income' ? 'income-badge' : 'expense-badge'}`}>
                        {t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-semibold whitespace-nowrap" style={{ color: t.type === 'income' ? '#22c55e' : '#ef4444' }}>
                      <span className="flex items-center gap-1">
                        {t.type === 'income' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {formatCurrency(t.amount)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          id={`edit-btn-${t.id}`}
                          onClick={() => setEditTarget(t)}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: 'none', cursor: 'pointer' }}
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`delete-btn-${t.id}`}
                          onClick={() => setDeleteId(t.id)}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', cursor: 'pointer' }}
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <Modal title="Export Laporan Keuangan" onClose={() => setShowExportModal(false)}>
          <ExportModal 
            onExport={handleExport} 
            onClose={() => setShowExportModal(false)} 
          />
        </Modal>
      )}

      {/* Edit Modal */}
      {editTarget && (
        <Modal title="Edit Transaksi" onClose={() => setEditTarget(null)}>
          <TransactionForm
            accounts={accounts}
            initial={editTarget}
            onSuccess={() => { setEditTarget(null); fetchTransactions(); }}
            onCancel={() => setEditTarget(null)}
          />
        </Modal>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <Modal title="Hapus Transaksi" onClose={() => setDeleteId(null)}>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex gap-3 justify-end">
            <button id="cancel-delete-btn" onClick={() => setDeleteId(null)} className="btn-secondary">Batal</button>
            <button id="confirm-delete-btn" onClick={handleDelete} disabled={deleting} className="btn-danger flex items-center gap-2">
              {deleting ? <span className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Hapus
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
