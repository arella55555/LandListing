import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ContactAgentButton from '../../components/ContactAgentButton';
import ListingHeader from '../../components/ListingHeader';
import ListingImageCarousel from '../../components/ListingImageCarousel';
import PriceAlertBanner from '../../components/PriceAlertBanner';
import PropertyQuickDetails from '../../components/PropertyQuickDetails';
import UtilityIcons from '../../components/UtilityIcons';
import API from '../../services/api';
import { Listing } from '../../types/listing';

const fallbackListing: Listing = {
  id: 'fallback-1',
  title: 'Sunrise Bay Lot 42',
  description:
    'A sun-drenched coastal lot with sweeping views and flexible zoning for your next build.',
  price: 249000,
  location: 'Sunrise Bay, California',
  area: 32670,
  images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200'],
  sellerId: 'seller-fallback',
  sellerName: 'Open Horizon Agent',
  sellerPhone: '+1-555-0199',
  category: 'residential',
  status: 'available',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  featured: true,
};

const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

const formatAcreage = (area: number) => `${(area / 43560).toFixed(2)} Acres`;

const HomeScreen: React.FC = () => {
  const [listing, setListing] = useState<Listing>(fallbackListing);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadListing = async () => {
      try {
        const response = await API.get('/listings');
        const listings = Array.isArray(response.data) ? response.data : [];

        if (listings.length > 0) {
          setListing(listings[0] as Listing);
        }
      } catch (error) {
        console.error('Failed to load listings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadListing();
  }, []);

  const handleBackPress = () => {
    Alert.alert('Back', 'Back navigation is handled by your app stack when wired in.');
  };

  const handleSharePress = async () => {
    try {
      await Share.share({
        message: `${listing.title} — ${formatPrice(listing.price)} — ${listing.location}`,
      });
    } catch (error) {
      console.warn('Share failed:', error);
    }
  };

  const handleContactAgent = () => {
    if (!listing.sellerPhone) {
      Alert.alert('Contact Agent', 'Agent contact details are not available right now.');
      return;
    }

    Linking.openURL(`tel:${listing.sellerPhone}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#0077B6" />
        <Text style={styles.loadingText}>Loading listing…</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ListingHeader
          title={listing.title}
          onBackPress={handleBackPress}
          onSharePress={handleSharePress}
        />

        <View style={styles.imageSection}>
          <ListingImageCarousel imageUri={listing.images[0]} />
        </View>

        <View style={styles.bannerSection}>
          <PriceAlertBanner />
        </View>

        <View style={styles.detailsSection}>
          <PropertyQuickDetails
            acreage={formatAcreage(listing.area)}
            price={formatPrice(listing.price)}
          />
        </View>

        <View style={styles.iconsSection}>
          <UtilityIcons />
        </View>

        <View style={styles.ctaSection}>
          <ContactAgentButton onPress={handleContactAgent} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
  },
  loadingText: {
    marginTop: 16,
    color: '#03045E',
    fontSize: 16,
    fontWeight: '700',
  },
  content: {
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  imageSection: {
    marginTop: 20,
  },
  bannerSection: {
    marginTop: 18,
  },
  detailsSection: {
    marginTop: 18,
  },
  iconsSection: {
    marginTop: 24,
  },
  ctaSection: {
    marginTop: 24,
  },
});

export default HomeScreen;
