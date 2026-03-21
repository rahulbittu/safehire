import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Button } from "@verifyme/ui";
import { Input } from "@verifyme/ui";

/**
 * OTP verification screen.
 * User enters the 6-digit OTP sent to their phone.
 *
 * TODO: Wire up to auth API (tRPC auth.verifyOtp).
 * TODO: Add auto-read OTP from SMS (Android).
 * TODO: Add resend OTP with countdown timer.
 * TODO: Store session securely via expo-secure-store.
 */
export default function VerifyOtpScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleVerify = async () => {
    setError(undefined);

    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      // TODO: Call auth.verifyOtp via tRPC
      // const result = await trpc.auth.verifyOtp.mutate({ phone, otp });
      // TODO: Store session token in expo-secure-store
      // await SecureStore.setItemAsync('session_token', result.session.token);

      // TODO: Navigate based on user role
      // if (result.session.role === 'worker') router.replace('/(worker)/home');
      // else router.replace('/(hirer)/dashboard');

      // Placeholder: navigate to worker home
      router.replace("/(worker)/home");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Invalid OTP";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to {phone ?? "your phone"}
        </Text>
      </View>

      <View style={styles.form}>
        <Input
          label="OTP Code"
          placeholder="000000"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
          error={error}
        />

        <Button title="Verify" onPress={handleVerify} loading={loading} />

        <Button
          title="Resend OTP"
          onPress={() => {
            // TODO: Implement resend with cooldown timer
            Alert.alert("Info", "OTP resend not yet implemented");
          }}
          variant="secondary"
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
