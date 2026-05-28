import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  Linking,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';

interface ListingMapProps {
  latitude: number;
  longitude: number;
  title?: string;
  height?: number;
}

const ListingMap: React.FC<ListingMapProps> = ({
  latitude,
  longitude,
  title = 'Listing Location',
  height = 350,
}) => {
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(14);
  const [satelliteMode, setSatelliteMode] = useState(false);

  const delta = 0.02 / Math.pow(2, zoomLevel - 14);

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url).catch(() => {
      alert('Could not open Google Maps');
    });
  };

  const changeZoom = (direction: 'in' | 'out') => {
    setZoomLevel((current) => {
      const next = direction === 'in' ? current + 1 : current - 1;
      return Math.max(1, Math.min(20, next));
    });
  };

  const renderMap = () => (
    <MapView
      style={styles.map}
      provider={PROVIDER_DEFAULT}
      mapType={satelliteMode ? 'satellite' : 'standard'}
      initialRegion={{
        latitude,
        longitude,
        latitudeDelta: delta,
        longitudeDelta: delta,
      }}
      region={{
        latitude,
        longitude,
        latitudeDelta: delta,
        longitudeDelta: delta,
      }}
    >
      <Marker coordinate={{ latitude, longitude }} title={title} />
    </MapView>
  );

  return (
    <View style={[styles.container, { height }]}> 
      {renderMap()}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.textButton}
          onPress={() => setSatelliteMode((current) => !current)}
        >
          <MaterialIcons name={satelliteMode ? 'map' : 'satellite'} size={18} color="#007AFF" />
          <Text style={styles.buttonLabel}>{satelliteMode ? 'Standard' : 'Satellite'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => changeZoom('in')}>
          <MaterialIcons name="add" size={20} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => changeZoom('out')}>
          <MaterialIcons name="remove" size={20} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.textButton} onPress={() => setFullscreenVisible(true)}>
          <MaterialIcons name="fullscreen" size={18} color="#007AFF" />
          <Text style={styles.buttonLabel}>Fullscreen</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.textButton} onPress={openGoogleMaps}>
          <MaterialIcons name="location-on" size={18} color="#007AFF" />
          <Text style={styles.buttonLabel}>Open in Maps</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.attribution}>© OpenStreetMap contributors</Text>

      <Modal visible={fullscreenVisible} animationType="slide">
        <View style={styles.fullscreenContainer}>
          <MapView
            style={styles.fullscreenMap}
            provider={PROVIDER_DEFAULT}
            mapType={satelliteMode ? 'satellite' : 'standard'}
            initialRegion={{
              latitude,
              longitude,
              latitudeDelta: delta,
              longitudeDelta: delta,
            }}
          >
            <Marker coordinate={{ latitude, longitude }} title={title} />
          </MapView>
          <TouchableOpacity style={styles.closeButton} onPress={() => setFullscreenVisible(false)}>
            <MaterialIcons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.fullscreenAttribution}>© OpenStreetMap contributors</Text>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F7F7F7',
  },
  map: {
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    padding: 12,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  textButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  buttonLabel: {
    marginLeft: 6,
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 13,
  },
  attribution: {
    fontSize: 10,
    color: '#888',
    textAlign: 'center',
    paddingVertical: 8,
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullscreenMap: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 48,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  fullscreenAttribution: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    color: '#FFF',
    fontSize: 11,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
});

export default ListingMap;
