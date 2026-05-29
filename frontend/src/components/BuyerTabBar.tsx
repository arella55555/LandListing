import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

type BuyerTab = 'home' | 'favorites' | 'profile';

export default function BuyerTabBar({ active }: { active: BuyerTab }) {
  const router = useRouter();

  return (
    <View style={styles.tabBar}>
      <TabItem icon="⌂" label="Home" active={active === 'home'} onPress={() => router.push('/' as any)} />
      <TabItem icon="♥" label="Favorites" active={active === 'favorites'} onPress={() => router.push('/favorites' as any)} />
      <TabItem icon="👤" label="Profile" active={active === 'profile'} onPress={() => router.push('/profile' as any)} />
    </View>
  );
}

function TabItem({ icon, label, active = false, onPress }: {
  icon: string;
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.tabItem} onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.tabIcon, active && styles.tabIconActive]}>{icon}</Text>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingBottom: 6,
    paddingTop: 8,
    elevation: 8,
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabIcon: { fontSize: 20, color: '#9CA3AF' },
  tabIconActive: { color: '#111827' },
  tabLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '400' },
  tabLabelActive: { color: '#111827', fontWeight: '600' },
});