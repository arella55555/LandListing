import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from 'react-native';

// Set backend host and API prefix. For local development:
// - Web (browser): use http://localhost:5000/api
// - iOS simulator: use http://localhost:5000/api
// - Android emulator (default): use http://10.0.2.2:5000/api
// - Physical device / Expo Go: replace with your machine LAN IP, e.g. http://192.168.1.42:5000/api
const DEFAULT_HOST = 'http://localhost:5000';

function getApiBaseUrl() {
  const isWeb = typeof window !== 'undefined';
  if (isWeb) return `${DEFAULT_HOST}/api`;

  if (Platform.OS === 'android') {
    // Android emulator maps localhost to 10.0.2.2
    return `http://10.0.2.2:5000/api`;
  }

  // iOS simulator and other native environments use localhost, physical devices should use LAN IP
  return `${DEFAULT_HOST}/api`;
}

const API = axios.create({
  baseURL: getApiBaseUrl(),
});

// Use main's cleaner interceptor (try/catch, no redundant error handler)
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

// Your additions — keep all of these
export const listingAPI = {
  create: (data: {
    category_id: number;
    title: string;
    description: string;
    price: number;
    area_sqm: number;
    latitude: number;
    longitude: number;
    barangay?: string;
    municipality: string;
    province: string;
    title_status?: string;
    listing_type?: string;
    negotiable?: boolean;
  }) => API.post("/post/listings", data),

  getAll: () => API.get("/listings"),
  getById: (id: string) => API.get(`/listings/${id}`),
  update: (id: string, data: Partial<any>) => API.put(`/listings/${id}`, data),
  delete: (id: string) => API.delete(`/listings/${id}`),
};

export const categoryAPI = {
  getAll: () => API.get("/categories"),
};

export default API;
