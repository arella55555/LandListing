import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import LoginScreen from "../src/screens/Login/LoginScreen";

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("authToken");
      setIsLoggedIn(!!token);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/dashboard");
    }
  }, [isLoggedIn, router]);

  if (isLoggedIn === null) {
    return null;
  }

  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  return null;
}
