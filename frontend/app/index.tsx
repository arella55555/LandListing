import HomeScreen from "../src/screens/Home/HomeScreen";
import Dashboard from "../src/screens/Dashboard/Dashboard";
import React from "react";
import AppNavigator from "../src/navigation/AppNavigation";
//import { AuthProvider } from "../src/navigation/AuthContext";

export default function App() {
    return (
        //<AuthProvider>
            <AppNavigator />
        //</AuthProvider>
    );
}
