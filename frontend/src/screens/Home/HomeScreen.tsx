import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import FilterBar, { HomeFilterState } from '../../components/FilterBar';
import ListingCard, { ListingPreview } from '../../components/ListingCard';
import { useListings } from '../../hooks/useListings';
import { Listing } from '../../services/listingService';

const fallbackImage = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80';
const UNDER_PHP_THRESHOLD = 300_000;
const OVER_PHP_THRESHOLD = 600_000;
const CATEGORY_IDS: Record<Exclude<HomeFilterState['propertyType'], 'all'>, number> = {
  agricultural: 1,
  residential: 2,
  commercial: 3,
  industrial: 4,
  'farm-lot': 5,
};

const formatLocation = (listing: Listing) =>
  [listing.barangay, listing.municipality, listing.province].filter(Boolean).join(', ') || 'Unknown location';


const toPreview = (listing: Listing): ListingPreview => ({
  id: listing.id,
  title: listing.title,
  price: listing.price,
  image: listing.primary_image_url ?? listing.images?.[0]?.image_url ?? fallbackImage,
  location: formatLocation(listing),
  areaSqm: listing.area_sqm,
  listingType:
    listing.listing_type === 'sale'
      ? 'For Sale'
      : listing.listing_type === 'rent'
        ? 'For Rent'
        : 'For Lease',
  titleStatus: listing.title_status.toUpperCase(),
});

const matchesPropertyType = (listing: Listing, propertyType: HomeFilterState['propertyType']) => {
  if (propertyType === 'all') return true;
  return listing.category_id === CATEGORY_IDS[propertyType];
};

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<HomeFilterState>({
    propertyType: 'all',
    priceRange: 'all',
  });

  const { listings, loading, error, refetch } = useListings();
  const { width } = useWindowDimensions();

  const columns = width >= 1024 ? 4 : width >= 768 ? 3 : width >= 640 ? 2 : 1;

  const previewListings = useMemo(() => listings.map(toPreview), [listings]);

  const filteredListings = useMemo(() => {
    return listings
      .filter((listing) => {
        const search = searchQuery.toLowerCase();
        const location = formatLocation(listing).toLowerCase();
        const matchesSearch = `${listing.title} ${location}`.toLowerCase().includes(search);
        const matchesType = matchesPropertyType(listing, activeFilters.propertyType);
        const matchesPrice =
          activeFilters.priceRange === 'all' ||
          (activeFilters.priceRange === 'under-300k' && listing.price < UNDER_PHP_THRESHOLD) ||
          (activeFilters.priceRange === '300k-600k' && listing.price >= UNDER_PHP_THRESHOLD && listing.price <= OVER_PHP_THRESHOLD) ||
          (activeFilters.priceRange === '600k-plus' && listing.price > OVER_PHP_THRESHOLD);

        return matchesSearch && matchesType && matchesPrice;
      })
      .map(toPreview);
  }, [activeFilters, listings, searchQuery]);

  const handleListingPress = (listing: ListingPreview) => {
    const source = listings.find((item) => item.id === listing.id);
    if (!source) {
      Alert.alert('Listing not found', 'This listing is no longer available.');
      return;
    }

    router.push({
      pathname: '/listing/[id]' as any,
      params: { id: source.id, data: JSON.stringify(source) },
    });
  };

  if (loading && previewListings.length === 0) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color="#0F766E" />
        <Text style={styles.stateText}>Loading listings...</Text>
      </View>
    );
  }

  if (error && previewListings.length === 0) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.stateTitle}>Could not load listings</Text>
        <Text style={styles.stateText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.topBarLabel}>Home</Text>
          <Text style={styles.topBarTitle}>Listings</Text>
        </View>

        <Pressable
          style={styles.logoutButton}
          onPress={async () => {
            try {
              await AsyncStorage.removeItem('token');
              router.replace('/login');
            } catch (err) {
              Alert.alert('Error', 'Could not log out.');
            }
          }}
        >
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </View>

      <FlatList
        key={`home-grid-${columns}`}
        data={filteredListings}
        keyExtractor={(item) => item.id}
        numColumns={columns}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={columns > 1 ? styles.columnWrapper : undefined}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.heroSection}>
            <View style={styles.heroCopy}>
              <Text style={styles.eyebrow}>Buyer dashboard</Text>
              <Text style={styles.title}>Discover land and homes that fit your next move.</Text>
              <Text style={styles.description}>
                Browse listings straight from the database, refine results with fast filters, and open any card for the live detail screen.
              </Text>
            </View>

            <View style={styles.filterCard}>
              <FilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onFilterChange={setActiveFilters}
              />
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No listings found</Text>
            <Text style={styles.emptyText}>
              Try broadening your search or adjusting the price and property filters.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.cardWrapper, { width: `${100 / columns}%` }]}>
            <ListingCard listing={item} onPress={handleListingPress} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  topBarLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F766E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  heroSection: {
    marginBottom: 18,
    gap: 16,
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  logoutText: {
    color: '#B91C1C',
    fontWeight: '700',
  },
  heroCopy: {
    paddingTop: 8,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F766E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 34,
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#475569',
  },
  filterCard: {
    marginTop: 4,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  cardWrapper: {
    paddingHorizontal: 6,
    paddingBottom: 16,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  stateText: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    marginTop: 10,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#0F766E',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});

export default HomeScreen;
