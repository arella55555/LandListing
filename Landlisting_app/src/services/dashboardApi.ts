import AsyncStorage from "@react-native-async-storage/async-storage";

import baseURL from "./api";

async function getAuthHeaders() {
  const token = await AsyncStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export const getDashboardStats = async () => {
  const headers = await getAuthHeaders();

  const res = await fetch(`${baseURL}/dashboard`, {
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to fetch dashboard");
  }

  return await res.json();
};