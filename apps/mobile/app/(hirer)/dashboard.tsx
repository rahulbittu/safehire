import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@verifyme/ui";

// TODO: Fetch dashboard data via tRPC (hirer.getMyWorkers)

/**
 * Hirer dashboard screen.
 * Shows search, recent trust cards, and managed workers.
 *
 * TODO: Fetch real data from API.
 * TODO: Add pull-to-refresh.
 */
export default function HirerDashboardScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      <View style={styles.section}>
        <Button
          title="Search Workers"
          onPress={() => router.push("/(hirer)/search")}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Workers</Text>
        <Text style={styles.emptyText}>
          No workers yet. Search for workers to get started.
        </Text>
        {/* TODO: List workers with active consent grants */}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <Text style={styles.emptyText}>No recent activity</Text>
        {/* TODO: Show recent trust card views, endorsements, incidents */}
      </View>

      <Button
        title="Report an Incident"
        onPress={() => router.push("/(hirer)/report-incident")}
        variant="danger"
        style={styles.reportButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 24,
    marginTop: 16,
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
  reportButton: {
    marginBottom: 32,
  },
});
