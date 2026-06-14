import React from "react";
import { Pressable, StyleSheet, type ViewStyle, type StyleProp } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

// Chip de filtro horizontal — padrao Instrument (spec): padding 8v/14h,
// radius 11, border 1, 12/600. Ativo = ember; inativo = superficie + tinta.
export function FilterChip({ label, active, onPress, style }: FilterChipProps) {
  const { fullTheme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active
            ? fullTheme.colors.primary
            : fullTheme.colors.surface,
          borderColor: active ? fullTheme.colors.primary : fullTheme.colors.border,
        },
        style,
      ]}
    >
      <ThemedText
        style={[
          styles.label,
          { color: active ? "#FFFFFF" : fullTheme.colors.textPrimary },
        ]}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 11,
    borderWidth: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
});
