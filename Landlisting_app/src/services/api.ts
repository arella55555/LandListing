import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your PC LAN IP
const API_BASE_URL = "http://192.168.123.44:5000/api";

const API = axios.create({
  baseURL: API_BASE_URL,
});


// Attach JWT token automatically
API.interceptors.request.use(async (config) => {
  try {
    //const token = await AsyncStorage.getItem("token");
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUwYzRhYmVhLWJiYjYtNGEyOS04YjM2LWE5YjVhMzU4NDE5NCIsInJvbGUiOiJzZWxsZXIiLCJpc192ZXJpZmllZCI6dHJ1ZSwiaWF0IjoxNzc5ODcwOTg5LCJleHAiOjE3Nzk5NTczODl9.KEE1H7d1rvfp_t8kCt3PWS2sgloO9LYj6L7vsTnwkLw";

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

export default API;
