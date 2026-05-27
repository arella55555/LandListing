import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Switch,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useState } from "react";

export default function AdminSettingsScreen() {

    const [darkMode, setDarkMode] =
        useState(false);

    const [pushNotifications, setPushNotifications] =
        useState(true);

    const [twoFactor, setTwoFactor] =
        useState(true);

    return (

        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >

            {/* HEADER */}

            <View style={styles.header}>

                <Text style={styles.title}>
                    Settings
                </Text>

                <Text style={styles.subtitle}>
                    Manage admin preferences & security
                </Text>

            </View>

            {/* ACCOUNT */}

            <Text style={styles.sectionTitle}>
                Account
            </Text>

            <View style={styles.sectionCard}>

                <SettingsItem
                    icon="person-outline"
                    title="Admin Profile"
                />

                <SettingsItem
                    icon="lock-closed-outline"
                    title="Change Password"
                />

            </View>

            {/* SECURITY */}

            <Text style={styles.sectionTitle}>
                Security
            </Text>

            <View style={styles.sectionCard}>

                <SwitchItem
                    icon="shield-checkmark-outline"
                    title="Two-Factor Authentication"
                    value={twoFactor}
                    onValueChange={setTwoFactor}
                />

                <SettingsItem
                    icon="finger-print-outline"
                    title="Biometric Login"
                />

                <SettingsItem
                    icon="warning-outline"
                    title="Login Activity"
                />

            </View>

            {/* PLATFORM */}

            <Text style={styles.sectionTitle}>
                Platform Moderation
            </Text>

            <View style={styles.sectionCard}>

                <SettingsItem
                    icon="home-outline"
                    title="Listing Moderation Rules"
                />

                <SettingsItem
                    icon="shield-outline"
                    title="Verification Rules"
                />

                <SettingsItem
                    icon="flag-outline"
                    title="Reports & Violations"
                />

                <SettingsItem
                    icon="document-text-outline"
                    title="Audit Logs"
                />

            </View>

            {/* APP SETTINGS */}

            <Text style={styles.sectionTitle}>
                App Preferences
            </Text>

            <View style={styles.sectionCard}>

                <SwitchItem
                    icon="moon-outline"
                    title="Dark Mode"
                    value={darkMode}
                    onValueChange={setDarkMode}
                />

                <SwitchItem
                    icon="notifications-outline"
                    title="Push Notifications"
                    value={pushNotifications}
                    onValueChange={setPushNotifications}
                />

                <SettingsItem
                    icon="language-outline"
                    title="Language"
                    value="English"
                />

                <SettingsItem
                    icon="trash-outline"
                    title="Clear Cache"
                    value="45.2 MB"
                />

            </View>

            {/* SUPPORT */}

            <Text style={styles.sectionTitle}>
                Support
            </Text>

            <View style={styles.sectionCard}>

                <SettingsItem
                    icon="help-circle-outline"
                    title="Help & Support"
                />

                <SettingsItem
                    icon="information-circle-outline"
                    title="About App"
                    value="v1.0.0"
                />

            </View>

            {/* LOGOUT */}

            <TouchableOpacity style={styles.logoutButton}>

                <Ionicons
                    name="log-out-outline"
                    size={20}
                    color="white"
                />

                <Text style={styles.logoutText}>
                    Logout
                </Text>

            </TouchableOpacity>

            <View style={{ height: 100 }} />

        </ScrollView>
    );
}

/* ================= COMPONENTS ================= */

function SettingsItem({
    icon,
    title,
    value,
}: any) {

    return (

        <TouchableOpacity style={styles.item}>

            <View style={styles.itemLeft}>

                <View style={styles.iconContainer}>

                    <Ionicons
                        name={icon}
                        size={20}
                        color="#64748B"
                    />

                </View>

                <Text style={styles.itemText}>
                    {title}
                </Text>

            </View>

            <View style={styles.itemRight}>

                {value && (
                    <Text style={styles.itemValue}>
                        {value}
                    </Text>
                )}

                <Ionicons
                    name="chevron-forward"
                    size={18}
                    color="#94A3B8"
                />

            </View>

        </TouchableOpacity>
    );
}

function SwitchItem({
    icon,
    title,
    value,
    onValueChange,
}: any) {

    return (

        <View style={styles.item}>

            <View style={styles.itemLeft}>

                <View style={styles.iconContainer}>

                    <Ionicons
                        name={icon}
                        size={20}
                        color="#64748B"
                    />

                </View>

                <Text style={styles.itemText}>
                    {title}
                </Text>

            </View>

            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{
                    false: "#CBD5E1",
                    true: "#8B5CF6",
                }}
                thumbColor="#FFFFFF"
            />

        </View>
    );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
        paddingHorizontal: 20,
        paddingTop: 20,
    },

    header: {
        marginBottom: 25,
    },

    title: {
        fontSize: 32,
        fontWeight: "800",
        color: "#0F172A",
    },

    subtitle: {
        color: "#64748B",
        marginTop: 6,
        fontSize: 15,
    },

    sectionTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#64748B",
        marginBottom: 12,
        marginTop: 10,
    },

    sectionCard: {
        backgroundColor: "white",
        borderRadius: 22,
        marginBottom: 20,
        overflow: "hidden",
    },

    item: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 18,
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },

    itemLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },

    itemRight: {
        flexDirection: "row",
        alignItems: "center",
    },

    iconContainer: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: "#F8FAFC",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
    },

    itemText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#0F172A",
    },

    itemValue: {
        color: "#64748B",
        marginRight: 8,
        fontSize: 13,
    },

    logoutButton: {
        backgroundColor: "#EF4444",
        height: 58,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        marginTop: 10,
    },

    logoutText: {
        color: "white",
        fontWeight: "700",
        fontSize: 16,
        marginLeft: 8,
    },
});