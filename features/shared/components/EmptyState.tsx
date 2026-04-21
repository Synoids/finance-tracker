import { FolderOpen } from "lucide-react";

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border-2 border-dashed border-[var(--border)] bg-[var(--bg-secondary)]">
      <div className="w-14 h-14 bg-[var(--bg-card)] rounded-full flex items-center justify-center mb-4">
        <FolderOpen className="w-6 h-6 text-[var(--text-muted)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="mt-1 text-sm text-[var(--text-muted)] max-w-sm">{message}</p>
    </div>
  );
}
