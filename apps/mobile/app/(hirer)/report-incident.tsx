import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@verifyme/ui";
import { Input } from "@verifyme/ui";

// TODO: Wire up to tRPC incident.reportIncident
// TODO: Wire up evidence upload via expo-camera and expo-document-picker

const INCIDENT_TYPES = [
  { value: "theft", label: "Theft" },
  { value: "misconduct", label: "Misconduct" },
  { value: "property_damage", label: "Property Damage" },
  { value: "harassment", label: "Harassment" },
  { value: "safety_concern", label: "Safety Concern" },
  { value: "other", label: "Other" },
] as const;

const SEVERITY_LEVELS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
] as const;

/**
 * Incident reporting form for hirers.
 * Allows type selection, description, evidence upload, and severity rating.
 *
 * TODO: Add worker selection/search.
 * TODO: Add camera and document picker for evidence.
 * TODO: Add confirmation dialog before submission.
 */
export default function ReportIncidentScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("");
  const [description, setDescription] = useState("");
  const [workerId, setWorkerId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedType || !selectedSeverity || !description || !workerId) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // TODO: Call incident.reportIncident via tRPC
      // Description will be encrypted before storage by the API layer
      // await trpc.incident.reportIncident.mutate({
      //   workerId,
      //   type: selectedType,
      //   severity: selectedSeverity,
      //   description,
      //   evidence: uploadedEvidence,
      // });
      Alert.alert(
        "Submitted",
        "Your incident report has been submitted for review.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Submission failed";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Report an Incident</Text>
      <Text style={styles.disclaimer}>
        All incident reports are reviewed by our team. Descriptions are
        encrypted and handled confidentially.
      </Text>

      {/* TODO: Replace with worker search/picker */}
      <Input
        label="Worker ID"
        placeholder="Enter worker ID"
        value={workerId}
        onChangeText={setWorkerId}
      />

      {/* Incident type selection */}
      <Text style={styles.label}>Incident Type</Text>
      <View style={styles.chipRow}>
        {INCIDENT_TYPES.map((type) => (
          <Button
            key={type.value}
            title={type.label}
            onPress={() => setSelectedType(type.value)}
            variant={selectedType === type.value ? "primary" : "secondary"}
            style={styles.chip}
          />
        ))}
      </View>

      {/* Severity selection */}
      <Text style={styles.label}>Severity</Text>
      <View style={styles.chipRow}>
        {SEVERITY_LEVELS.map((level) => (
          <Button
            key={level.value}
            title={level.label}
            onPress={() => setSelectedSeverity(level.value)}
            variant={
              selectedSeverity === level.value ? "primary" : "secondary"
            }
            style={styles.chip}
          />
        ))}
      </View>

      {/* Description */}
      <Input
        label="Description"
        placeholder="Describe the incident in detail..."
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={5}
      />

      {/* Evidence upload */}
      <View style={styles.evidenceSection}>
        <Text style={styles.label}>Evidence</Text>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            TODO: Add camera and document picker for evidence upload
          </Text>
        </View>
      </View>

      <Button
        title="Submit Report"
        onPress={handleSubmit}
        loading={loading}
        variant="danger"
        style={styles.submitButton}
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
    marginBottom: 8,
  },
  disclaimer: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 24,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
    marginTop: 8,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36,
  },
  evidenceSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  placeholder: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 24,
    alignItems: "center",
  },
  placeholderText: {
    color: "#9CA3AF",
    fontSize: 14,
    textAlign: "center",
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 32,
  },
});
