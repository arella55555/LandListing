import AsyncStorage from "@react-native-async-storage/async-storage";

import baseURL from "./api";

export async function login(
  email: string,
  password: string
) {

  const res = await fetch(
    `${baseURL}/login`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  const data = await res.json();

  console.log("LOGIN RESPONSE:", data);

  if (!res.ok) {
    throw new Error(
      data.message ||
      "Login failed"
    );
  }

  // SAVE TOKEN
  if (data.token) {

    await AsyncStorage.setItem(
      "token",
      data.token
    );
  }

  const token =
  await AsyncStorage.getItem("token");

console.log("TOKEN:", token);


  return data;
}



export async function register(payload: {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
}) {
  const res = await fetch(`${baseURL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Signup failed");
  }

  return data;
}

export async function getToken() {
  return await AsyncStorage.getItem("token");
}

export async function logout() {
  await AsyncStorage.removeItem("token");
}