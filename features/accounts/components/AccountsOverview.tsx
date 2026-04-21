'use client';

import { useState } from "react";
import { Landmark, Smartphone, Wallet, Plus } from "lucide-react";
import { Account } from "../queries";
import { EmptyState } from "@/features/shared/components/EmptyState";
import { formatNumber } from "@/lib/utils";
import Modal from "@/components/Modal";
import AccountForm from "./AccountForm";

export function AccountsOverview({ accounts }: { accounts: Account[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getIcon = (type: string) => {
    if (type === 'bank') return <Landmark className="w-5 h-5 text-indigo-500" />;
    if (type === 'ewallet') return <Smartphone className="w-5 h-5 text-purple-500" />;
    return <Wallet className="w-5 h-5 text-emerald-500" />;
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-5">
        {accounts.map((acc) => (
          <div key={acc.id} className="glass-card p-6 transition-all hover:border-[var(--text-muted)] group">
            <div className="flex justify-between items-center mb-4">
              <div className="p-2.5 rounded-xl bg-[var(--bg-secondary)] group-hover:bg-indigo-50/20 transition-colors">
                {getIcon(acc.type)}
              </div>
            </div>
            <h3 className="font-semibold text-base text-[var(--text-primary)]">{acc.name}</h3>
            <p className="text-[var(--text-muted)] text-xs font-medium uppercase tracking-wide mb-1 opacity-70">
              {acc.type}
            </p>
            <p className="text-xl font-bold text-[var(--text-primary)] mt-2">
              Rp {formatNumber(acc.balance)}
            </p>
          </div>
        ))}

        {/* Tombol Tambah Akun */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="glass-card p-6 flex flex-col items-center justify-center min-h-[160px] cursor-pointer hover:bg-[var(--bg-secondary)] transition-all border-dashed border-2 group"
        >
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-[var(--text-muted)] flex items-center justify-center mb-3 group-hover:border-indigo-500 group-hover:text-indigo-500 transition-colors text-[var(--text-muted)]">
            <Plus className="w-6 h-6" />
          </div>
          <span className="font-medium text-[var(--text-secondary)] group-hover:text-indigo-600 transition-colors">Tambah Akun Baru</span>
        </button>
      </div>

      {isModalOpen && (
        <Modal title="Tambah Akun Baru" onClose={() => setIsModalOpen(false)}>
          <AccountForm 
            onSuccess={() => setIsModalOpen(false)} 
            onCancel={() => setIsModalOpen(false)} 
          />
        </Modal>
      )}
    </>
  );
}
