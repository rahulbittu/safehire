import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@verifyme/ui";
import { Input } from "@verifyme/ui";

/**
 * Phone number login screen.
 * User enters their phone number and receives an OTP.
 *
 * TODO: Wire up to auth API (tRPC auth.register or auth.verifyOtp).
 * TODO: Add phone number formatting for Indian numbers (+91).
 * TODO: Add rate limiting feedback.
 */
export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleSendOtp = async () => {
    setError(undefined);

    // Basic validation
    if (phone.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    try {
      // TODO: Call auth.register or send OTP via tRPC
      // await trpc.auth.register.mutate({ phone, role: 'worker' });

      // Navigate to OTP verification screen
      router.push({
        pathname: "/(auth)/verify-otp",
        params: { phone },
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to send OTP";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to SafeHire</Text>
        <Text style={styles.subtitle}>
          Enter your phone number to get started
        </Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Phone Number"
          placeholder="+91 98765 43210"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          autoComplete="tel"
          error={error}
        />

        <Button
          title="Send OTP"
          onPress={handleSendOtp}
          loading={loading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 24,
    justifyContent: "center",
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 8,
  },
  form: {
    gap: 16,
  },
});
