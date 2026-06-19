import { Download, ExternalLink, Globe2, Phone } from 'lucide-react';
import type { Company } from '../lib/api';

interface CompanyTableProps {
  companies: Company[];
}

const exportColumns: Array<{ label: string; value: (company: Company) => string | number | null }> = [
  { label: 'Empresa', value: (company) => company.name },
  { label: 'Categoria', value: (company) => company.category },
  { label: 'Telefone', value: (company) => company.phone },
  { label: 'Endereco', value: (company) => company.address },
  { label: 'Site', value: (company) => company.website },
  { label: 'Avaliacao', value: (company) => company.rating },
  { label: 'Numero de avaliacoes', value: (company) => company.reviewCount },
  { label: 'Score', value: (company) => company.score },
  { label: 'Busca', value: (company) => company.searchTerm },
  { label: 'Criado em', value: (company) => company.createdAt },
  { label: 'Atualizado em', value: (company) => company.updatedAt }
];

function escapeHtml(value: string | number | null) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function exportToExcel(companies: Company[]) {
  const header = exportColumns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join('');
  const rows = companies
    .map((company) => `<tr>${exportColumns.map((column) => `<td>${escapeHtml(column.value(company))}</td>`).join('')}</tr>`)
    .join('');
  const worksheet = `<!doctype html><html><head><meta charset="UTF-8" /></head><body><table><thead><tr>${header}</tr></thead><tbody>${rows}</tbody></table></body></html>`;
  const blob = new Blob([worksheet], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);

  link.href = url;
  link.download = `radarleads-${date}.xls`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function CompanyTable({ companies }: CompanyTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Empresas</h2>
          <p className="mt-1 text-sm text-slate-600">{companies.length} registros filtrados</p>
        </div>
        <button
          type="button"
          onClick={() => exportToExcel(companies)}
          disabled={companies.length === 0}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-ink transition hover:border-mint hover:text-mint disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="size-4" />
          Exportar Excel
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {['Empresa', 'Categoria', 'Telefone', 'Site', 'Score'].map((header) => (
                <th key={header} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {companies.map((company) => (
              <tr key={company.id} className="hover:bg-slate-50/80">
                <td className="max-w-xs px-5 py-4">
                  <p className="font-semibold text-ink">{company.name}</p>
                  <p className="mt-1 line-clamp-1 text-xs text-slate-500">{company.address ?? 'Endereco nao informado'}</p>
                </td>
                <td className="px-5 py-4 text-sm text-slate-600">{company.category ?? 'Nao informado'}</td>
                <td className="px-5 py-4 text-sm text-slate-600">
                  {company.phone ? (
                    <span className="inline-flex items-center gap-2">
                      <Phone className="size-4 text-mint" />
                      {company.phone}
                    </span>
                  ) : (
                    'Nao informado'
                  )}
                </td>
                <td className="px-5 py-4 text-sm">
                  {company.website ? (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 font-medium text-mint hover:text-ink"
                    >
                      <Globe2 className="size-4" />
                      Abrir
                      <ExternalLink className="size-3" />
                    </a>
                  ) : (
                    <span className="rounded bg-coral/10 px-2 py-1 text-xs font-semibold text-coral">Sem site</span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <span className="inline-flex min-w-14 justify-center rounded bg-ink px-3 py-1 text-sm font-semibold text-white">
                    {company.score}
                  </span>
                </td>
              </tr>
            ))}
            {companies.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-500">
                  Nenhuma empresa encontrada com os filtros atuais.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
