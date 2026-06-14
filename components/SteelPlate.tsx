import React, { ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";

export interface SteelField {
  label: string;
  value: string;
}

interface SteelPlateProps {
  title?: string;
  fields: SteelField[];
  icon?: keyof typeof Feather.glyphMap;
  children?: ReactNode;
}

// Placa de aço (spec 06) — instrumento de aço CONSTANTE nos dois temas.
// Gradiente 150deg #22323d→#16222a, radius 18, labels mono 9, valores 13/600.
export function SteelPlate({
  title,
  fields,
  icon = "activity",
  children,
}: SteelPlateProps) {
  const { fullTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: fullTheme.colors.steelBg }]}>
      {title ? (
        <View style={styles.header}>
          <Feather name={icon} size={16} color={fullTheme.colors.steelLabel} />
          <ThemedText mono style={styles.title}>
            {title.toUpperCase()}
          </ThemedText>
        </View>
      ) : null}
      <View style={styles.grid}>
        {fields.map((f, i) => (
          <View key={`${f.label}-${i}`} style={styles.field}>
            <ThemedText mono style={styles.label}>
              {f.label.toUpperCase()}
            </ThemedText>
            <ThemedText style={styles.value}>{f.value}</ThemedText>
          </View>
        ))}
      </View>
      {children}
    </View>
  );
}

const STEEL_LABEL = "#7f94a3";
const STEEL_INK = "#eef4f8";

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 11,
  },
  title: {
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 1.6,
    color: STEEL_LABEL,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  field: {
    width: "50%",
    marginBottom: 10,
    paddingRight: 14,
  },
  label: {
    fontSize: 9,
    fontWeight: "500",
    letterSpacing: 0.8,
    color: STEEL_LABEL,
  },
  value: {
    fontSize: 13,
    fontWeight: "600",
    color: STEEL_INK,
    marginTop: 2,
  },
});
