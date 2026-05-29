import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function App() {
	const router = useRouter();
	const [ready, setReady] = useState(false);

	useEffect(() => {
		const bootstrap = async () => {
			const token = await AsyncStorage.getItem('token');
			const userRole = await AsyncStorage.getItem('userRole');
			if (!token) {
				router.replace('/login');
				setReady(true);
				return;
			}

			router.replace(userRole === 'seller' ? '/my-listings' : '/home');
			setReady(true);
		};

		bootstrap();
	}, [router]);

	if (!ready) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#16a34a" />
			</View>
		);
	}

	return null;
}

const styles = StyleSheet.create({
	loadingContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#f0fdf4',
	},
});
