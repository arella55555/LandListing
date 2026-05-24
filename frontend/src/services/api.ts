import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const IS_WEB = typeof window !== "undefined";

const API = axios.create({
  // Web browser → use localhost
  // Phone (Expo Go) → use your WiFi IP
  baseURL: IS_WEB ? "http://localhost:3000" : "http://10.0.0.39:3000",
});

// Attach auth token to every request automatically
API.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // ignore
  }
  return config;
});

export default API;