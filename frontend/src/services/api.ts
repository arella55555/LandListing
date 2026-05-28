import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

const getApiBaseUrl = () => {
  if (Platform.OS === "android") {
    return "http://10.0.2.2:5000";
  }

  const debuggerHost =
    Constants.manifest?.debuggerHost ||
    (Constants.manifest2 as any)?.debuggerHost ||
    Constants.expoConfig?.hostUri;

  if (debuggerHost) {
    const host = debuggerHost.split(":")[0];
    return `http://${host}:5000`;
  }

  return "http://localhost:5000";
};

const API = axios.create({
  baseURL: getApiBaseUrl(),
});

API.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  } catch {
    // ignore
  }
  return config;
});

export default API;
