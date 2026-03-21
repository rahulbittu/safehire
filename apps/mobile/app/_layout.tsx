import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

// TODO: Import and wrap with AuthProvider from @verifyme/auth
// import { AuthProvider } from "@verifyme/auth";

/**
 * Root layout for the mobile app.
 * Sets up navigation stack and global providers.
 *
 * TODO: Add AuthProvider wrapping.
 * TODO: Add error boundary.
 * TODO: Add splash screen handling.
 */
export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#FFFFFF" },
          headerTintColor: "#1F2937",
          headerTitleStyle: { fontWeight: "600" },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="(auth)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(worker)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(hirer)"
          options={{ headerShown: false }}
        />
      </Stack>
    </>
  );
}
