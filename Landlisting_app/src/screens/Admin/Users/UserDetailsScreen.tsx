import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";

import {
  useRoute,
  useNavigation,
} from "@react-navigation/native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  approveSeller,
  rejectSeller,
  suspendUser,
  unsuspendUser,
} from "../../../services/adminService";

export default function UserDetailsScreen() {

  const route = useRoute<any>();

  const navigation =
    useNavigation<any>();

  const {
    user,
    reviewMode,
    onUserUpdated,
  } = route.params;

  async function handleApprove() {

    try {

      await approveSeller(user.id);

      Alert.alert(
        "Success",
        "Seller approved"
      );

      onUserUpdated?.();
      navigation.goBack();

    } catch {

      Alert.alert(
        "Error",
        "Failed to approve seller"
      );
    }
  }

  async function handleReject() {

    try {

      await rejectSeller(user.id);

      Alert.alert(
        "Rejected",
        "Seller rejected"
      );

      onUserUpdated?.();
      navigation.goBack();

    } catch {

      Alert.alert(
        "Error",
        "Failed to reject seller"
      );
    }
  }

  async function handleSuspend() {

    try {

      await suspendUser(user.id);

      Alert.alert(
        "Suspended",
        "User suspended"
      );

      onUserUpdated?.();
      navigation.goBack();

    } catch {

      Alert.alert(
        "Error",
        "Failed to suspend user"
      );
    }
  }

  async function handleUnsuspend() {

    try {

      await unsuspendUser(user.id);

      Alert.alert(
        "Restored",
        "User unsuspended"
      );

      onUserUpdated?.();
      navigation.goBack();

    } catch {

      Alert.alert(
        "Error",
        "Failed to unsuspend user"
      );
    }
  }

  return (

    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: 120,
      }}
    >

      <View style={styles.hero}>

        <View style={styles.avatar}>

          <Text style={styles.avatarText}>
            {user.full_name
              ?.charAt(0)
              ?.toUpperCase()}
          </Text>

        </View>

        <Text style={styles.name}>
          {user.full_name}
        </Text>

        <Text style={styles.email}>
          {user.email}
        </Text>

        <View style={styles.roleBadge}>

          <Text style={styles.roleText}>
            {user.role}
          </Text>

        </View>

      </View>

      <View style={styles.section}>

        <Text style={styles.sectionTitle}>
          Account Overview
        </Text>

        <InfoRow
          icon="shield-checkmark-outline"
          label="Verification"
          value={
            user.is_verified
              ? "Verified"
              : "Unverified"
          }
        />

        <InfoRow
          icon="warning-outline"
          label="Suspended"
          value={
            user.is_suspended
              ? "Yes"
              : "No"
          }
        />

        <InfoRow
          icon="person-outline"
          label="Role"
          value={user.role}
        />

        {user.role === "seller" && (

          <InfoRow
            icon="storefront-outline"
            label="Seller Status"
            value={
              user
                .seller_verification_status ||
              "pending"
            }
          />
        )}

      </View>

      {reviewMode &&
        user.role === "seller" &&
        user
          .seller_verification_status ===
          "pending" && (

        <View style={styles.section}>

          <Text
            style={styles.sectionTitle}
          >
            Seller Verification
          </Text>

          <TouchableOpacity
            style={styles.approveButton}
            onPress={handleApprove}
          >

            <Ionicons
              name="checkmark"
              size={20}
              color="white"
            />

            <Text
              style={styles.actionText}
            >
              Approve Seller
            </Text>

          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rejectButton}
            onPress={handleReject}
          >

            <Ionicons
              name="close"
              size={20}
              color="white"
            />

            <Text
              style={styles.actionText}
            >
              Reject Seller
            </Text>

          </TouchableOpacity>

        </View>
      )}

      <View style={styles.section}>

        <Text style={styles.sectionTitle}>
          Moderation
        </Text>

        {!user.is_suspended ? (

          <TouchableOpacity
            style={styles.suspendButton}
            onPress={handleSuspend}
          >

            <Ionicons
              name="ban-outline"
              size={20}
              color="white"
            />

            <Text
              style={styles.actionText}
            >
              Suspend User
            </Text>

          </TouchableOpacity>

        ) : (

          <TouchableOpacity
            style={styles.unsuspendButton}
            onPress={handleUnsuspend}
          >

            <Ionicons
              name="refresh-outline"
              size={20}
              color="white"
            />

            <Text
              style={styles.actionText}
            >
              Unsuspend User
            </Text>

          </TouchableOpacity>
        )}

      </View>

    </ScrollView>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: any) {

  return (

    <View style={styles.infoRow}>

      <View style={styles.infoLeft}>

        <Ionicons
          name={icon}
          size={18}
          color="#64748B"
        />

        <Text style={styles.infoLabel}>
          {label}
        </Text>

      </View>

      <Text style={styles.infoValue}>
        {value}
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  hero: {
    backgroundColor: "white",
    alignItems: "center",
    paddingVertical: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 999,
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: "white",
    fontSize: 40,
    fontWeight: "800",
  },

  name: {
    marginTop: 18,
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
  },

  email: {
    marginTop: 6,
    color: "#64748B",
  },

  roleBadge: {
    marginTop: 14,
    backgroundColor: "#EDE9FE",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
  },

  roleText: {
    color: "#7C3AED",
    fontWeight: "700",
    textTransform: "capitalize",
  },

  section: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 24,
    padding: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 18,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  infoLabel: {
    color: "#475569",
    fontWeight: "600",
  },

  infoValue: {
    color: "#0F172A",
    fontWeight: "700",
    textTransform: "capitalize",
  },

  approveButton: {
    backgroundColor: "#16A34A",
    padding: 16,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },

  rejectButton: {
    backgroundColor: "#DC2626",
    padding: 16,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },

  suspendButton: {
    backgroundColor: "#DC2626",
    padding: 16,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },

  unsuspendButton: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },

  actionText: {
    color: "white",
    fontWeight: "800",
  },
});