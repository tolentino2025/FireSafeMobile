import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface StatCardProps {
  title: string;
  value: number;
  icon: keyof typeof Feather.glyphMap;
  color?: string;
}

export function StatCard({ title, value, icon, color }: StatCardProps) {
  const { fullTheme } = useTheme();
  
  const iconColor = color || fullTheme.colors.primary;

  return (
    <View style={[styles.container, { 
      backgroundColor: fullTheme.colors.cardBackground,
      borderColor: fullTheme.colors.border,
    }]}>
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
        <Feather name={icon} size={20} color={iconColor} />
      </View>
      <ThemedText type="h2" style={styles.value}>
        {value}
      </ThemedText>
      <ThemedText type="small" secondary>
        {title}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    borderWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  value: {
    marginBottom: Spacing.xs,
  },
});
