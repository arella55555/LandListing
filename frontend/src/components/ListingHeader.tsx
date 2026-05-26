import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ListingHeaderProps {
  title?: string;
  onBackPress?: () => void;
  onSharePress?: () => void;
}

const ListingHeader: React.FC<ListingHeaderProps> = ({
  title = 'Sunrise Bay Lot 42',
  onBackPress,
  onSharePress,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.iconButton}
        activeOpacity={0.8}
        onPress={onBackPress}
      >
        <Ionicons name="arrow-back-outline" size={22} color="#0077B6" />
      </TouchableOpacity>

      <View style={styles.titleWrap}>
        <Text style={styles.title}>{title}</Text>
      </View>

      <TouchableOpacity
        style={styles.iconButton}
        activeOpacity={0.8}
        onPress={onSharePress}
      >
        <Ionicons name="share-social-outline" size={22} color="#0077B6" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#03045E',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  titleWrap: {
    flex: 1,
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#03045E',
    lineHeight: 28,
  },
});

export default ListingHeader;
