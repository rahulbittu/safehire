import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";

// TODO: Import useAuth from @verifyme/auth
// import { useAuth } from "@verifyme/auth";

/**
 * Landing / splash screen.
 * Checks auth state and redirects to the appropriate screen:
 * - If authenticated worker -> (worker)/home
 * - If authenticated hirer -> (hirer)/dashboard
 * - If not authenticated -> (auth)/login
 *
 * TODO: Wire up real auth state check.
 */
export default function IndexScreen() {
  const router = useRouter();
  // TODO: const { user, loading } = useAuth();

  useEffect(() => {
    // TODO: Replace with real auth check
    const checkAuth = async () => {
      // Simulate loading delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // TODO: Check real auth state
      // if (user) {
      //   if (user.role === 'worker') router.replace('/(worker)/home');
      //   else if (user.role === 'hirer') router.replace('/(hirer)/dashboard');
      // } else {
      //   router.replace('/(auth)/login');
      // }

      // For now, always redirect to login
      router.replace("/(auth)/login");
    };

    checkAuth();
  }, [router]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SafeHire</Text>
      <Text style={styles.subtitle}>Trust, verified.</Text>
      <ActivityIndicator
        size="large"
        color="#2563EB"
        style={styles.loader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#2563EB",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 8,
  },
  loader: {
    marginTop: 32,
  },
});
