import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from "react-native";

import { useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";

import { getLogs } from "../../../services/adminService";

/* =========================================================
 ADMIN LOGS SCREEN (UPGRADED UI)
========================================================= */

export default function AdminLogsScreen() {
  const [logs, setLogs] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<
    "all" | "users" | "listings" | "security"
  >("all");

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [search, logs, tab]);

  async function fetchLogs() {
    try {
      setLoading(true);

      const data = await getLogs();

      setLogs(data || []);
      setFiltered(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function applyFilters() {
    let list = [...logs];

    /* SEARCH */
    if (search.trim()) {
      list = list.filter(
        (l) =>
          l.action?.toLowerCase().includes(search.toLowerCase()) ||
          l.admin_name?.toLowerCase().includes(search.toLowerCase()) ||
          l.target_type?.toLowerCase().includes(search.toLowerCase())
      );
    }

    /* TABS */
    switch (tab) {
      case "users":
        list = list.filter((l) =>
          l.action?.includes("user") ||
          l.action?.includes("suspend") ||
          l.action?.includes("ban")
        );
        break;

      case "listings":
        list = list.filter((l) =>
          l.action?.includes("listing")
        );
        break;

      case "security":
        list = list.filter((l) =>
          l.action?.includes("login") ||
          l.action?.includes("role") ||
          l.action?.includes("security")
        );
        break;
    }

    setFiltered(list);
  }

  /* =========================================================
   ICON LOGIC
  ========================================================= */

  function getIcon(action: string) {
    if (action?.includes("approve")) return "checkmark-circle";
    if (action?.includes("reject")) return "close-circle";
    if (action?.includes("suspend")) return "ban";
    if (action?.includes("login")) return "log-in";
    if (action?.includes("role")) return "shield-checkmark";
    return "document-text";
  }

  function getColor(action: string) {
    if (action?.includes("reject") || action?.includes("ban"))
      return "#EF4444";

    if (action?.includes("suspend"))
      return "#F59E0B";

    if (action?.includes("approve"))
      return "#22C55E";

    return "#3B82F6";
  }

  function formatAction(action: string) {
    return action
      ?.replaceAll("_", " ")
      ?.replace(/\b\w/g, (c) => c.toUpperCase());
  }

  const stats = useMemo(() => {
    return {
      total: logs.length,
      users: logs.filter((l) => l.action?.includes("user")).length,
      listings: logs.filter((l) => l.action?.includes("listing")).length,
      security: logs.filter(
        (l) =>
          l.action?.includes("login") ||
          l.action?.includes("role")
      ).length,
    };
  }, [logs]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 10, color: "#64748B" }}>
          Loading logs...
        </Text>
      </View>
    );
  }

  /* =========================================================
   HEADER
  ========================================================= */

  function Header() {
    return (
      <>
        <Text style={styles.title}>System Logs</Text>
        <Text style={styles.subtitle}>
          Admin activity monitoring & audit trail
        </Text>

        {/* SEARCH */}
        <View style={styles.searchRow}>
          <TextInput
            placeholder="Search logs..."
            value={search}
            onChangeText={setSearch}
            style={styles.search}
          />
        </View>

        {/* STATS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Stat label="Total" value={stats.total} />
          <Stat label="Users" value={stats.users} />
          <Stat label="Listings" value={stats.listings} />
          <Stat label="Security" value={stats.security} />
        </ScrollView>

        {/* FILTER TABS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Tab label="All" active={tab === "all"} onPress={() => setTab("all")} />
          <Tab label="Users" active={tab === "users"} onPress={() => setTab("users")} />
          <Tab label="Listings" active={tab === "listings"} onPress={() => setTab("listings")} />
          <Tab label="Security" active={tab === "security"} onPress={() => setTab("security")} />
        </ScrollView>

        <View style={{ height: 10 }} />
      </>
    );
  }

  /* =========================================================
   RENDER ITEM
  ========================================================= */

  function renderItem({ item }: any) {
    const color = getColor(item.action);

    return (
      <View style={styles.card}>
        <View
          style={[
            styles.iconBox,
            { backgroundColor: `${color}15` },
          ]}
        >
          <Ionicons
            name={getIcon(item.action) as any}
            size={22}
            color={color}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.action}>
            {formatAction(item.action)}
          </Text>

          <Text style={styles.meta}>
            By: {item.admin_name}
          </Text>

          <Text style={styles.meta}>
            Target: {item.target_type}
          </Text>

          <Text style={styles.time}>
            {new Date(item.created_at).toLocaleString()}
          </Text>
        </View>

        {/* severity indicator */}
        <View
          style={[
            styles.badge,
            { backgroundColor: `${color}20` },
          ]}
        >
          <View
            style={[
              styles.dot,
              { backgroundColor: color },
            ]}
          />
        </View>
      </View>
    );
  }

  /* =========================================================
   MAIN
  ========================================================= */

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        ListHeaderComponent={Header}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchLogs();
            }}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={60} color="#CBD5E1" />
            <Text style={{ marginTop: 10, color: "#94A3B8" }}>
              No logs found
            </Text>
          </View>
        }
      />
    </View>
  );
}

/* =========================================================
 COMPONENTS
========================================================= */

function Stat({ label, value }: any) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Tab({ label, active, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.tab, active && styles.tabActive]}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/* =========================================================
 STYLES
========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 16,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    color: "#64748B",
    marginTop: 4,
    marginBottom: 12,
  },

  searchRow: {
    marginBottom: 10,
  },

  search: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 12,
  },

  stat: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 12,
    marginRight: 10,
    minWidth: 90,
  },

  statValue: {
    fontSize: 18,
    fontWeight: "800",
  },

  statLabel: {
    fontSize: 12,
    color: "#64748B",
  },

  tab: {
    padding: 10,
    marginRight: 10,
    borderRadius: 10,
    backgroundColor: "#E2E8F0",
  },

  tabActive: {
    backgroundColor: "#3B82F6",
  },

  tabText: {
    color: "#334155",
    fontWeight: "600",
  },

  tabTextActive: {
    color: "white",
  },

  card: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  action: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },

  meta: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 2,
  },

  time: {
    marginTop: 6,
    color: "#94A3B8",
    fontSize: 12,
  },

  badge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  empty: {
    alignItems: "center",
    marginTop: 100,
  },
});