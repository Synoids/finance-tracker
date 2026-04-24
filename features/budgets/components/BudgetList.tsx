'use client';

import { Budget } from '@/lib/types';
import { formatCurrency, getCategoryColor, cn } from '@/lib/utils';
import { Trash2, Wallet2, AlertCircle } from 'lucide-react';
import { deleteBudget } from '../actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import EmptyState from '@/components/ui/EmptyState';

interface BudgetWithProgress extends Budget {
  spent: number;
}

interface BudgetListProps {
  budgets: BudgetWithProgress[];
}

export default function BudgetList({ budgets }: BudgetListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm('Apakah Anda yakin ingin menghapus anggaran ini?')) return;
    
    setDeletingId(id);
    try {
      await deleteBudget(id);
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  if (budgets.length === 0) {
    return (
      <EmptyState
        icon={Wallet2}
        title="Belum ada anggaran bulan ini"
        description="Mulai atur batasan pengeluaran Anda dengan formulir di samping untuk kontrol finansial yang lebih baik."
        className="glass-card"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {budgets.map((budget) => {
        const percentage = Math.min((budget.spent / budget.amount) * 100, 100);
        const isOverBudget = budget.spent > budget.amount;
        
        let barColor = 'bg-emerald-500';
        if (percentage >= 100) barColor = 'bg-red-500';
        else if (percentage >= 70) barColor = 'bg-amber-500';

        return (
          <div 
            key={budget.id} 
            className="glass-card p-4 flex flex-col gap-3 group hover:bg-[var(--bg-secondary)] transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
                  style={{ 
                    background: getCategoryColor(budget.category) + '22', 
                    color: getCategoryColor(budget.category) 
                  }}
                >
                  {budget.category.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{budget.category}</p>
                  <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>
                    Anggaran Bulanan
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => handleDelete(budget.id)}
                disabled={deletingId === budget.id}
                className="p-1.5 rounded-lg text-red-500/70 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                title="Hapus anggaran"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: 'var(--text-secondary)' }}>
                  Terpakai: <span className="font-semibold" style={{ color: isOverBudget ? '#ef4444' : 'var(--text-primary)' }}>{formatCurrency(budget.spent)}</span>
                </span>
                <span style={{ color: 'var(--text-muted)' }}>
                   Limit: <span className="font-medium text-indigo-400">{formatCurrency(budget.amount)}</span>
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                <div 
                  className={cn("h-full transition-all duration-1000 ease-out", barColor)}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium" style={{ color: percentage >= 100 ? '#ef4444' : 'var(--text-muted)' }}>
                  {percentage.toFixed(0)}% telah terpakai
                </span>
                {isOverBudget && (
                  <div className="flex items-center gap-1 text-red-500 animate-pulse">
                    <AlertCircle className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase">Over Budget!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
