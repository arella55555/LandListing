import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Image,
} from "react-native";

import { LineChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";

import { getDashboardStats } from "../../../services/dashboardApi";

const screenWidth = Dimensions.get("window").width;

export default function AdminDashboardScreen() {
  const navigation = useNavigation<any>();

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      const data = await getDashboardStats();

      setStats({
        totalUsers: data?.totalUsers ?? 2458,
        totalListings: data?.totalListings ?? 1245,
        pendingListings: data?.pendingListings ?? 128,
        activeListings: data?.activeListings ?? 980,
        reportedListings: data?.reportedListings ?? 46,
        verifications: data?.verifications ?? 37,
      });
    } catch (err) {
      console.error("Dashboard error:", err);

      // fallback placeholders
      setStats({
        totalUsers: 2458,
        totalListings: 1245,
        pendingListings: 128,
        activeListings: 980,
        reportedListings: 46,
        verifications: 37,
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>
          Loading admin dashboard...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      {/* ================= HEADER ================= */}

      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>
            Good morning, Admin 👋
          </Text>

          <Text style={styles.subtitle}>
            Heres whats happening on LandListing today.
          </Text>
        </View>

        <View style={styles.topActions}>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color="#334155"
            />

            <View style={styles.notificationBadge}>
              <Text style={styles.notificationText}>3</Text>
            </View>
          </TouchableOpacity>

          <Image
            source={{
              uri: "https://i.pravatar.cc/100",
            }}
            style={styles.avatar}
          />
        </View>
      </View>

      {/* ================= SEARCH ================= */}

      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#94A3B8"
          />

          <TextInput
            placeholder="Search anything..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
          />
        </View>

        <TouchableOpacity style={styles.filterButton}>
          <Ionicons
            name="options-outline"
            size={20}
            color="#475569"
          />
        </TouchableOpacity>
      </View>

      {/* ================= KPI ================= */}

      <View style={styles.statsGrid}>
        <DashboardCard
          title="Pending Listings"
          value={stats.pendingListings}
          growth="+12.5%"
          icon="document-text-outline"
          color="#8B5CF6"
        />

        <DashboardCard
          title="Open Reports"
          value={stats.reportedListings}
          growth="+8.3%"
          icon="flag-outline"
          color="#EF4444"
        />

        <DashboardCard
          title="Verifications"
          value={stats.verifications}
          growth="+11.3%"
          icon="shield-checkmark-outline"
          color="#22C55E"
        />

        <DashboardCard
          title="Active Users"
          value={stats.totalUsers}
          growth="+7.6%"
          icon="people-outline"
          color="#3B82F6"
        />
      </View>

      {/* ================= TASKS ================= */}

      <SectionHeader
        title="Tasks Requiring Your Action"
        action="View all"
      />

      <View style={styles.card}>
        <View style={styles.tabs}>
          <TabButton label={`Listings (${stats.pendingListings})`} active />
          <TabButton label={`Reports (${stats.reportedListings})`} />
          <TabButton label={`Verifications (${stats.verifications})`} />
        </View>

        <ListingItem
          title="Green Valley Estate"
          location="Lagos, Nigeria"
          author="John Doe"
          price="₦45,000,000"
          status="Pending"
        />

        <ListingItem
          title="Ocean View Land"
          location="Lekki, Lagos"
          author="Jane Smith"
          price="₦80,000,000"
          status="Pending"
        />

        <ListingItem
          title="City Center Plot"
          location="Abuja, FCT"
          author="Mike Brown"
          price="₦120,000,000"
          status="Pending"
        />

        <TouchableOpacity style={styles.reviewButton}>
          <Text style={styles.reviewButtonText}>
            Review All Pending Listings
          </Text>
        </TouchableOpacity>
      </View>

      {/* ================= QUICK ACTIONS ================= */}

      <Text style={styles.sectionTitle}>
        Quick Actions
      </Text>

      <View style={styles.quickActions}>
        <QuickAction
          label="Review Listings"
          sub="128 pending"
          icon="document-text-outline"
          color="#8B5CF6"
          onPress={() => navigation.navigate("Listings")}
        />

        <QuickAction
          label="Review Reports"
          sub="46 open"
          icon="flag-outline"
          color="#EF4444"
          onPress={() => navigation.navigate("Reports")}
        />

        <QuickAction
          label="Verify Docs"
          sub="37 pending"
          icon="shield-checkmark-outline"
          color="#22C55E"
          onPress={() => navigation.navigate("Verify")}
        />

        <QuickAction
          label="Manage Admins"
          sub="Admin control"
          icon="people-outline"
          color="#3B82F6"
          onPress={() => navigation.navigate("Users")}
        />
      </View>

      {/* ================= PRIORITY ALERTS ================= */}

      <SectionHeader
        title="Priority Alerts"
        action="View all"
      />

      <View style={styles.alertGrid}>
        <AlertCard
          title="High Priority Reports"
          count="12"
          icon="flag"
          color="#EF4444"
        />

        <AlertCard
          title="Flagged Listings"
          count="8"
          icon="warning"
          color="#F59E0B"
        />

        <AlertCard
          title="High Risk Accounts"
          count="5"
          icon="people"
          color="#8B5CF6"
        />

        <AlertCard
          title="SLA Breaches"
          count="3"
          icon="time"
          color="#3B82F6"
        />
      </View>

      {/* ================= RECENT ACTIVITY ================= */}

      <SectionHeader
        title="Recent Activity"
        action="View all"
      />

      <View style={styles.card}>
        <ActivityItem
          text="You approved a listing"
          sub="Green Valley Estate (ID: #L1245)"
          icon="checkmark-circle"
          color="#22C55E"
          time="2m ago"
        />

        <ActivityItem
          text="You resolved a report"
          sub="Inappropriate Content (ID: #R2031)"
          icon="flag"
          color="#EF4444"
          time="15m ago"
        />

        <ActivityItem
          text="You approved verification"
          sub="Jane Smith - ID Card"
          icon="shield-checkmark"
          color="#8B5CF6"
          time="1h ago"
        />

        <ActivityItem
          text="You suspended a user"
          sub="Mike Johnson (ID: #U1023)"
          icon="person-remove"
          color="#F59E0B"
          time="2h ago"
        />
      </View>

      {/* ================= ANALYTICS ================= */}

      <SectionHeader
        title="Analytics Overview"
        action="This Week"
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 16 }}
      >

        <AnalyticsCard
          title="Listings"
          value="1,245"
          growth="+9.7%"
          color="#8B5CF6"
          data={[20, 45, 28, 80, 99, 43, 50]}
        />

        <AnalyticsCard
          title="Reports"
          value="246"
          growth="+6.3%"
          color="#EF4444"
          data={[10, 20, 15, 30, 45, 35, 40]}
        />

        <AnalyticsCard
          title="Verifications"
          value="337"
          growth="+14.1%"
          color="#22C55E"
          data={[15, 35, 25, 50, 40, 55, 60]}
        />

        <AnalyticsCard
          title="New Users"
          value="158"
          growth="+8.2%"
          color="#3B82F6"
          data={[5, 15, 12, 30, 25, 40, 35]}
        />
      </ScrollView>

      {/* ================= RECENT LISTINGS ================= */}

      <SectionHeader
        title="Recent Listings"
        action="View all"
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 100 }}
      >

        <RecentListingCard
          title="Sunset Farmland"
          location="Ibadan, Oyo"
          price="₦60,000,000"
        />

        <RecentListingCard
          title="Hilltop Estate"
          location="Enugu"
          price="₦35,000,000"
        />

        <RecentListingCard
          title="Lakeside Plot"
          location="Port Harcourt"
          price="₦80,000,000"
        />
      </ScrollView>
    </ScrollView>
  );
}

/* =========================================================
 COMPONENTS
========================================================= */

function DashboardCard({
  title,
  value,
  growth,
  icon,
  color,
}: any) {
  return (
    <View style={styles.dashboardCard}>
      <View
        style={[
          styles.dashboardIcon,
          { backgroundColor: `${color}15` },
        ]}
      >
        <Ionicons name={icon} size={22} color={color} />
      </View>

      <Text style={styles.dashboardTitle}>
        {title}
      </Text>

      <Text style={styles.dashboardValue}>
        {value}
      </Text>

      <Text style={styles.dashboardGrowth}>
        ↗ {growth} vs yesterday
      </Text>
    </View>
  );
}

function SectionHeader({ title, action }: any) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderTitle}>
        {title}
      </Text>

      <TouchableOpacity>
        <Text style={styles.sectionAction}>
          {action}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function TabButton({ label, active }: any) {
  return (
    <TouchableOpacity
      style={[
        styles.tabButton,
        active && styles.activeTab,
      ]}
    >
      <Text
        style={[
          styles.tabText,
          active && styles.activeTabText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function ListingItem({
  title,
  location,
  author,
  price,
  status,
}: any) {
  return (
    <TouchableOpacity style={styles.listingItem}>
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
        }}
        style={styles.listingImage}
      />

      <View style={{ flex: 1 }}>
        <Text style={styles.listingTitle}>
          {title}
        </Text>

        <Text style={styles.listingLocation}>
          {location}
        </Text>

        <Text style={styles.listingMeta}>
          By {author}
        </Text>

        <Text style={styles.listingPrice}>
          {price}
        </Text>
      </View>

      <View style={{ alignItems: "flex-end" }}>
        <View style={styles.pendingBadge}>
          <Text style={styles.pendingText}>
            {status}
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={18}
          color="#94A3B8"
          style={{ marginTop: 14 }}
        />
      </View>
    </TouchableOpacity>
  );
}

function QuickAction({
  label,
  sub,
  icon,
  color,
  onPress,
}: any) {
  return (
    <TouchableOpacity
      style={styles.quickActionCard}
      onPress={onPress}
    >
      <View
        style={[
          styles.quickActionIcon,
          { backgroundColor: `${color}15` },
        ]}
      >
        <Ionicons name={icon} size={20} color={color} />
      </View>

      <Text style={styles.quickActionLabel}>
        {label}
      </Text>

      <Text style={styles.quickActionSub}>
        {sub}
      </Text>
    </TouchableOpacity>
  );
}

function AlertCard({
  title,
  count,
  icon,
  color,
}: any) {
  return (
    <View style={styles.alertCard}>
      <View
        style={[
          styles.alertIcon,
          { backgroundColor: `${color}15` },
        ]}
      >
        <Ionicons name={icon} size={18} color={color} />
      </View>

      <Text style={styles.alertCount}>
        {count}
      </Text>

      <Text style={styles.alertTitle}>
        {title}
      </Text>
    </View>
  );
}

function ActivityItem({
  text,
  sub,
  icon,
  color,
  time,
}: any) {
  return (
    <View style={styles.activityItem}>
      <View
        style={[
          styles.activityIcon,
          { backgroundColor: `${color}15` },
        ]}
      >
        <Ionicons name={icon} size={18} color={color} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.activityText}>
          {text}
        </Text>

        <Text style={styles.activitySub}>
          {sub}
        </Text>
      </View>

      <Text style={styles.activityTime}>
        {time}
      </Text>
    </View>
  );
}

function AnalyticsCard({
  title,
  value,
  growth,
  data,
  color,
}: any) {
  return (
    <View style={styles.analyticsCard}>
      <Text style={styles.analyticsTitle}>
        {title}
      </Text>

      <Text style={styles.analyticsValue}>
        {value}
      </Text>

      <Text style={styles.analyticsGrowth}>
        ↗ {growth}
      </Text>

      <LineChart
        data={{
          labels: ["", "", "", "", "", ""],
          datasets: [{ data }],
        }}
        width={220}
        height={90}
        withDots={false}
        withInnerLines={false}
        withOuterLines={false}
        withVerticalLabels={false}
        withHorizontalLabels={false}
        chartConfig={{
          backgroundGradientFrom: "#fff",
          backgroundGradientTo: "#fff",
          color: () => color,
        }}
        bezier
        style={{ marginLeft: -25 }}
      />
    </View>
  );
}

function RecentListingCard({
  title,
  location,
  price,
}: any) {
  return (
    <TouchableOpacity style={styles.recentCard}>
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
        }}
        style={styles.recentImage}
      />

      <Text style={styles.recentTitle}>
        {title}
      </Text>

      <Text style={styles.recentLocation}>
        {location}
      </Text>

      <Text style={styles.recentPrice}>
        {price}
      </Text>

      <View style={styles.pendingBadgeSmall}>
        <Text style={styles.pendingSmallText}>
          Pending
        </Text>
      </View>
    </TouchableOpacity>
  );
}

/* =========================================================
 CHART CONFIG
========================================================= */

const chartConfig = {
  backgroundGradientFrom: "#FFFFFF",
  backgroundGradientTo: "#FFFFFF",
  decimalPlaces: 0,
  color: (opacity = 1) =>
    `rgba(124,58,237,${opacity})`,
  labelColor: () => "#64748B",
};

/* =========================================================
 STYLES
========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    paddingTop: 14,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },

  loadingText: {
    marginTop: 12,
    color: "#64748B",
  },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },

  greeting: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    color: "#64748B",
    marginTop: 4,
    fontSize: 14,
  },

  topActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  notificationButton: {
    position: "relative",
  },

  notificationBadge: {
    position: "absolute",
    right: -4,
    top: -4,
    backgroundColor: "#7C3AED",
    width: 18,
    height: 18,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
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

  searchContainer: {
    flexDirection: "row",
    marginBottom: 18,
    gap: 10,
  },

  searchInputWrapper: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 16,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  searchInput: {
    flex: 1,
    paddingVertical: 14,
    marginLeft: 8,
    color: "#0F172A",
  },

  filterButton: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  dashboardCard: {
    backgroundColor: "white",
    width: "48%",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#EEF2F7",
  },

  dashboardIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  dashboardTitle: {
    color: "#475569",
    fontSize: 13,
    marginBottom: 6,
  },

  dashboardValue: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0F172A",
  },

  dashboardGrowth: {
    marginTop: 8,
    color: "#16A34A",
    fontWeight: "600",
    fontSize: 12,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 8,
  },

  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },

  sectionAction: {
    color: "#7C3AED",
    fontWeight: "700",
  },

  card: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#EEF2F7",
  },

  tabs: {
    flexDirection: "row",
    marginBottom: 18,
    gap: 10,
  },

  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
  },

  activeTab: {
    backgroundColor: "#7C3AED",
  },

  tabText: {
    fontWeight: "600",
    color: "#64748B",
  },

  activeTabText: {
    color: "white",
  },

  listingItem: {
    flexDirection: "row",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 16,
  },

  listingImage: {
    width: 78,
    height: 78,
    borderRadius: 14,
    marginRight: 14,
  },

  listingTitle: {
    fontWeight: "700",
    fontSize: 16,
    color: "#0F172A",
  },

  listingLocation: {
    marginTop: 4,
    color: "#64748B",
    fontSize: 13,
  },

  listingMeta: {
    marginTop: 6,
    color: "#94A3B8",
    fontSize: 12,
  },

  listingPrice: {
    marginTop: 6,
    fontWeight: "700",
    color: "#0F172A",
  },

  pendingBadge: {
    backgroundColor: "#FFF7ED",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },

  pendingText: {
    color: "#EA580C",
    fontWeight: "700",
    fontSize: 12,
  },

  reviewButton: {
    backgroundColor: "#F5F3FF",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 6,
  },

  reviewButtonText: {
    color: "#7C3AED",
    fontWeight: "700",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 14,
  },

  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  quickActionCard: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#EEF2F7",
  },

  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  quickActionLabel: {
    fontWeight: "700",
    color: "#0F172A",
  },

  quickActionSub: {
    marginTop: 4,
    color: "#64748B",
    fontSize: 12,
  },

  alertGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  alertCard: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#EEF2F7",
  },

  alertIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  alertCount: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
  },

  alertTitle: {
    marginTop: 6,
    color: "#475569",
    fontWeight: "600",
  },

  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  activityIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  activityText: {
    fontWeight: "700",
    color: "#0F172A",
  },

  activitySub: {
    marginTop: 4,
    color: "#64748B",
    fontSize: 12,
  },

  activityTime: {
    color: "#94A3B8",
    fontSize: 12,
  },

  analyticsCard: {
    width: 240,
    backgroundColor: "white",
    borderRadius: 22,
    padding: 16,
    marginRight: 14,
    borderWidth: 1,
    borderColor: "#EEF2F7",
  },

  analyticsTitle: {
    color: "#64748B",
    fontWeight: "600",
  },

  analyticsValue: {
    fontSize: 28,
    fontWeight: "800",
    marginTop: 6,
    color: "#0F172A",
  },

  analyticsGrowth: {
    marginTop: 4,
    color: "#16A34A",
    fontWeight: "700",
  },

  recentCard: {
    width: 220,
    backgroundColor: "white",
    borderRadius: 22,
    padding: 12,
    marginRight: 14,
    borderWidth: 1,
    borderColor: "#EEF2F7",
  },

  recentImage: {
    width: "100%",
    height: 120,
    borderRadius: 18,
    marginBottom: 12,
  },

  recentTitle: {
    fontWeight: "700",
    color: "#0F172A",
  },

  recentLocation: {
    marginTop: 4,
    color: "#64748B",
    fontSize: 12,
  },

  recentPrice: {
    marginTop: 8,
    fontWeight: "800",
    color: "#0F172A",
  },

  pendingBadgeSmall: {
    backgroundColor: "#FFF7ED",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginTop: 10,
  },

  pendingSmallText: {
    color: "#EA580C",
    fontWeight: "700",
    fontSize: 11,
  },
});