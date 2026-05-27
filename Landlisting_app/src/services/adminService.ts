import AsyncStorage from "@react-native-async-storage/async-storage";

import baseURL from "./api";

async function getAuthHeaders() {

  const token =
    await AsyncStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export const getUsers = async () => {

  const headers =
    await getAuthHeaders();

  const res = await fetch(
    `${baseURL}/admin/users`,
    {
      headers,
    }
  );

  if (!res.ok) {

    const errorData =
      await res.json();

    throw new Error(
      errorData.message ||
      "Failed to fetch users"
    );
  }

  return await res.json();
};

export const approveSeller =
  async (userId: string) => {

  const headers =
    await getAuthHeaders();

  const res = await fetch(
    `${baseURL}/admin/users/${userId}/approve-seller`,
    {
      method: "PATCH",
      headers,
    }
  );

  return await res.json();
};

export const rejectSeller =
  async (userId: string) => {

  const headers =
    await getAuthHeaders();

  const res = await fetch(
    `${baseURL}/admin/users/${userId}/reject-seller`,
    {
      method: "PATCH",
      headers,
    }
  );

  return await res.json();
};

export const suspendUser =
  async (userId: string) => {

  const headers =
    await getAuthHeaders();

  const res = await fetch(
    `${baseURL}/admin/users/${userId}/suspend`,
    {
      method: "PATCH",
      headers,
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.message ||
      "Failed to suspend user"
    );
  }

  return data;
};

export const unsuspendUser =
  async (userId: string) => {

  const headers =
    await getAuthHeaders();

  const res = await fetch(
    `${baseURL}/admin/users/${userId}/unsuspend`,
    {
      method: "PATCH",
      headers,
    }
  );

  return await res.json();
};

export const getListings = async () => {

  const headers =
    await getAuthHeaders();

  const res = await fetch(
    `${baseURL}/admin/listings`,
    {
      headers,
    }
  );

  if (!res.ok) {

    const errorData =
      await res.json();

    throw new Error(
      errorData.message ||
      "Failed to fetch listings"
    );
  }

  return await res.json();
};

export const approveListing =
  async (listingId: string) => {

  const headers =
    await getAuthHeaders();

  const res = await fetch(
    `${baseURL}/admin/listings/${listingId}/approve`,
    {
      method: "PATCH",
      headers,
    }
  );

  return await res.json();
};

export const rejectListing =
  async (listingId: string) => {

  const headers =
    await getAuthHeaders();

  const res = await fetch(
    `${baseURL}/admin/listings/${listingId}/reject`,
    {
      method: "PATCH",
      headers,
    }
  );

  return await res.json();
};

export const getLogs = async () => {

  const headers =
    await getAuthHeaders();

  const res = await fetch(
    `${baseURL}/admin/logs`,
    {
      headers,
    }
  );

  if (!res.ok) {

    const errorData =
      await res.json();

    throw new Error(
      errorData.message ||
      "Failed to fetch logs"
    );
  }

  return await res.json();
};