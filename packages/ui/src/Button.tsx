import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
} from "react-native";

type ButtonVariant = "primary" | "secondary" | "danger";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

const VARIANT_STYLES: Record<
  ButtonVariant,
  { bg: string; text: string; border: string }
> = {
  primary: { bg: "#2563EB", text: "#FFFFFF", border: "#2563EB" },
  secondary: { bg: "#FFFFFF", text: "#374151", border: "#D1D5DB" },
  danger: { bg: "#DC2626", text: "#FFFFFF", border: "#DC2626" },
};

/**
 * Basic button component with variant support.
 * Cross-platform (React Native compatible).
 */
export function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const colors = VARIANT_STYLES[variant];
  const isDisabled = disabled || loading;

  const buttonStyle: ViewStyle = {
    ...styles.button,
    backgroundColor: colors.bg,
    borderColor: colors.border,
    opacity: isDisabled ? 0.5 : 1,
    ...style,
  };

  const textStyle: TextStyle = {
    ...styles.text,
    color: colors.text,
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={colors.text} size="small" />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
});
