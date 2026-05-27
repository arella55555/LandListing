// app/index.tsx
// Expo Router uses this as the root route.
// _layout.tsx defines the Stack — this file just re-exports HomeScreen.
//import HomeScreen from '../src/screens/Home/HomeScreen';
import LoginScreen from "../src/screens/Login/LoginScreen";
import HomeScreen from "../src/screens/Home/HomeScreen";
import Dashboard from "../src/screens/Dashboard/Dashboard";
import React from "react";
import AppNavigator from "../src/navigation/AppNavigation";
//import { AuthProvider } from "../src/navigation/AuthContext";

export default function App() {
  return <LoginScreen />;
    return (
        //<AuthProvider>
            <AppNavigator />
        //</AuthProvider>
    );
}

