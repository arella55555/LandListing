import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API = axios.create({
  baseURL: "http://YOUR_IP:5000",
});

API.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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
  }) => API.post("/listings", data),

  getAll: () => API.get("/listings"),

  getById: (id: string) => API.get(`/listings/${id}`),

  update: (id: string, data: Partial<any>) => API.put(`/listings/${id}`, data),

  delete: (id: string) => API.delete(`/listings/${id}`),
};

export const categoryAPI = {
  getAll: () => API.get("/categories"),
};

export default API;
