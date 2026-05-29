import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";

import { useState } from "react";

import {
  approveListing,
  rejectListing,
  flagListing,
  revertListing,
} from "../../../services/adminService";

import { Ionicons } from "@expo/vector-icons";

import {
  useNavigation,
  useRoute,
} from "@react-navigation/native";

const screenWidth =
  Dimensions.get("window").width;

export default function ListingDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { listing } = route.params;

  const [currentListing, setCurrentListing] =
    useState(listing);

  const [actionLoading, setActionLoading] =
    useState(false);

  const status =
    currentListing?.moderation_status ||
    "pending";

  const images =
    currentListing?.images?.length > 0
      ? currentListing.images
      : [
          currentListing?.image,
          "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
        ].filter(Boolean);

  async function handleApprove() {
    try {
      setActionLoading(true);

      await approveListing(currentListing.id);

      setCurrentListing({
        ...currentListing,
        moderation_status: "approved",
      });
    } catch (error: any) {
      alert(
        error?.message ||
          "Failed to approve listing"
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    try {
      setActionLoading(true);

      await rejectListing(currentListing.id);

      setCurrentListing({
        ...currentListing,
        moderation_status: "rejected",
      });
    } catch (error: any) {
      alert(
        error?.message ||
          "Failed to reject listing"
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleFlag() {
    try {
      setActionLoading(true);

      await flagListing(currentListing.id);

      setCurrentListing({
        ...currentListing,
        moderation_status: "flagged",
      });
    } catch (error: any) {
      alert(
        error?.message ||
          "Failed to flag listing"
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRevert() {
    try {
      setActionLoading(true);

      await revertListing(currentListing.id);

      setCurrentListing({
        ...currentListing,
        moderation_status: "pending",
      });
    } catch (error: any) {
      alert(
        error?.message ||
          "Failed to revert listing"
      );
    } finally {
      setActionLoading(false);
    }
  }

  function renderLoading(
    color: string = "white"
  ) {
    return (
      <ActivityIndicator
        size="small"
        color={color}
      />
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* IMAGE */}

      <View style={styles.imageWrapper}>
        <Image
          source={{
            uri:
              images?.[0] ||
              "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
          }}
          style={styles.mainImage}
        />

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color="#0F172A"
          />
        </TouchableOpacity>

        <View style={styles.imageCount}>
          <Text style={styles.imageCountText}>
            1/{images.length}
          </Text>
        </View>
      </View>

      {/* CONTENT */}

      <View style={styles.content}>
        {/* STATUS */}

        <View style={styles.topRow}>
          <View
            style={[
              styles.statusBadge,

              status === "approved" &&
                styles.approvedBadge,

              status === "rejected" &&
                styles.rejectedBadge,

              status === "flagged" &&
                styles.flaggedBadge,

              status === "pending" &&
                styles.pendingBadge,
            ]}
          >
            <Text style={styles.badgeText}>
              {status}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.moreButton}
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color="#0F172A"
            />
          </TouchableOpacity>
        </View>

        {/* TITLE */}

        <Text style={styles.title}>
          {currentListing?.title ||
            "Untitled Listing"}
        </Text>

        {/* LOCATION */}

        <Text style={styles.location}>
          <Ionicons
            name="location-outline"
            size={15}
            color="#64748B"
          />

          {" "}

          {currentListing?.municipality ||
            "N/A"}
          ,{" "}
          {currentListing?.province ||
            "N/A"}
        </Text>

        {/* PRICE */}

        <Text style={styles.price}>
          ₱
          {Number(
            currentListing?.price || 0
          ).toLocaleString()}
        </Text>

        {/* SELLER */}

        <View style={styles.sellerCard}>
          <View style={styles.sellerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {currentListing?.seller_name?.charAt(
                  0
                ) || "S"}
              </Text>
            </View>

            <View>
              <Text style={styles.sellerName}>
                {currentListing?.seller_name ||
                  "Unknown Seller"}
              </Text>

              <Text style={styles.sellerEmail}>
                Seller Account
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.profileButton}
          >
            <Ionicons
              name="person-outline"
              size={18}
              color="#7C3AED"
            />
          </TouchableOpacity>
        </View>

        {/* DESCRIPTION */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Description
          </Text>

          <Text style={styles.description}>
            {currentListing?.description ||
              "No description provided."}
          </Text>
        </View>

        {/* DETAILS */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Property Details
          </Text>

          <View style={styles.detailsGrid}>
            <DetailCard
              icon="resize-outline"
              label="Lot Area"
              value={`${currentListing?.area_sqm || 0} sqm`}
            />

            <DetailCard
              icon="business-outline"
              label="Property Type"
              value={
                currentListing?.property_type ||
                "Residential"
              }
            />

            <DetailCard
              icon="document-text-outline"
              label="Moderation"
              value={status}
            />

            <DetailCard
              icon="cash-outline"
              label="Price"
              value={`₱${Number(
                currentListing?.price || 0
              ).toLocaleString()}`}
            />
          </View>
        </View>

        {/* GALLERY */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Property Images
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
          >
            {images.map(
              (
                img: string,
                index: number
              ) => (
                <Image
                  key={index}
                  source={{ uri: img }}
                  style={styles.galleryImage}
                />
              )
            )}
          </ScrollView>
        </View>

        {/* ACTIONS */}

        {status === "pending" && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={handleReject}
              disabled={actionLoading}
            >
              {actionLoading ? (
                renderLoading()
              ) : (
                <>
                  <Ionicons
                    name="close"
                    size={18}
                    color="white"
                  />

                  <Text
                    style={styles.actionText}
                  >
                    Reject
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.flagButton}
              onPress={handleFlag}
              disabled={actionLoading}
            >
              {actionLoading ? (
                renderLoading("#B45309")
              ) : (
                <>
                  <Ionicons
                    name="flag-outline"
                    size={18}
                    color="#B45309"
                  />

                  <Text
                    style={styles.flagText}
                  >
                    Flag
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.approveButton}
              onPress={handleApprove}
              disabled={actionLoading}
            >
              {actionLoading ? (
                renderLoading()
              ) : (
                <>
                  <Ionicons
                    name="checkmark"
                    size={18}
                    color="white"
                  />

                  <Text
                    style={styles.actionText}
                  >
                    Approve
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {status === "flagged" && (
          <View style={styles.actionsColumn}>
            <TouchableOpacity
              style={styles.warningButton}
              onPress={handleRevert}
              disabled={actionLoading}
            >
              <Ionicons
                name="refresh-outline"
                size={18}
                color="#B45309"
              />

              <Text style={styles.flagText}>
                Return to Review
              </Text>
            </TouchableOpacity>

            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={handleReject}
                disabled={actionLoading}
              >
                <Ionicons
                  name="close"
                  size={18}
                  color="white"
                />

                <Text
                  style={styles.actionText}
                >
                  Reject
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.approveButton}
                onPress={handleApprove}
                disabled={actionLoading}
              >
                <Ionicons
                  name="checkmark"
                  size={18}
                  color="white"
                />

                <Text
                  style={styles.actionText}
                >
                  Approve
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {(status === "approved" ||
          status === "rejected") && (
          <View style={styles.actionsColumn}>
            <TouchableOpacity
              style={styles.warningButton}
              onPress={handleRevert}
              disabled={actionLoading}
            >
              <Ionicons
                name="refresh-outline"
                size={18}
                color="#B45309"
              />

              <Text style={styles.flagText}>
                Revert to Pending
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

/* COMPONENTS */

function DetailCard({
  icon,
  label,
  value,
}: any) {
  return (
    <View style={styles.detailCard}>
      <Ionicons
        name={icon as any}
        size={20}
        color="#7C3AED"
      />

      <Text style={styles.detailLabel}>
        {label}
      </Text>

      <Text style={styles.detailValue}>
        {value}
      </Text>
    </View>
  );
}

/* STYLES */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  imageWrapper: {
    position: "relative",
  },

  mainImage: {
    width: screenWidth,
    height: 280,
  },

  backButton: {
    position: "absolute",
    top: 55,
    left: 20,
    backgroundColor: "white",
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  imageCount: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor:
      "rgba(15,23,42,0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },

  imageCountText: {
    color: "white",
    fontWeight: "600",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },

  pendingBadge: {
    backgroundColor: "#FEF3C7",
  },

  approvedBadge: {
    backgroundColor: "#DCFCE7",
  },

  rejectedBadge: {
    backgroundColor: "#FEE2E2",
  },

  flaggedBadge: {
    backgroundColor: "#EDE9FE",
  },

  badgeText: {
    fontWeight: "700",
    textTransform: "capitalize",
    color: "#0F172A",
  },

  moreButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 16,
  },

  location: {
    marginTop: 8,
    color: "#64748B",
    fontSize: 15,
  },

  price: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 18,
  },

  sellerCard: {
    backgroundColor: "white",
    borderRadius: 22,
    padding: 18,
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sellerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  avatarText: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
  },

  sellerName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },

  sellerEmail: {
    marginTop: 4,
    color: "#64748B",
  },

  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#F5F3FF",
    justifyContent: "center",
    alignItems: "center",
  },

  section: {
    marginTop: 28,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 14,
  },

  description: {
    color: "#475569",
    lineHeight: 24,
  },

  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  detailCard: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },

  detailLabel: {
    marginTop: 10,
    color: "#64748B",
    fontSize: 13,
  },

  detailValue: {
    marginTop: 6,
    fontWeight: "700",
    color: "#0F172A",
  },

  galleryImage: {
    width: 120,
    height: 90,
    borderRadius: 18,
    marginRight: 12,
  },

  actionsColumn: {
    marginTop: 30,
    gap: 12,
  },

  actionsContainer: {
    flexDirection: "row",
    gap: 12,
  },

  rejectButton: {
    flex: 1,
    backgroundColor: "#EF4444",
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  approveButton: {
    flex: 1,
    backgroundColor: "#10B981",
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  flagButton: {
    flex: 1,
    backgroundColor: "#FEF3C7",
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  warningButton: {
    backgroundColor: "#FEF3C7",
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  actionText: {
    color: "white",
    fontWeight: "700",
  },

  flagText: {
    color: "#B45309",
    fontWeight: "700",
  },
});