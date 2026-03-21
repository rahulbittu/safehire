import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { TrustCard } from "@verifyme/ui";
import { Button } from "@verifyme/ui";

// TODO: Import useAuth from @verifyme/auth
// TODO: Fetch trust card data via tRPC (worker.getMyTrustCard)

/**
 * Worker home screen.
 * Shows trust card summary and quick actions.
 *
 * TODO: Fetch real data from API.
 * TODO: Add pull-to-refresh.
 * TODO: Add push notification indicators.
 */
export default function WorkerHomeScreen() {
  const router = useRouter();

  // TODO: Replace with real data fetching
  const trustCardData = {
    workerId: "placeholder",
    workerName: "Worker Name",
    tier: "unverified" as const,
    verificationStatus: "pending" as const,
    tenureMonths: 0,
    endorsementCount: 0,
    incidentFlag: false,
    lastUpdated: new Date(),
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.greeting}>Welcome back</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Trust Card</Text>
        <TrustCard {...trustCardData} />
      </View>

      <View style={styles.actions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <Button
          title="View Full Trust Card"
          onPress={() => router.push("/(worker)/trust-card")}
          style={styles.actionButton}
        />

        <Button
          title="Update Profile"
          onPress={() => router.push("/(worker)/profile")}
          variant="secondary"
          style={styles.actionButton}
        />

        <Button
          title="View My Incidents"
          onPress={() => {
            // TODO: Navigate to incidents list
          }}
          variant="secondary"
          style={styles.actionButton}
        />
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
  greeting: {
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
  actions: {
    marginBottom: 32,
  },
  actionButton: {
    marginBottom: 12,
  },
});
