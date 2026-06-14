import React from "react";
import { View, StyleSheet, type ViewStyle, type StyleProp } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";

export type StatusChipVariant =
  | "pass"
  | "pending"
  | "fail"
  | "neutral"
  | "info";

interface StatusChipProps {
  label: string;
  variant?: StatusChipVariant;
  style?: StyleProp<ViewStyle>;
  /** Texto all-caps (padrao Instrument para selos de conformidade). */
  upper?: boolean;
}

// Selo de status — padrao Instrument (spec 09): radius 7, 10/700, ls .03em.
export function StatusChip({
  label,
  variant = "neutral",
  style,
  upper = false,
}: StatusChipProps) {
  const { fullTheme } = useTheme();

  const palette: Record<StatusChipVariant, { fg: string; bg: string }> = {
    pass: { fg: fullTheme.colors.success, bg: fullTheme.colors.successSoft },
    pending: { fg: fullTheme.colors.warning, bg: fullTheme.colors.warningSoft },
    fail: { fg: fullTheme.colors.error, bg: fullTheme.colors.errorSoft },
    info: { fg: fullTheme.colors.primary, bg: fullTheme.colors.primarySoft },
    neutral: {
      fg: fullTheme.colors.textSecondary,
      bg: fullTheme.colors.surfaceAlt,
    },
  };

  const { fg, bg } = palette[variant];

  return (
    <View style={[styles.chip, { backgroundColor: bg }, style]}>
      <ThemedText
        style={[
          styles.text,
          { color: fg },
          upper && styles.upper,
        ]}
      >
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: "flex-start",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 7,
  },
  text: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  upper: {
    textTransform: "uppercase",
  },
});
