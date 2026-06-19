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

export interface ScrapedCompany {
  name: string;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
  category?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
}
