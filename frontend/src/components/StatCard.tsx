import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: number;
  icon: ReactNode;
}

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <strong className="mt-2 block text-3xl font-semibold text-ink dark:text-slate-100">{value}</strong>
        </div>
        <div className="grid size-11 place-items-center rounded-lg bg-field text-mint dark:bg-slate-700">{icon}</div>
      </div>
    </div>
  );
}
