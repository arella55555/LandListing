import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { authAPI } from '@/src/services/api';
import BuyerTabBar from '@/src/components/BuyerTabBar';

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        const userRole = await AsyncStorage.getItem('userRole');

        if (!userId) {
          router.replace('/login');
          return;
        }

        const response = await authAPI.getUser(userId);
        setProfile({ ...(response.data?.user ?? response.data), role: userRole });
      } catch (error) {
        Alert.alert('Error', 'Could not load profile.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <ActivityIndicator size="large" color="#27AE60" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Text style={styles.title}>Profile</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{profile?.full_name ?? 'Not set'}</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{profile?.email ?? 'Not set'}</Text>

        <Text style={styles.label}>Role</Text>
        <Text style={styles.value}>{String(profile?.role ?? '').toUpperCase() || 'UNKNOWN'}</Text>

        <Text style={styles.label}>Verified</Text>
        <Text style={styles.value}>{profile?.is_verified ? 'Yes' : 'No'}</Text>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={async () => {
          await AsyncStorage.multiRemove(['token', 'userId', 'userRole']);
          router.replace('/login');
        }}
      >
        <Text style={styles.logoutButtonText}>Log out</Text>
      </TouchableOpacity>

      <BuyerTabBar active="profile" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 16 },
  card: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#F9FAFB',
    gap: 6,
  },
  label: { fontSize: 12, fontWeight: '700', color: '#6B7280', marginTop: 8 },
  value: { fontSize: 16, fontWeight: '600', color: '#111827' },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 12,
  },
  logoutButtonText: {
    color: '#B91C1C',
    fontWeight: '800',
    fontSize: 15,
  },
});