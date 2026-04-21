export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-[var(--border)] rounded ${className}`} />
  );
}

export function AccountsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="glass-card p-6">
          <Skeleton className="w-10 h-10 rounded-xl mb-4" />
          <Skeleton className="w-24 h-4 mb-3" />
          <Skeleton className="w-16 h-3 mb-3" />
          <Skeleton className="w-32 h-6 mt-2" />
        </div>
      ))}
    </div>
  );
}
