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

import {
  useNavigation,
} from "@react-navigation/native";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Ionicons } from "@expo/vector-icons";import {
  getUsers,
} from "../../../services/adminService";

import { COLORS } from "../../../constants/color";

/* =========================================================
   TYPES
========================================================= */

type MainTab =
  | "all"
  | "buyers"
  | "sellers"
  | "suspended";

type SellerVerificationTab =
  | "all"
  | "pending"
  | "approved"
  | "rejected";

type User = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_verified: boolean;
  is_suspended: boolean;
  seller_verification_status?: string;
};

/* =========================================================
   SCREEN
========================================================= */

export default function AdminUsersScreen() {

  const navigation = useNavigation<any>();

  const [users, setUsers] =
    useState<User[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [selectedTab, setSelectedTab] =
    useState<MainTab>("all");

  const [
    sellerVerificationTab,
    setSellerVerificationTab,
  ] =
    useState<SellerVerificationTab>("all");

  /* =========================================================
     FETCH
  ========================================================= */

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {

    try {

      setLoading(true);

      const data =
        await getUsers();

      const usersList =
        data?.users || [];

      setUsers(usersList);

    } catch (error) {

      console.error(
        "Admin users fetch error:",
        error
      );

    } finally {

      setLoading(false);
      setRefreshing(false);
    }
  }

  /* =========================================================
     RESET SELLER FILTER
  ========================================================= */

  useEffect(() => {

    if (
      selectedTab !== "sellers"
    ) {

      setSellerVerificationTab(
        "all"
      );
    }

  }, [selectedTab]);

  /* =========================================================
     FILTERED USERS
  ========================================================= */

  const filteredUsers =
    useMemo(() => {

      /*let filtered =
        [...users];*/
      
      let filtered = users.filter(
        (u) =>
          u.role !== "admin" &&
          u.role !== "superadmin"
      );

      /* SEARCH */

      if (search.trim()) {

        const keyword =
          search.toLowerCase();

        filtered =
          filtered.filter(
            (user) => {

              return (

                user.full_name
                  ?.toLowerCase()
                  ?.includes(
                    keyword
                  ) ||

                user.email
                  ?.toLowerCase()
                  ?.includes(
                    keyword
                  ) ||

                user.role
                  ?.toLowerCase()
                  ?.includes(
                    keyword
                  )
              );
            }
          );
      }

      /* MAIN FILTERS */

      switch (
        selectedTab
      ) {

        case "buyers":

          filtered =
            filtered.filter(
              (u) =>
                u.role ===
                "buyer"
            );

          break;

        case "sellers":

  filtered = filtered.filter((u) => {

    if (u.is_suspended) {
      return false;
    }

    return (
      u.role === "seller" ||
      u.seller_verification_status === "pending" ||
      u.seller_verification_status === "approved" ||
      sellerVerificationTab === "rejected"
    );
  });

  break;

        case "suspended":

          filtered =
            filtered.filter(
              (u) =>
                u.is_suspended
            );

          break;
      }

      /* SELLER VERIFICATION */

      if (
        selectedTab ===
        "sellers"
      ) {

        switch (
          sellerVerificationTab
        ) {

          case "pending":

            filtered =
              filtered.filter(
                (u) =>
                  (
                    u.seller_verification_status ==="pending" && u.is_verified === false && u.role==="buyer" && "pending"
                  ) ===
                  "pending"
              );

            break;

          case "approved":

            filtered =
              filtered.filter(
                (u) =>
                  u.seller_verification_status ===
                  "approved"
              );

            break;

          case "rejected":

            filtered =
              filtered.filter(
                (u) =>
                  u.seller_verification_status ===
                  "rejected" || u.role==="buyer" && u.seller_verification_status==="rejected"
              );

            break;
        }
      }

      return filtered;

    }, [
      users,
      search,
      selectedTab,
      sellerVerificationTab,
    ]);

  /* =========================================================
     STATS
  ========================================================= */

  const stats =
    useMemo(() => {

      return {

        totalUsers:
          users.length,

        activeUsers:
          users.filter(
            (u) =>
              !u.is_suspended
          ).length,

        sellers:
          users.filter(
            (u) =>
              u.role ===
              "seller"
          ).length,

        buyers:
          users.filter(
            (u) =>
              u.role ===
              "buyer"
          ).length,

        suspended:
          users.filter(
            (u) =>
              u.is_suspended
          ).length,

        pendingSellerRequests:
        users.filter(
          (u) =>
            u.seller_verification_status === "pending"
        ).length,
      };

    }, [users]);

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {

    return (

      <View
        style={
          styles.loaderContainer
        }
      >

        <ActivityIndicator
          size="large"
          color={
            COLORS.primary
          }
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Loading users...
        </Text>

      </View>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (

    <View style={styles.container}>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) =>
          item.id
        }
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={{
          paddingBottom: 120,
        }}
        refreshControl={

          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={() => {

              setRefreshing(
                true
              );

              fetchUsers();
            }}
          />
        }

        ListHeaderComponent={

          <>

            {/* =========================================================
                HEADER
            ========================================================= */}

            <View
              style={
                styles.header
              }
            >

              <View>

                <Text
                  style={
                    styles.title
                  }
                >
                  Users
                </Text>

                <Text
                  style={
                    styles.subtitle
                  }
                >
                  Monitor platform
                  users,
                  sellers,
                  suspensions &
                  verification
                  requests
                </Text>

              </View>

              <View
                style={
                  styles.headerActions
                }
              >

                <View
                  style={
                    styles.profileAvatar
                  }
                >

                  <Ionicons
                    name="person"
                    size={20}
                    color="#64748B"
                  />

                </View>

              </View>

            </View>

            {/* =========================================================
                SEARCH
            ========================================================= */}

            <View
              style={
                styles.searchRow
              }
            >

              <View
                style={
                  styles.searchContainer
                }
              >

                <Ionicons
                  name="search-outline"
                  size={18}
                  color="#94A3B8"
                />

                <TextInput
                  value={search}
                  onChangeText={
                    setSearch
                  }
                  placeholder="Search users by name, email or role..."
                  placeholderTextColor="#94A3B8"
                  style={
                    styles.searchInput
                  }
                />

              </View>

              <TouchableOpacity
                style={
                  styles.filterButton
                }
              >

                <Ionicons
                  name="options-outline"
                  size={20}
                  color="#475569"
                />

              </TouchableOpacity>

            </View>

            {/* =========================================================
                STATS
            ========================================================= */}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              style={
                styles.statsWrapper
              }
            >

              <StatsCard
                title="Total Users"
                value={
                  stats.totalUsers
                }
                icon="people-outline"
                color="#7C3AED"
              />

              <StatsCard
                title="Active"
                value={
                  stats.activeUsers
                }
                icon="checkmark-circle-outline"
                color="#16A34A"
              />

              <StatsCard
                title="Sellers"
                value={
                  stats.sellers
                }
                icon="storefront-outline"
                color="#2563EB"
              />

              <StatsCard
                title="Buyers"
                value={
                  stats.buyers
                }
                icon="person-outline"
                color="#F59E0B"
              />

              <StatsCard
                title="Pending Seller Verification"
                value={
                  stats.pendingSellerRequests
                }
                icon="shield-checkmark-outline"
                color="#DC2626"
              />

            </ScrollView>

            {/* =========================================================
                FILTER TABS
            ========================================================= */}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              style={
                styles.tabsWrapper
              }
            >

              <FilterTab
                label="All Users"
                active={
                  selectedTab ===
                  "all"
                }
                onPress={() =>
                  setSelectedTab(
                    "all"
                  )
                }
              />

              <FilterTab
                label="Buyers"
                active={
                  selectedTab ===
                  "buyers"
                }
                onPress={() =>
                  setSelectedTab(
                    "buyers"
                  )
                }
              />

              <FilterTab
                label="Sellers"
                active={
                  selectedTab ===
                  "sellers"
                }
                onPress={() =>
                  setSelectedTab(
                    "sellers"
                  )
                }
              />

              <FilterTab
                label="Suspended"
                active={
                  selectedTab ===
                  "suspended"
                }
                onPress={() =>
                  setSelectedTab(
                    "suspended"
                  )
                }
              />

            </ScrollView>

            {/* =========================================================
                SELLER VERIFICATION
            ========================================================= */}

            {selectedTab ===
              "sellers" && (

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={
                  false
                }
                style={
                  styles.verificationTabs
                }
              >

                <VerificationTab
                  label="All"
                  active={
                    sellerVerificationTab ===
                    "all"
                  }
                  onPress={() =>
                    setSellerVerificationTab(
                      "all"
                    )
                  }
                />

                <VerificationTab
                  label="Pending"
                  active={
                    sellerVerificationTab ===
                    "pending"
                  }
                  onPress={() =>
                    setSellerVerificationTab(
                      "pending"
                    )
                  }
                />

                <VerificationTab
                  label="Approved"
                  active={
                    sellerVerificationTab ===
                    "approved"
                  }
                  onPress={() =>
                    setSellerVerificationTab(
                      "approved"
                    )
                  }
                />

                <VerificationTab
                  label="Rejected"
                  active={
                    sellerVerificationTab ===
                    "rejected"
                  }
                  onPress={() =>
                    setSellerVerificationTab(
                      "rejected"
                    )
                  }
                />

              </ScrollView>
            )}

          </>
        }

        renderItem={({
          item,
        }) => {

          const verificationStatus =
            item.seller_verification_status;

          return (

            <TouchableOpacity
              activeOpacity={
                0.9
              }
              style={
                styles.userCard
              }
              onPress={() =>
                navigation.navigate(
                  "UserDetails",
                  {
                    user: item,
                    onUserUpdated:
                      fetchUsers,
                  }
                )
              }
            >

              {/* TOP */}

              <View
                style={
                  styles.userTopRow
                }
              >

                <View
                  style={
                    styles.avatar
                  }
                >

                  <Text
                    style={
                      styles.avatarText
                    }
                  >
                    {item
                      .full_name?.[0]
                      ?.toUpperCase() ||
                      "U"}
                  </Text>

                </View>

                <View
                  style={{
                    flex: 1,
                  }}
                >

                  <Text
                    style={
                      styles.userName
                    }
                  >
                    {
                      item.full_name
                    }
                  </Text>

                  <Text
                    style={
                      styles.userEmail
                    }
                  >
                    {item.email}
                  </Text>

                  <Text
                    style={
                      styles.userMeta
                    }
                  >
                    {item.role}
                  </Text>

                </View>

                <Ionicons
                  name="ellipsis-vertical"
                  size={20}
                  color="#64748B"
                />

              </View>

              {/* BADGES */}

              <View
                style={
                  styles.badgesContainer
                }
              >

                <View
                  style={[
                    styles.badge,
                    getRoleBadge(
                      item.role
                    ),
                  ]}
                >

                  <Text
                    style={
                      styles.badgeText
                    }
                  >
                    {item.role}
                  </Text>

                </View>

                {/* SELLER VERIFICATION BADGE */}

                {item.seller_verification_status && (

                  <View
                    style={[
                      styles.badge,

                      item.seller_verification_status === "approved"
                        ? styles.verifiedBadge
                        : item.seller_verification_status === "rejected"
                        ? styles.rejectedBadge
                        : styles.pendingBadge,
                    ]}
                  >

                    <Text style={styles.badgeText}>

                      {item.seller_verification_status === "approved"
                        ? "Verified Seller"

                        : item.seller_verification_status === "rejected"
                        ? "Seller Rejected"

                        : "Unverified Seller Request"}

                    </Text>

                  </View>
                )}

                {item.role ===
                  "seller" && (

                  <View
                    style={[
                      styles.badge,
                      getVerificationBadge(
                        verificationStatus
                      ),
                    ]}
                  >

                    <Text
                      style={
                        styles.badgeText
                      }
                    >
                      {verificationStatus ||
                        "pending"}
                    </Text>

                  </View>
                )}

                {item.is_suspended && (

                  <View
                    style={[
                      styles.badge,
                      styles.suspendedBadge,
                    ]}
                  >

                    <Text
                      style={
                        styles.badgeText
                      }
                    >
                      Suspended
                    </Text>

                  </View>
                )}

              </View>

              {/* ACTIONS */}

              <View
                style={
                  styles.actionsRow
                }
              >

                <TouchableOpacity
                  style={
                    styles.viewButton
                  }
                  onPress={() =>
                    navigation.navigate(
                      "UserDetails",
                      {
                        user: item,
                        onUserUpdated:
                          fetchUsers,
                      }
                    )
                  }
                >

                  <Text
                    style={
                      styles.viewButtonText
                    }
                  >
                    View User
                  </Text>

                </TouchableOpacity>

                {verificationStatus === "pending" &&  (

                  <TouchableOpacity
                    style={
                      styles.reviewButton
                    }
                    onPress={() =>
                      navigation.navigate(
                        "UserDetails",
                        {
                          user: item,
                          reviewMode:
                            true,
                          onUserUpdated:
                            fetchUsers,
                        }
                      )
                    }
                  >

                    <Text
                      style={
                        styles.reviewButtonText
                      }
                    >
                      Review
                      Verification
                    </Text>

                  </TouchableOpacity>
                )}

              </View>

            </TouchableOpacity>
          );
        }}

        ListEmptyComponent={

          <View
            style={
              styles.emptyContainer
            }
          >

            <Ionicons
              name="people-outline"
              size={60}
              color="#CBD5E1"
            />

            <Text
              style={
                styles.emptyText
              }
            >
              No users found
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

function StatsCard({
  title,
  value,
  icon,
  color,
}: any) {

  return (

    <View
      style={
        styles.statsCard
      }
    >

      <View
        style={[
          styles.statsIcon,
          {
            backgroundColor:
              `${color}15`,
          },
        ]}
      >

        <Ionicons
          name={icon}
          size={20}
          color={color}
        />

      </View>

      <Text
        style={
          styles.statsTitle
        }
      >
        {title}
      </Text>

      <Text
        style={
          styles.statsValue
        }
      >
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
        active &&
          styles.activeFilterTab,
      ]}
    >

      <Text
        style={[
          styles.filterText,
          active &&
            styles.activeFilterText,
        ]}
      >
        {label}
      </Text>

    </TouchableOpacity>
  );
}

function VerificationTab({
  label,
  active,
  onPress,
}: any) {

  return (

    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.verificationTab,
        active &&
          styles.activeVerificationTab,
      ]}
    >

      <Text
        style={[
          styles.verificationText,
          active &&
            styles.activeVerificationText,
        ]}
      >
        {label}
      </Text>

    </TouchableOpacity>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getRoleBadge(
  role: string
) {

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

function getVerificationBadge(
  status?: string
) {

  switch (status) {

    case "approved":
      return styles.approvedBadge;

    case "rejected":
      return styles.rejectedBadge;

    default:
      return styles.pendingBadge;
  }
}

/* =========================================================
   STYLES
========================================================= */

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor:
        "#F8FAFC",
      paddingHorizontal: 20,
      paddingTop: 20,
    },

    loaderContainer: {
      flex: 1,
      justifyContent:
        "center",
      alignItems: "center",
    },

    loadingText: {
      marginTop: 10,
      color: "#64748B",
    },

    header: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
      marginBottom: 24,
    },

    title: {
      fontSize: 34,
      fontWeight: "800",
      color: "#0F172A",
    },

    subtitle: {
      marginTop: 4,
      color: "#64748B",
      maxWidth: 240,
      lineHeight: 20,
    },

    headerActions: {
      flexDirection: "row",
      alignItems: "center",
    },

    profileAvatar: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor:
        "white",
      justifyContent:
        "center",
      alignItems: "center",
      marginLeft: 12,
    },

    searchRow: {
      flexDirection: "row",
      marginBottom: 22,
    },

    searchContainer: {
      flex: 1,
      height: 56,
      borderRadius: 18,
      backgroundColor:
        "white",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
    },

    searchInput: {
      flex: 1,
      marginLeft: 10,
      color: "#0F172A",
    },

    filterButton: {
      width: 56,
      height: 56,
      borderRadius: 18,
      backgroundColor:
        "white",
      justifyContent:
        "center",
      alignItems: "center",
      marginLeft: 10,
    },

    statsWrapper: {
      marginBottom: 20,
    },

    statsCard: {
      width: 170,
      backgroundColor:
        "white",
      borderRadius: 24,
      padding: 18,
      marginRight: 14,
    },

    statsIcon: {
      width: 46,
      height: 46,
      borderRadius: 14,
      justifyContent:
        "center",
      alignItems: "center",
      marginBottom: 14,
    },

    statsTitle: {
      color: "#64748B",
      fontSize: 13,
    },

    statsValue: {
      marginTop: 8,
      fontSize: 28,
      fontWeight: "800",
      color: "#0F172A",
    },

    tabsWrapper: {
      marginBottom: 14,
    },

    filterTab: {
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor:
        "#E2E8F0",
      marginRight: 10,
    },

    activeFilterTab: {
      backgroundColor:
        "#7C3AED",
    },

    filterText: {
      color: "#475569",
      fontWeight: "700",
    },

    activeFilterText: {
      color: "white",
    },

    verificationTabs: {
      marginBottom: 20,
    },

    verificationTab: {
      paddingHorizontal: 16,
      paddingVertical: 9,
      borderRadius: 999,
      backgroundColor:
        "#F1F5F9",
      marginRight: 10,
    },

    activeVerificationTab: {
      backgroundColor:
        "#0F172A",
    },

    verificationText: {
      color: "#475569",
      fontWeight: "700",
    },

    activeVerificationText: {
      color: "white",
    },

    userCard: {
      backgroundColor:
        "white",
      borderRadius: 26,
      padding: 18,
      marginBottom: 16,
    },

    userTopRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    avatar: {
      width: 58,
      height: 58,
      borderRadius: 20,
      backgroundColor:
        "#7C3AED",
      justifyContent:
        "center",
      alignItems: "center",
      marginRight: 14,
    },

    avatarText: {
      color: "white",
      fontSize: 22,
      fontWeight: "800",
    },

    userName: {
      fontSize: 17,
      fontWeight: "700",
      color: "#0F172A",
      textTransform:
        "capitalize",
    },

    userEmail: {
      color: "#64748B",
      marginTop: 4,
    },

    userMeta: {
      marginTop: 4,
      color: "#94A3B8",
      fontSize: 12,
      textTransform:
        "capitalize",
    },

    badgesContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 16,
    },

    badge: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 999,
      marginRight: 8,
      marginBottom: 8,
    },

    badgeText: {
      fontSize: 12,
      fontWeight: "700",
      color: "#0F172A",
      textTransform:
        "capitalize",
    },

    adminBadge: {
      backgroundColor:
        "#DBEAFE",
    },

    superadminBadge: {
      backgroundColor:
        "#EDE9FE",
    },

    sellerBadge: {
      backgroundColor:
        "#DCFCE7",
    },

    buyerBadge: {
      backgroundColor:
        "#FEF3C7",
    },

    verifiedBadge: {
      backgroundColor:
        "#DCFCE7",
    },

    unverifiedBadge: {
      backgroundColor:
        "#F1F5F9",
    },

    approvedBadge: {
      backgroundColor:
        "#DCFCE7",
    },

    pendingBadge: {
      backgroundColor:
        "#FEF3C7",
    },

    rejectedBadge: {
      backgroundColor:
        "#FEE2E2",
    },

    suspendedBadge: {
      backgroundColor:
        "#FEE2E2",
    },

    actionsRow: {
      flexDirection: "row",
      marginTop: 18,
    },

    viewButton: {
      flex: 1,
      backgroundColor:
        "#E2E8F0",
      paddingVertical: 13,
      borderRadius: 14,
      alignItems: "center",
      marginRight: 5,
    },

    reviewButton: {
      flex: 1,
      backgroundColor:
        "#7C3AED",
      paddingVertical: 13,
      borderRadius: 14,
      alignItems: "center",
      marginLeft: 5,
    },

    viewButtonText: {
      color: "#0F172A",
      fontWeight: "700",
    },

    reviewButtonText: {
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