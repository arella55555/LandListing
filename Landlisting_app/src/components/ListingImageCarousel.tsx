import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface ListingImageCarouselProps {
  imageUri: string;
  badgeLabel?: string;
}

const ListingImageCarousel: React.FC<ListingImageCarouselProps> = ({
  imageUri,
  badgeLabel = 'NEW LISTING',
}) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />

      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badgeLabel}</Text>
      </View>

      <View style={styles.paginationRow}>
        {[0, 1, 2].map((index) => (
          <View
            key={index}
            style={[styles.dot, index === 1 ? styles.activeDot : null]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    height: 320,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#03045E',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#52B788',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  paginationRow: {
    position: 'absolute',
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
  },
});

export default ListingImageCarousel;
