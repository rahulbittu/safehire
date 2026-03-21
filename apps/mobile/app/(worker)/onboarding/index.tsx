import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@verifyme/ui";
import { Input } from "@verifyme/ui";

type OnboardingStep = "name" | "phone" | "skills" | "photo" | "aadhaar";

const STEPS: OnboardingStep[] = ["name", "phone", "skills", "photo", "aadhaar"];

const STEP_TITLES: Record<OnboardingStep, string> = {
  name: "What is your name?",
  phone: "Verify your phone number",
  skills: "What are your skills?",
  photo: "Add a profile photo",
  aadhaar: "Verify your identity",
};

/**
 * Multi-step onboarding wizard for new workers.
 * Steps: Name -> Phone verification -> Skills -> Photo -> Aadhaar (DigiLocker).
 *
 * TODO: Wire up each step to the appropriate API calls.
 * TODO: Add proper back navigation within the wizard.
 * TODO: Persist partial progress so user can resume.
 */
export default function OnboardingScreen() {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [fullName, setFullName] = useState("");

  const currentStep = STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === STEPS.length - 1;
  const progress = (currentStepIndex + 1) / STEPS.length;

  const handleNext = () => {
    if (isLastStep) {
      // TODO: Submit all onboarding data
      // TODO: Create worker profile via tRPC
      router.replace("/(worker)/home");
      return;
    }
    setCurrentStepIndex((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case "name":
        return (
          <View>
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>
        );

      case "phone":
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepDescription}>
              We will send an OTP to verify your phone number.
            </Text>
            {/* TODO: Inline phone verification flow */}
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>
                Phone verification — TODO: Integrate OTP flow
              </Text>
            </View>
          </View>
        );

      case "skills":
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepDescription}>
              Select the skills you have. This helps hirers find you.
            </Text>
            {/* TODO: Skills tag selection UI */}
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>
                Skills multi-select — TODO: Implement chip/tag selector
              </Text>
            </View>
          </View>
        );

      case "photo":
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepDescription}>
              Add a clear photo of yourself. This helps hirers recognize you.
            </Text>
            {/* TODO: Camera/gallery photo picker */}
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>
                Photo capture — TODO: Implement with expo-camera
              </Text>
            </View>
          </View>
        );

      case "aadhaar":
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepDescription}>
              Verify your identity through DigiLocker. Your Aadhaar number is
              never stored — only a secure hash is kept for verification.
            </Text>
            {/* TODO: DigiLocker integration */}
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>
                Aadhaar verification via DigiLocker — TODO: Integrate DigiLocker
                SDK
              </Text>
            </View>
            <Button
              title="Skip for now"
              onPress={() => router.replace("/(worker)/home")}
              variant="secondary"
              style={styles.skipButton}
            />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      </View>

      <Text style={styles.stepIndicator}>
        Step {currentStepIndex + 1} of {STEPS.length}
      </Text>

      <Text style={styles.title}>{STEP_TITLES[currentStep]}</Text>

      {renderStep()}

      <View style={styles.navigation}>
        {currentStepIndex > 0 && (
          <Button
            title="Back"
            onPress={handleBack}
            variant="secondary"
            style={styles.navButton}
          />
        )}
        <Button
          title={isLastStep ? "Complete" : "Next"}
          onPress={handleNext}
          style={styles.navButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 24,
  },
  progressContainer: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#2563EB",
    borderRadius: 2,
  },
  stepIndicator: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 24,
  },
  stepContent: {
    marginBottom: 24,
  },
  stepDescription: {
    fontSize: 16,
    color: "#4B5563",
    marginBottom: 16,
    lineHeight: 24,
  },
  placeholder: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  placeholderText: {
    color: "#9CA3AF",
    fontSize: 14,
    textAlign: "center",
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 32,
    gap: 12,
  },
  navButton: {
    flex: 1,
  },
  skipButton: {
    marginTop: 8,
  },
});
