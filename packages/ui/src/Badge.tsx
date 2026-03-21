import React from "react";
import { View, Text, StyleSheet, type ViewStyle } from "react-native";

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

const VARIANT_STYLES: Record<
  BadgeVariant,
  { bg: string; text: string }
> = {
  success: { bg: "#D1FAE5", text: "#065F46" },
  warning: { bg: "#FEF3C7", text: "#92400E" },
  danger: { bg: "#FEE2E2", text: "#991B1B" },
  info: { bg: "#DBEAFE", text: "#1E40AF" },
  neutral: { bg: "#F3F4F6", text: "#4B5563" },
};

/** Map verification tiers to badge variants */
const TIER_VARIANT_MAP: Record<string, BadgeVariant> = {
  unverified: "neutral",
  basic: "info",
  enhanced: "success",
};

/** Map incident/appeal statuses to badge variants */
const STATUS_VARIANT_MAP: Record<string, BadgeVariant> = {
  submitted: "info",
  under_review: "warning",
  substantiated: "danger",
  unsubstantiated: "neutral",
  inconclusive: "neutral",
  appealed: "warning",
  pending: "warning",
  accepted: "success",
  rejected: "danger",
  verified: "success",
  expired: "danger",
};

/**
 * Badge component for verification tiers and status indicators.
 * Cross-platform (React Native compatible).
 */
export function Badge({ label, variant = "neutral", style }: BadgeProps) {
  const colors = VARIANT_STYLES[variant];

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }, style]}>
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

/**
 * Convenience function to get the right badge variant for a tier.
 */
export function tierToVariant(
  tier: "unverified" | "basic" | "enhanced"
): BadgeVariant {
  return TIER_VARIANT_MAP[tier] ?? "neutral";
}

/**
 * Convenience function to get the right badge variant for a status string.
 */
export function statusToVariant(status: string): BadgeVariant {
  return STATUS_VARIANT_MAP[status] ?? "neutral";
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
  },
});
