import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { login } from "../../services/authService";
import { useNavigation } from "@react-navigation/native";

export default function LoginScreen() {
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
  try {
    setLoading(true);

    const data = await login(
      email,
      password
    );

    /*const role =
  data?.user?.role ??
  data?.role ??
  data?.user?.data?.role;*/
//const role = data.user?.role || data.role;

const role = data?.user?.role;
console.log("ROLE:", role);
console.log("LOGIN RESPONSE:", data);

  console.log("ROLE:", role);
console.log("LOGIN RESPONSE:", JSON.stringify(data, null, 2));
    // ADMIN
    if (
      role === "admin"
    ) {

      navigation.reset({
        index: 0,
        routes: [
          { name: "AdminStack" },
        ],
      });

      return;
    }

    // NORMAL USERS
    navigation.reset({
      index: 0,
      routes: [
        { name: "AppStack" },
      ],
    });

  } catch (err: any) {

    alert(err.message);

  } finally {

    setLoading(false);
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Login</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>
          {loading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
        <Text style={styles.link}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 28, fontWeight: "800", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
  },
  button: {
    backgroundColor: "#7C3AED",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "700" },
  link: { marginTop: 15, textAlign: "center", color: "#7C3AED" },
});