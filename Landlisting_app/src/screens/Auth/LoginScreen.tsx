import React, {
  useState,
} from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import {
  useNavigation,
} from "@react-navigation/native";

import {
  login,
} from "../../services/authService";

export default function LoginScreen() {

  const navigation =
    useNavigation<any>();

  const [email, setEmail] =
    useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [loading, setLoading] =
    useState(false);

  const handleLogin =
    async () => {

    try {

      setLoading(true);

      const data =
        await login(
          email,
          password
        );

      console.log(
        "LOGIN RESPONSE:",
        JSON.stringify(
          data,
          null,
          2
        )
      );

      const role =
        data?.user?.role;

      console.log(
        "ROLE:",
        role
      );

      /* =====================================================
         ADMIN / SUPERADMIN
      ===================================================== */

      if (
        role === "admin" ||
        role === "superadmin"
      ) {

        navigation.reset({
          index: 0,
          routes: [
            {
              name:
                "AdminStack",
            },
          ],
        });

        return;
      }

      /* =====================================================
         NORMAL USERS
      ===================================================== */

      navigation.reset({
        index: 0,
        routes: [
          {
            name:
              "AppStack",
          },
        ],
      });

    } catch (err: any) {

      console.log(
        "LOGIN ERROR:",
        err
      );

      alert(
        err.message ||
        "Login failed"
      );

    } finally {

      setLoading(false);
    }
  };

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        Login
      </Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={
          setPassword
        }
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >

        {loading ? (

          <ActivityIndicator
            color="white"
          />

        ) : (

          <Text
            style={
              styles.buttonText
            }
          >
            Login
          </Text>
        )}

      </TouchableOpacity>

      <TouchableOpacity
        onPress={() =>
          navigation.navigate(
            "Signup"
          )
        }
      >

        <Text style={styles.link}>
          Create Account
        </Text>

      </TouchableOpacity>

    </View>
  );
}

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      justifyContent:
        "center",
      padding: 20,
      backgroundColor:
        "#fff",
    },

    title: {
      fontSize: 32,
      fontWeight: "800",
      marginBottom: 24,
      color: "#0F172A",
    },

    input: {
      borderWidth: 1,
      borderColor: "#CBD5E1",
      padding: 14,
      marginBottom: 14,
      borderRadius: 12,
      fontSize: 16,
    },

    button: {
      backgroundColor:
        "#7C3AED",
      padding: 15,
      borderRadius: 12,
      alignItems: "center",
      marginTop: 4,
    },

    buttonText: {
      color: "white",
      fontWeight: "700",
      fontSize: 16,
    },

    link: {
      marginTop: 18,
      textAlign: "center",
      color: "#7C3AED",
      fontWeight: "600",
    },
  });