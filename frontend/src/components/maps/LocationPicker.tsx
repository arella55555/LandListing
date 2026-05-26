import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';

interface LocationPickerProps {
  onSelect: (latitude: number, longitude: number, address?: string) => void;
  initialLatitude?: number;
  initialLongitude?: number;
}

interface SearchSuggestion {
  lat: string;
  lon: string;
  display_name: string;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  onSelect,
  initialLatitude = 12.8797,
  initialLongitude = 121.7740,
}) => {
  const mapRef = useRef<MapView>(null);
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: initialLatitude,
    longitude: initialLongitude,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState<string>('');
  const [satelliteMode, setSatelliteMode] = useState(false);

  const handleMapPress = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
    reverseGeocode(latitude, longitude);
  };

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await response.json();
      setAddress(
        data.address?.town || data.address?.municipality || data.display_name || ''
      );
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (text.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          text
        )}&limit=5&countrycodes=ph`
      );
      const data = await response.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);
    setSelectedLocation({ latitude: lat, longitude: lon });
    setAddress(suggestion.display_name);
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);

    mapRef.current?.animateToRegion(
      {
        latitude: lat,
        longitude: lon,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      },
      800
    );
  };

  const handleCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }

      setLoading(true);
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setSelectedLocation({ latitude, longitude });
      reverseGeocode(latitude, longitude);

      mapRef.current?.animateToRegion(
        {
          latitude,
          longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        },
        800
      );
    } catch (error) {
      console.error('Location error:', error);
      alert('Error getting current location');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    onSelect(selectedLocation.latitude, selectedLocation.longitude, address);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <MaterialIcons name="location-on" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search location..."
          value={searchQuery}
          onChangeText={handleSearch}
          editable={!loading}
        />
        {loading && <ActivityIndicator size="small" color="#007AFF" />}
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <ScrollView nestedScrollEnabled style={styles.suggestionsList}>
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => handleSelectSuggestion(suggestion)}
              >
                <MaterialIcons name="location-on" size={16} color="#999" />
                <Text style={styles.suggestionText} numberOfLines={2}>
                  {suggestion.display_name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        }}
        onPress={handleMapPress}
        mapType={satelliteMode ? 'satellite' : 'standard'}
      >
        <Marker
          coordinate={selectedLocation}
          draggable
          onDragEnd={(e) => {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            setSelectedLocation({ latitude, longitude });
            reverseGeocode(latitude, longitude);
          }}
        />
      </MapView>

      <View style={styles.bottomActions}>
        <View style={styles.leftActions}>
          <TouchableOpacity
            style={styles.smallActionButton}
            onPress={() => setSatelliteMode(!satelliteMode)}
          >
            <MaterialIcons
              name={satelliteMode ? 'map' : 'satellite'}
              size={20}
              color="#FFF"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.smallActionButton}
            onPress={handleCurrentLocation}
          >
            <MaterialIcons name="my-location" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Confirm Location</Text>
        </TouchableOpacity>
      </View>

      {address ? (
        <View style={styles.addressDisplay}>
          <Text style={styles.addressText}>{address}</Text>
        </View>
      ) : null}

      <Text style={styles.attribution}>© OpenStreetMap contributors</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    marginHorizontal: 12,
    marginTop: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  suggestionsContainer: {
    maxHeight: 150,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 4,
    marginHorizontal: 12,
    marginBottom: 8,
  },
  suggestionsList: {
    flex: 1,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  suggestionText: {
    marginLeft: 8,
    flex: 1,
    fontSize: 13,
    color: '#333',
  },
  map: {
    flex: 1,
    marginHorizontal: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 12,
    marginTop: 10,
  },
  leftActions: {
    flexDirection: 'row',
  },
  smallActionButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  confirmButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFF',
    fontWeight: '700',
  },
  addressDisplay: {
    marginHorizontal: 12,
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F9F9F9',
  },
  addressText: {
    color: '#444',
    fontSize: 13,
  },
  attribution: {
    marginTop: 10,
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    marginBottom: 12,
  },
});

export default LocationPicker;
