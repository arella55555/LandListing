import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AdminTabNavigator from "./AdminTabNavigator";

import UserDetailsScreen from "../screens/Admin/Users/UserDetailsScreen";

import ListingDetailsScreen
from "../screens/Admin/Listings/ListingDetailsScreen";

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

    </Stack.Navigator>
  );
}