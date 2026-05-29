import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import Home from '../screens/Home/HomeScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
    return (
        <Tab.Navigator>
            <Tab.Screen name="Home" component={Home}/>
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    return ( 
            <Stack.Navigator>
                <Stack.Screen 
                    name="Main"
                    component={MainTabs}
                    options={{headerShown: false }}
                />
            </Stack.Navigator>
    );
}