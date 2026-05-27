import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AdminTabNavigator from "./AdminTabNavigator";

import UserDetailsScreen from "../screens/Admin/Users/UserDetailsScreen";

import ListingDetailsScreen
from "../screens/Admin/Listings/ListingDetailsScreen";
import AdminSettingsScreen from "../screens/Admin/Settings/AdminSettingsScreen";
import AdminLogsScreen from "../screens/Admin/Logs/AdminLogsScreen";
import AdminReportsScreen from "../screens/Admin/Logs/AdminReportScreen";

const Stack = createNativeStackNavigator();

export default function AdminStackNavigator() {
  return (
    <Stack.Navigator>

      <Stack.Screen
        name="AdminTabs"
        component={AdminTabNavigator}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="UserDetails"
        component={UserDetailsScreen}
        options={{
          title: "User Details",
        }}
      />

      <Stack.Screen
        name="ListingDetails"
        component={ListingDetailsScreen}
        options={{
          title: "Listing Details",
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="Reports"
        component={AdminReportsScreen}
        options={{
          title: "Reports",
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="Logs"
        component={AdminLogsScreen}
        options={{
          title: "Logs",
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="Settings"
        component={AdminSettingsScreen}
        options={{
          title: "Settings",
          headerShown: false,
        }}
      />

    </Stack.Navigator>
  );
}