import React, {
  useState,
} from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import {
  useNavigation,
} from "@react-navigation/native";

import {
  register,
} from "../../services/authService";

export default function SignupScreen() {

  const navigation =
    useNavigation<any>();

  const [
    full_name,
    setFullName,
  ] = useState("");

  const [email, setEmail] =
    useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [phone, setPhone] =
    useState("");

  const handleSignup =
    async () => {

    try {

      await register({
        full_name,
        email,
        password,
        phone,

        // DEFAULT ROLE
        role: "buyer",
      });

      alert(
        "Account created successfully!"
      );

      navigation.goBack();

    } catch (err: any) {

      alert(
        err.message ||
        "Signup failed"
      );
    }
  };

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        Create Account
      </Text>

      <TextInput
        placeholder="Full Name"
        value={full_name}
        onChangeText={
          setFullName
        }
        style={styles.input}
      />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
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
        onPress={handleSignup}
      >

        <Text
          style={
            styles.buttonText
          }
        >
          Sign Up
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
        "#16A34A",
      padding: 15,
      borderRadius: 12,
      alignItems: "center",
    },

    buttonText: {
      color: "white",
      fontWeight: "700",
      fontSize: 16,
    },
  });