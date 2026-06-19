export interface Company {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  website: string | null;
  category: string | null;
  rating: number | null;
  reviewCount: number | null;
  score: number;
  searchTerm: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  total: number;
  withoutSite: number;
  withSite: number;
  topOpportunities: Company[];
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    ...options
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? 'Falha ao comunicar com a API.');
  }

  return response.json() as Promise<T>;
}

export function getStats(): Promise<DashboardStats> {
  return request<DashboardStats>('/companies/stats');
}

export function getCompanies(filters: { noSite?: boolean; hasSite?: boolean; minScore?: number }): Promise<Company[]> {
  const params = new URLSearchParams();

  if (filters.noSite) params.set('noSite', 'true');
  if (filters.hasSite) params.set('hasSite', 'true');
  if (typeof filters.minScore === 'number') params.set('minScore', String(filters.minScore));

  const query = params.toString();
  return request<Company[]>(`/companies${query ? `?${query}` : ''}`);
}

export function searchCompanies(query: string): Promise<{ query: string; found: number; companies: Company[] }> {
  return request('/search', {
    method: 'POST',
    body: JSON.stringify({ query })
  });
}
