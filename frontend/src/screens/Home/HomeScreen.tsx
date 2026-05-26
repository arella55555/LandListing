import React, { useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import FilterBar, { HomeFilterState } from '../../components/FilterBar';
import ListingCard, { ListingPreview } from '../../components/ListingCard';

const USD_TO_PHP = 58;
const toPhp = (usd: number) => Math.round(usd * USD_TO_PHP);
const UNDER_PHP_THRESHOLD = toPhp(300000);
const OVER_PHP_THRESHOLD = toPhp(600000);

const mockListings: ListingPreview[] = [
  {
    id: '1',
    title: 'Sunrise Ridge Lot',
    price: toPhp(275000),
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    location: 'Cavite, Philippines',
    beds: 3,
    baths: 2,
  },
  {
    id: '2',
    title: 'Cedar Creek Parcel',
    price: toPhp(419000),
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    location: 'Tagaytay, Philippines',
    beds: 4,
    baths: 3,
  },
  {
    id: '3',
    title: 'Mesa Vista Farm',
    price: toPhp(625000),
    image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
    location: 'Bacolod, Philippines',
    beds: 4,
    baths: 3,
  },
  {
    id: '4',
    title: 'Oak Hollow Retreat',
    price: toPhp(290000),
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    location: 'Davao, Philippines',
    beds: 2,
    baths: 2,
  },
  {
    id: '5',
    title: 'Pine Valley Land',
    price: toPhp(210000),
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    location: 'Baguio, Philippines',
    beds: 3,
    baths: 2,
  },
  {
    id: '6',
    title: 'Riverbend Townhome',
    price: toPhp(540000),
    image: 'https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1200&q=80',
    location: 'Metro Manila, Philippines',
    beds: 3,
    baths: 2,
  },
];

const HomeScreen: React.FC = () => {
  const [listings] = useState<ListingPreview[]>(mockListings);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<HomeFilterState>({
    propertyType: 'all',
    priceRange: 'all',
  });

  const { width } = useWindowDimensions();

  const columns = width >= 1024 ? 4 : width >= 768 ? 3 : width >= 640 ? 2 : 1;

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const matchesSearch = `${listing.title} ${listing.location}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesType =
        activeFilters.propertyType === 'all' ||
        (activeFilters.propertyType === 'land' && listing.title.toLowerCase().includes('lot')) ||
        (activeFilters.propertyType === 'single-family' && listing.beds >= 3 && listing.baths >= 2) ||
        (activeFilters.propertyType === 'townhome' && listing.title.toLowerCase().includes('townhome')) ||
        (activeFilters.propertyType === 'farm' && listing.title.toLowerCase().includes('farm'));

      const matchesPrice =
        activeFilters.priceRange === 'all' ||
        (activeFilters.priceRange === 'under-300k' && listing.price < UNDER_PHP_THRESHOLD) ||
        (activeFilters.priceRange === '300k-600k' &&
          listing.price >= UNDER_PHP_THRESHOLD &&
          listing.price <= OVER_PHP_THRESHOLD) ||
        (activeFilters.priceRange === '600k-plus' && listing.price > OVER_PHP_THRESHOLD);

      return matchesSearch && matchesType && matchesPrice;
    });
  }, [activeFilters, listings, searchQuery]);

  const handleListingPress = (listing: ListingPreview) => {
    Alert.alert('Details preview', `Viewing ${listing.title} in ${listing.location}.`);
  };

  return (
    <View style={styles.screen}>
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
                Browse curated listings, refine results with fast filters, and tap any card to view the details preview.
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
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  heroSection: {
    marginBottom: 18,
    gap: 16,
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
});

export default HomeScreen;
