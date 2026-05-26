/**
 * favorites.tsx  –  lupa.ph
 * Shows listings the user has saved/favorited.
 * When USE_MOCK = true → reads from useFavorites() mock data
 * When USE_MOCK = false → calls GET /listings/favorites from backend
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, SafeAreaView, StatusBar, Platform, RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFavorites } from '../src/hooks/useListings';
import { Listing } from '../src/services/listingService';

const PRIMARY    = '#27AE60';
const TEXT_DARK  = '#111827';
const TEXT_MED   = '#6B7280';
const TEXT_LIGHT = '#9CA3AF';
const BG         = '#FFFFFF';
const DIVIDER    = '#F3F4F6';

const fmt     = (n: number) => '₱' + n.toLocaleString('en-PH');
const fmtArea = (n: number) => n.toLocaleString('en-PH') + ' sqm';

export default function FavoritesScreen() {
  const router = useRouter();
  const { favorites, loading, error, refetch, removeFavorite } = useFavorites();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const renderCard = ({ item }: { item: Listing }) => {
    const imgUri = item.primary_image_url ?? item.images?.[0]?.image_url ?? item.image_url;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.88}
        onPress={() =>
          router.push({
            pathname: '/listing/[id]' as any,
            params: { id: item.id, data: JSON.stringify(item) },
          })
        }
      >
        <View style={styles.cardImageWrapper}>
          {imgUri ? (
            <Image source={{ uri: imgUri }} style={styles.cardImage} resizeMode="cover" />
          ) : (
            <View style={[styles.cardImage, styles.imagePlaceholder]}>
              <Text style={{ fontSize: 32 }}>🏞</Text>
            </View>
          )}
          {/* Remove from favorites button */}
          <TouchableOpacity
            style={styles.heartBtn}
            onPress={() => removeFavorite(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.heartIcon}>♥</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <View style={styles.cardMeta}>
            <Text style={styles.cardLocation}>
              ⊙ {item.municipality}, {item.province}
            </Text>
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.cardPrice}>{fmt(item.price)}</Text>
            <Text style={styles.cardArea}>{fmtArea(item.area_sqm)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favorites</Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
      ) : error ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>⚠️</Text>
          <Text style={styles.emptyTitle}>Something went wrong</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={item => item.id}
          renderItem={renderCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PRIMARY} />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>♡</Text>
              <Text style={styles.emptyTitle}>No favorites yet</Text>
              <Text style={styles.emptySubtitle}>
                Tap the heart on any listing to save it here.
              </Text>
              <TouchableOpacity
                style={styles.browseBtn}
                onPress={() => router.push('/' as any)}
              >
                <Text style={styles.browseBtnText}>Browse Listings</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TabItem icon="⌂"  label="Home"        onPress={() => router.push('/' as any)} />
        <TabItem icon="♥"  label="Favorites"   active />
        <TabItem icon="≡"  label="My Listings" onPress={() => router.push('/my-listings' as any)} />
        <TabItem icon="👤" label="Profile"     onPress={() => router.push('/profile' as any)} />
      </View>
    </SafeAreaView>
  );
}

function TabItem({ icon, label, active = false, onPress }: {
  icon: string; label: string; active?: boolean; onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.tabItem} onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.tabIcon, active && styles.tabIconActive]}>{icon}</Text>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: TEXT_DARK, letterSpacing: -0.5 },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100, gap: 16 },

  // Card
  card: {
    backgroundColor: BG, borderRadius: 14, overflow: 'hidden',
    borderWidth: 1, borderColor: DIVIDER,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  cardImageWrapper: { position: 'relative' },
  cardImage: { width: '100%', height: 180, backgroundColor: '#E5E7EB' },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  heartBtn: {
    position: 'absolute', top: 12, right: 12,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center', justifyContent: 'center', elevation: 2,
  },
  heartIcon: { fontSize: 18, color: '#EF4444', lineHeight: 20 },
  cardBody: { padding: 14, gap: 4 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: TEXT_DARK, marginBottom: 2 },
  cardMeta: { flexDirection: 'row', alignItems: 'center' },
  cardLocation: { fontSize: 13, color: TEXT_MED },
  cardFooter: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginTop: 6,
  },
  cardPrice: { fontSize: 16, fontWeight: '700', color: TEXT_DARK },
  cardArea: { fontSize: 13, color: TEXT_MED },

  // Empty state
  emptyBox: { marginTop: 80, alignItems: 'center', gap: 10, paddingHorizontal: 40 },
  emptyIcon: { fontSize: 52, color: TEXT_LIGHT },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: TEXT_DARK },
  emptySubtitle: { fontSize: 14, color: TEXT_MED, textAlign: 'center', lineHeight: 20 },
  browseBtn: {
    marginTop: 8, backgroundColor: PRIMARY, borderRadius: 12,
    paddingHorizontal: 28, paddingVertical: 12,
  },
  browseBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  retryBtn: {
    backgroundColor: PRIMARY, borderRadius: 10,
    paddingHorizontal: 24, paddingVertical: 10,
  },
  retryText: { color: '#FFF', fontWeight: '700' },

  // Tab bar
  tabBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', backgroundColor: BG,
    borderTopWidth: 1, borderTopColor: DIVIDER,
    paddingBottom: Platform.OS === 'ios' ? 20 : 6,
    paddingTop: 8, elevation: 8,
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabIcon: { fontSize: 20, color: TEXT_LIGHT },
  tabIconActive: { color: TEXT_DARK },
  tabLabel: { fontSize: 11, color: TEXT_LIGHT, fontWeight: '400' },
  tabLabelActive: { color: TEXT_DARK, fontWeight: '600' },
});
