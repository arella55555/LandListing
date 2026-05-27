import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

const screenWidth = Dimensions.get("window").width;

export default function ListingDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { listing } = route.params;

  const images =
    listing.images?.length > 0
      ? listing.images
      : [
          "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
          "https://images.unsplash.com/photo-1494526585095-c41746248156",
          "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
        ];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* IMAGE SECTION */}

      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: images[0] }}
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
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>
              {listing.status || "Pending"}
            </Text>
          </View>

          <TouchableOpacity style={styles.moreButton}>
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color="#0F172A"
            />
          </TouchableOpacity>
        </View>

        {/* TITLE */}

        <Text style={styles.title}>
          {listing.title}
        </Text>

        <Text style={styles.location}>
          <Ionicons
            name="location-outline"
            size={15}
            color="#64748B"
          />
          {" "}
          {listing.municipality},
          {" "}
          {listing.province}
        </Text>

        {/* PRICE */}

        <Text style={styles.price}>
          ₱{Number(listing.price).toLocaleString()}
        </Text>

        {/* SELLER */}

        <View style={styles.sellerCard}>
          <View style={styles.sellerLeft}>

            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {listing.seller_name?.charAt(0) || "S"}
              </Text>
            </View>

            <View>
              <Text style={styles.sellerName}>
                {listing.seller_name || "Unknown Seller"}
              </Text>

              <Text style={styles.sellerEmail}>
                seller@email.com
              </Text>
            </View>

          </View>

          <TouchableOpacity style={styles.profileButton}>
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
            {listing.description ||
              "This property listing is currently awaiting moderation review. The land offers excellent accessibility, good investment potential, and suitable residential or commercial development opportunities."}
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
              value={`${listing.area_sqm || 0} sqm`}
            />

            <DetailCard
              icon="business-outline"
              label="Property Type"
              value={listing.property_type || "Residential"}
            />

            <DetailCard
              icon="document-text-outline"
              label="Title Status"
              value="Clean Title"
            />

            <DetailCard
              icon="calendar-outline"
              label="Posted"
              value="2h ago"
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
            showsHorizontalScrollIndicator={false}
          >

            {images.map((img: string, index: number) => (
              <Image
                key={index}
                source={{ uri: img }}
                style={styles.galleryImage}
              />
            ))}

          </ScrollView>
        </View>

        {/* MODERATION NOTES */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Moderation Notes
          </Text>

          <View style={styles.notesCard}>
            <Text style={styles.noteText}>
              • Verify uploaded land title document.
            </Text>

            <Text style={styles.noteText}>
              • Check for duplicate listings.
            </Text>

            <Text style={styles.noteText}>
              • Confirm property location accuracy.
            </Text>
          </View>
        </View>

        {/* ACTION BUTTONS */}

        <View style={styles.actionsContainer}>

          <TouchableOpacity style={styles.rejectButton}>
            <Ionicons
              name="close"
              size={18}
              color="white"
            />

            <Text style={styles.actionText}>
              Reject
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.flagButton}>
            <Ionicons
              name="flag-outline"
              size={18}
              color="#F59E0B"
            />

            <Text style={styles.flagText}>
              Flag
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.approveButton}>
            <Ionicons
              name="checkmark"
              size={18}
              color="white"
            />

            <Text style={styles.actionText}>
              Approve
            </Text>
          </TouchableOpacity>

        </View>

      </View>
    </ScrollView>
  );
}

/* ================= COMPONENTS ================= */

function DetailCard({
  icon,
  label,
  value,
}: any) {
  return (
    <View style={styles.detailCard}>
      <Ionicons
        name={icon}
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

/* ================= STYLES ================= */

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
    backgroundColor: "rgba(15,23,42,0.7)",
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
    paddingBottom: 120,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  pendingBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },

  pendingText: {
    color: "#B45309",
    fontWeight: "700",
    textTransform: "capitalize",
  },

  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
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

  notesCard: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 18,
  },

  noteText: {
    color: "#475569",
    marginBottom: 10,
    lineHeight: 22,
  },

  actionsContainer: {
    flexDirection: "row",
    marginTop: 35,
    gap: 10,
  },

  rejectButton: {
    flex: 1,
    backgroundColor: "#EF4444",
    paddingVertical: 16,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  flagButton: {
    flex: 1,
    backgroundColor: "#FEF3C7",
    paddingVertical: 16,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  approveButton: {
    flex: 1,
    backgroundColor: "#10B981",
    paddingVertical: 16,
    borderRadius: 18,
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