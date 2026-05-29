/**
 * MyListingsScreen.tsx  –  lupa.ph
 * Uses shared useListings hook for delete + update to reflect instantly.
 */

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, SafeAreaView, StatusBar, Alert,
  Platform, RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useListings } from '../../hooks/useListings';
import { Listing } from '../../services/listingService';

const PRIMARY    = '#27AE60';
const TEXT_DARK  = '#111827';
const TEXT_MED   = '#6B7280';
const TEXT_LIGHT = '#9CA3AF';
const BG         = '#FFFFFF';
const DIVIDER    = '#F3F4F6';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  active:   { bg: '#DCFCE7', text: '#16A34A' },
  pending:  { bg: '#FEF9C3', text: '#CA8A04' },
  draft:    { bg: '#F3F4F6', text: '#6B7280' },
  sold:     { bg: '#FEE2E2', text: '#DC2626' },
  leased:   { bg: '#DBEAFE', text: '#2563EB' },
  rented:   { bg: '#F3E8FF', text: '#7C3AED' },
  archived: { bg: '#F3F4F6', text: '#6B7280' },
  rejected: { bg: '#FEE2E2', text: '#DC2626' },
};

const fmt = (n: number) => '₱' + n.toLocaleString('en-PH');

export default function MyListingsScreen() {
  const router = useRouter();
  const { listings: allListings, deleteListing, refetch } = useListings();
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const loadUserId = async () => {
      const storedUserId = await AsyncStorage.getItem('userId');
      setCurrentUserId(storedUserId ?? null);
    };

    loadUserId();
  }, []);

  if (currentUserId === undefined) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={BG} />
        <View style={styles.loadingBox}>
          <Text style={styles.emptyTitle}>Loading your listings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Only show listings owned by current user
  const listings = currentUserId ? allListings.filter(l => l.seller_id === currentUserId) : [];

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleDelete = (item: Listing) => {
    Alert.alert('Delete Listing', `Delete "${item.title}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          const ok = await deleteListing(item.id);
          if (!ok) Alert.alert('Error', 'Could not delete listing.');
        },
      },
    ]);
  };

  const renderRow = ({ item }: { item: Listing }) => {
    const statusStyle = STATUS_COLORS[item.status] ?? STATUS_COLORS.draft;
    const imgUri = item.primary_image_url ?? item.images?.[0]?.image_url ?? (item as any).image_url;

    return (
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.82}
        onPress={() =>
          router.push({
            pathname: '/listing/[id]' as any,
            params: { id: item.id, data: JSON.stringify(item) },
          })
        }
      >
        <View style={styles.thumbBox}>
          {imgUri
            ? <Image source={{ uri: imgUri }} style={styles.thumb} resizeMode="cover" />
            : <View style={styles.thumbPlaceholder}><Text style={styles.thumbPlaceholderIcon}>🏞</Text></View>
          }
        </View>

        <View style={styles.info}>
          <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.rowPrice}>{fmt(item.price)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() =>
              router.push({
                pathname: '/listing/edit' as any,
                params: { data: JSON.stringify(item) },
              })
            }
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.editIcon}>✎</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleDelete(item)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.deleteIcon}>🗑</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Listings</Text>
      </View>

      <FlatList
        data={listings}
        keyExtractor={item => item.id}
        renderItem={renderRow}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PRIMARY} />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>🏞</Text>
            <Text style={styles.emptyTitle}>No listings yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap + to create your first listing and it will appear here.
            </Text>
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
        <TabItem icon="⌂"  label="Home"        onPress={() => router.push('/' as any)} />
        <TabItem icon="♡"  label="Favorites"   onPress={() => router.push('/favorites' as any)} />
        <TabItem icon="≡"  label="My Listings" active />
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
    paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 16 : 8,
    paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: DIVIDER,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: TEXT_DARK, letterSpacing: -0.5 },
  listContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 110 },
  row: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    borderRadius: 14, padding: 12, borderWidth: 1, borderColor: DIVIDER,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  separator: { height: 12 },
  thumbBox: {
    width: 72, height: 72, borderRadius: 10, overflow: 'hidden',
    backgroundColor: '#F3F4F6', marginRight: 14, flexShrink: 0,
  },
  thumb: { width: '100%', height: '100%' },
  thumbPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  thumbPlaceholderIcon: { fontSize: 28 },
  info: { flex: 1, gap: 4 },
  rowTitle: { fontSize: 15, fontWeight: '700', color: TEXT_DARK },
  rowPrice: { fontSize: 14, fontWeight: '600', color: PRIMARY },
  statusBadge: {
    alignSelf: 'flex-start', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 3, marginTop: 2,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  actions: { alignItems: 'center', justifyContent: 'center', gap: 10, marginLeft: 10 },
  actionBtn: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  editIcon: { fontSize: 18, color: TEXT_MED },
  deleteIcon: { fontSize: 18 },
  emptyBox: { marginTop: 80, alignItems: 'center', gap: 10 },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: TEXT_DARK },
  emptySubtitle: { fontSize: 14, color: TEXT_MED, textAlign: 'center' },
  fab: {
    position: 'absolute', bottom: 72, right: 20, width: 56, height: 56,
    borderRadius: 28, backgroundColor: PRIMARY,
    alignItems: 'center', justifyContent: 'center', elevation: 6,
  },
  fabIcon: { fontSize: 28, color: '#FFF', lineHeight: 32 },
  tabBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', backgroundColor: BG,
    borderTopWidth: 1, borderTopColor: DIVIDER,
    paddingBottom: Platform.OS === 'ios' ? 20 : 6, paddingTop: 8, elevation: 8,
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabIcon: { fontSize: 20, color: TEXT_LIGHT },
  tabIconActive: { color: TEXT_DARK },
  tabLabel: { fontSize: 11, color: TEXT_LIGHT, fontWeight: '400' },
  tabLabelActive: { color: TEXT_DARK, fontWeight: '600' },
});
