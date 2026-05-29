import AsyncStorage from "@react-native-async-storage/async-storage";
import baseURL from "./api";

export async function getDashboardAnalytics() {
  const token = await AsyncStorage.getItem("token");

  const res = await fetch(`${baseURL}/admin/analytics`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch analytics");
  }

  return await res.json();
}