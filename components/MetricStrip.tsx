import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";

export interface Metric {
  label: string;
  value: string | number;
  icon?: keyof typeof Feather.glyphMap;
}

interface MetricStripProps {
  metrics: Metric[]; // tipicamente 3
}

// Tira de metricas — padrao Instrument (spec 11): surface, radius 18, border 1,
// divisores 1px entre celulas, numero IBM Plex Mono 24/600, label mono 10.
export function MetricStrip({ metrics }: MetricStripProps) {
  const { fullTheme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: fullTheme.colors.surface,
          borderColor: fullTheme.colors.border,
        },
      ]}
    >
      {metrics.map((m, i) => (
        <View
          key={`${m.label}-${i}`}
          style={[
            styles.cell,
            i > 0 && {
              borderLeftWidth: 1,
              borderLeftColor: fullTheme.colors.border,
            },
          ]}
        >
          <View style={styles.labelRow}>
            {m.icon ? (
              <Feather
                name={m.icon}
                size={15}
                color={fullTheme.colors.inkFaint}
              />
            ) : null}
            <ThemedText style={styles.label} secondary>
              {m.label}
            </ThemedText>
          </View>
          <ThemedText mono style={styles.value}>
            {String(m.value)}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  cell: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  value: {
    fontSize: 24,
    fontWeight: "600",
    marginTop: 6,
    lineHeight: 26,
  },
});
