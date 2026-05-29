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

  const res = await fetch(`${baseURL}/admin/dashboard`, {
    method: "GET",
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "Failed to fetch dashboard");
  }

  return data;
};