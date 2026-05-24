// app/_layout.tsx
// Expo Router provides NavigationContainer automatically.
// We just define the Stack here — no NavigationContainer wrapper needed.
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
