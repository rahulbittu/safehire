import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { Button } from "@verifyme/ui";
import { Input } from "@verifyme/ui";

// TODO: Fetch existing profile via tRPC (worker.getProfile)
// TODO: Submit updates via tRPC (worker.updateProfile)

/**
 * Worker profile editing screen.
 * Allows workers to update their name, skills, languages, experience, and photo.
 *
 * TODO: Add photo upload via expo-camera / expo-image-picker.
 * TODO: Add skills and languages as tag inputs.
 * TODO: Fetch and pre-fill existing profile data.
 */
export default function ProfileScreen() {
  const [fullName, setFullName] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      // TODO: Call worker.updateProfile via tRPC
      // await trpc.worker.updateProfile.mutate({
      //   fullName,
      //   experienceYears: parseInt(experienceYears, 10),
      //   skills: selectedSkills,
      //   languages: selectedLanguages,
      // });
      Alert.alert("Success", "Profile updated (placeholder)");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      <Input
        label="Full Name"
        placeholder="Enter your full name"
        value={fullName}
        onChangeText={setFullName}
      />

      <Input
        label="Years of Experience"
        placeholder="0"
        value={experienceYears}
        onChangeText={setExperienceYears}
        keyboardType="number-pad"
      />

      {/* TODO: Add skills multi-select/tag input */}
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>
          Skills selection — TODO: Implement tag input
        </Text>
      </View>

      {/* TODO: Add languages multi-select/tag input */}
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>
          Languages selection — TODO: Implement tag input
        </Text>
      </View>

      {/* TODO: Add photo upload */}
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>
          Photo upload — TODO: Implement with expo-camera
        </Text>
      </View>

      <Button
        title="Save Profile"
        onPress={handleSave}
        loading={loading}
        style={styles.saveButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 24,
  },
  placeholder: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  placeholderText: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  saveButton: {
    marginTop: 16,
    marginBottom: 32,
  },
});
