import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";

interface ComplianceRingProps {
  /** Percentual de conformidade 0–100. */
  percent: number;
  /** Rotulo abaixo do numero (ex.: "CONFORME"). */
  label?: string;
  size?: number;
}

// Anel de conformidade — padrao Instrument (spec 08).
// size 104, r 46, circunferencia 289, stroke 9, offset = 289 - (289*pct/100).
const R = 46;
const CIRC = 289; // 2π × 46

export function ComplianceRing({
  percent,
  label = "CONFORME",
  size = 104,
}: ComplianceRingProps) {
  const { fullTheme } = useTheme();
  const pct = Math.max(0, Math.min(100, percent));
  const offset = Math.round(CIRC - (CIRC * pct) / 100);
  const center = size / 2;
  const scaledR = (R * size) / 104;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg
        width={size}
        height={size}
        style={{ transform: [{ rotate: "-90deg" }] }}
      >
        <Circle
          cx={center}
          cy={center}
          r={scaledR}
          fill="none"
          stroke={fullTheme.colors.borderStrong}
          strokeWidth={9}
        />
        <Circle
          cx={center}
          cy={center}
          r={scaledR}
          fill="none"
          stroke={fullTheme.colors.primary}
          strokeWidth={9}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
        />
      </Svg>
      <View style={styles.center}>
        <ThemedText mono style={styles.value}>
          {pct}
          <ThemedText mono secondary style={styles.unit}>
            %
          </ThemedText>
        </ThemedText>
        {label ? (
          <ThemedText style={[styles.label, { color: fullTheme.colors.success }]}>
            {label}
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    fontSize: 25,
    fontWeight: "600",
    lineHeight: 27,
  },
  unit: {
    fontSize: 13,
    fontWeight: "600",
  },
  label: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.1,
    marginTop: 1,
  },
});
