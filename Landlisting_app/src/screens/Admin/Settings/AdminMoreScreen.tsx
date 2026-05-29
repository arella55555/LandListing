import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";

import { SafeAreaView }
from "react-native-safe-area-context";

import {
  Feather,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";

import {
  useNavigation,
} from "@react-navigation/native";

import AsyncStorage
from "@react-native-async-storage/async-storage";

/* =========================================================
   API URL
========================================================= */

const API_URL =
  "http://10.239.158.186:5000/api";

/* =========================================================
   SCREEN
========================================================= */

export default function MoreScreen() {

  const navigation = useNavigation<any>();

  const [loading, setLoading] =
    useState(true);

  const [admin, setAdmin] =
    useState<any>(null);

  /* =========================================================
     FETCH ADMIN PROFILE
  ========================================================= */

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  async function fetchAdminProfile() {

    try {

      setLoading(true);

      const token =
        await AsyncStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      setAdmin(data.user);

    } catch (err) {

      console.log(err);

      Alert.alert(
        "Error",
        "Failed to load profile"
      );

    } finally {

      setLoading(false);
    }
  }

  /* =========================================================
     MENU ITEMS
  ========================================================= */

  const menuItems = [

    {
      icon: "analytics-outline",
      title: "Dashboard Analytics",
      route: "Dashboard",
    },

    {
      icon: "flag-outline",
      title: "Reports",
      route: "Reports",
    },

    {
      icon: "document-text-outline",
      title: "Activity Logs",
      route: "Logs",
    },

    {
      icon: "settings-outline",
      title: "Settings",
      route: "Settings",
    },

  ];

  /* =========================================================
     LOGOUT
  ========================================================= */

  async function handleLogout() {

    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Logout",
          style: "destructive",

          onPress: async () => {

            await AsyncStorage.removeItem(
              "token"
            );

            navigation.replace("Login");
          },
        },
      ]
    );
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {

    return (
      <View style={styles.loader}>
        <ActivityIndicator
          size="large"
          color="#7C3AED"
        />
      </View>
    );
  }

  const initial =
    admin?.full_name?.charAt(0) || "A";

  /* =========================================================
     MAIN
  ========================================================= */

  return (

    <SafeAreaView style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* PROFILE */}

        <View style={styles.profileCard}>

          <View style={styles.avatar}>

            <Text style={styles.avatarText}>
              {initial}
            </Text>

          </View>

          <View style={styles.profileInfo}>

            <Text style={styles.name}>
              {admin?.full_name}
            </Text>

            <Text style={styles.role}>
              {admin?.role}
            </Text>

            <Text style={styles.email}>
              {admin?.email}
            </Text>

          </View>

        </View>

        {/* GENERAL */}

        <Text style={styles.sectionTitle}>
          Administration
        </Text>

        <View style={styles.menuContainer}>

          {menuItems.map((item, index) => (

            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,

                index ===
                  menuItems.length - 1 && {
                    borderBottomWidth: 0,
                  },
              ]}

              activeOpacity={0.8}

              onPress={() =>
                navigation.navigate(item.route)
              }
            >

              <View style={styles.menuLeft}>

                <View style={styles.iconWrapper}>

                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color="#7C3AED"
                  />

                </View>

                <Text style={styles.menuText}>
                  {item.title}
                </Text>

              </View>

              <Feather
                name="chevron-right"
                size={20}
                color="#94A3B8"
              />

            </TouchableOpacity>

          ))}

        </View>

        {/* SECURITY */}

        <Text style={styles.sectionTitle}>
          Security
        </Text>

        <View style={styles.menuContainer}>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.8}
          >

            <View style={styles.menuLeft}>

              <View style={styles.iconWrapper}>

                <MaterialIcons
                  name="security"
                  size={20}
                  color="#7C3AED"
                />

              </View>

              <Text style={styles.menuText}>
                Privacy & Security
              </Text>

            </View>

            <Feather
              name="chevron-right"
              size={20}
              color="#94A3B8"
            />

          </TouchableOpacity>

        </View>

        {/* APP INFO */}

        <Text style={styles.sectionTitle}>
          System
        </Text>

        <View style={styles.infoCard}>

          <View style={styles.infoRow}>

            <Text style={styles.infoLabel}>
              App Version
            </Text>

            <Text style={styles.infoValue}>
              v1.0.0
            </Text>

          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>

            <Text style={styles.infoLabel}>
              Environment
            </Text>

            <Text style={styles.infoValue}>
              Production
            </Text>

          </View>

        </View>

        {/* LOGOUT */}

        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.85}
          onPress={handleLogout}
        >

          <Ionicons
            name="log-out-outline"
            size={22}
            color="#DC2626"
          />

          <Text style={styles.logoutText}>
            Logout
          </Text>

        </TouchableOpacity>

        <View style={{ height: 120 }} />

      </ScrollView>

    </SafeAreaView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    padding: 22,
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
  },

  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },

  name: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },

  role: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 14,
  },

  email: {
    marginTop: 4,
    color: "#94A3B8",
    fontSize: 13,
  },

  sectionTitle: {
    marginTop: 28,
    marginBottom: 14,
    fontSize: 15,
    fontWeight: "700",
    color: "#64748B",
  },

  menuContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
  },

  menuText: {
    marginLeft: 14,
    fontSize: 15,
    color: "#111827",
    fontWeight: "600",
  },

  infoCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  infoDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 16,
  },

  infoLabel: {
    color: "#64748B",
    fontWeight: "600",
  },

  infoValue: {
    color: "#111827",
    fontWeight: "700",
  },

  logoutButton: {
    marginTop: 32,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  logoutText: {
    marginLeft: 10,
    color: "#DC2626",
    fontWeight: "800",
    fontSize: 15,
  },
});