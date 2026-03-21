import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface TrustCardProps {
  workerId: string;
  workerName: string;
  tier: "unverified" | "basic" | "enhanced";
  verificationStatus: "pending" | "verified" | "expired" | "rejected";
  tenureMonths: number;
  endorsementCount: number;
  incidentFlag: boolean;
  lastUpdated: Date;
}

const TIER_COLORS = {
  unverified: "#9CA3AF",
  basic: "#3B82F6",
  enhanced: "#10B981",
} as const;

const TIER_LABELS = {
  unverified: "Unverified",
  basic: "Basic Verified",
  enhanced: "Enhanced Verified",
} as const;

/**
 * TrustCard component — displays a worker's trust information at a glance.
 * Cross-platform (React Native compatible).
 *
 * TODO: Add animations for tier badge.
 * TODO: Add accessibility labels.
 */
export function TrustCard({
  workerName,
  tier,
  verificationStatus,
  tenureMonths,
  endorsementCount,
  incidentFlag,
  lastUpdated,
}: TrustCardProps) {
  const tierColor = TIER_COLORS[tier];
  const tierLabel = TIER_LABELS[tier];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{workerName}</Text>
        <View style={[styles.tierBadge, { backgroundColor: tierColor }]}>
          <Text style={styles.tierText}>{tierLabel}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{tenureMonths}</Text>
          <Text style={styles.statLabel}>Months Tenure</Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statValue}>{endorsementCount}</Text>
          <Text style={styles.statLabel}>Endorsements</Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {verificationStatus === "verified" ? "Yes" : "No"}
          </Text>
          <Text style={styles.statLabel}>ID Verified</Text>
        </View>
      </View>

      {incidentFlag && (
        <View style={styles.incidentWarning}>
          <Text style={styles.incidentText}>
            Incident record on file — contact for details
          </Text>
        </View>
      )}

      <Text style={styles.updated}>
        Last updated: {lastUpdated.toLocaleDateString("en-IN")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  tierText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  stat: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  incidentWarning: {
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  incidentText: {
    color: "#92400E",
    fontSize: 13,
  },
  updated: {
    fontSize: 11,
    color: "#9CA3AF",
    textAlign: "right",
  },
});
