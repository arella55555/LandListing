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

export default function AdminUsersScreen() {

  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const navigation = useNavigation<any>();

  const [refreshing, setRefreshing] =
    useState(false);

  const [search, setSearch] = useState("");

  const [selectedTab, setSelectedTab] =
    useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers(search);
  }, [search, users, selectedTab]);

  async function fetchUsers() {
  try {
    setLoading(true);

    const data = await getUsers();

    // ✅ FIX: backend returns { users: [...] }
    const usersList = data.users || [];

    setUsers(usersList);
    setFilteredUsers(usersList);

  } catch (error) {
    console.error("Fetch users error:", error);

  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}

  function filterUsers(text: string) {

    setSearch(text);

    let filtered = [...users];

    if (text.trim()) {
      filtered = filtered.filter((user) =>
        user.full_name
          ?.toLowerCase()
          .includes(text.toLowerCase())
      );
    }

    // FILTER TABS

    if (selectedTab === "verified_sellers") {
      filtered = filtered.filter(
        (u) => u.is_verified_seller
      );
    }

    if (selectedTab === "pending_verification") {
      filtered = filtered.filter(
        (u) => u.seller_verification_status === "pending"
      );
    }

    if (selectedTab === "suspended") {
      filtered = filtered.filter(
        (u) => u.is_suspended
      );
    }

    setFilteredUsers(filtered);
  }

  function renderRole(role: string) {

    switch (role) {

      case "superadmin":
        return styles.superadminBadge;

      case "admin":
        return styles.adminBadge;

      case "seller":
        return styles.sellerBadge;

      default:
        return styles.buyerBadge;
    }
  }

  function renderVerificationStatus(status: string) {

    switch (status) {

      case "approved":
        return styles.approvedBadge;

      case "rejected":
        return styles.rejectedBadge;

      default:
        return styles.pendingBadge;
    }
  }

  const totalUsers = users.length;

  const activeUsers =
    users.filter((u) => !u.is_suspended).length;

  const suspendedUsers =
    users.filter((u) => u.is_suspended).length;

  const pendingSellerVerifications =
    users.filter(
      (u) =>
        u.seller_verification_status === "pending"
    ).length;

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}

        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchUsers();
            }}
          />
        }

        showsVerticalScrollIndicator={false}

        contentContainerStyle={{
          paddingBottom: 120,
        }}

        ListHeaderComponent={(
          <>
            {/* HEADER */}

            <View style={styles.header}>

              <View>
                <Text style={styles.title}>
                  Users
                </Text>

                <Text style={styles.subtitle}>
                  Manage platform users & seller verification
                </Text>
              </View>

              <View style={styles.headerRight}>
                <TouchableOpacity style={styles.notificationBtn}>
                  <Ionicons
                    name="notifications-outline"
                    size={22}
                    color="#0F172A"
                  />

                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationText}>
                      3
                    </Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.profileCircle}>
                  <Ionicons
                    name="person"
                    size={20}
                    color="#64748B"
                  />
                </View>
              </View>
            </View>

            {/* SEARCH */}

            <View style={styles.searchRow}>

              <View style={styles.searchContainer}>

                <Ionicons
                  name="search"
                  size={18}
                  color="#94A3B8"
                />

                <TextInput
                  placeholder="Search users by name, email or ID..."
                  placeholderTextColor="#94A3B8"
                  style={styles.searchInput}
                  value={search}
                  onChangeText={filterUsers}
                />
              </View>

              <TouchableOpacity style={styles.filterBtn}>
                <Ionicons
                  name="options-outline"
                  size={20}
                  color="#475569"
                />
              </TouchableOpacity>

            </View>

            {/* KPI CARDS */}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 22 }}
            >

              <StatsCard
                title="Total Users"
                value={totalUsers}
                icon="people-outline"
                color="#7C3AED"
              />

              <StatsCard
                title="Active Users"
                value={activeUsers}
                icon="checkmark-circle-outline"
                color="#16A34A"
              />

              <StatsCard
                title="Suspended"
                value={suspendedUsers}
                icon="ban-outline"
                color="#EA580C"
              />

              <StatsCard
                title="Seller Requests"
                value={pendingSellerVerifications}
                icon="shield-checkmark-outline"
                color="#DC2626"
              />

            </ScrollView>

            {/* FILTER TABS */}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 18 }}
            >

              <FilterTab
                label="All Users"
                active={selectedTab === "all"}
                onPress={() => setSelectedTab("all")}
              />

              <FilterTab
                label="Verified Sellers"
                active={
                  selectedTab === "verified_sellers"
                }
                onPress={() =>
                  setSelectedTab("verified_sellers")
                }
              />

              <FilterTab
                label="Pending Verification"
                active={
                  selectedTab === "pending_verification"
                }
                onPress={() =>
                  setSelectedTab("pending_verification")
                }
              />

              <FilterTab
                label="Suspended"
                active={selectedTab === "suspended"}
                onPress={() =>
                  setSelectedTab("suspended")
                }
              />

            </ScrollView>
          </>
        )}

        renderItem={({ item }) => (

          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={() =>
              navigation.navigate(
                "UserDetails",
                { user: item }
              )
            }
          >


            {/* TOP */}
            {item.role === "buyer" &&
            item.seller_verification_status === "pending" && (

              <View style={styles.requestBanner}>

                <Ionicons
                  name="shield-checkmark-outline"
                  size={16}
                  color="#92400E"
                />

                <Text style={styles.requestBannerText}>
                  Seller Access Request
                </Text>

              </View>
            )}

            <View style={styles.topRow}>

              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.full_name?.charAt(0)}
                </Text>
              </View>

              <View style={{ flex: 1 }}>

                <Text style={styles.name}>
                  {item.full_name}
                </Text>

                <Text style={styles.email}>
                  {item.email}
                </Text>

                <Text style={styles.metaText}>
                  Joined May 2024 • 12 Listings
                </Text>

              </View>

              <TouchableOpacity>
                <Ionicons
                  name="ellipsis-vertical"
                  size={20}
                  color="#64748B"
                />
              </TouchableOpacity>

            </View>

            {/* BADGES */}

            <View style={styles.badgesContainer}>

              <View
                style={[
                  styles.roleBadge,
                  renderRole(item.role),
                ]}
              >
                <Text style={styles.badgeText}>
                  {item.role}
                </Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  item.is_verified
                    ? styles.verified
                    : styles.unverified,
                ]}
              >
                <Text style={styles.badgeText}>
                  {item.is_verified
                    ? "Verified"
                    : "Unverified"}
                </Text>
              </View>

              {/* SELLER VERIFICATION */}

              {item.seller_verification_status && (
                <View
                  style={[
                    styles.statusBadge,
                    renderVerificationStatus(
                      item.seller_verification_status
                    ),
                  ]}
                >
                  <Text style={styles.badgeText}>
                    Seller {
                      item.seller_verification_status
                    }
                  </Text>
                </View>
              )}

              {item.is_suspended && (
                <View
                  style={[
                    styles.statusBadge,
                    styles.suspended,
                  ]}
                >
                  <Text style={styles.badgeText}>
                    Suspended
                  </Text>
                </View>
              )}

            </View>

            {/* ACTIONS */}

            <View style={styles.actions}>

              <TouchableOpacity
                style={styles.viewButton}
                onPress={() =>
                  navigation.navigate(
                    "UserDetails",
                    { user: item }
                  )
                }
              >
                <Text style={styles.viewButtonText}>
                  View
                </Text>
              </TouchableOpacity>

              {/* PLACEHOLDER VERIFICATION BUTTON */}

              {item.seller_verification_status ===
                "pending" && (
                <TouchableOpacity
                  style={styles.verifyButton}
                >
                  <Text style={styles.buttonText}>
                    Review Verification
                  </Text>
                </TouchableOpacity>
              )}

            </View>

          </TouchableOpacity>
        )}

        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="people-outline"
              size={50}
              color="#CBD5E1"
            />

            <Text style={styles.emptyText}>
              No users found
            </Text>
          </View>
        }
      />
    </View>
  );
}

/* ================= COMPONENTS ================= */

function StatsCard({
  title,
  value,
  icon,
  color,
}: any) {

  return (
    <View style={styles.statsCard}>

      <View
        style={[
          styles.statsIcon,
          { backgroundColor: `${color}15` },
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={color}
        />
      </View>

      <Text style={styles.statsTitle}>
        {title}
      </Text>

      <Text style={styles.statsValue}>
        {value}
      </Text>

    </View>
  );
}

function FilterTab({
  label,
  active,
  onPress,
}: any) {

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.filterTab,
        active && styles.activeFilterTab,
      ]}
    >
      <Text
        style={[
          styles.filterText,
          active && styles.activeFilterText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
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

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    color: "#64748B",
    marginTop: 4,
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  notificationBtn: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },

  notificationBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 999,
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
  },

  notificationText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
  },

  profileCircle: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },

  searchRow: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 10,
  },

  searchContainer: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    height: 55,
  },

  filterBtn: {
    width: 55,
    height: 55,
    borderRadius: 16,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: "#0F172A",
  },

  statsCard: {
    backgroundColor: "white",
    width: 160,
    borderRadius: 20,
    padding: 18,
    marginRight: 14,
  },

  statsIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  statsTitle: {
    color: "#64748B",
    fontSize: 13,
  },

  statsValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 6,
  },

  filterTab: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#E2E8F0",
    marginRight: 10,
  },

  activeFilterTab: {
    backgroundColor: "#7C3AED",
  },

  filterText: {
    color: "#475569",
    fontWeight: "600",
  },

  activeFilterText: {
    color: "white",
  },

  card: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  avatarText: {
    color: "white",
    fontSize: 22,
    fontWeight: "800",
  },

  name: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },

  email: {
    color: "#64748B",
    marginTop: 4,
  },

  metaText: {
    color: "#94A3B8",
    marginTop: 4,
    fontSize: 12,
  },

  badgesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 16,
    gap: 8,
  },

  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },

  adminBadge: {
    backgroundColor: "#DBEAFE",
  },

  superadminBadge: {
    backgroundColor: "#EDE9FE",
  },

  sellerBadge: {
    backgroundColor: "#DCFCE7",
  },

  buyerBadge: {
    backgroundColor: "#F1F5F9",
  },

  verified: {
    backgroundColor: "#DCFCE7",
  },

  unverified: {
    backgroundColor: "#FEF3C7",
  },

  suspended: {
    backgroundColor: "#FEE2E2",
  },

  approvedBadge: {
    backgroundColor: "#DCFCE7",
  },

  pendingBadge: {
    backgroundColor: "#FEF3C7",
  },

  rejectedBadge: {
    backgroundColor: "#FEE2E2",
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
  },

  requestBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 16,
  },

  requestBannerText: {
    marginLeft: 8,
    color: "#92400E",
    fontWeight: "700",
    fontSize: 12,
  },

  actions: {
    flexDirection: "row",
    marginTop: 18,
    gap: 10,
  },

  viewButton: {
    flex: 1,
    backgroundColor: "#E2E8F0",
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
  },

  verifyButton: {
    flex: 1,
    backgroundColor: "#7C3AED",
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
  },

  viewButtonText: {
    color: "#0F172A",
    fontWeight: "700",
  },

  buttonText: {
    color: "white",
    fontWeight: "700",
  },

  emptyContainer: {
    alignItems: "center",
    marginTop: 120,
  },

  emptyText: {
    marginTop: 12,
    color: "#94A3B8",
  },
});