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
  Image,
} from "react-native";

import { useEffect, useState, useCallback } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import {
  getListings,
  approveListing,
  rejectListing,
  flagListing, // ✅ FIXED: added missing import
} from "../../../services/adminService";

import { COLORS } from "../../../constants/color";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1507089947368-19c1da9775ae";

export default function AdminListingsScreen() {
  const navigation = useNavigation<any>();

  const [listings, setListings] = useState<any[]>([]);
  const [filteredListings, setFilteredListings] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState<
    "all" | "pending" | "approved" | "rejected" | "flagged"
  >("pending");

  useFocusEffect(
  useCallback(() => {
    fetchListings();
  }, [])
);

  useEffect(() => {
    applyFilters();
  }, [search, listings, selectedTab]);

  async function fetchListings() {
    try {
      setLoading(true);

      const data = await getListings();
      const safe = Array.isArray(data?.listings) ? data.listings : [];

      setListings(safe);
    } catch (error) {
      console.error("Fetch listings error:", error);
      setListings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // ✅ FIXED: unified status source
  function getListingStatus(item: any) {
    return item.status || item.moderation_status || "pending";
  }

  function applyFilters() {
    let filtered = [...listings];

    if (selectedTab !== "all") {
      filtered = filtered.filter(
        (l) => l.moderation_status === selectedTab
      );
    }

    if (search.trim()) {
      filtered = filtered.filter((l) =>
        l.title?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredListings(filtered);
  }

  async function handleApprove(id: string) {
  try {
    setActionLoading(id);

    await approveListing(id);

    setListings(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, moderation_status: "approved" }
          : item
      )
    );
  } catch (error: any) {
    alert(error.message);
  } finally {
    setActionLoading(null);
  }
}

  async function handleReject(id: string) {
  try {
    setActionLoading(id);

    await rejectListing(id);

    setListings(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, moderation_status: "rejected" }
          : item
      )
    );
  } catch (error: any) {
    alert(error.message);
  } finally {
    setActionLoading(null);
  }
}

  async function handleFlag(id: string) {
  try {
    setActionLoading(id);

    await flagListing(id);

    setListings(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, moderation_status: "flagged" }
          : item
      )
    );
  } catch (error: any) {
    alert(error.message);
  } finally {
    setActionLoading(null);
  }
}
async function handleRevert(id: string) {
  try {
    setActionLoading(id);

    // OPTIONAL:
    // await revertListing(id);

    setListings(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, moderation_status: "pending" }
          : item
      )
    );

  } catch (error: any) {
    alert(error.message);
  } finally {
    setActionLoading(null);
  }
}

  function normalizeStatus(status: string) {
    const allowed = [
      "pending",
      "approved",
      "rejected",
      "sold",
      "leased",
      "rented",
      "flagged",
    ];

    return allowed.includes(status) ? status : "pending";
  }

  function getStatusStyle(status: string) {
    switch (status) {
      case "approved":
        return styles.approvedBadge;
      case "rejected":
        return styles.rejectedBadge;
      case "sold":
      case "leased":
      case "rented":
        return styles.soldBadge;
      case "flagged":
        return styles.flaggedBadge;
      default:
        return styles.pendingBadge;
    }
  }

  const pendingCount = listings.filter(
    l => l.moderation_status === "pending"
  ).length;

  const approvedCount = listings.filter(
    l => l.moderation_status === "approved"
  ).length;

  const rejectedCount = listings.filter(
    l => l.moderation_status === "rejected"
  ).length;

  const flaggedCount = listings.filter(
    l => l.moderation_status === "flagged"
  ).length;

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading listings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredListings}
        keyExtractor={(item, index) => item.id ?? String(index)}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchListings();
            }}
          />
        }
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Listings</Text>
                <Text style={styles.subtitle}>
                  Moderate property listings
                </Text>
              </View>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={18} color="#94A3B8" />
              <TextInput
                placeholder="Search listings..."
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <StatsCard label="Pending" value={pendingCount} color="#F59E0B" icon="time-outline" />
              <StatsCard label="Approved" value={approvedCount} color="#10B981" icon="checkmark-circle-outline" />
              <StatsCard label="Rejected" value={rejectedCount} color="#EF4444" icon="close-circle-outline" />
              <StatsCard label="Flagged" value={flaggedCount} color="#8B5CF6" icon="flag-outline" />
            </ScrollView>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {["all", "pending", "approved", "rejected", "flagged"].map((tab) => (
                <FilterTab
                  key={tab}
                  label={tab}
                  active={selectedTab === tab}
                  onPress={() => setSelectedTab(tab as any)}
                />
              ))}
            </ScrollView>
          </>
        }
        renderItem={({ item }) => {
          const status = item.moderation_status;
          /**
           * function getActions(status: string) {
                if (status === "pending") return "moderate";
                if (status === "flagged") return "review";
                return "view";
              }
           */
          const image =
            item.image || item.images?.[0] || FALLBACK_IMAGE;

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate("ListingDetails", { listing: item })
              }
            >
              <View style={styles.topRow}>
                <Image source={{ uri: image }} style={styles.imagePlaceholder} />

                <View style={{ flex: 1 }}>
                  <Text style={styles.listingTitle}>
                    {item.title || "Untitled Listing"}
                  </Text>

                  <Text style={styles.location}>
                    {item.municipality || "N/A"}, {item.province || "N/A"}
                  </Text>

                  <Text style={styles.price}>
                    ₱{Number(item.price || 0).toLocaleString()}
                  </Text>

                  <Text style={styles.metaText}>
                    By {item.seller_name || "Unknown"}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <InfoBadge icon="resize-outline" text={`${item.area_sqm || 0} sqm`} />
                <InfoBadge icon="business-outline" text={item.property_type || "N/A"} />
              </View>

              <View style={[styles.statusBadge, getStatusStyle(status)]}>
                <Text style={styles.badgeText}>{status}</Text>
              </View>

              {status === "pending" && (
  <View style={styles.actions}>
    <TouchableOpacity
      disabled={actionLoading === item.id}
      style={styles.rejectButton}
      onPress={() => handleReject(item.id)}
    >
      <Ionicons name="close" size={18} color="#EF4444" />
      <Text style={styles.rejectText}>Reject</Text>
    </TouchableOpacity>

    <TouchableOpacity
      disabled={actionLoading === item.id}
      style={styles.flagButton}
      onPress={() => handleFlag(item.id)}
    >
      <Ionicons name="flag-outline" size={18} color="#F59E0B" />
      <Text style={styles.flagText}>Flag</Text>
    </TouchableOpacity>

    <TouchableOpacity
      disabled={actionLoading === item.id}
      style={styles.approveButton}
      onPress={() => handleApprove(item.id)}
    >
      <Ionicons name="checkmark" size={18} color="white" />
      <Text style={styles.approveText}>Approve</Text>
    </TouchableOpacity>
  </View>
)}

              {status === "flagged" && (
  <View style={styles.actions}>
    <TouchableOpacity
      style={styles.approveButton}
      onPress={() =>
        navigation.navigate("ListingDetails", { listing: item })
      }
    >
      <Ionicons name="eye-outline" size={18} color="white" />
      <Text style={styles.approveText}>Inspect</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.flagButton}
      onPress={() => handleRevert(item.id)}
    >
      <Ionicons
        name="refresh-outline"
        size={18}
        color="#D97706"
      />

      <Text style={styles.flagText}>
        Revert
      </Text>
    </TouchableOpacity>
  </View>
)}

{status !== "pending" && status !== "flagged" && (
  <View style={styles.actions}>
    <TouchableOpacity
      style={styles.approveButton}
      onPress={() =>
        navigation.navigate("ListingDetails", { listing: item })
      }
    >
      <Ionicons name="eye-outline" size={18} color="white" />
      <Text style={styles.approveText}>View</Text>
    </TouchableOpacity>
  </View>
)}

              {actionLoading === item.id && (
                <Text style={{ marginTop: 8, color: "#64748B" }}>
                  Processing...
                </Text>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
/* ================= COMPONENTS ================= */

function StatsCard({
  label,
  value,
  color,
  icon,
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

      <Text style={styles.statsLabel}>
        {label}
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

function InfoBadge({
  icon,
  text,
}: any) {

  return (

    <View style={styles.infoBadge}>

      <Ionicons
        name={icon}
        size={14}
        color="#64748B"
      />

      <Text style={styles.infoText}>
        {text}
      </Text>

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

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
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

  iconButton: {
    width: 48,
    height: 48,
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
    marginBottom: 22,
    height: 56,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: "#0F172A",
  },

  statsCard: {
    width: 150,
    backgroundColor: "white",
    borderRadius: 22,
    padding: 18,
    marginRight: 14,
  },

  statsIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  statsLabel: {
    color: "#64748B",
    fontSize: 13,
  },

  statsValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 5,
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
    fontWeight: "600",
    color: "#475569",
  },

  activeFilterText: {
    color: "white",
  },

  card: {
    backgroundColor: "white",
    borderRadius: 26,
    padding: 18,
    marginBottom: 18,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  imagePlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  listingTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },

  location: {
    color: "#64748B",
    marginTop: 4,
  },

  price: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  metaText: {
    marginTop: 5,
    color: "#94A3B8",
    fontSize: 12,
  },

  infoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
  },

  infoBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },

  infoText: {
    marginLeft: 5,
    color: "#475569",
    fontSize: 12,
    fontWeight: "600",
  },

  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginTop: 16,
  },

  approvedBadge: {
    backgroundColor: "#DCFCE7",
  },

  rejectedBadge: {
    backgroundColor: "#FEE2E2",
  },

  pendingBadge: {
    backgroundColor: "#FEF3C7",
  },

  soldBadge: {
    backgroundColor: "#DBEAFE",
  },

  flaggedBadge: {
    backgroundColor: "#EDE9FE",
  },

  defaultBadge: {
    backgroundColor: "#E2E8F0",
  },

  badgeText: {
    fontWeight: "700",
    color: "#0F172A",
    textTransform: "capitalize",
  },

  actions: {
    flexDirection: "row",
    marginTop: 20,
    gap: 10,
  },

  rejectButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
    paddingVertical: 13,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  flagButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#FCD34D",
    backgroundColor: "#FFFBEB",
    paddingVertical: 13,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  approveButton: {
    flex: 1,
    backgroundColor: "#10B981",
    paddingVertical: 13,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  rejectText: {
    color: "#EF4444",
    fontWeight: "700",
    marginLeft: 5,
  },

  flagText: {
    color: "#D97706",
    fontWeight: "700",
    marginLeft: 5,
  },

  approveText: {
    color: "white",
    fontWeight: "700",
    marginLeft: 5,
  },

  emptyContainer: {
    alignItems: "center",
    marginTop: 120,
  },

  emptyTitle: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },

  emptySubtitle: {
    marginTop: 5,
    color: "#94A3B8",
  },

  fab: {
    position: "absolute",
    bottom: 30,
    right: 25,
    width: 62,
    height: 62,
    borderRadius: 999,
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },

});