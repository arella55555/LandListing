import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your PC LAN IP
const API_BASE_URL = "http://192.168.123.44:5000/api";

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});


// Attach JWT token automatically
API.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.log("Token read error:", error);
  }

  return config;
});

// =========================
// Listings API
// =========================
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

  update: (id: string, data: Partial<any>) =>
    API.put(`/listings/${id}`, data),

  delete: (id: string) => API.delete(`/listings/${id}`),
};

// =========================
// Categories API
// =========================
export const categoryAPI = {
  getAll: () => API.get("/categories"),
};

// =========================
// Auth API
// =========================
export const authAPI = {
  login: (data: { email: string; password: string }) => API.post('/login', data),
  register: (data: { email: string; password: string; full_name?: string; phone?: string; role?: string }) =>
    API.post('/register', data),
  getUser: (id: string) => API.get(`/users/${id}`),
};

// =========================
// Listing Image Upload API
// =========================
export const listingImageAPI = {
  upload: (formData: FormData) =>
    API.post('/listing-image/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default API;