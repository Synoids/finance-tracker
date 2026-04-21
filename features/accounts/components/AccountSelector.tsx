'use client';

import { useFormContext } from "react-hook-form";
import { Wallet, Landmark, Smartphone } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { Account } from "../queries";

export function AccountSelector({ accounts }: { accounts: Account[] }) {
  const { register, formState: { errors } } = useFormContext();

  const getIcon = (type: string) => {
    if (type === 'bank') return <Landmark className="w-4 h-4 text-indigo-500" />;
    if (type === 'ewallet') return <Smartphone className="w-4 h-4 text-purple-500" />;
    return <Wallet className="w-4 h-4 text-emerald-500" />;
  };

  return (
    <div className="w-full">
      <label className="label">Pilih Akun</label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {accounts.map((acc) => (
          <label key={acc.id} className="relative cursor-pointer">
            <input 
              type="radio" 
              value={acc.id} 
              {...register("account_id")} 
              className="peer sr-only" 
            />
            <div className={`flex flex-col p-4 border rounded-xl transition-all bg-[var(--bg-secondary)] border-transparent hover:border-[var(--text-muted)] peer-checked:border-indigo-500 peer-checked:bg-indigo-50/10`}>
              <div className="flex items-center gap-2 mb-1">
                {getIcon(acc.type)}
                <span className="font-semibold text-sm text-[var(--text-primary)] truncate">
                  {acc.name}
                </span>
              </div>
              <span className="text-xs text-[var(--text-muted)]">
                Rp {formatNumber(acc.balance)}
              </span>
            </div>
          </label>
        ))}
      </div>
      {errors.account_id && (
        <p className="text-xs mt-1 text-red-500">{errors.account_id.message as string}</p>
      )}
    </div>
  );
}
