// ListingsScreen.tsx
// Modern HCI-Focused LandListing Admin Listings Screen
// Expo + React Native + TypeScript
// Requires:
// expo install react-native-safe-area-context
// expo install @expo/vector-icons

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Feather,
  MaterialIcons,
  Ionicons,
} from "@expo/vector-icons";

const listingData = [
  {
    id: 1,
    title: "Mountain View Lot",
    seller: "Juan Dela Cruz",
    price: "₱2,300,000",
    status: "Pending",
    reports: 2,
  },
  {
    id: 2,
    title: "Beachfront Property",
    seller: "Maria Santos",
    price: "₱8,500,000",
    status: "Flagged",
    reports: 5,
  },
  {
    id: 3,
    title: "Farm Land",
    seller: "Cebu Lands Corp",
    price: "₱1,200,000",
    status: "Approved",
    reports: 0,
  },
];

export default function ListingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Listings</Text>
            <Text style={styles.subtitle}>
              Moderate and manage property listings
            </Text>
          </View>

          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={22} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color="#6B7280" />
          <TextInput
            placeholder="Search listings..."
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
          />
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>124</Text>
            <Text style={styles.statLabel}>All Listings</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>18</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>7</Text>
            <Text style={styles.statLabel}>Flagged</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>11</Text>
            <Text style={styles.statLabel}>Reported</Text>
          </View>
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          {[
            "All",
            "Pending",
            "Approved",
            "Flagged",
            "Reported",
          ].map((filter, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.filterChip,
                index === 0 && styles.activeFilterChip,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  index === 0 && styles.activeFilterText,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Listings */}
        <Text style={styles.sectionTitle}>Moderation Queue</Text>

        {listingData.map((item) => (
          <View key={item.id} style={styles.listingCard}>
            <Image
              source={{
                uri: "https://placehold.co/600x400/png",
              }}
              style={styles.listingImage}
            />

            <View style={styles.listingContent}>
              <View style={styles.listingTopRow}>
                <Text style={styles.listingTitle}>{item.title}</Text>

                <View
                  style={[
                    styles.statusBadge,
                    item.status === "Pending"
                      ? styles.pendingBadge
                      : item.status === "Flagged"
                      ? styles.flaggedBadge
                      : styles.approvedBadge,
                  ]}
                >
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>

              <Text style={styles.listingSeller}>
                Seller: {item.seller}
              </Text>

              <Text style={styles.listingPrice}>{item.price}</Text>

              <View style={styles.reportRow}>
                <MaterialIcons
                  name="report-gmailerrorred"
                  size={18}
                  color="#EF4444"
                />
                <Text style={styles.reportText}>
                  {item.reports} reports
                </Text>
              </View>

              {/* Actions */}
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.approveButton}>
                  <Text style={styles.actionText}>Approve</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.rejectButton}>
                  <Text style={styles.rejectText}>Reject</Text>
                </TouchableOpacity>

                <TouchableOpacity
  style={styles.flagButton}
  onPress={() => handleFlag(item.id)}
>
                  <Text style={styles.flagText}>Flag</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {/* Bottom Spacing */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#6B7280",
  },

  notificationButton: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 16,
  },

  searchContainer: {
    marginTop: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  searchInput: {
    marginLeft: 10,
    flex: 1,
    fontSize: 15,
    color: "#111827",
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },

  statCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
  },

  statNumber: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
  },

  statLabel: {
    marginTop: 8,
    fontSize: 14,
    color: "#6B7280",
  },

  filterContainer: {
    marginTop: 22,
  },

  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    marginRight: 10,
  },

  activeFilterChip: {
    backgroundColor: "#7C3AED",
  },

  filterText: {
    color: "#6B7280",
    fontWeight: "500",
  },

  activeFilterText: {
    color: "#FFFFFF",
  },

  sectionTitle: {
    marginTop: 26,
    marginBottom: 16,
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  listingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    overflow: "hidden",
    marginBottom: 22,
  },

  listingImage: {
    width: "100%",
    height: 180,
  },

  listingContent: {
    padding: 18,
  },

  listingTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  listingTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 30,
  },

  pendingBadge: {
    backgroundColor: "#FEF3C7",
  },

  flaggedBadge: {
    backgroundColor: "#FEE2E2",
  },

  approvedBadge: {
    backgroundColor: "#DCFCE7",
  },

  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
  },

  listingSeller: {
    marginTop: 10,
    fontSize: 14,
    color: "#6B7280",
  },

  listingPrice: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },

  reportRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  reportText: {
    marginLeft: 6,
    color: "#EF4444",
    fontWeight: "600",
  },

  actionRow: {
    flexDirection: "row",
    marginTop: 18,
    justifyContent: "space-between",
  },

  approveButton: {
    flex: 1,
    backgroundColor: "#7C3AED",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    marginRight: 8,
  },

  rejectButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    marginRight: 8,
  },

  flagButton: {
    flex: 1,
    backgroundColor: "#FEE2E2",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },

  actionText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  rejectText: {
    color: "#111827",
    fontWeight: "600",
  },

  flagText: {
    color: "#DC2626",
    fontWeight: "600",
  },
});