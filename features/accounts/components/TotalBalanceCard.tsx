import { Wallet } from "lucide-react";
import { Account } from "../queries";
import { formatNumber } from "@/lib/utils";

export function TotalBalanceCard({ accounts }: { accounts: Account[] }) {
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 rounded-[2rem] p-8 md:p-10 text-white shadow-2xl shadow-indigo-500/30 relative overflow-hidden group transition-all duration-500 hover:shadow-indigo-500/40">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-[0.07] rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-indigo-400 opacity-10 rounded-full blur-2xl" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-8">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 shadow-inner">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="bg-white/10 border border-white/10 px-4 py-1 rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase backdrop-blur-sm">
              Net Worth
            </span>
            <span className="text-[10px] text-indigo-200 font-medium">Updated just now</span>
          </div>
        </div>
        
        <p className="text-indigo-100 text-sm md:text-base font-medium mb-1 opacity-80">Total Saldo (Semua Akun)</p>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
          Rp {formatNumber(totalBalance)}
        </h2>

        <div className="mt-8 flex gap-3">
          <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-white/40 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
