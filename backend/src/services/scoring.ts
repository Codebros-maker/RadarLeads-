import type { ScrapedCompany } from '../types/company.js';

export function calculateScore(company: Pick<ScrapedCompany, 'website' | 'phone' | 'reviewCount'>): number {
  let score = 0;

  if (!company.website) {
    score += 100;
  }

  if ((company.reviewCount ?? 0) > 100) {
    score += 50;
  }

  if (company.phone) {
    score += 20;
  }

  if (company.website) {
    score -= 50;
  }

  return score;
}
