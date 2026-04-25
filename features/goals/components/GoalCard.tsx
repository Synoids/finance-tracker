'use client';

import { Goal } from "@/lib/types";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { Target, TrendingUp, Calendar, Trash2, Plus, Wallet, Landmark, Smartphone, ChevronDown, X } from "lucide-react";
import { updateGoalProgress, deleteGoal } from "../actions";
import { useState } from "react";
import { toast } from "sonner";
import { Account } from "@/features/accounts/queries";

interface GoalCardProps {
  goal: Goal;
  accounts: Account[];
}

export default function GoalCard({ goal, accounts }: GoalCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [amount, setAmount] = useState(0);
  const [displayAmount, setDisplayAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shouldDeduct, setShouldDeduct] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || "");
  const [mode, setMode] = useState<'add' | 'withdraw'>('add');

  const progress = Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100);
  const remaining = Math.max(goal.target_amount - goal.current_amount, 0);

  const getAccountIcon = (type: string) => {
    if (type === 'bank') return <Landmark className="w-3 h-3" />;
    if (type === 'ewallet') return <Smartphone className="w-3 h-3" />;
    return <Wallet className="w-3 h-3" />;
  };

  async function handleAction() {
    if (amount <= 0) return;
    if (shouldDeduct && !selectedAccountId) {
      toast.error("Pilih akun terlebih dahulu");
      return;
    }
    
    setIsLoading(true);
    try {
      await updateGoalProgress(goal.id, amount, selectedAccountId, shouldDeduct, mode);
      
      let message = "";
      if (mode === 'add') {
        message = shouldDeduct 
          ? `Tabungan berhasil ditambah & saldo dipotong!` 
          : `Tabungan berhasil ditambah (Virtual Tracking)`;
      } else {
        message = shouldDeduct 
          ? `Uang berhasil diambil & saldo akun bertambah!` 
          : `Uang berhasil diambil (Virtual Tracking)`;
      }
      
      toast.success(message);
      setAmount(0);
      setDisplayAmount("");
      setIsAdding(false);
      setShouldDeduct(false);
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Apakah Anda yakin ingin menghapus target ini?")) return;
    
    try {
      await deleteGoal(goal.id);
      toast.success("Target berhasil dihapus");
    } catch (error) {
      toast.error("Gagal menghapus target");
    }
  }

  return (
    <div className="glass-card p-6 flex flex-col gap-5 group relative transition-all hover:shadow-xl hover:shadow-indigo-500/5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" 
               style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1' }}>
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{goal.name}</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{goal.category || 'Tabungan'}</p>
          </div>
        </div>
        <button 
          onClick={handleDelete}
          className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Terkumpul</p>
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(goal.current_amount)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Target</p>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>{formatCurrency(goal.target_amount)}</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-3 rounded-full bg-[var(--bg-secondary)] overflow-hidden border border-[var(--border)]">
          <div 
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{ 
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
              boxShadow: '0 0 10px rgba(99,102,241,0.5)'
            }}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
          <span style={{ color: '#6366f1' }}>{progress}% Tercapai</span>
          <span style={{ color: 'var(--text-muted)' }}>Sisa {formatCurrency(remaining)}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>{goal.deadline ? `Deadline: ${formatDate(goal.deadline)}` : 'Tanpa Deadline'}</span>
        </div>
      </div>

      {isAdding ? (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Mode Selector */}
          <div className="flex p-1 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
            <button
              onClick={() => setMode('add')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'add' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Isi Celengan
            </button>
            <button
              onClick={() => setMode('withdraw')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'withdraw' 
                ? 'bg-red-600 text-white shadow-md' 
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Ambil Uang
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-indigo-500">Rp</span>
              <input
                type="text"
                value={displayAmount}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^\d]/g, '');
                  const num = parseInt(val) || 0;
                  setAmount(num);
                  setDisplayAmount(num > 0 ? formatNumber(num) : "");
                }}
                placeholder="0"
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl pl-9 pr-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                autoFocus
              />
            </div>
            <button 
              onClick={() => { setIsAdding(false); setShouldDeduct(false); }}
              className="p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={shouldDeduct}
                onChange={(e) => setShouldDeduct(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                {mode === 'add' ? 'Potong dari saldo?' : 'Kembalikan ke saldo?'}
              </span>
            </label>

            {shouldDeduct && (
              <div className="space-y-2 animate-in fade-in slide-in-from-left-2 duration-200">
                <p className="text-[10px] font-bold uppercase tracking-wider px-1" style={{ color: 'var(--text-muted)' }}>
                  {mode === 'add' ? 'Sumber Dana' : 'Tujuan Saldo'}
                </p>
                <div className="grid grid-cols-1 gap-2">
                  <select 
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} (Rp {formatNumber(acc.balance)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={handleAction}
            disabled={isLoading || amount <= 0}
            className={`w-full py-3 text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2 rounded-2xl transition-all shadow-lg ${
              mode === 'add' 
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20' 
              : 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20'
            }`}
          >
            {isLoading ? "Memproses..." : (mode === 'add' ? "Konfirmasi Tabungan" : "Konfirmasi Pengambilan")}
          </button>
        </div>
      ) : (
        <button 
          onClick={() => setIsAdding(true)}
          className="w-full py-3 rounded-2xl border-2 border-dashed border-[var(--border)] flex items-center justify-center gap-2 text-sm font-semibold transition-all hover:border-indigo-500/50 hover:text-indigo-400"
          style={{ color: 'var(--text-secondary)' }}
        >
          <Plus className="w-4 h-4" /> Kelola Celengan
        </button>
      )}
    </div>
  );
}
