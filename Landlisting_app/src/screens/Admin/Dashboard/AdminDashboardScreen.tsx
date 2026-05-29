// app/admin/dashboard.tsx
// LUPA.PH — ADMIN DASHBOARD (FULLY FIXED)

import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  Alert,
} from "react-native";

import {
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";

import { Ionicons } from "@expo/vector-icons";

import {
  getDashboardStats,
} from "../../../services/dashboardApi";

import {
  approveListing,
} from "../../../services/adminService";

/* ======================================================
   PALETTE
====================================================== */

const PRIMARY = "#27AE60";
const PRIMARY_LIGHT = "#E8F8EF";

const TEXT_DARK = "#111827";
const TEXT_MED = "#6B7280";
const TEXT_LIGHT = "#9CA3AF";

const BG = "#F8FAFC";
const CARD_BG = "#FFFFFF";

const RED = "#EF4444";
const ORANGE = "#F59E0B";
const BLUE = "#3B82F6";

/* ======================================================
   HELPERS
====================================================== */

const getListingImage = (item: any) => {
  if (item?.image) {
    return item.image;
  }

  return "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop";
};

const formatActivity = (log: any) => {
  const action = String(
    log?.action || ""
  ).toLowerCase();

  if (action.includes("approve")) {
    return {
      text: "A property listing was approved",
      icon: "checkmark-circle-outline",
      color: PRIMARY,
    };
  }

  if (action.includes("reject")) {
    return {
      text: "A listing was rejected",
      icon: "close-circle-outline",
      color: RED,
    };
  }

  if (action.includes("flag")) {
    return {
      text: "A listing was flagged",
      icon: "flag-outline",
      color: ORANGE,
    };
  }

  if (action.includes("suspend")) {
    return {
      text: "A user account was suspended",
      icon: "shield-outline",
      color: ORANGE,
    };
  }

  if (action.includes("seller")) {
    return {
      text: "A seller application was reviewed",
      icon: "shield-checkmark-outline",
      color: BLUE,
    };
  }

  return {
    text: "Marketplace activity updated",
    icon: "pulse-outline",
    color: PRIMARY,
  };
};

/* ======================================================
   SCREEN
====================================================== */

export default function AdminDashboardScreen() {
  const navigation: any = useNavigation();

  const [dashboard, setDashboard] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [approvingId, setApprovingId] =
    useState<string | null>(null);

  /* ======================================================
     LOAD
  ====================================================== */

  const loadDashboard = async (
    silent = false
  ) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      const data =
        await getDashboardStats();

      setDashboard({
        stats: data?.stats || {},
        alerts: data?.alerts || {},
        recentListings:
          data?.recentListings || [],
        activity:
          data?.activity || [],
      });

    } catch (err: any) {

      console.log(
        "Dashboard fetch error:",
        err
      );

      Alert.alert(
        "Error",
        err?.message ||
          "Failed to load dashboard"
      );

    } finally {

      if (!silent) {
        setLoading(false);
      }
    }
  };

  /* ======================================================
     AUTO REFRESH
  ====================================================== */

  useEffect(() => {
    loadDashboard();

    const interval = setInterval(() => {
      loadDashboard(true);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  /* ======================================================
     REFRESH WHEN RETURNING
  ====================================================== */

  useFocusEffect(
    useCallback(() => {
      loadDashboard(true);
    }, [])
  );

  /* ======================================================
     APPROVE
  ====================================================== */

  const handleApprove = async (
    listingId: string
  ) => {
    try {
      setApprovingId(listingId);

      await approveListing(listingId);

      setDashboard((prev: any) => ({
        ...prev,

        stats: {
          ...prev.stats,

          pendingListings:
            Math.max(
              0,
              (prev.stats
                ?.pendingListings || 0) - 1
            ),

          approvedListings:
            (prev.stats
              ?.approvedListings || 0) + 1,
        },

        recentListings:
          prev.recentListings.filter(
            (x: any) =>
              x.id !== listingId
          ),
      }));

      Alert.alert(
        "Success",
        "Listing approved"
      );

    } catch (err: any) {

      Alert.alert(
        "Error",
        err?.message ||
          "Approval failed"
      );

    } finally {
      setApprovingId(null);
    }
  };

  /* ======================================================
     NAVIGATION
  ====================================================== */

  const goToListingsPending = () => {
    navigation.navigate("Listings", {
      filter: "pending",
    });
  };

  const goToUsers = () => {
    navigation.navigate("Users");
  };

  const goToReports = () => {
    navigation.navigate("Reports");
  };

  const goToLogs = () => {
    navigation.navigate("Logs");
  };

  /* ======================================================
     LOADER
  ====================================================== */

  if (loading && !dashboard) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator
          size="large"
          color={PRIMARY}
        />

        <Text style={styles.loadingText}>
          Loading dashboard...
        </Text>
      </View>
    );
  }

  const pendingListings =
    dashboard?.stats?.pendingListings ||
    0;

  const approvedListings =
    dashboard?.stats?.approvedListings ||
    0;

  const verifiedUsers =
    dashboard?.stats?.verifiedUsers ||
    0;

  const activeUsers =
    (dashboard?.stats?.totalUsers ||
      0) -
    (dashboard?.stats
      ?.suspendedUsers || 0);

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={BG}
        barStyle="dark-content"
      />

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={{
          paddingBottom: 120,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {

              setRefreshing(true);

              await loadDashboard(true);

              setRefreshing(false);
            }}
          />
        }
      >

        {/* HEADER */}

        <View style={styles.header}>

          <View style={{ flex: 1 }}>

            <Text style={styles.brand}>
              Lupa.ph Admin
            </Text>

            <Text style={styles.headerTitle}>
              Dashboard
            </Text>

            <Text
              style={
                styles.headerSubtitle
              }
            >
              Monitor listings,
              users, reports and
              moderation.
            </Text>

          </View>

          <View
            style={styles.headerActions}
          >

            <TouchableOpacity
              style={
                styles.notificationButton
              }
              onPress={
                goToListingsPending
              }
            >
              <Ionicons
                name="notifications-outline"
                size={22}
                color={TEXT_DARK}
              />

              {pendingListings > 0 && (
                <View
                  style={
                    styles.notificationBadge
                  }
                >
                  <Text
                    style={
                      styles.notificationText
                    }
                  >
                    {pendingListings}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <Image
              source={{
                uri: "https://i.pravatar.cc/100",
              }}
              style={styles.avatar}
            />

          </View>

        </View>

        {/* PRIORITY */}

        {pendingListings > 0 && (
          <TouchableOpacity
            style={styles.priorityBar}
            activeOpacity={0.9}
            onPress={
              goToListingsPending
            }
          >

            <Ionicons
              name="warning-outline"
              size={18}
              color="#92400E"
            />

            <Text
              style={
                styles.priorityText
              }
            >
              {pendingListings}{" "}
              listings awaiting
              approval
            </Text>

            <Ionicons
              name="chevron-forward"
              size={18}
              color="#92400E"
              style={{
                marginLeft: "auto",
              }}
            />

          </TouchableOpacity>
        )}

        {/* SUMMARY */}

        <View style={styles.summaryCard}>
  <SummaryItem label="Pending" value={pendingListings} />
  <SummaryItem label="Approved" value={approvedListings} />
  <SummaryItem label="Verified" value={verifiedUsers} />
</View>

        {/* OVERVIEW */}

        <Text style={styles.sectionTitle}>
          Marketplace Overview
        </Text>

        <View style={styles.statsGrid}>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={
              goToListingsPending
            }
          >
            <DashboardCard
              title="Pending"
              value={pendingListings}
              subtitle="Listings"
              icon="document-text-outline"
              color={ORANGE}
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={goToReports}
          >
            <DashboardCard
              title="Reports"
              value={
                dashboard?.alerts
                  ?.openReports || 0
              }
              subtitle="Open cases"
              icon="flag-outline"
              color={RED}
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={goToUsers}
          >
            <DashboardCard
              title="Verified"
              value={verifiedUsers}
              subtitle="Trusted users"
              icon="shield-checkmark-outline"
              color={PRIMARY}
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={goToUsers}
          >
            <DashboardCard
              title="Active"
              value={activeUsers}
              subtitle="Marketplace users"
              icon="people-outline"
              color={BLUE}
            />
          </TouchableOpacity>

        </View>

        {/* MODERATION */}

        <View style={styles.sectionHeader}>

          <Text
            style={
              styles.sectionHeaderTitle
            }
          >
            Moderation Queue
          </Text>

          <TouchableOpacity
            onPress={
              goToListingsPending
            }
          >
            <Text
              style={
                styles.sectionAction
              }
            >
              View all
            </Text>
          </TouchableOpacity>

        </View>

        {dashboard?.recentListings
          ?.length ? (

          dashboard.recentListings
            .slice(0, 4)
            .map((item: any) => {

              const location =
                [
                  item?.barangay,
                  item?.municipality,
                  item?.province,
                ]
                  .filter(Boolean)
                  .join(", ");

              return (
                <ModerationCard
                  key={item.id}
                  title={item.title}
                  price={`₱${Number(
                    item.price || 0
                  ).toLocaleString()}`}
                  location={
                    location ||
                    "Location unavailable"
                  }
                  seller={
                    item.seller_name ||
                    "Unknown Seller"
                  }
                  image={getListingImage(
                    item
                  )}
                  loading={
                    approvingId ===
                    item.id
                  }
                  onApprove={() =>
                    handleApprove(
                      item.id
                    )
                  }
                  onReview={() =>
                    navigation.navigate(
                      "ListingDetails",
                      {
                        listing:
                          item,
                      }
                    )
                  }
                />
              );
            })

        ) : (

          <View style={styles.emptyCard}>

            <Ionicons
              name="checkmark-circle-outline"
              size={34}
              color={PRIMARY}
            />

            <Text
              style={styles.emptyTitle}
            >
              Moderation queue is
              clear
            </Text>

            <Text
              style={styles.emptySub}
            >
              No pending listings
              right now
            </Text>

          </View>

        )}

        {/* QUICK ACTIONS */}

        <View style={styles.sectionHeader}>

          <Text
            style={
              styles.sectionHeaderTitle
            }
          >
            Quick Actions
          </Text>

        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={{
            paddingRight: 10,
          }}
          style={{
            marginBottom: 24,
          }}
        >

          <QuickAction
            title="Review Listings"
            subtitle="Pending queue"
            icon="document-text-outline"
            color={PRIMARY}
            onPress={
              goToListingsPending
            }
          />

          <QuickAction
            title="Reports"
            subtitle="User complaints"
            icon="flag-outline"
            color={RED}
            onPress={goToReports}
          />

          <QuickAction
            title="Manage Users"
            subtitle="Accounts"
            icon="people-outline"
            color={BLUE}
            onPress={goToUsers}
          />

          <QuickAction
            title="Logs"
            subtitle="Admin activity"
            icon="reader-outline"
            color={ORANGE}
            onPress={goToLogs}
          />

        </ScrollView>

        {/* ACTIVITY */}

        <View style={styles.sectionHeader}>

          <Text
            style={
              styles.sectionHeaderTitle
            }
          >
            Recent Activity
          </Text>

          <TouchableOpacity
            onPress={() =>
              loadDashboard(true)
            }
          >
            <Text
              style={
                styles.sectionAction
              }
            >
              Refresh
            </Text>
          </TouchableOpacity>

        </View>

        <View style={styles.logsCard}>

          {dashboard?.activity
            ?.length ? (

            dashboard.activity.map(
              (log: any) => {

                const activity =
                  formatActivity(
                    log
                  );

                return (
                  <ActivityItem
                    key={log.id}
                    text={
                      activity.text
                    }
                    icon={
                      activity.icon
                    }
                    time={new Date(
                      log.created_at
                    ).toLocaleString()}
                    color={
                      activity.color
                    }
                  />
                );
              }
            )

          ) : (

            <Text
              style={
                styles.noActivity
              }
            >
              No recent activity
            </Text>

          )}

        </View>

      </ScrollView>
    </View>
  );
}

/* ======================================================
   COMPONENTS
====================================================== */


function SummaryItem({ label, value }: any) {
  return (
    <View style={styles.summaryItemCard}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function DashboardCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: any) {
  return (
    <View style={styles.dashboardCard}>

      <View
        style={[
          styles.dashboardIcon,
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

      <Text style={styles.dashboardTitle}>
        {title}
      </Text>

      <Text style={styles.dashboardValue}>
        {value}
      </Text>

      <Text style={styles.dashboardSub}>
        {subtitle}
      </Text>

    </View>
  );
}

function QuickAction({
  title,
  subtitle,
  icon,
  color,
  onPress,
}: any) {
  return (
    <TouchableOpacity
      style={styles.quickActionCard}
      onPress={onPress}
      activeOpacity={0.9}
    >

      <View
        style={[
          styles.quickIcon,
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

      <Text style={styles.quickTitle}>
        {title}
      </Text>

      <Text
        style={styles.quickSubtitle}
      >
        {subtitle}
      </Text>

    </TouchableOpacity>
  );
}

function ModerationCard({
  title,
  location,
  seller,
  price,
  image,
  onApprove,
  onReview,
  loading,
}: any) {
  return (
    <TouchableOpacity
      style={styles.queueCard}
      activeOpacity={0.92}
      onPress={onReview}
    >

      <Image
        source={{ uri: image }}
        style={styles.queueImage}
      />

      <View style={{ flex: 1 }}>

        <View style={styles.queueTop}>

          <View
            style={styles.statusBadge}
          >
            <Text
              style={
                styles.statusText
              }
            >
              Pending
            </Text>
          </View>

        </View>

        <Text
          numberOfLines={1}
          style={styles.queueTitle}
        >
          {title}
        </Text>

        <Text
          numberOfLines={1}
          style={
            styles.queueLocation
          }
        >
          ⊙ {location}
        </Text>

        <Text
          numberOfLines={1}
          style={styles.queueSeller}
        >
          Seller: {seller}
        </Text>

        <View
          style={styles.queueFooter}
        >

          <Text
            style={styles.queuePrice}
          >
            {price}
          </Text>

          <View
            style={
              styles.queueButtons
            }
          >

            <TouchableOpacity
              style={
                styles.approveButton
              }
              onPress={onApprove}
              disabled={loading}
            >

              {loading ? (
                <ActivityIndicator
                  color="#fff"
                  size="small"
                />
              ) : (
                <Text
                  style={
                    styles.approveText
                  }
                >
                  Approve
                </Text>
              )}

            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.reviewButton
              }
              onPress={onReview}
            >
              <Ionicons
                name="eye-outline"
                size={16}
                color={PRIMARY}
              />
            </TouchableOpacity>

          </View>

        </View>

      </View>

    </TouchableOpacity>
  );
}

function ActivityItem({
  text,
  time,
  color,
  icon,
}: any) {
  return (
    <View style={styles.activityItem}>

      <View
        style={[
          styles.activityIcon,
          {
            backgroundColor:
              `${color}15`,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={16}
          color={color}
        />
      </View>

      <View style={{ flex: 1 }}>

        <Text
          style={
            styles.activityText
          }
        >
          {text}
        </Text>

      </View>

      <Text style={styles.activityTime}>
        {time}
      </Text>

    </View>
  );
}

/* ======================================================
   STYLES
====================================================== */

const cardShadow = {
  shadowColor: "#000",
  shadowOpacity: 0.04,
  shadowRadius: 10,
  shadowOffset: {
    width: 0,
    height: 4,
  },
  elevation: 2,
};

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: BG,
    paddingHorizontal: 16,
    paddingTop: 18,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BG,
  },

  loadingText: {
    marginTop: 14,
    color: TEXT_MED,
  },

  header: {
    flexDirection: "row",
    marginBottom: 18,
  },

  brand: {
    color: PRIMARY,
    fontWeight: "700",
    marginBottom: 4,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: TEXT_DARK,
  },

  headerSubtitle: {
    marginTop: 6,
    color: TEXT_MED,
    lineHeight: 20,
  },

  headerActions: {
    alignItems: "center",
    marginLeft: 12,
  },

  notificationButton: {
    marginBottom: 14,
    position: "relative",
  },

  notificationBadge: {
    position: "absolute",
    top: -5,
    right: -6,
    backgroundColor: RED,
    minWidth: 18,
    height: 18,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },

  notificationText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 999,
  },

  priorityBar: {
    backgroundColor: "#FEF3C7",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  priorityText: {
    marginLeft: 10,
    color: "#92400E",
    fontWeight: "700",
  },

  summaryItem: {
    alignItems: "center",
    flex: 1,
  },

  summaryDivider: {
    width: 1,
    height: 36,
    backgroundColor: "#E5E7EB",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: 14,
  },

  statsGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
  marginBottom: 12,
  marginHorizontal: -4,
},

  dashboardCard: {
    width: 165,
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    ...cardShadow,
  },

  dashboardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  dashboardTitle: {
    marginTop: 12,
    color: TEXT_MED,
    fontSize: 12,
  },

  dashboardValue: {
    fontSize: 24,
    fontWeight: "800",
    color: TEXT_DARK,
    marginTop: 5,
  },

  dashboardSub: {
    marginTop: 6,
    color: PRIMARY,
    fontWeight: "700",
    fontSize: 11,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    marginTop: 4,
  },

  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_DARK,
  },

  sectionAction: {
    color: PRIMARY,
    fontWeight: "700",
  },

  quickActionCard: {
    width: 170,
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 16,
    marginRight: 12,
    ...cardShadow,
  },

  quickIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  quickTitle: {
    fontWeight: "700",
    color: TEXT_DARK,
    fontSize: 14,
  },

  quickSubtitle: {
    marginTop: 4,
    color: TEXT_MED,
    fontSize: 12,
  },

  queueCard: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 12,
    flexDirection: "row",
    marginBottom: 12,
    ...cardShadow,
  },

  queueImage: {
    width: 78,
    height: 78,
    borderRadius: 14,
    marginRight: 12,
  },

  queueTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  statusBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: "flex-start",
  },

  statusText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#D97706",
  },

  queueTitle: {
    marginTop: 8,
    fontWeight: "700",
    fontSize: 14,
    color: TEXT_DARK,
  },

  queueLocation: {
    marginTop: 3,
    color: TEXT_MED,
    fontSize: 12,
  },

  queueSeller: {
    marginTop: 3,
    color: TEXT_LIGHT,
    fontSize: 11,
  },

  queueFooter: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  queuePrice: {
    fontWeight: "800",
    color: TEXT_DARK,
    fontSize: 13,
  },

  queueButtons: {
    flexDirection: "row",
    gap: 6,
  },

  approveButton: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    minWidth: 80,
    justifyContent: "center",
    alignItems: "center",
  },

  approveText: {
    color: "white",
    fontWeight: "700",
    fontSize: 12,
  },

  reviewButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: PRIMARY_LIGHT,
    justifyContent: "center",
    alignItems: "center",
  },

  logsCard: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
    ...cardShadow,
  },

  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  activityIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  activityText: {
    fontWeight: "600",
    color: TEXT_DARK,
    fontSize: 13,
  },

  activityTime: {
    color: TEXT_LIGHT,
    fontSize: 11,
    marginLeft: 10,
  },

  noActivity: {
    color: TEXT_MED,
    textAlign: "center",
    paddingVertical: 10,
  },

  emptyCard: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    marginBottom: 18,
    ...cardShadow,
  },

  emptyTitle: {
    marginTop: 12,
    fontWeight: "700",
    fontSize: 15,
    color: TEXT_DARK,
  },

  emptySub: {
    marginTop: 5,
    color: TEXT_MED,
    fontSize: 12,
  },
  summaryCard: {
  backgroundColor: "transparent",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 22,
},

summaryItemCard: {
  flex: 1,
  backgroundColor: CARD_BG,
  borderRadius: 16,
  paddingVertical: 14,
  paddingHorizontal: 10,
  marginHorizontal: 4,
  alignItems: "center",
  ...cardShadow,
},

summaryValue: {
  fontSize: 22,
  fontWeight: "800",
  color: TEXT_DARK,
},

summaryLabel: {
  marginTop: 4,
  color: TEXT_MED,
  fontSize: 12,
},
});