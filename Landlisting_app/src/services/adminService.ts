import AsyncStorage from "@react-native-async-storage/async-storage";
import baseURL from "./api";

/* ================================
   CORE FETCH WRAPPER (IMPORTANT)
================================ */
async function apiRequest(
  url: string,
  options: RequestInit = {}
) {
  const token = await AsyncStorage.getItem("token");

  if (!token) {
    throw new Error("No auth token found");
  }

  const res = await fetch(`${baseURL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  let data: any = null;

  try {
    data = await res.json();
  } catch (e) {
    // ignore json parse errors
  }

  if (!res.ok) {
    throw new Error(
      data?.message || `Request failed: ${res.status}`
    );
  }

  return data;
}

/* ================================
   USERS
================================ */

export const getUsers = async () => {
  return apiRequest("/admin/users");
};

export const approveSeller = async (userId: string) => {
  return apiRequest(`/admin/users/${userId}/approve-seller`, {
    method: "PATCH",
  });
};

export const rejectSeller = async (userId: string) => {
  return apiRequest(`/admin/users/${userId}/reject-seller`, {
    method: "PATCH",
  });
};

export const suspendUser = async (userId: string) => {
  return apiRequest(`/admin/users/${userId}/suspend`, {
    method: "PATCH",
  });
};

export const unsuspendUser = async (userId: string) => {
  return apiRequest(`/admin/users/${userId}/unsuspend`, {
    method: "PATCH",
  });
};

/* ================================
   LISTINGS (FIXED + CLEAN)
================================ */

export const getListings = async () => {
  const res = await apiRequest("/admin/listings");

  // normalize backend response safely
  return {
    listings: res?.listings || [],
  };
};

export const approveListing = async (listingId: string) => {
  return apiRequest(`/admin/listings/${listingId}/approve`, {
    method: "PATCH",
  });
};

export const rejectListing = async (listingId: string) => {
  return apiRequest(`/admin/listings/${listingId}/reject`, {
    method: "PATCH",
  });
};

export const flagListing = async (listingId: string) => {
  return apiRequest(`/admin/listings/${listingId}/flag`, {
    method: "PATCH",
  });
};

/* ================================
   LOGS
================================ */

export const getLogs = async () => {
  return apiRequest("/admin/logs");
};

