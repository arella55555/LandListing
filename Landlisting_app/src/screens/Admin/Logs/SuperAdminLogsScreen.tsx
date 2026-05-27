import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";

import { useEffect, useState } from "react";

import { Ionicons } from "@expo/vector-icons";

import { getLogs } from "../../../services/adminService";

export default function AdminLogsScreen() {

  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {

    try {

      const data = await getLogs();

      console.log(data);

      setLogs(data);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);
    }
  }

  function getIcon(action: string) {

    switch (action) {

      case "approve_listing":
        return "checkmark-circle";

      case "reject_listing":
        return "close-circle";

      case "suspend_user":
        return "ban";

      default:
        return "document-text";
    }
  }

  function formatAction(action: string) {

    return action
      .replaceAll("_", " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  if (loading) {

    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Admin Logs
      </Text>

      <Text style={styles.subtitle}>
        Superadmin activity monitoring
      </Text>

      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}

        contentContainerStyle={{
          paddingBottom: 120,
        }}

        renderItem={({ item }) => (

          <View style={styles.card}>

            <View style={styles.iconContainer}>

              <Ionicons
                name={getIcon(item.action) as any}
                size={22}
                color="#3B82F6"
              />

            </View>

            <View style={{ flex: 1 }}>

              <Text style={styles.action}>
                {formatAction(item.action)}
              </Text>

              <Text style={styles.admin}>
                By: {item.admin_name}
              </Text>

              <Text style={styles.target}>
                Target: {item.target_type}
              </Text>

              <Text style={styles.date}>
                {new Date(
                  item.created_at
                ).toLocaleString()}
              </Text>

            </View>

          </View>
        )}

        ListEmptyComponent={

          <View style={styles.emptyContainer}>

            <Ionicons
              name="document-text-outline"
              size={60}
              color="#CBD5E1"
            />

            <Text style={styles.emptyText}>
              No logs found
            </Text>

          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 20,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
  },

  subtitle: {
    color: "#64748B",
    marginTop: 5,
    marginBottom: 25,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    flexDirection: "row",
  },

  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  action: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },

  admin: {
    marginTop: 5,
    color: "#475569",
  },

  target: {
    marginTop: 4,
    color: "#64748B",
    fontSize: 13,
  },

  date: {
    marginTop: 8,
    color: "#94A3B8",
    fontSize: 12,
  },

  emptyContainer: {
    marginTop: 100,
    alignItems: "center",
  },

  emptyText: {
    marginTop: 12,
    color: "#94A3B8",
  },
});