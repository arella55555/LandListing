import React from "react";

import { PaperProvider }
from "react-native-paper";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import LoginScreen
from "@/src/screens/Auth/LoginScreen";

import SignupScreen
from "@/src/screens/Auth/SignupScreen";

import AdminStackNavigator
from "@/src/navigation/AdminStackNavigator";

import AppNavigator
from "@/src/navigation/AppNavigation";

const Stack =
  createNativeStackNavigator();

export default function App() {
  return (
    <PaperProvider>
      
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="AdminStack" component={AdminStackNavigator} />
          <Stack.Screen name="AppStack" component={AppNavigator} />
        </Stack.Navigator>

    </PaperProvider>
  );
}
