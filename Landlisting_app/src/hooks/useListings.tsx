/**
 * useListings.ts  –  lupa.ph
 *
 * Uses module-level shared state so ALL screens see the same data.
 * Favorites and new listings persist across navigation.
 *
 * Set USE_MOCK = false when backend is ready.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  listingService,
  Listing,
  CreateListingPayload,
  UpdateListingPayload,
  ListingFilters,
} from '../services/listingService';

const USE_MOCK = true;

// ─────────────────────────────────────────────
// MODULE-LEVEL shared state
// All hook instances read/write the SAME arrays
// ─────────────────────────────────────────────
let _listings: Listing[] = [
  {
    id: '1',
    seller_id: 'seller-1',
    category_id: 1,
    title: 'Boogs Lot',
    description: 'Prime commercial lot in the heart of Kalibo.',
    price: 25_000_000,
    area_sqm: 3000,
    latitude: 11.7087,
    longitude: 122.3634,
    municipality: 'Kalibo',
    province: 'Aklan',
    title_status: 'TCT',
    listing_type: 'sale',
    status: 'active',
    negotiable: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    primary_image_url: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80',
    is_favorited: false,
  },
  {
    id: '2',
    seller_id: 'seller-2',
    category_id: 1,
    title: 'Lupain ni Cheyt',
    description: 'Agricultural lot perfect for farming and leisure.',
    price: 3_200_000,
    area_sqm: 8000,
    latitude: 11.8423,
    longitude: 122.1045,
    municipality: 'Nabas',
    province: 'Aklan',
    title_status: 'tax_dec',
    listing_type: 'sale',
    status: 'active',
    negotiable: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    primary_image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80',
    is_favorited: false,
  },
  {
    id: '3',
    seller_id: 'seller-1',
    category_id: 5,
    title: 'Batan Farm Lot',
    description: 'Coconut land near the coast, ideal for agri-tourism.',
    price: 1_500_000,
    area_sqm: 5000,
    latitude: 11.5973,
    longitude: 122.4889,
    municipality: 'Batan',
    province: 'Aklan',
    title_status: 'OCT',
    listing_type: 'sale',
    status: 'active',
    negotiable: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    primary_image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
    is_favorited: false,
  },
];

// Listeners — every mounted hook re-renders when data changes
type Listener = () => void;
const _listeners: Set<Listener> = new Set();

function notifyAll() {
  _listeners.forEach(fn => fn());
}

function setListings(updater: (prev: Listing[]) => Listing[]) {
  _listings = updater(_listings);
  notifyAll();
}

// ─────────────────────────────────────────────
// useListings — main feed
// ─────────────────────────────────────────────
export function useListings(filters?: ListingFilters) {
  const [, rerender] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to shared state changes
  useEffect(() => {
    const listener = () => rerender(n => n + 1);
    _listeners.add(listener);
    return () => { _listeners.delete(listener); };
  }, []);

  const fetchListings = useCallback(async () => {
    if (USE_MOCK) return; // mock data is already loaded
    setLoading(true);
    setError(null);
    try {
      const data = await listingService.getAll(filters);
      setListings(() => data);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Filter listings for search
  const listings = filters?.search
    ? _listings.filter(l => {
        const q = filters.search!.toLowerCase();
        return (
          l.title.toLowerCase().includes(q) ||
          l.municipality?.toLowerCase().includes(q) ||
          l.province?.toLowerCase().includes(q)
        );
      })
    : _listings;

  // ── Create ──────────────────────────────────
  const createListing = async (payload: CreateListingPayload): Promise<Listing | null> => {
    try {
      if (USE_MOCK) {
        const newListing: Listing = {
          ...payload,
          id: Date.now().toString(),
          seller_id: 'seller-1',
          status: 'active',
          negotiable: payload.negotiable ?? true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          primary_image_url: payload.image_urls?.[0],
          is_favorited: false,
        };
        setListings(prev => [newListing, ...prev]);
        return newListing;
      }
      const created = await listingService.create(payload);
      setListings(prev => [created, ...prev]);
      return created;
    } catch (err: any) {
      setError(err?.message ?? 'Failed to create listing');
      return null;
    }
  };

  // ── Update ──────────────────────────────────
  const updateListing = async (
    id: string,
    payload: UpdateListingPayload
  ): Promise<Listing | null> => {
    try {
      if (USE_MOCK) {
        let updated: Listing | null = null;
        setListings(prev =>
          prev.map(l => {
            if (l.id !== id) return l;
            updated = { ...l, ...payload, updated_at: new Date().toISOString() };
            return updated!;
          })
        );
        return updated;
      }
      const updatedFromApi = await listingService.update(id, payload);
      setListings(prev => prev.map(l => (l.id === id ? updatedFromApi : l)));
      return updatedFromApi;
    } catch (err: any) {
      setError(err?.message ?? 'Failed to update listing');
      return null;
    }
  };

  // ── Delete ──────────────────────────────────
  const deleteListing = async (id: string): Promise<boolean> => {
    try {
      if (!USE_MOCK) await listingService.remove(id);
      setListings(prev => prev.filter(l => l.id !== id));
      return true;
    } catch (err: any) {
      setError(err?.message ?? 'Failed to delete listing');
      return false;
    }
  };

  // ── Toggle favorite ─────────────────────────
  const toggleFavorite = async (id: string): Promise<void> => {
    // Update shared state immediately
    setListings(prev =>
      prev.map(l => l.id === id ? { ...l, is_favorited: !l.is_favorited } : l)
    );
    if (!USE_MOCK) {
      const listing = _listings.find(l => l.id === id);
      if (listing) {
        try {
          await listingService.toggleFavorite(listing);
        } catch {
          // Rollback on error
          setListings(prev =>
            prev.map(l => l.id === id ? { ...l, is_favorited: !l.is_favorited } : l)
          );
        }
      }
    }
  };

  return {
    listings,
    loading,
    error,
    refetch: fetchListings,
    createListing,
    updateListing,
    deleteListing,
    toggleFavorite,
  };
}

// ─────────────────────────────────────────────
// useMyListings — seller's own listings
// ─────────────────────────────────────────────
export function useMyListings() {
  const [, rerender] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const listener = () => rerender(n => n + 1);
    _listeners.add(listener);
    return () => { _listeners.delete(listener); };
  }, []);

  const fetchMyListings = useCallback(async () => {
    if (USE_MOCK) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listingService.getMyListings();
      // Merge into shared listings
      data.forEach(incoming => {
        setListings(prev =>
          prev.find(l => l.id === incoming.id)
            ? prev.map(l => l.id === incoming.id ? incoming : l)
            : [incoming, ...prev]
        );
      });
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load your listings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyListings();
  }, [fetchMyListings]);

  // My listings = listings owned by current user
  const MY_SELLER_ID = 'seller-1'; // TODO: replace with real auth user id
  const listings = _listings.filter(l => l.seller_id === MY_SELLER_ID);

  const deleteListing = async (id: string): Promise<boolean> => {
    try {
      if (!USE_MOCK) await listingService.remove(id);
      setListings(prev => prev.filter(l => l.id !== id));
      return true;
    } catch (err: any) {
      setError(err?.message ?? 'Failed to delete listing');
      return false;
    }
  };

  return {
    listings,
    loading,
    error,
    refetch: fetchMyListings,
    deleteListing,
  };
}

// ─────────────────────────────────────────────
// useFavorites — saved listings
// ─────────────────────────────────────────────
export function useFavorites() {
  const [, rerender] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const listener = () => rerender(n => n + 1);
    _listeners.add(listener);
    return () => { _listeners.delete(listener); };
  }, []);

  const fetchFavorites = useCallback(async () => {
    if (USE_MOCK) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listingService.getFavorites();
      data.forEach(incoming => {
        setListings(prev =>
          prev.map(l => l.id === incoming.id ? { ...l, is_favorited: true } : l)
        );
      });
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // Favorites = listings with is_favorited = true
  const favorites = _listings.filter(l => l.is_favorited);

  const removeFavorite = async (id: string) => {
    setListings(prev =>
      prev.map(l => l.id === id ? { ...l, is_favorited: false } : l)
    );
    if (!USE_MOCK) {
      try {
        await listingService.removeFavorite(id);
      } catch {
        // Rollback
        setListings(prev =>
          prev.map(l => l.id === id ? { ...l, is_favorited: true } : l)
        );
      }
    }
  };

  return {
    favorites,
    loading,
    error,
    refetch: fetchFavorites,
    removeFavorite,
  };
}