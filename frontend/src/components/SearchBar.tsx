import { Search } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface SearchBarProps {
  loading: boolean;
  onSearch: (query: string) => Promise<void>;
}

export function SearchBar({ loading, onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;
    await onSearch(value);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:flex-row">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="restaurantes em Manaus"
          className="h-12 w-full rounded-md border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition focus:border-mint focus:bg-white focus:ring-2 focus:ring-mint/20"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-ink px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Search className="size-4" />
        {loading ? 'Buscando...' : 'Buscar empresas'}
      </button>
    </form>
  );
}
