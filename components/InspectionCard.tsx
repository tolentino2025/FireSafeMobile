import React from "react";
import { StyleSheet, Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { Inspection } from "@/contexts/InspectionContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { parseLocalYMD } from "@/utils/dateUtils";

interface InspectionCardProps {
  inspection: Inspection;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const inspectionTypeIcons: Record<string, keyof typeof Feather.glyphMap> = {
  wet_pipe: "droplet",
  dry_pipe: "wind",
  preaction_deluge: "cloud-rain",
  foam_water: "cloud",
  water_spray: "cloud-drizzle",
  water_mist: "cloud-snow",
  pump_weekly: "activity",
  pump_monthly: "activity",
  pump_annual: "activity",
  electric_pump: "zap",
  diesel_pump: "truck",
  aboveground: "git-branch",
  underground: "git-commit",
  hydrant_flow: "navigation",
  water_tank: "database",
  hazard_eval: "alert-triangle",
  standpipe: "maximize-2",
};

export function InspectionCard({ inspection, onPress }: InspectionCardProps) {
  const { fullTheme } = useTheme();
  const { t } = useLanguage();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const getStatusColor = () => {
    switch (inspection.status) {
      case "completed":
        return fullTheme.colors.success;
      case "in_progress":
        return fullTheme.colors.warning;
      case "draft":
        return fullTheme.colors.textSecondary;
      case "pending":
      default:
        return fullTheme.colors.textSecondary;
    }
  };

  const getStatusLabel = () => {
    switch (inspection.status) {
      case "completed":
        return t.inspections.status.completed;
      case "in_progress":
        return t.inspections.status.inProgress;
      case "draft":
        return t.inspections.status.draft;
      case "pending":
      default:
        return t.inspections.status.pending;
    }
  };

  const getTypeLabel = () => {
    const typeKey = inspection.type.replace(/_/g, "") as keyof typeof t.inspectionTypes;
    const mapping: Record<string, keyof typeof t.inspectionTypes> = {
      wet_pipe: "wetPipe",
      dry_pipe: "dryPipe",
      preaction_deluge: "preactionDeluge",
      foam_water: "foamWater",
      water_spray: "waterSpray",
      water_mist: "waterMist",
      pump_weekly: "pumpWeekly",
      pump_monthly: "pumpMonthly",
      pump_annual: "pumpAnnual",
      electric_pump: "electricPump",
      diesel_pump: "dieselPump",
      aboveground: "aboveground",
      underground: "underground",
      hydrant_flow: "hydrantFlow",
      water_tank: "waterTank",
      hazard_eval: "hazardEval",
      standpipe: "standpipe",
    };
    return t.inspectionTypes[mapping[inspection.type] || "wetPipe"];
  };

  const formatDate = (dateString: string) => {
    const date = parseLocalYMD(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const icon = inspectionTypeIcons[inspection.type] || "clipboard";

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        { 
          backgroundColor: fullTheme.colors.cardBackground,
          borderColor: fullTheme.colors.border,
        },
        animatedStyle,
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${fullTheme.colors.primary}15` }]}>
        <Feather name={icon} size={24} color={fullTheme.colors.primary} />
      </View>
      <View style={styles.content}>
        <ThemedText type="h4" numberOfLines={1}>
          {inspection.propertyName}
        </ThemedText>
        <ThemedText type="small" secondary numberOfLines={1}>
          {getTypeLabel()}
        </ThemedText>
        <View style={styles.footer}>
          <ThemedText type="small" secondary>
            {formatDate(inspection.date)}
          </ThemedText>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor()}20` }]}>
            <ThemedText type="small" style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusLabel()}
            </ThemedText>
          </View>
        </View>
      </View>
      <Feather name="chevron-right" size={20} color={fullTheme.colors.textSecondary} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
    gap: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
});
