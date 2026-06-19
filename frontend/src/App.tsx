import { Building2, Globe2, Target, TrendingUp } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CompanyTable } from './components/CompanyTable';
import { Filters, type FiltersState } from './components/Filters';
import { SearchBar } from './components/SearchBar';
import { StatCard } from './components/StatCard';
import { getCompanies, getStats, searchCompanies, type Company, type DashboardStats } from './lib/api';

const initialStats: DashboardStats = {
  total: 0,
  withoutSite: 0,
  withSite: 0,
  topOpportunities: []
};

export function App() {
  const [stats, setStats] = useState(initialStats);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filters, setFilters] = useState<FiltersState>({ siteMode: 'all', minScore: -50 });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const apiFilters = useMemo(
    () => ({
      noSite: filters.siteMode === 'noSite',
      hasSite: filters.siteMode === 'hasSite',
      minScore: filters.minScore
    }),
    [filters]
  );

  const refresh = useCallback(async () => {
    const [nextStats, nextCompanies] = await Promise.all([getStats(), getCompanies(apiFilters)]);
    setStats(nextStats);
    setCompanies(nextCompanies);
  }, [apiFilters]);

  useEffect(() => {
    refresh().catch((error: unknown) => {
      setMessage(error instanceof Error ? error.message : 'Nao foi possivel carregar os dados.');
    });
  }, [refresh]);

  async function handleSearch(query: string) {
    setLoading(true);
    setMessage(null);
    try {
      const result = await searchCompanies(query);
      setMessage(`${result.found} empresas salvas para "${result.query}".`);
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao buscar empresas.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f9fb] text-ink">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-2 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-mint">RadarLeads</p>
            <h1 className="mt-1 text-3xl font-semibold text-ink">Prospecção local para serviços web</h1>
          </div>
          <div className="rounded-md bg-white px-3 py-2 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
            Score alto indica oportunidade comercial maior.
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Empresas encontradas" value={stats.total} icon={<Building2 className="size-5" />} />
          <StatCard label="Empresas sem site" value={stats.withoutSite} icon={<Target className="size-5" />} />
          <StatCard label="Empresas com site" value={stats.withSite} icon={<Globe2 className="size-5" />} />
          <StatCard label="Top oportunidades" value={stats.topOpportunities.length} icon={<TrendingUp className="size-5" />} />
        </section>

        <SearchBar loading={loading} onSearch={handleSearch} />

        {message && <div className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">{message}</div>}

        <Filters filters={filters} onChange={setFilters} />

        <section className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <CompanyTable companies={companies} />
          <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Top oportunidades</h2>
            <div className="mt-4 space-y-3">
              {stats.topOpportunities.map((company) => (
                <div key={company.id} className="rounded-md border border-slate-100 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-ink">{company.name}</p>
                    <span className="rounded bg-mint/10 px-2 py-1 text-xs font-semibold text-mint">{company.score}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{company.category ?? 'Categoria nao informada'}</p>
                </div>
              ))}
              {stats.topOpportunities.length === 0 && <p className="text-sm text-slate-500">Busque empresas para iniciar o ranking.</p>}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
