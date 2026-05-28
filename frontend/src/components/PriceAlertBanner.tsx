import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PriceAlertBannerProps {
  label?: string;
}

const PriceAlertBanner: React.FC<PriceAlertBannerProps> = ({
  label = 'PRICE REDUCED',
}) => {
  return (
    <View style={styles.banner}>
      <Text style={styles.label}>{label}</Text>
      <Ionicons name="notifications-outline" size={18} color="#03045E" />
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FF9F1C',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  label: {
    color: '#03045E',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});

export default PriceAlertBanner;
