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

import { COLORS } from "../../../constants/color";

/* =========================================================
   REPORTS SCREEN
========================================================= */

export default function AdminReportsScreen() {

  const [loading, setLoading] = useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [search, setSearch] = useState("");

  const [tab, setTab] = useState<
    "all" |
    "open" |
    "resolved" |
    "rejected"
  >("all");

  /* =========================================================
     PLACEHOLDER REPORTS
  ========================================================= */

  const [reports, setReports] = useState<any[]>([
    {
      id: "1",
      title: "Inappropriate Content",
      listing_name: "Green Valley Estate",
      reporter: "Alex Johnson",
      status: "open",
      created_at: "1h ago",
      severity: "high",
    },

    {
      id: "2",
      title: "Fake Information",
      listing_name: "Ocean View Land",
      reporter: "Mike Brown",
      status: "open",
      created_at: "2h ago",
      severity: "medium",
    },

    {
      id: "3",
      title: "Spam / Scams",
      listing_name: "City Center Plot",
      reporter: "Emily Davis",
      status: "resolved",
      created_at: "3h ago",
      severity: "high",
    },

    {
      id: "4",
      title: "Duplicate Listing",
      listing_name: "Hilltop Property",
      reporter: "Sarah Lee",
      status: "rejected",
      created_at: "6h ago",
      severity: "low",
    },

    {
      id: "5",
      title: "Inappropriate Images",
      listing_name: "Sunset Farmland",
      reporter: "Daniel Wilson",
      status: "open",
      created_at: "5h ago",
      severity: "medium",
    },
  ]);

  /* =========================================================
     FILTERED REPORTS
  ========================================================= */

  const filteredReports = useMemo(() => {

    let list = [...reports];

    /* SEARCH */

    if (search.trim()) {

      list = list.filter((r) =>
        r.title
          .toLowerCase()
          .includes(search.toLowerCase()) ||

        r.listing_name
          .toLowerCase()
          .includes(search.toLowerCase()) ||

        r.reporter
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    /* TABS */

    if (tab !== "all") {
      list = list.filter(
        (r) => r.status === tab
      );
    }

    return list;

  }, [search, tab, reports]);

  /* =========================================================
     STATS
  ========================================================= */

  const stats = useMemo(() => {

    return {

      total:
        reports.length,

      open:
        reports.filter(
          (r) => r.status === "open"
        ).length,

      resolved:
        reports.filter(
          (r) => r.status === "resolved"
        ).length,

      rejected:
        reports.filter(
          (r) => r.status === "rejected"
        ).length,
    };

  }, [reports]);

  /* =========================================================
     HELPERS
  ========================================================= */

  function getStatusStyle(status: string) {

    switch (status) {

      case "resolved":
        return styles.resolvedBadge;

      case "rejected":
        return styles.rejectedBadge;

      default:
        return styles.openBadge;
    }
  }

  function getStatusText(status: string) {

    switch (status) {

      case "resolved":
        return "Resolved";

      case "rejected":
        return "Rejected";

      default:
        return "Open";
    }
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {

    return (
      <View style={styles.loader}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />

        <Text style={styles.loadingText}>
          Loading reports...
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

        {/* TITLE */}

        <View style={styles.header}>

          <View>

            <Text style={styles.title}>
              Reports
            </Text>

            <Text style={styles.subtitle}>
              Moderate user submitted reports
            </Text>

          </View>

          <View style={styles.headerActions}>

            <TouchableOpacity
              style={styles.iconBtn}
            >
              <Ionicons
                name="search-outline"
                size={20}
                color="#0F172A"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconBtn}
            >
              <Ionicons
                name="options-outline"
                size={20}
                color="#0F172A"
              />
            </TouchableOpacity>

          </View>

        </View>

        {/* SEARCH */}

        <View style={styles.searchContainer}>

          <Ionicons
            name="search"
            size={18}
            color="#94A3B8"
          />

          <TextInput
            placeholder="Search reports..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />

        </View>

        {/* STATS */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 18 }}
        >

          <StatsCard
            title="All Reports"
            value={stats.total}
            icon="flag-outline"
            color="#7C3AED"
          />

          <StatsCard
            title="Open"
            value={stats.open}
            icon="alert-circle-outline"
            color="#DC2626"
          />

          <StatsCard
            title="Resolved"
            value={stats.resolved}
            icon="checkmark-circle-outline"
            color="#16A34A"
          />

          <StatsCard
            title="Rejected"
            value={stats.rejected}
            icon="close-circle-outline"
            color="#EA580C"
          />

        </ScrollView>

        {/* FILTER TABS */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 20 }}
        >

          <FilterTab
            label="All"
            active={tab === "all"}
            onPress={() => setTab("all")}
          />

          <FilterTab
            label="Open"
            active={tab === "open"}
            onPress={() => setTab("open")}
          />

          <FilterTab
            label="Resolved"
            active={tab === "resolved"}
            onPress={() => setTab("resolved")}
          />

          <FilterTab
            label="Rejected"
            active={tab === "rejected"}
            onPress={() => setTab("rejected")}
          />

        </ScrollView>

      </>
    );
  }

  /* =========================================================
     REPORT CARD
  ========================================================= */

  function renderItem({ item }: any) {

    return (

      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
      >

        {/* LEFT ICON */}

        <View style={styles.reportIcon}>

          <Ionicons
            name="flag"
            size={20}
            color="#EF4444"
          />

        </View>

        {/* CONTENT */}

        <View style={{ flex: 1 }}>

          <Text style={styles.reportTitle}>
            {item.title}
          </Text>

          <Text style={styles.listingName}>
            {item.listing_name}
          </Text>

          <Text style={styles.reportMeta}>
            By {item.reporter}
          </Text>

          <Text style={styles.reportTime}>
            {item.created_at}
          </Text>

        </View>

        {/* STATUS */}

        <View
          style={[
            styles.statusBadge,
            getStatusStyle(item.status),
          ]}
        >

          <Text
            style={styles.statusText}
          >
            {getStatusText(item.status)}
          </Text>

        </View>

      </TouchableOpacity>
    );
  }

  /* =========================================================
     MAIN
  ========================================================= */

  return (

    <View style={styles.container}>

      <FlatList
        data={filteredReports}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}

        ListHeaderComponent={Header}

        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);

              setTimeout(() => {
                setRefreshing(false);
              }, 1000);
            }}
          />
        }

        contentContainerStyle={{
          paddingBottom: 120,
        }}

        showsVerticalScrollIndicator={false}

        ListEmptyComponent={
          <View style={styles.emptyContainer}>

            <Ionicons
              name="flag-outline"
              size={60}
              color="#CBD5E1"
            />

            <Text style={styles.emptyText}>
              No reports found
            </Text>

          </View>
        }
      />

      {/* FLOATING ACTION BUTTON */}

      <TouchableOpacity
        style={styles.fab}
      >

        <Ionicons
          name="add"
          size={28}
          color="white"
        />

      </TouchableOpacity>

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

    <View style={styles.statsCard}>

      <View
        style={[
          styles.statsIcon,
          {
            backgroundColor: `${color}15`,
          },
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

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    color: "#64748B",
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

  headerActions: {
    flexDirection: "row",
    gap: 10,
  },

  iconBtn: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },

  searchContainer: {
    backgroundColor: "white",
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 58,
    marginBottom: 18,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: "#0F172A",
  },

  statsCard: {
    backgroundColor: "white",
    width: 150,
    borderRadius: 22,
    padding: 18,
    marginRight: 14,
  },

  statsIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
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
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  reportIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  reportTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },

  listingName: {
    color: "#334155",
    marginTop: 3,
    fontWeight: "500",
  },

  reportMeta: {
    color: "#64748B",
    marginTop: 5,
    fontSize: 13,
  },

  reportTime: {
    color: "#94A3B8",
    marginTop: 4,
    fontSize: 12,
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },

  openBadge: {
    backgroundColor: "#FEE2E2",
  },

  resolvedBadge: {
    backgroundColor: "#DCFCE7",
  },

  rejectedBadge: {
    backgroundColor: "#FEF3C7",
  },

  statusText: {
    fontWeight: "700",
    fontSize: 12,
    color: "#0F172A",
  },

  fab: {
    position: "absolute",
    bottom: 30,
    right: 24,
    width: 62,
    height: 62,
    borderRadius: 999,
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
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