import { createHash } from 'node:crypto';
import type { Company, ScrapedCompany } from '../types/company.js';
import { calculateScore } from '../services/scoring.js';
import { firestore } from './firebase.js';

const companiesCollection = firestore.collection('companies');

type CompanyDocument = Omit<Company, 'id'> & {
  hasWebsite: boolean;
  identityKey: string;
};

type NormalizedCompany = {
  name: string;
  phone: string | null;
  address: string | null;
  website: string | null;
  category: string | null;
  rating: number | null;
  reviewCount: number | null;
};

function mapCompany(id: string, data: FirebaseFirestore.DocumentData): Company {
  return {
    id,
    name: String(data.name ?? ''),
    phone: data.phone ?? null,
    address: data.address ?? null,
    website: data.website ?? null,
    category: data.category ?? null,
    rating: typeof data.rating === 'number' ? data.rating : null,
    reviewCount: typeof data.reviewCount === 'number' ? data.reviewCount : null,
    score: typeof data.score === 'number' ? data.score : 0,
    searchTerm: String(data.searchTerm ?? ''),
    createdAt: String(data.createdAt ?? ''),
    updatedAt: String(data.updatedAt ?? '')
  };
}

function sortCompanies(companies: Company[]): Company[] {
  return companies.sort((left, right) => {
    if (right.score !== left.score) return right.score - left.score;
    if ((right.reviewCount ?? -1) !== (left.reviewCount ?? -1)) return (right.reviewCount ?? -1) - (left.reviewCount ?? -1);
    return left.name.localeCompare(right.name);
  });
}

function getIdentityKey(company: Pick<NormalizedCompany, 'name' | 'address'>): string {
  return `${company.name.trim().toLowerCase()}|${company.address?.trim().toLowerCase() ?? ''}`;
}

function getDocumentId(identityKey: string): string {
  return createHash('sha256').update(identityKey).digest('hex');
}

export interface CompanyFilters {
  noSite?: boolean;
  hasSite?: boolean;
  minScore?: number;
}

export async function listCompanies(filters: CompanyFilters = {}): Promise<Company[]> {
  const snapshot = await companiesCollection.get();
  const companies = snapshot.docs.map((document) => mapCompany(document.id, document.data()));

  return sortCompanies(
    companies.filter((company) => {
      if (filters.noSite && company.website) return false;
      if (filters.hasSite && !company.website) return false;
      if (typeof filters.minScore === 'number' && company.score < filters.minScore) return false;
      return true;
    })
  );
}

export async function getTopCompanies(limit = 10): Promise<Company[]> {
  const snapshot = await companiesCollection.orderBy('score', 'desc').limit(limit).get();
  return sortCompanies(snapshot.docs.map((document) => mapCompany(document.id, document.data()))).slice(0, limit);
}

export async function getCompanyById(id: string): Promise<Company | null> {
  const document = await companiesCollection.doc(id).get();
  return document.exists ? mapCompany(document.id, document.data() ?? {}) : null;
}

export async function upsertCompanies(searchTerm: string, companies: ScrapedCompany[]): Promise<Company[]> {
  const saved: Company[] = [];

  for (const item of companies) {
    const normalized: NormalizedCompany = {
      name: item.name.trim(),
      phone: normalizeOptional(item.phone),
      address: normalizeOptional(item.address),
      website: normalizeOptional(item.website),
      category: normalizeOptional(item.category),
      rating: item.rating ?? null,
      reviewCount: item.reviewCount ?? null
    };

    if (!normalized.name) {
      continue;
    }

    const identityKey = getIdentityKey(normalized);
    const documentRef = companiesCollection.doc(getDocumentId(identityKey));
    const currentDocument = await documentRef.get();
    const now = new Date().toISOString();
    const currentData = currentDocument.data();
    const companyDocument: CompanyDocument = {
      ...normalized,
      hasWebsite: Boolean(normalized.website),
      identityKey,
      score: calculateScore(normalized),
      searchTerm,
      createdAt: String(currentData?.createdAt ?? now),
      updatedAt: now
    };

    await documentRef.set(companyDocument, { merge: true });
    const nextDocument = await documentRef.get();
    saved.push(mapCompany(nextDocument.id, nextDocument.data() ?? companyDocument));
  }

  return saved;
}

export async function getDashboardStats() {
  const companies = await listCompanies();

  return {
    total: companies.length,
    withoutSite: companies.filter((company) => !company.website).length,
    withSite: companies.filter((company) => Boolean(company.website)).length,
    topOpportunities: sortCompanies([...companies]).slice(0, 5)
  };
}

function normalizeOptional(value?: string | null): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}
