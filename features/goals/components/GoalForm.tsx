'use client';

import { createGoal } from "../actions";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { Plus, X, Target, DollarSign, Calendar, Tag } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export default function GoalForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [displayAmount, setDisplayAmount] = useState("");
  const [amount, setAmount] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    try {
      await createGoal(formData);
      toast.success("Target menabung berhasil dibuat!");
      setIsOpen(false);
      formRef.current?.reset();
    } catch (error) {
      toast.error("Gagal membuat target");
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="btn-primary w-full h-14 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
      >
        <Plus className="w-5 h-5" />
        <span>Buat Target Baru</span>
      </button>
    );
  }

  return (
    <div className="glass-card p-6 animate-in fade-in zoom-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Target Baru</h3>
        <button 
          onClick={() => setIsOpen(false)}
          className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
        >
          <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>

      <form action={handleSubmit} ref={formRef} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider ml-1" style={{ color: 'var(--text-muted)' }}>Nama Target</label>
          <div className="relative">
            <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
            <input
              name="name"
              required
              placeholder="Misal: Dana Darurat"
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider ml-1" style={{ color: 'var(--text-muted)' }}>Nominal Target</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
            <input
              type="text"
              value={displayAmount}
              onChange={(e) => {
                const val = e.target.value.replace(/[^\d]/g, '');
                const num = parseInt(val) || 0;
                setAmount(num);
                setDisplayAmount(num > 0 ? formatNumber(num) : "");
              }}
              required
              placeholder="0"
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <input type="hidden" name="target_amount" value={amount} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider ml-1" style={{ color: 'var(--text-muted)' }}>Kategori</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
              <input
                name="category"
                placeholder="Elektronik"
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider ml-1" style={{ color: 'var(--text-muted)' }}>Deadline</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
              <input
                name="deadline"
                type="date"
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button 
            type="submit" 
            disabled={isLoading}
            className="btn-primary w-full py-4 text-sm font-bold shadow-lg shadow-indigo-500/20 disabled:opacity-50"
          >
            {isLoading ? "Menyimpan..." : "Buat Target Sekarang"}
          </button>
        </div>
      </form>
    </div>
  );
}
