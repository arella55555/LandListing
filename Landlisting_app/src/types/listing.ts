export type ListingStatus =
  | 'available'
  | 'pending'
  | 'sold'
  | 'draft'
  | 'archived'
  | 'leased'
  | 'rented'
  | 'rejected';

export type ListingCategory =
  | 'agricultural'
  | 'commercial'
  | 'residential'
  | 'industrial';

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  area: number;
  images: string[];
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  category: ListingCategory;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
  featured?: boolean;
}

export interface FilterOptions {
  category?: ListingCategory;
  status?: ListingStatus;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
}
