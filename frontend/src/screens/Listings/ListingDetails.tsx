import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import ListingMap from '../../components/maps/ListingMap';
import { listingAPI } from '../../services/api';

type ListingDetailsRouteProp = RouteProp<
  { ListingDetails: { id: string } },
  'ListingDetails'
>;

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  area_sqm: number;
  latitude: number;
  longitude: number;
  barangay?: string;
  municipality: string;
  province: string;
  title_status: string;
  listing_type: string;
  negotiable: boolean;
  created_at: string;
}

const ListingDetails: React.FC = () => {
  const route = useRoute<ListingDetailsRouteProp>();
  const listingId = route.params?.id;
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListing = async () => {
      if (!listingId) {
        setLoading(false);
        return;
      }

      try {
        const response = await listingAPI.getById(listingId);
        setListing(response.data.listing);
      } catch (error) {
        console.error('Fetch listing failed:', error);
        Alert.alert('Error', 'Unable to load listing details.');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [listingId]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!listing) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Listing details are not available.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{listing.title}</Text>
        <Text style={styles.price}>₱{listing.price.toLocaleString('en-PH')}</Text>
      </View>

      <ListingMap
        latitude={listing.latitude}
        longitude={listing.longitude}
        title={listing.title}
        height={350}
      />

      <View style={styles.detailSection}>
        <Text style={styles.sectionTitle}>Location</Text>
        <Text style={styles.detailText}>{listing.barangay || 'N/A'}</Text>
        <Text style={styles.detailText}>{listing.municipality}, {listing.province}</Text>
        <Text style={styles.detailText}>
          Coordinates: {listing.latitude.toFixed(4)}, {listing.longitude.toFixed(4)}
        </Text>
      </View>

      <View style={styles.detailSection}>
        <Text style={styles.sectionTitle}>Details</Text>
        <Text style={styles.detailText}>Area: {listing.area_sqm} sqm</Text>
        <Text style={styles.detailText}>Type: {listing.listing_type}</Text>
        <Text style={styles.detailText}>Title: {listing.title_status}</Text>
        <Text style={styles.detailText}>
          {listing.negotiable ? 'Negotiable' : 'Fixed price'}
        </Text>
      </View>

      <View style={styles.detailSection}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{listing.description}</Text>
      </View>

      <Text style={styles.attribution}>Map data © OpenStreetMap contributors</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  errorText: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 16,
    color: '#444',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111827',
  },
  price: {
    fontSize: 20,
    color: '#2563EB',
    fontWeight: '700',
  },
  detailSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111827',
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#4B5563',
  },
  attribution: {
    margin: 16,
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default ListingDetails;
