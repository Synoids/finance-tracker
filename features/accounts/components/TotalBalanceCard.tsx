import { Wallet } from "lucide-react";
import { Account } from "../queries";
import { formatNumber } from "@/lib/utils";

export function TotalBalanceCard({ accounts }: { accounts: Account[] }) {
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl md:rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4 md:mb-6">
          <div className="p-2.5 md:p-3 bg-white/10 rounded-xl backdrop-blur-md">
            <Wallet className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] md:text-xs font-semibold tracking-wider uppercase">
            Net Worth
          </span>
        </div>
        
        <p className="text-indigo-100 text-xs md:text-sm font-medium mb-1">Total Saldo (Semua Akun)</p>
        <h2 className="text-2xl md:text-4xl font-bold tracking-tight">
          Rp {formatNumber(totalBalance)}
        </h2>
      </div>
    </div>
  );
}
