'use client';

import { useState } from 'react';
import { Calendar, Tag, FileText, Download, X } from 'lucide-react';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/lib/types';

interface ExportModalProps {
  onExport: (options: ExportOptions) => void;
  onClose: () => void;
}

export interface ExportOptions {
  period: 'all' | 'current_month' | 'last_month' | 'last_3_months';
  category: string;
  type: 'all' | 'income' | 'expense';
  includeSummary: boolean;
}

export default function ExportModal({ onExport, onClose }: ExportModalProps) {
  const [options, setOptions] = useState<ExportOptions>({
    period: 'current_month',
    category: 'all',
    type: 'all',
    includeSummary: true
  });

  const allCategories = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

  return (
    <div className="space-y-6">
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        Sesuaikan laporan Anda sebelum diunduh untuk hasil yang lebih spesifik.
      </p>

      <div className="space-y-4">
        {/* Period Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
            <Calendar className="w-3 h-3" /> Periode Laporan
          </label>
          <select 
            value={options.period} 
            onChange={(e) => setOptions({...options, period: e.target.value as any})}
            className="input-field"
          >
            <option value="current_month">Bulan Ini</option>
            <option value="last_month">Bulan Lalu</option>
            <option value="last_3_months">3 Bulan Terakhir</option>
            <option value="all">Semua Waktu</option>
          </select>
        </div>

        {/* Category Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
            <Tag className="w-3 h-3" /> Kategori
          </label>
          <select 
            value={options.category} 
            onChange={(e) => setOptions({...options, category: e.target.value})}
            className="input-field"
          >
            <option value="all">Semua Kategori</option>
            {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Type Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
            <FileText className="w-3 h-3" /> Jenis Transaksi
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['all', 'income', 'expense'].map((t) => (
              <button
                key={t}
                onClick={() => setOptions({...options, type: t as any})}
                className={`py-2 px-3 rounded-xl text-xs font-medium transition-all border ${
                  options.type === t 
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' 
                    : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                }`}
              >
                {t === 'all' ? 'Semua' : t === 'income' ? 'Masuk' : 'Keluar'}
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
          <input 
            type="checkbox" 
            id="inc-summary"
            checked={options.includeSummary}
            onChange={(e) => setOptions({...options, includeSummary: e.target.checked})}
            className="w-4 h-4 rounded border-white/20 bg-transparent text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="inc-summary" className="text-sm cursor-pointer" style={{ color: 'var(--text-primary)' }}>
            Sertakan ringkasan analisis kategori
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onClose} className="btn-secondary flex-1">Batal</button>
        <button 
          onClick={() => onExport(options)} 
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Unduh Laporan
        </button>
      </div>
    </div>
  );
}
