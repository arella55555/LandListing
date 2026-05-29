import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";

import { getUsers } from "../../../services/adminService";
import { COLORS } from "../../../constants/color";

type Role = "buyer" | "seller" | "admin" | "superadmin";
type Status = "active" | "suspended" | "banned";

type VerificationStatus = "none" | "pending" | "approved" | "rejected";

interface User {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  status: Status;
  seller_verification_status?: VerificationStatus;
  is_suspended?: boolean;
  is_verified?: boolean;
}

export default function AdminUsersScreen() {
  const navigation = useNavigation<any>();

  const [users, setUsers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<
    "all" | "sellers" | "pending" | "suspended" | "admins"
  >("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [search, users, tab]);

  async function fetchUsers() {
    try {
      setLoading(true);

      const data = await getUsers();

      setUsers(data || []);
      setFiltered(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function applyFilters() {
    let list = [...users];

    // SEARCH (admin focus: name/email)
    if (search.trim()) {
      list = list.filter(
        (u) =>
          u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
          u.email?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // ADMIN FILTER TABS
    switch (tab) {
      case "sellers":
        list = list.filter((u) => u.role === "seller");
        break;

      case "pending":
        list = list.filter(
          (u) =>
            u.role === "seller" &&
            u.seller_verification_status === "pending"
        );
        break;

      case "suspended":
        list = list.filter((u) => u.status === "suspended");
        break;

      case "admins":
        list = list.filter(
          (u) => u.role === "admin" || u.role === "superadmin"
        );
        break;

      default:
        break;
    }

    setFiltered(list);
  }

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10, color: "#64748B" }}>
          Loading admin users panel...
        </Text>
      </View>
    );
  }

  function ListHeader() {
    return (
      <>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Users</Text>

            <Text style={styles.subtitle}>
              Admin Panel — Manage users and seller verification requests
            </Text>
          </View>
        </View>

        {/* SEARCH */}
        <View style={styles.searchRow}>
          <TextInput
            placeholder="Search users..."
            value={search}
            onChangeText={setSearch}
            style={styles.search}
          />
        </View>

        {/* TABS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Tab label="All" active={tab === "all"} onPress={() => setTab("all")} />
          <Tab
            label="Sellers"
            active={tab === "sellers"}
            onPress={() => setTab("sellers")}
          />
          <Tab
            label="Pending"
            active={tab === "pending"}
            onPress={() => setTab("pending")}
          />
          <Tab
            label="Suspended"
            active={tab === "suspended"}
            onPress={() => setTab("suspended")}
          />
          <Tab
            label="Admins"
            active={tab === "admins"}
            onPress={() => setTab("admins")}
          />
        </ScrollView>

        <View style={{ height: 10 }} />
      </>
    );
  }

  function renderItem({ item }: { item: User }) {
    const isSeller = item.role === "seller";

    const verification =
      item.seller_verification_status ?? "none";

    return (
      <TouchableOpacity style={styles.card}>
        <View style={styles.row}>
          <View>
            <Text style={styles.name}>{item.full_name}</Text>
            <Text style={styles.email}>{item.email}</Text>
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.role}>{item.role}</Text>

            <Text style={statusColor(item.status)}>
              {item.status}
            </Text>
          </View>
        </View>

        {/* ADMIN-ONLY SELLER SECTION */}
        {isSeller && (
          <View style={styles.verificationBox}>
            <Text style={styles.verificationText}>
              Seller Verification: {verification}
            </Text>

            {verification === "pending" && (
              <TouchableOpacity style={styles.verifyBtn}>
                <Text style={styles.verifyText}>
                  Review Verification
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchUsers();
            }}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="people-outline"
              size={50}
              color="#CBD5E1"
            />
            <Text style={{ marginTop: 10, color: "#94A3B8" }}>
              No users found
            </Text>
          </View>
        }
      />
    </View>
  );
}

/* ================= COMPONENTS ================= */

function Tab({ label, active, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.tab, active && styles.tabActive]}
    >
      <Text
        style={[styles.tabText, active && styles.tabTextActive]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function statusColor(status: string) {
  if (status === "banned") return { color: "#DC2626" };
  if (status === "suspended") return { color: "#EA580C" };
  return { color: "#16A34A" };
}

/* ================= STYLES ================= */

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

  header: {
    marginBottom: 10,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    color: "#64748B",
    marginTop: 4,
  },

  searchRow: {
    marginBottom: 10,
  },

  search: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 12,
  },

  tab: {
    padding: 10,
    marginRight: 10,
    borderRadius: 10,
    backgroundColor: "#E2E8F0",
  },

  tabActive: {
    backgroundColor: "#7C3AED",
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
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  name: {
    fontWeight: "700",
    fontSize: 16,
  },

  email: {
    color: "#64748B",
  },

  role: {
    fontWeight: "600",
    textTransform: "capitalize",
  },

  verificationBox: {
    marginTop: 10,
    borderTopWidth: 1,
    borderColor: "#E2E8F0",
    paddingTop: 10,
  },

  verificationText: {
    fontSize: 12,
    color: "#64748B",
  },

  verifyBtn: {
    marginTop: 8,
    backgroundColor: "#7C3AED",
    padding: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
  },

  verifyText: {
    color: "white",
    fontWeight: "700",
  },

  empty: {
    alignItems: "center",
    marginTop: 100,
  },
});