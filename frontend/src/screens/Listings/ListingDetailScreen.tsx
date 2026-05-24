/**
 * ListingDetailScreen.tsx  –  lupa.ph
 * Uses shared useListings hook for delete + favorite.
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, SafeAreaView, StatusBar,
  Dimensions, ActivityIndicator, Alert, Platform, FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useListings } from '../../hooks/useListings';
import { Listing } from '../../services/listingService';
import { listingService } from '../../services/listingService';

const { width: SCREEN_W } = Dimensions.get('window');

const PRIMARY    = '#27AE60';
const TEXT_DARK  = '#111827';
const TEXT_MED   = '#6B7280';
const TEXT_LIGHT = '#9CA3AF';
const BG         = '#FFFFFF';
const DIVIDER    = '#F3F4F6';

const fmt     = (n: number) => '₱' + n.toLocaleString('en-PH');
const fmtArea = (n: number) => n.toLocaleString('en-PH') + ' sqm';

const LISTING_TYPE_LABELS: Record<string, string> = {
  sale: 'For Sale', rent: 'For Rent', lease: 'For Lease',
};
const STATUS_COLORS: Record<string, string> = {
  active: '#27AE60', pending: '#F59E0B', sold: '#EF4444',
  leased: '#3B82F6', rented: '#8B5CF6', archived: '#9CA3AF',
  draft: '#9CA3AF', rejected: '#EF4444',
};

const MY_SELLER_ID = 'seller-1'; // TODO: replace with real auth

export default function ListingDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; data?: string }>();
  const { deleteListing, toggleFavorite } = useListings();

  const seedListing: Listing | null = params.data
    ? (JSON.parse(params.data as string) as Listing)
    : null;

  const [listing, setListing]       = useState<Listing | null>(seedListing);
  const [loading, setLoading] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const isOwner = listing?.seller_id === MY_SELLER_ID;

  useEffect(() => {
  const id = params.id as string;
  if (!id || seedListing) return;  // ← changed line
  let cancelled = false;
  (async () => {
    setLoading(true);
    try {
      const data = await listingService.getById(id);
      if (!cancelled) setListing(data);
    } catch {
      Alert.alert('Error', 'Could not load listing.');
      router.back();
    } finally {
      if (!cancelled) setLoading(false);
    }
  })();
  return () => { cancelled = true; };
}, [params.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const images: string[] =
    listing?.images?.map(i => i.image_url) ??
    (listing?.primary_image_url ? [listing.primary_image_url] : []);

  const handleFavorite = async () => {
    if (!listing) return;
    const newVal = !listing.is_favorited;
    setListing(prev => prev ? { ...prev, is_favorited: newVal } : prev);
    await toggleFavorite(listing.id);
  };

  const confirmDelete = () => {
    Alert.alert('Delete Listing', 'Are you sure you want to delete this listing?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          if (!listing) return;
          const ok = await deleteListing(listing.id);
          if (ok) router.back();
          else Alert.alert('Error', 'Failed to delete listing.');
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  if (!listing) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView style={styles.scroll} bounces={false} showsVerticalScrollIndicator={false}>
        <View style={styles.heroWrapper}>
          {images.length > 0 ? (
            <FlatList
              data={images}
              keyExtractor={(_item, i) => String(i)}
              horizontal pagingEnabled showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={e => {
                setImageIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_W));
              }}
              renderItem={({ item: imgUri }) => (
                <Image source={{ uri: imgUri }} style={styles.heroImage} resizeMode="cover" />
              )}
            />
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]}>
              <Text style={{ color: TEXT_LIGHT, fontSize: 48 }}>🏞</Text>
            </View>
          )}

          {images.length > 1 && (
            <View style={styles.dots}>
              {images.map((_img, i) => (
                <View key={i} style={[styles.dot, i === imageIndex && styles.dotActive]} />
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>

          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>
              {LISTING_TYPE_LABELS[listing.listing_type] ?? listing.listing_type}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>{listing.title}</Text>
            <Text style={styles.price}>{fmt(listing.price)}</Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              ⊙ {[listing.barangay, listing.municipality, listing.province].filter(Boolean).join(', ')}
            </Text>
            <Text style={styles.metaText}>⬚ {fmtArea(listing.area_sqm)}</Text>
          </View>

          <View style={styles.tagsRow}>
            {listing.negotiable && (
              <View style={styles.tag}><Text style={styles.tagText}>Negotiable</Text></View>
            )}
            <View style={[styles.tag, { backgroundColor: `${STATUS_COLORS[listing.status] ?? '#9CA3AF'}18` }]}>
              <Text style={[styles.tagText, { color: STATUS_COLORS[listing.status] ?? '#9CA3AF' }]}>
                {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
              </Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{listing.title_status.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.divider} />
          <Text style={styles.sectionLabel}>Description</Text>
          <Text style={styles.description}>{listing.description}</Text>
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.favoriteBtn} onPress={handleFavorite}>
          <Text style={[styles.favIcon, listing.is_favorited && styles.favIconActive]}>
            {listing.is_favorited ? '♥' : '♡'}
          </Text>
        </TouchableOpacity>

        {isOwner && (
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() =>
              router.push({
                pathname: '/listing/edit' as any,
                params: { data: JSON.stringify(listing) },
              })
            }
          >
            <Text style={styles.editIcon}>✎ </Text>
            <Text style={styles.editBtnText}>Edit Listing</Text>
          </TouchableOpacity>
        )}

        {isOwner && (
          <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete}>
            <Text style={styles.deleteBtnText}>🗑</Text>
          </TouchableOpacity>
        )}

        {!isOwner && (
          <TouchableOpacity style={styles.contactBtn}>
            <Text style={styles.contactBtnText}>Contact Seller</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const HERO_H = 260;
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  heroWrapper: { position: 'relative', height: HERO_H, backgroundColor: '#E5E7EB' },
  heroImage: { width: SCREEN_W, height: HERO_H },
  heroPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  dots: {
    position: 'absolute', bottom: 12, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { backgroundColor: '#FFF', width: 18 },
  backBtn: {
    position: 'absolute', top: Platform.OS === 'ios' ? 54 : 16, left: 16,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.88)',
    alignItems: 'center', justifyContent: 'center', elevation: 3,
  },
  backIcon: { fontSize: 26, color: TEXT_DARK, lineHeight: 30, marginTop: -2 },
  typeBadge: {
    position: 'absolute', bottom: 16, left: 16,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
  },
  typeBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  body: { paddingHorizontal: 20, paddingTop: 20 },
  titleRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', gap: 12, marginBottom: 10,
  },
  title: { flex: 1, fontSize: 22, fontWeight: '800', color: TEXT_DARK, letterSpacing: -0.4 },
  price: { fontSize: 18, fontWeight: '700', color: PRIMARY, flexShrink: 0 },
  metaRow: { flexDirection: 'row', gap: 16, marginBottom: 12, flexWrap: 'wrap' },
  metaText: { fontSize: 13, color: TEXT_MED },
  tagsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 16 },
  tag: { backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  tagText: { fontSize: 12, fontWeight: '600', color: TEXT_MED },
  divider: { height: 1, backgroundColor: DIVIDER, marginBottom: 16 },
  sectionLabel: { fontSize: 16, fontWeight: '700', color: TEXT_DARK, marginBottom: 8 },
  description: { fontSize: 15, color: TEXT_MED, lineHeight: 22 },
  actionBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 30 : 14,
    backgroundColor: BG, borderTopWidth: 1, borderTopColor: DIVIDER, elevation: 8,
  },
  favoriteBtn: {
    width: 48, height: 48, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center', backgroundColor: BG,
  },
  favIcon: { fontSize: 22, color: TEXT_LIGHT },
  favIconActive: { color: '#EF4444' },
  editBtn: {
    flex: 1, height: 48, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#E5E7EB',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, backgroundColor: BG,
  },
  editIcon: { fontSize: 15, color: TEXT_DARK },
  editBtnText: { fontSize: 14, fontWeight: '600', color: TEXT_DARK },
  deleteBtn: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center',
  },
  deleteBtnText: { fontSize: 18 },
  contactBtn: {
    flex: 2, height: 48, borderRadius: 12, backgroundColor: PRIMARY,
    alignItems: 'center', justifyContent: 'center', elevation: 4,
  },
  contactBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
});
