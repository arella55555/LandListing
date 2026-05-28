import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PropertyQuickDetailsProps {
  acreage?: string;
  price?: string;
}

const PropertyQuickDetails: React.FC<PropertyQuickDetailsProps> = ({
  acreage = '0.75 Acres',
  price = '$249,000',
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.acreage}>{acreage}</Text>
      <Text style={styles.price}>{price}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  acreage: {
    fontSize: 18,
    fontWeight: '600',
    color: '#03045E',
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    color: '#03045E',
  },
});

export default PropertyQuickDetails;
