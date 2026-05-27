import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from '../screens/Admin/Dashboard/AdminDashboardScreen';
import ListingsScreen from '../screens/Admin/Listings/AdminListingsScreen';
import VerificationScreen from '../screens/Admin/Users/AdminUsersScreen';
import AdminLogsScreen from '../screens/Admin/Logs/AdminLogsScreen';
import MoreScreen from '../screens/Admin/Settings/AdminSettingsScreen';

import { COLORS } from '../constants/color';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#94A3B8',

        tabBarStyle: {
          height: 70,
          paddingBottom: 10,
          paddingTop: 8,
          backgroundColor: '#0F172A',
          borderTopWidth: 0,
        },

        tabBarIcon: ({ color, size }) => {
          let iconName: any;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'home-outline';
              break;
            case 'Listings':
              iconName = 'albums-outline';
              break;
            case 'Verify':
              iconName = 'shield-checkmark-outline';
              break;
            case 'Logs':
              iconName = 'document-text-outline';
              break;
            default:
              iconName = 'menu-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Listings" component={ListingsScreen} />
      <Tab.Screen name="Verify" component={VerificationScreen} />
      <Tab.Screen name="Logs" component={AdminLogsScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}