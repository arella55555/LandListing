/**
 * listingService.ts  –  lupa.ph
 * Updated to match the actual backend response format:
 *   GET /listings         → { listings: [...] }
 *   GET /listings/:id     → { listing: {...} }
 *   POST /post/listings   → { message, listing }
 *   PUT /listings/:id     → { message, listing }
 *   DELETE /listings/:id  → { message }
 *
 * Note: backend returns `is_saved` — mapped to `is_favorited` here
 */

import api from './api';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export interface ListingImage {
  id: string;
  listing_id: string;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
}

export interface Listing {
  saved_id?: string;
  id: string;
  seller_id: string;
  category_id: number;
  title: string;
  description: string;
  price: number;
  area_sqm: number;
  latitude: number;
  longitude: number;
  barangay?: string;
  municipality: string;
  province: string;
  title_status: 'TCT' | 'OCT' | 'tax_dec' | 'other';
  listing_type: 'sale' | 'rent' | 'lease';
  status: 'draft' | 'pending' | 'active' | 'sold' | 'leased' | 'rented' | 'rejected' | 'archived';
  negotiable: boolean;
  created_at: string;
  updated_at: string;
  images?: ListingImage[];
  image_url?: string;
  is_favorited?: boolean;   // mapped from backend's is_saved
  is_saved?: boolean;       // raw backend field
  primary_image_url?: string;
}

export interface CreateListingPayload {
  category_id: number;
  title: string;
  description: string;
  price: number;
  area_sqm: number;
  latitude: number;
  longitude: number;
  barangay?: string;
  municipality: string;
  province: string;
  title_status: Listing['title_status'];
  listing_type: Listing['listing_type'];
  negotiable?: boolean;
  image_urls?: string[];
}

export type UpdateListingPayload = Partial<CreateListingPayload>;

export interface ListingFilters {
  search?: string;
  municipality?: string;
  province?: string;
  category_id?: number;
  listing_type?: Listing['listing_type'];
  min_price?: number;
  max_price?: number;
  min_area?: number;
  max_area?: number;
  status?: Listing['status'];
  page?: number;
  limit?: number;
}

// ─────────────────────────────────────────────
// Helper: normalize is_saved → is_favorited
// ─────────────────────────────────────────────
function normalize(listing: any): Listing {
  return {
    ...listing,
    is_favorited: listing.is_saved ?? listing.is_favorited ?? false,
  };
}

// ─────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────
export const listingService = {

  /**
   * GET /listings
   * Backend returns: { listings: [...] }
   */
  async getAll(filters?: ListingFilters): Promise<Listing[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          params.append(key, String(val));
        }
      });
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(`/listings${query}`);
    const rows = response.data?.listings ?? response.data ?? [];
    return rows.map(normalize);
  },

  /**
   * GET /listings/:id
   * Backend returns: { listing: {...} }
   */
  async getById(id: string): Promise<Listing> {
    const response = await api.get(`/listings/${id}`);
    const row = response.data?.listing ?? response.data;
    return normalize(row);
  },

  /**
   * GET /listings/my
   * Backend returns: { listings: [...] }
   */
  async getMyListings(): Promise<Listing[]> {
    const response = await api.get('/listings/my');
    const rows = response.data?.listings ?? response.data ?? [];
    return rows.map(normalize);
  },

  /**
   * POST /post/listings   ← note: /post/ prefix from backend
   * Backend returns: { message, listing }
   */
  async create(payload: CreateListingPayload): Promise<Listing> {
    const response = await api.post('/post/listings', payload);
    const row = response.data?.listing ?? response.data;
    return normalize(row);
  },

  /**
   * PUT /listings/:id
   * Backend returns: { message, listing }
   */
  async update(id: string, payload: UpdateListingPayload): Promise<Listing> {
    const response = await api.put(`/listings/${id}`, payload);
    const row = response.data?.listing ?? response.data;
    return normalize(row);
  },

  /**
   * DELETE /listings/:id
   * Backend returns: { message }
   */
  async remove(id: string): Promise<void> {
    await api.delete(`/listings/${id}`);
  },

  // ── Favorites ─────────────────────────────

  /**
   * GET /listings/favorites
   * Backend returns: { listings: [...] }
   */
  async getFavorites(): Promise<Listing[]> {
    const response = await api.get('/favorites');
    const rows = response.data?.favorites ?? response.data?.listings ?? response.data ?? [];
    return rows.map(normalize);
  },

  /**
   * POST /listings/:id/favorite
   */
  async addFavorite(listingId: string): Promise<string> {
    const response = await api.post('/favorites', { listing_id: listingId });
    const fav = response.data?.favorite ?? response.data;
    return fav?.id;
  },

  /**
   * DELETE /listings/:id/favorite
   */
  async removeFavorite(savedId: string): Promise<void> {
    await api.delete(`/favorites/${savedId}`);
  },

  /**
   * Toggle helper
   */
  async toggleFavorite(listing: Listing): Promise<boolean> {
    if (listing.is_favorited) {
      await listingService.removeFavorite(listing.saved_id ?? listing.id);
      return false;
    } else {
      await listingService.addFavorite(listing.id);
      return true;
    }
  },
};