import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { ADMIN_TABS } from "../constants/adminTabs";

import AdminDashboardScreen from "../screens/Admin/Dashboard/AdminDashboardScreen";
import AdminUsersScreen from "../screens/Admin/Users/AdminUsersScreen";
import AdminListingsScreen from "../screens/Admin/Listings/AdminListingsScreen";
import AdminMoreScreen from "../screens/Admin/Settings/AdminMoreScreen";

const Tab = createBottomTabNavigator();

const SCREEN_MAP: any = {
  Dashboard: AdminDashboardScreen,
  Users: AdminUsersScreen,
  Listings: AdminListingsScreen,
  More: AdminMoreScreen,
};

export default function AdminTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarStyle: {
          backgroundColor: "#0F172A",
          borderTopWidth: 0,
          height: 65,
        },

        tabBarActiveTintColor: "#3B82F6",
        tabBarInactiveTintColor: "#94A3B8",

        tabBarIcon: ({ color, size, focused }) => {
  const tab = ADMIN_TABS.find(
    (t) => t.name === route.name
  );

  // 👇 override ONLY More tab icon
  let iconName = tab?.icon as any;

  if (route.name === "More") {
    iconName = focused
      ? "settings"
      : "settings-outline";
  }

  return (
    <Ionicons
      name={iconName}
      size={22}
      color={color}
    />
  );
},
      })}
    >
      {ADMIN_TABS.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={SCREEN_MAP[tab.name]}
        />
      ))}
    </Tab.Navigator>
  );
}