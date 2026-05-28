import axios from "axios";
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

export default API;
