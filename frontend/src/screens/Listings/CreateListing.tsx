import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import LocationPicker from '../../components/maps/LocationPicker';
import { listingAPI, categoryAPI } from '../../services/api';

interface Category {
  id: number;
  name: string;
}

const CreateListing: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    area_sqm: '',
    latitude: 12.8797,
    longitude: 121.7740,
    barangay: '',
    municipality: 'Quezon City',
    province: 'Metro Manila',
    category_id: 2,
    title_status: 'other',
    listing_type: 'sale',
    negotiable: true,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getAll();
        setCategories(response.data.categories || []);
      } catch (error) {
        console.warn('Unable to load categories', error);
        setCategories([
          { id: 1, name: 'Agricultural' },
          { id: 2, name: 'Residential' },
          { id: 3, name: 'Commercial' },
        ]);
      }
    };

    fetchCategories();
  }, []);

  const handleLocationSelect = (
    latitude: number,
    longitude: number,
    address?: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      latitude,
      longitude,
      barangay: address || prev.barangay,
    }));
    setShowLocationPicker(false);
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.price ||
      !formData.area_sqm
    ) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      await listingAPI.create({
        ...formData,
        price: parseFloat(formData.price),
        area_sqm: parseFloat(formData.area_sqm),
      });
      Alert.alert('Success', 'Listing created successfully.');
      setFormData({
        title: '',
        description: '',
        price: '',
        area_sqm: '',
        latitude: 12.8797,
        longitude: 121.7740,
        barangay: '',
        municipality: 'Quezon City',
        province: 'Metro Manila',
        category_id: 2,
        title_status: 'other',
        listing_type: 'sale',
        negotiable: true,
      });
    } catch (error: any) {
      console.error('Create listing error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to create listing.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (showLocationPicker) {
    return (
      <View style={styles.pickerContainer}>
        <LocationPicker
          onSelect={handleLocationSelect}
          initialLatitude={formData.latitude}
          initialLongitude={formData.longitude}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Create Listing</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter listing title"
            value={formData.title}
            onChangeText={(value) => handleInputChange('title', value)}
            editable={!loading}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.pickerBox}>
            <Picker
              selectedValue={formData.category_id}
              onValueChange={(value) => handleInputChange('category_id', value)}
              enabled={!loading}
            >
              {categories.map((category) => (
                <Picker.Item
                  key={category.id}
                  label={category.name}
                  value={category.id}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the property"
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            editable={!loading}
            multiline
          />
        </View>

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Price</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 500000"
              value={formData.price}
              onChangeText={(value) => handleInputChange('price', value)}
              keyboardType="decimal-pad"
              editable={!loading}
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>Area (sqm)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 1000"
              value={formData.area_sqm}
              onChangeText={(value) => handleInputChange('area_sqm', value)}
              keyboardType="decimal-pad"
              editable={!loading}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Location</Text>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={() => setShowLocationPicker(true)}
            disabled={loading}
          >
            <Text style={styles.locationLabel}>
              {`📍 ${formData.latitude.toFixed(4)}, ${formData.longitude.toFixed(4)}`}
            </Text>
            <Text style={styles.locationHint}>
              {formData.barangay || 'Tap the map to pick a location'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Municipality</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Quezon City"
            value={formData.municipality}
            onChangeText={(value) => handleInputChange('municipality', value)}
            editable={!loading}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Province</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Metro Manila"
            value={formData.province}
            onChangeText={(value) => handleInputChange('province', value)}
            editable={!loading}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Type</Text>
            <View style={styles.pickerBox}>
              <Picker
                selectedValue={formData.listing_type}
                onValueChange={(value) => handleInputChange('listing_type', value)}
                enabled={!loading}
              >
                <Picker.Item label="Sale" value="sale" />
                <Picker.Item label="Rent" value="rent" />
                <Picker.Item label="Lease" value="lease" />
              </Picker>
            </View>
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>Title Status</Text>
            <View style={styles.pickerBox}>
              <Picker
                selectedValue={formData.title_status}
                onValueChange={(value) => handleInputChange('title_status', value)}
                enabled={!loading}
              >
                <Picker.Item label="TCT" value="TCT" />
                <Picker.Item label="OCT" value="OCT" />
                <Picker.Item label="Tax Declaration" value="tax_dec" />
                <Picker.Item label="Other" value="other" />
              </Picker>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => handleInputChange('negotiable', !formData.negotiable)}
        >
          <View style={styles.checkboxBox}>
            {formData.negotiable && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>Negotiable price</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>Create Listing</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollView: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    color: '#111827',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    color: '#111827',
  },
  textArea: {
    minHeight: 110,
  },
  pickerBox: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfField: {
    flex: 1,
  },
  locationButton: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 14,
    padding: 16,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  locationHint: {
    marginTop: 6,
    color: '#475569',
    fontSize: 13,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  checkmark: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#334155',
  },
  submitButton: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 24,
  },
  disabledButton: {
    opacity: 0.65,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  pickerContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
});

export default CreateListing;
