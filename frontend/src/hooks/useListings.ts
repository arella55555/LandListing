/**
 * useListings.ts  –  lupa.ph
 *
 * Uses module-level shared state so ALL screens see the same data.
 * Favorites and new listings persist across navigation.
 *
 * Backend-backed state only; no hardcoded mock listings.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  listingService,
  Listing,
  CreateListingPayload,
  UpdateListingPayload,
  ListingFilters,
} from '../services/listingService';

const USE_MOCK = false;

// ─────────────────────────────────────────────
// MODULE-LEVEL shared state
// All hook instances read/write the SAME arrays
// ─────────────────────────────────────────────
let _listings: Listing[] = [];

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
      await listingService.remove(id);
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