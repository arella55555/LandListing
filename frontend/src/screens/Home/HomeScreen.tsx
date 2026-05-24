/**
 * HomeScreen.tsx  –  lupa.ph
 * Uses shared useListings() hook so favorites persist across screens.
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, Image, SafeAreaView, StatusBar,
  ScrollView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useListings } from '../../hooks/useListings';
import { Listing } from '../../services/listingService';

const PRIMARY       = '#27AE60';
const PRIMARY_LIGHT = '#E8F8EF';
const TEXT_DARK     = '#111827';
const TEXT_MED      = '#6B7280';
const TEXT_LIGHT    = '#9CA3AF';
const BG            = '#FFFFFF';
const INPUT_BG      = '#F3F4F6';
const FILTERS       = ['Price', 'Location', 'Size'];

const formatPrice = (p: number) => '₱' + p.toLocaleString('en-PH');
const formatArea  = (a: number) => a.toLocaleString('en-PH') + ' sqm';

export default function HomeScreen() {
  const router = useRouter();
  const [search, setSearch]             = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const { listings, toggleFavorite } = useListings();

  // Filter locally by search
  const filtered = listings.filter(l => {
    const q = search.toLowerCase();
    return (
      l.title.toLowerCase().includes(q) ||
      l.municipality?.toLowerCase().includes(q) ||
      l.province?.toLowerCase().includes(q)
    );
  });

  const renderCard = ({ item }: { item: Listing }) => {
    const imgUri = item.primary_image_url ?? item.images?.[0]?.image_url ?? (item as any).image_url;

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
          <TouchableOpacity
            style={styles.heartBtn}
            onPress={() => toggleFavorite(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.heartIcon}>{item.is_favorited ? '♥' : '♡'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <View style={styles.cardMeta}>
            <Text style={styles.cardLocation}>⊙ {item.municipality}, {item.province}</Text>
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.cardPrice}>{formatPrice(item.price)}</Text>
            <Text style={styles.cardArea}>{formatArea(item.area_sqm)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lupa ph sampleg</Text>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Text style={styles.searchMagnifier}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search land listings..."
            placeholderTextColor={TEXT_LIGHT}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        style={styles.filterScroll} contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map(f => {
          const active = activeFilter === f;
          return (
            <TouchableOpacity
              key={f}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setActiveFilter(active ? null : f)}
              activeOpacity={0.75}
            >
              {f === 'Price' && (
                <Text style={[styles.chipIcon, active && styles.chipIconActive]}>⊟ </Text>
              )}
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{f}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No listings found.</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/listing/add' as any)}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>＋</Text>
      </TouchableOpacity>

      <View style={styles.tabBar}>
        <TabItem icon="⌂" label="Home" active />
        <TabItem icon="♡" label="Favorites" onPress={() => router.push('/favorites' as any)} />
        <TabItem icon="≡" label="My Listings" onPress={() => router.push('/my-listings' as any)} />
        <TabItem icon="👤" label="Profile" onPress={() => router.push('/profile' as any)} />
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
  header: { paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 16 : 8, paddingBottom: 12 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: TEXT_DARK, letterSpacing: -0.5 },
  searchRow: { paddingHorizontal: 16, paddingBottom: 10 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: INPUT_BG, borderRadius: 12, paddingHorizontal: 14, height: 46,
  },
  searchMagnifier: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: TEXT_DARK, paddingVertical: 0 },
  filterScroll: { flexGrow: 0, marginBottom: 8 },
  filterContent: { paddingHorizontal: 16, gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#D1D5DB',
    borderRadius: 24, paddingHorizontal: 14, paddingVertical: 7, marginRight: 8, backgroundColor: BG,
  },
  chipActive: { borderColor: PRIMARY, backgroundColor: PRIMARY_LIGHT },
  chipIcon: { fontSize: 13, color: TEXT_MED },
  chipIconActive: { color: PRIMARY },
  chipText: { fontSize: 14, fontWeight: '500', color: TEXT_DARK },
  chipTextActive: { color: PRIMARY, fontWeight: '600' },
  listContent: { paddingHorizontal: 16, paddingBottom: 100, gap: 16 },
  empty: { marginTop: 60, alignItems: 'center' },
  emptyText: { fontSize: 15, color: TEXT_LIGHT },
  card: {
    backgroundColor: BG, borderRadius: 14, overflow: 'hidden',
    borderWidth: 1, borderColor: '#F3F4F6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  cardImageWrapper: { position: 'relative' },
  cardImage: { width: '100%', height: 190, backgroundColor: '#E5E7EB' },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  heartBtn: {
    position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center', elevation: 2,
  },
  heartIcon: { fontSize: 18, color: '#EF4444', lineHeight: 20 },
  cardBody: { padding: 14, gap: 4 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: TEXT_DARK, marginBottom: 2 },
  cardMeta: { flexDirection: 'row', alignItems: 'center' },
  cardLocation: { fontSize: 13, color: TEXT_MED },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  cardPrice: { fontSize: 16, fontWeight: '700', color: TEXT_DARK },
  cardArea: { fontSize: 13, color: TEXT_MED },
  fab: {
    position: 'absolute', bottom: 72, right: 20, width: 56, height: 56, borderRadius: 28,
    backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center', elevation: 6,
  },
  fabIcon: { fontSize: 28, color: '#FFFFFF', lineHeight: 32 },
  tabBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: BG,
    borderTopWidth: 1, borderTopColor: '#F3F4F6',
    paddingBottom: Platform.OS === 'ios' ? 20 : 6, paddingTop: 8, elevation: 8,
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabIcon: { fontSize: 20, color: TEXT_LIGHT },
  tabIconActive: { color: TEXT_DARK },
  tabLabel: { fontSize: 11, color: TEXT_LIGHT, fontWeight: '400' },
  tabLabelActive: { color: TEXT_DARK, fontWeight: '600' },
});
