import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Listing } from '../types/listing';

interface ListingCardProps {
  listing: Listing;
  onPress?: () => void;
}

const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

const ListingCard: React.FC<ListingCardProps> = ({ listing, onPress }) => {
  const imageSource = listing.images?.[0]
    ? { uri: listing.images[0] }
    : undefined;

  const statusColor =
    listing.status === 'available' ? '#2E7D32' : '#F9A825';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.imageWrapper}>
        {imageSource ? (
          <Image source={imageSource} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="image-outline" size={28} color="#9E9E9E" />
          </View>
        )}
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{listing.status}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {listing.title}
        </Text>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.metaText}>{listing.location}</Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="expand-outline" size={14} color="#666" />
          <Text style={styles.metaText}>{listing.area.toLocaleString()} sq ft</Text>
        </View>

        <Text style={styles.price}>{formatPrice(listing.price)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  imageWrapper: {
    height: 140,
    width: '100%',
    backgroundColor: '#EDEDED',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#4B5563',
  },
  price: {
    marginTop: 6,
    fontSize: 17,
    fontWeight: '800',
    color: '#2E7D32',
  },
});

export default ListingCard;
