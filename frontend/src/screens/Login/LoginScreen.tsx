import { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import API from "../../services/api";

export default function LoginScreen() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState<"seller" | "buyer" | "admin" | "">("buyer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    setErrorMessage("");

    if (!selectedRole) {
      setErrorMessage("Please select a role.");
      return;
    }

    if (!email || !password) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage("Please enter a valid email.");
      return;
    }

    setLoading(true);
    try {
      const response = await API.post("/auth/login", {
        email,
        password,
        role: selectedRole,
      });

      await AsyncStorage.setItem("authToken", response.data.token);
      await AsyncStorage.setItem("user", JSON.stringify(response.data.user));

      Alert.alert("Success", `Welcome back ${response.data.user.fullName}!`);
      setEmail("");
      setPassword("");
      router.replace("/(tabs)");
    } catch (error: any) {
      let message = "Login failed. Please try again.";

      if (error?.response?.data?.error) {
        message = error.response.data.error;
      } else if (error?.response?.status >= 500) {
        message = "Server error. Please try again later.";
      } else if (error?.request) {
        message = "Unable to reach the server. Check your connection and try again.";
      }

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setErrorMessage("");

    if (!selectedRole) {
      setErrorMessage("Please select a role.");
      return;
    }

    if (!email || !password || !confirmPassword) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage("Please enter a valid email.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await API.post("/auth/signup", {
        email,
        password,
        role: selectedRole,
      });

      Alert.alert("Success", `Signup successful as ${selectedRole}! Please login.`);
      setIsLogin(true);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      let message = "Signup failed. Please try again.";

      if (error?.response?.data?.error) {
        message = error.response.data.error;
      } else if (error?.response?.status >= 500) {
        message = "Server error. Please try again later.";
      } else if (error?.request) {
        message = "Unable to reach the server. Check your connection and try again.";
      }

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.title}>LandListing</Text>
        <Text style={styles.subtitle}>
          {isLogin ? "Welcome Back" : "Create Account"}
        </Text>
      </View>

      <View style={styles.form}>
        {/* Role Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Role</Text>
          <View style={styles.roleRow}>
            {[
              { key: "seller", label: "Seller" },
              { key: "buyer", label: "Buyer" },
              { key: "admin", label: "Admin" },
            ].map((role) => (
              <TouchableOpacity
                key={role.key}
                style={[
                  styles.roleButton,
                  selectedRole === role.key && styles.roleButtonSelected,
                ]}
                onPress={() => setSelectedRole(role.key as "seller" | "buyer" | "admin")}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    selectedRole === role.key && styles.roleButtonTextSelected,
                  ]}
                >
                  {role.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Email Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />
        </View>

        {/* Confirm Password (Signup only) */}
        {!isLogin && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>
        )}

        {/* Login/Signup Button */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={isLogin ? handleLogin : handleSignup}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Loading..." : isLogin ? "Login" : "Sign Up"}
          </Text>
        </TouchableOpacity>

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        {/* Forgot Password Link (Login only) */}
        {isLogin && (
          <TouchableOpacity>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Toggle Login/Signup */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
        </Text>
        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.toggleText}>
            {isLogin ? "Sign Up" : "Login"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
  },
  form: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  roleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  roleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#bdc3c7",
    borderRadius: 8,
    paddingVertical: 10,
    marginRight: 8,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  roleButtonSelected: {
    backgroundColor: "#3498db",
    borderColor: "#2980b9",
  },
  roleButtonText: {
    fontSize: 14,
    color: "#2c3e50",
    fontWeight: "600",
  },
  roleButtonTextSelected: {
    color: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#bdc3c7",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#2c3e50",
  },
  button: {
    backgroundColor: "#3498db",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  forgotPassword: {
    color: "#3498db",
    fontSize: 14,
    marginTop: 12,
    textAlign: "center",
  },
  errorText: {
    color: "#e74c3c",
    marginTop: 12,
    textAlign: "center",
    fontSize: 14,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: "#7f8c8d",
    fontSize: 14,
  },
  toggleText: {
    color: "#3498db",
    fontSize: 14,
    fontWeight: "600",
  },
});
