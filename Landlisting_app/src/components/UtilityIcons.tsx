import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface UtilityIconsProps {
  icons?: Array<{ name: keyof typeof Ionicons.glyphMap; testID?: string }>;
}

const defaultIcons = [
  { name: 'water-outline' },
  { name: 'trail-sign-outline' },
  { name: 'flash-outline' },
  { name: 'construct-outline' },
] as const;

const UtilityIcons: React.FC<UtilityIconsProps> = ({
  icons = defaultIcons,
}) => {
  return (
    <View style={styles.row}>
      {icons.map((icon) => (
        <TouchableOpacity
          key={String(icon.name)}
          style={styles.iconButton}
          activeOpacity={0.85}
        >
          <Ionicons name={icon.name} size={22} color="#0077B6" />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  iconButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#0077B6',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
});

export default UtilityIcons;
