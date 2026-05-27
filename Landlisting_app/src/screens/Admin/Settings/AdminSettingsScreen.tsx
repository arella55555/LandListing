import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from "react-native";

export default function AdminSettingsScreen() {
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Settings</Text>

            <Text style={styles.sectionTitle}>
                Account
            </Text>

            <TouchableOpacity style={styles.item}>
                <Text style={styles.itemText}>
                    Admin Profile
                </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.item}>
                <Text style={styles.itemText}>
                    Change Password
                </Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>
                System
            </Text>

            <TouchableOpacity style={styles.item}>
                <Text style={styles.itemText}>
                    Listing Moderation
                </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.item}>
                <Text style={styles.itemText}>
                    Verification Rules
                </Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>
                Security
            </Text>

            <TouchableOpacity style={styles.logoutButton}>
                <Text style={styles.logoutText}>
                    Logout
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
        padding: 20,
    },

    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 25,
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#64748B",
        marginBottom: 10,
        marginTop: 15,
    },

    item: {
        backgroundColor: "white",
        padding: 18,
        borderRadius: 12,
        marginBottom: 10,
    },

    itemText: {
        fontSize: 16,
    },

    logoutButton: {
        backgroundColor: "#EF4444",
        padding: 18,
        borderRadius: 12,
        marginTop: 10,
    },

    logoutText: {
        color: "white",
        textAlign: "center",
        fontWeight: "600",
        fontSize: 16,
    },
});