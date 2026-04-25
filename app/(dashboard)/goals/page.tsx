import { getGoals } from "@/features/goals/queries";
import { getAccounts } from "@/features/accounts/queries";
import GoalCard from "@/features/goals/components/GoalCard";
import GoalForm from "@/features/goals/components/GoalForm";
import { PiggyBank, Target, CheckCircle2, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function GoalsPage() {
  const [goals, accounts] = await Promise.all([
    getGoals(),
    getAccounts()
  ]);
  
  const totalSavings = goals.reduce((sum, g) => sum + g.current_amount, 0);
  const activeGoals = goals.filter(g => g.status === 'active').length;
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalSavings / totalTarget) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] p-8 md:p-10 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-48 h-48 bg-indigo-400 opacity-20 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
              <PiggyBank className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Target Menabung</h1>
          </div>
          <p className="text-indigo-100 max-w-md text-lg leading-relaxed">
            Wujudkan impianmu dengan menabung secara konsisten. Setiap receh sangat berarti!
          </p>
        </div>

        <div className="relative z-10 flex flex-col items-center md:items-end gap-2">
          <p className="text-indigo-100 text-sm font-medium uppercase tracking-widest">Total Terkumpul</p>
          <h2 className="text-5xl font-black tracking-tighter">
            {formatCurrency(totalSavings)}
          </h2>
          <div className="flex items-center gap-2 mt-2 bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/20">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-bold">{overallProgress}% dari total target</span>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center gap-5 border-l-4 border-l-indigo-500">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <Target className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Target Aktif</p>
            <p className="text-2xl font-black text-[var(--text-primary)]">{activeGoals}</p>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center gap-5 border-l-4 border-l-green-500">
          <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Selesai</p>
            <p className="text-2xl font-black text-[var(--text-primary)]">{completedGoals}</p>
          </div>
        </div>

        <div className="flex items-center">
          <GoalForm />
        </div>
      </div>

      {/* Goals Content */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-[var(--text-primary)]">Daftar Impian</h2>
          <div className="h-px flex-1 bg-[var(--border)] mx-6 opacity-50 hidden sm:block" />
        </div>

        {goals.length === 0 ? (
          <div className="glass-card py-20 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 rounded-[2rem] bg-[var(--bg-secondary)] flex items-center justify-center mb-6 shadow-inner">
              <PiggyBank className="w-12 h-12 text-[var(--text-muted)]" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Belum ada target menabung</h3>
            <p className="text-[var(--text-muted)] max-w-sm mb-8">
              Mulai buat target pertamamu sekarang dan pantau progresnya hingga tercapai!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} accounts={accounts} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
