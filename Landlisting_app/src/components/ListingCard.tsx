import React from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

export interface ListingPreview {
  id: string;
  title: string;
  price: number;
  image: string;
  location: string;
  areaSqm: number;
  listingType: string;
  titleStatus: string;
}

interface ListingCardProps {
  listing: ListingPreview;
  onPress?: (listing: ListingPreview) => void;
}

const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(value);

const ListingCard: React.FC<ListingCardProps> = ({ listing, onPress }) => {
  const handlePress = () => {
    if (onPress) {
      onPress(listing);
      return;
    }

    Alert.alert('Listing preview', `Open details for ${listing.title}`);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel={`Open details for ${listing.title}`}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: listing.image }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay}>
          <Text style={styles.priceTag}>{formatPrice(listing.price)}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {listing.title}
        </Text>

        <Text style={styles.location} numberOfLines={1}>
          {listing.location}
        </Text>

        <View style={styles.detailsRow}>
          <Text style={styles.detailPill}>{listing.areaSqm.toLocaleString('en-PH')} sqm</Text>
          <Text style={styles.detailPill}>{listing.listingType}</Text>
          <Text style={styles.detailPill}>{listing.titleStatus}</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  imageWrapper: {
    position: 'relative',
    height: 170,
    backgroundColor: '#E2E8F0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
  },
  priceTag: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  content: {
    padding: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  location: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailPill: {
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
    color: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: '700',
  },
});

export default ListingCard;
