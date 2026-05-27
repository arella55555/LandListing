import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function MoreScreen() {
  const navigation = useNavigation<any>();

  const menuItems = [
    {
      icon: "notifications-outline",
      title: "Notifications",
      route: "NotificationsScreen",
    },
    {
      icon: "shield-checkmark-outline",
      title: "Verification Queue",
      route: "VerificationQueueScreen",
    },
    {
      icon: "analytics-outline",
      title: "Analytics",
      route: "AnalyticsScreen",
    },
    {
      icon: "settings-outline",
      title: "Settings",
      route: "SettingsScreen",
    },
    {
      icon: "flag-outline",
      title: "Reports",
      route: "AdminReportsScreen",
    },
    {
      icon: "document-text-outline",
      title: "Activity Logs",
      route: "AdminLogsScreen",
    },
    {
      icon: "help-circle-outline",
      title: "Help & Support",
      route: "HelpScreen",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* PROFILE */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.name}>Admin User</Text>
            <Text style={styles.role}>LandListing Administrator</Text>
          </View>
        </View>

        {/* GENERAL MENU */}
        <Text style={styles.sectionTitle}>General</Text>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => navigation.navigate(item.route)}
            >
              <View style={styles.menuLeft}>
                <Ionicons
                  name={item.icon as any}
                  size={22}
                  color="#7C3AED"
                />
                <Text style={styles.menuText}>{item.title}</Text>
              </View>

              <Feather name="chevron-right" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        {/* SECURITY */}
        <Text style={styles.sectionTitle}>Security</Text>

        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("PrivacySecurityScreen")}
          >
            <View style={styles.menuLeft}>
              <MaterialIcons name="security" size={22} color="#7C3AED" />
              <Text style={styles.menuText}>Privacy & Security</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* LOGOUT */}
        <TouchableOpacity style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={22} color="#DC2626" />
          <Text style={styles.logoutText}>Logout</Text>
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

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },

  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 22,
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
  },

  profileInfo: {
    marginLeft: 16,
  },

  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },

  role: {
    marginTop: 4,
    color: "#6B7280",
  },

  sectionTitle: {
    marginTop: 28,
    marginBottom: 14,
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
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
    borderBottomColor: "#F3F4F6",
  },

  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  menuText: {
    marginLeft: 14,
    fontSize: 15,
    color: "#111827",
    fontWeight: "500",
  },

  logoutButton: {
    marginTop: 32,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  logoutText: {
    marginLeft: 10,
    color: "#DC2626",
    fontWeight: "700",
    fontSize: 15,
  },
});