import { SlidersHorizontal } from 'lucide-react';

export interface FiltersState {
  siteMode: 'all' | 'noSite' | 'hasSite';
  minScore: number;
}

interface FiltersProps {
  filters: FiltersState;
  onChange: (filters: FiltersState) => void;
}

export function Filters({ filters, onChange }: FiltersProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
        <SlidersHorizontal className="size-4 text-mint" />
        Filtros
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="grid grid-cols-3 rounded-md border border-slate-200 bg-slate-50 p-1 text-sm">
          {[
            ['all', 'Todos'],
            ['noSite', 'Sem site'],
            ['hasSite', 'Com site']
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ ...filters, siteMode: value as FiltersState['siteMode'] })}
              className={`h-9 rounded px-3 font-medium transition ${
                filters.siteMode === value ? 'bg-white text-ink shadow-sm' : 'text-slate-500 hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <label className="flex min-w-64 items-center gap-3 text-sm text-slate-600">
          Score mínimo
          <input
            type="range"
            min="-50"
            max="170"
            step="10"
            value={filters.minScore}
            onChange={(event) => onChange({ ...filters, minScore: Number(event.target.value) })}
            className="accent-mint"
          />
          <span className="w-10 rounded bg-field px-2 py-1 text-center font-semibold text-ink">{filters.minScore}</span>
        </label>
      </div>
    </div>
  );
}
