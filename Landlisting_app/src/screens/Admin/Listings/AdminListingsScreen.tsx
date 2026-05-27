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
import {
  useNavigation,
} from "@react-navigation/native";
import { useEffect, useState } from "react";



import { Ionicons } from "@expo/vector-icons";

import {
  getListings,
  approveListing,
  rejectListing,
} from "../../../services/adminService";

import { COLORS }
from "../../../constants/color";

export default function AdminListingsScreen() {

  const [listings, setListings] =
    useState<any[]>([]);

  const [filteredListings,
    setFilteredListings] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing,
    setRefreshing] =
    useState(false);

    const navigation =
  useNavigation<any>();

  const [search, setSearch] =
    useState("");

  const [selectedTab, setSelectedTab] =
    useState("pending");

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    filterListings(search);
  }, [search, listings, selectedTab]);

  async function fetchListings() {

  try {

    setLoading(true);

    const data =
      await getListings();

    const listingsData =
      data.listings || [];

    setListings(listingsData);

    setFilteredListings(
      listingsData
    );

  } catch (error) {

    console.error(
      "Fetch listings error:",
      error
    );

    setListings([]);
    setFilteredListings([]);

  } finally {

    setLoading(false);
    setRefreshing(false);
  }
}

async function handleApprove(id: string) {

  try {

    await approveListing(id);

    fetchListings();

  } catch (error) {

    console.error(error);
  }
}

async function handleReject(id: string) {

  try {

    await rejectListing(id);

    fetchListings();

  } catch (error) {

    console.error(error);
  }
}

  function filterListings(text: string) {

    setSearch(text);

    let filtered = [...listings];

    if (text.trim()) {

      filtered =
        filtered.filter((listing) =>
          listing.title
            ?.toLowerCase()
            .includes(text.toLowerCase())
        );
    }

    // FILTER TABS

    if (selectedTab !== "all") {

      filtered = filtered.filter(
        (listing) =>
          listing.status === selectedTab
      );
    }

    setFilteredListings(filtered);
  }

  function getStatusStyle(status: string) {

    switch (status) {

      case "approved":
        return styles.approvedBadge;

      case "rejected":
        return styles.rejectedBadge;

      case "sold":
        return styles.soldBadge;

      case "flagged":
        return styles.flaggedBadge;

      case "pending":
        return styles.pendingBadge;

      default:
        return styles.defaultBadge;
    }
  }

  const pendingCount =
    listings.filter(
      (l) => l.status === "pending"
    ).length;

  const approvedCount =
    listings.filter(
      (l) => l.status === "approved"
    ).length;

  const rejectedCount =
    listings.filter(
      (l) => l.status === "rejected"
    ).length;

  const flaggedCount =
    listings.filter(
      (l) => l.status === "flagged"
    ).length;

  if (loading) {

    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />

        <Text style={styles.loadingText}>
          Loading listings moderation...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <FlatList
        data={filteredListings}

        keyExtractor={(item) => item.id}

        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchListings();
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
                  Listings
                </Text>

                <Text style={styles.subtitle}>
                  Moderate and review property listings
                </Text>

              </View>

              <View style={styles.headerActions}>

                <TouchableOpacity
                  style={styles.iconButton}
                >
                  <Ionicons
                    name="search-outline"
                    size={22}
                    color="#0F172A"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconButton}
                >
                  <Ionicons
                    name="options-outline"
                    size={22}
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
                placeholder="Search listings..."
                placeholderTextColor="#94A3B8"
                style={styles.searchInput}
                value={search}
                onChangeText={filterListings}
              />

            </View>

            {/* STATS */}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 20 }}
            >

              <StatsCard
                label="Pending"
                value={pendingCount}
                color="#F59E0B"
                icon="time-outline"
              />

              <StatsCard
                label="Approved"
                value={approvedCount}
                color="#10B981"
                icon="checkmark-circle-outline"
              />

              <StatsCard
                label="Rejected"
                value={rejectedCount}
                color="#EF4444"
                icon="close-circle-outline"
              />

              <StatsCard
                label="Flagged"
                value={flaggedCount}
                color="#8B5CF6"
                icon="flag-outline"
              />

            </ScrollView>

            {/* FILTER TABS */}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 18 }}
            >

              <FilterTab
                label="All"
                active={selectedTab === "all"}
                onPress={() =>
                  setSelectedTab("all")
                }
              />

              <FilterTab
                label="Pending"
                active={selectedTab === "pending"}
                onPress={() =>
                  setSelectedTab("pending")
                }
              />

              <FilterTab
                label="Approved"
                active={selectedTab === "approved"}
                onPress={() =>
                  setSelectedTab("approved")
                }
              />

              <FilterTab
                label="Rejected"
                active={selectedTab === "rejected"}
                onPress={() =>
                  setSelectedTab("rejected")
                }
              />

              <FilterTab
                label="Flagged"
                active={selectedTab === "flagged"}
                onPress={() =>
                  setSelectedTab("flagged")
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
                "ListingDetails",
                {
                  listing: item,
                }
              )
            }
          >

            {/* TOP */}

            <View style={styles.topRow}>

              {/* PLACEHOLDER IMAGE */}

              <View style={styles.imagePlaceholder}>

                <Ionicons
                  name="image-outline"
                  size={30}
                  color="#94A3B8"
                />

              </View>

              <View style={{ flex: 1 }}>

                <Text style={styles.listingTitle}>
                  {item.title}
                </Text>

                <Text style={styles.location}>
                  {item.municipality},
                  {" "}
                  {item.province}
                </Text>

                <Text style={styles.price}>
                  ₱{item.price}
                </Text>

                <Text style={styles.metaText}>
                  By {item.seller_name || "Unknown"}
                </Text>

              </View>

              <TouchableOpacity>

                <Ionicons
                  name="ellipsis-vertical"
                  size={18}
                  color="#64748B"
                />

              </TouchableOpacity>

            </View>

            {/* INFO ROW */}

            <View style={styles.infoRow}>

              <InfoBadge
                icon="resize-outline"
                text={`${item.area_sqm || 0} sqm`}
              />

              <InfoBadge
                icon="business-outline"
                text={
                  item.property_type ||
                  "Residential"
                }
              />

              <InfoBadge
                icon="time-outline"
                text="2h ago"
              />

            </View>

            {/* STATUS */}

            <View
              style={[
                styles.statusBadge,
                getStatusStyle(item.status),
              ]}
            >
              <Text style={styles.badgeText}>
                {item.status}
              </Text>
            </View>

            {/* ACTIONS */}

            <View style={styles.actions}>

              <TouchableOpacity
                style={styles.rejectButton}
                onPress={() =>
                  handleReject(item.id)
                }
              >

                <Ionicons
                  name="close"
                  size={18}
                  color="#EF4444"
                />

                <Text style={styles.rejectText}>
                  Reject
                </Text>

              </TouchableOpacity>

              <TouchableOpacity
                style={styles.flagButton}
              >

                <Ionicons
                  name="flag-outline"
                  size={18}
                  color="#F59E0B"
                />

                <Text style={styles.flagText}>
                  Flag
                </Text>

              </TouchableOpacity>

              <TouchableOpacity
                style={styles.approveButton}
                onPress={() =>
                  handleApprove(item.id)
                }
              >

                <Ionicons
                  name="checkmark"
                  size={18}
                  color="white"
                />

                <Text style={styles.approveText}>
                  Approve
                </Text>

              </TouchableOpacity>

            </View>

          </TouchableOpacity>
        )}

        ListEmptyComponent={
          <View style={styles.emptyContainer}>

            <Ionicons
              name="home-outline"
              size={55}
              color="#CBD5E1"
            />

            <Text style={styles.emptyTitle}>
              No listings found
            </Text>

            <Text style={styles.emptySubtitle}>
              Try adjusting filters or search.
            </Text>

          </View>
        }
      />

      {/* FLOATING ACTION BUTTON */}

      <TouchableOpacity style={styles.fab}>

        <Ionicons
          name="add"
          size={28}
          color="white"
        />

      </TouchableOpacity>

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