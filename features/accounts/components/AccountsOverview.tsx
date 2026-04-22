'use client';

import { useState } from "react";
import { Landmark, Smartphone, Wallet, Plus, Edit2, Trash2 } from "lucide-react";
import { Account } from "../queries";
import { EmptyState } from "@/features/shared/components/EmptyState";
import { formatNumber } from "@/lib/utils";
import Modal from "@/components/Modal";
import AccountForm from "./AccountForm";
import { deleteAccount } from "../actions";
import { useRouter } from "next/navigation";

export function AccountsOverview({ accounts }: { accounts: Account[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const router = useRouter();

  const handleEdit = (account: Account) => {
    setSelectedAccount(account);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedAccount(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus akun ini? Transaksi terkait harus dihapus terlebih dahulu.")) return;
    
    setIsDeleting(id);
    const result = await deleteAccount(id);
    
    if (!result.success) {
      alert(result.error);
    } else {
      router.refresh();
    }
    setIsDeleting(null);
  };

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
              <div className="flex gap-2">
                <button 
                  onClick={() => handleEdit(acc)} 
                  className="p-1.5 rounded-full text-[var(--text-muted)] hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  title="Edit Akun"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(acc.id)} 
                  disabled={isDeleting === acc.id}
                  className="p-1.5 rounded-full text-[var(--text-muted)] hover:bg-red-50 hover:text-red-500 transition-colors"
                  title="Hapus Akun"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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
          onClick={handleAdd}
          className="glass-card p-6 flex flex-col items-center justify-center min-h-[160px] cursor-pointer hover:bg-[var(--bg-secondary)] transition-all border-dashed border-2 group"
        >
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-[var(--text-muted)] flex items-center justify-center mb-3 group-hover:border-indigo-500 group-hover:text-indigo-500 transition-colors text-[var(--text-muted)]">
            <Plus className="w-6 h-6" />
          </div>
          <span className="font-medium text-[var(--text-secondary)] group-hover:text-indigo-600 transition-colors">Tambah Akun Baru</span>
        </button>
      </div>

      {isModalOpen && (
        <Modal 
          title={selectedAccount ? "Edit Akun" : "Tambah Akun Baru"} 
          onClose={() => setIsModalOpen(false)}
        >
          <AccountForm 
            onSuccess={() => setIsModalOpen(false)} 
            onCancel={() => setIsModalOpen(false)}
            initialData={selectedAccount ? { name: selectedAccount.name, type: selectedAccount.type } : undefined}
            accountId={selectedAccount?.id}
          />
        </Modal>
      )}
    </>
  );
}
