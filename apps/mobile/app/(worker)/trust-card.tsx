import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Badge, statusToVariant, tierToVariant } from "@verifyme/ui";

// TODO: Fetch trust card data via tRPC (worker.getMyTrustCard)
// TODO: Fetch endorsement summary via tRPC

/**
 * Full trust card view for a worker.
 * Shows detailed verification tier, tenure, endorsements, and incident status.
 *
 * TODO: Fetch real data from API.
 * TODO: Add share trust card functionality (QR code or link).
 */
export default function TrustCardScreen() {
  // TODO: Replace with real data
  const tier = "unverified" as const;
  const verificationStatus = "pending" as const;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your Trust Card</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Verification Tier</Text>
          <Badge
            label={tier.charAt(0).toUpperCase() + tier.slice(1)}
            variant={tierToVariant(tier)}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Verification Status</Text>
          <Badge
            label={verificationStatus}
            variant={statusToVariant(verificationStatus)}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Tenure</Text>
          <Text style={styles.value}>0 months</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Endorsements</Text>
          <Text style={styles.value}>0</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Incident Record</Text>
          <Badge label="Clear" variant="success" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Endorsements</Text>
        <Text style={styles.emptyText}>No endorsements yet</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Verifications</Text>
        <Text style={styles.emptyText}>
          Complete your profile to start verification
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  label: {
    fontSize: 14,
    color: "#6B7280",
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
});
