import React from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { InspectionType } from "@/contexts/InspectionContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { HomeStackParamList } from "@/navigation/HomeStackNavigator";

const TAB_BAR_HEIGHT = 90;

type NewInspectionScreenProps = {
  navigation: NativeStackNavigationProp<HomeStackParamList, "NewInspection">;
};

interface InspectionTypeItem {
  type: InspectionType | "performance_test" | "diesel_performance_test" | "fm85a";
  icon: keyof typeof Feather.glyphMap;
  labelKey: keyof typeof import("@/constants/i18n").translations["en"]["inspectionTypes"];
  nfpaRef: string;
}

const inspectionCategories = [
  {
    categoryKey: "sprinklers" as const,
    items: [
      { type: "wet_pipe" as const, icon: "droplet" as const, labelKey: "wetPipe" as const, nfpaRef: "NFPA 25" },
      { type: "dry_pipe" as const, icon: "wind" as const, labelKey: "dryPipe" as const, nfpaRef: "NFPA 25" },
      { type: "preaction_deluge" as const, icon: "cloud-rain" as const, labelKey: "preactionDeluge" as const, nfpaRef: "NFPA 25" },
      { type: "foam_water" as const, icon: "cloud" as const, labelKey: "foamWater" as const, nfpaRef: "NFPA 25" },
      { type: "water_spray" as const, icon: "cloud-drizzle" as const, labelKey: "waterSpray" as const, nfpaRef: "NFPA 25" },
      { type: "water_mist" as const, icon: "cloud-snow" as const, labelKey: "waterMist" as const, nfpaRef: "NFPA 25" },
    ],
  },
  {
    categoryKey: "firePumps" as const,
    items: [
      { type: "electric_pump" as const, icon: "zap" as const, labelKey: "electricPump" as const, nfpaRef: "NFPA 25" },
      { type: "diesel_pump" as const, icon: "truck" as const, labelKey: "dieselPump" as const, nfpaRef: "NFPA 25" },
      { type: "performance_test" as const, icon: "activity" as const, labelKey: "performanceTest" as const, nfpaRef: "NFPA 25" },
      { type: "diesel_performance_test" as const, icon: "settings" as const, labelKey: "dieselPerformanceTest" as const, nfpaRef: "NFPA 25" },
    ],
  },
  {
    categoryKey: "hydrants" as const,
    items: [
      { type: "aboveground" as const, icon: "git-branch" as const, labelKey: "aboveground" as const, nfpaRef: "NFPA 25" },
      { type: "underground" as const, icon: "git-commit" as const, labelKey: "underground" as const, nfpaRef: "NFPA 25" },
      { type: "hydrant_flow" as const, icon: "navigation" as const, labelKey: "hydrantFlow" as const, nfpaRef: "NFPA 25" },
      { type: "standpipe" as const, icon: "maximize-2" as const, labelKey: "standpipe" as const, nfpaRef: "NFPA 25" },
    ],
  },
  {
    categoryKey: "tanks" as const,
    items: [
      { type: "water_tank" as const, icon: "database" as const, labelKey: "waterTank" as const, nfpaRef: "NFPA 25" },
      { type: "hazard_eval" as const, icon: "alert-triangle" as const, labelKey: "hazardEval" as const, nfpaRef: "NFPA 25" },
    ],
  },
  {
    categoryKey: "certificates" as const,
    items: [
      { type: "fm85a" as const, icon: "file-text" as const, labelKey: "fm85a" as const, nfpaRef: "FM Global" },
    ],
  },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TypeCardProps {
  item: InspectionTypeItem;
  onPress: () => void;
}

function TypeCard({ item, onPress }: TypeCardProps) {
  const { fullTheme } = useTheme();
  const { t } = useLanguage();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.typeCard,
        { 
          backgroundColor: fullTheme.colors.cardBackground,
          borderColor: fullTheme.colors.border,
        },
        animatedStyle,
      ]}
    >
      <View style={[styles.typeIconContainer, { backgroundColor: `${fullTheme.colors.primary}15` }]}>
        <Feather name={item.icon} size={28} color={fullTheme.colors.primary} />
      </View>
      <ThemedText type="h4" style={styles.typeName}>
        {t.inspectionTypes[item.labelKey]}
      </ThemedText>
      <ThemedText type="small" secondary>
        {item.nfpaRef}
      </ThemedText>
    </AnimatedPressable>
  );
}

export default function NewInspectionScreen({ navigation }: NewInspectionScreenProps) {
  const { fullTheme } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const handleTypeSelect = (type: InspectionType | "performance_test" | "diesel_performance_test" | "fm85a") => {
    if (type === "performance_test") {
      navigation.navigate("PerformanceTest", {});
    } else if (type === "diesel_performance_test") {
      navigation.navigate("DieselPerformanceTest", {});
    } else if (type === "fm85a") {
      navigation.navigate("FM85AForm", {});
    } else {
      navigation.replace("InspectionForm", { type });
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: Spacing.xl, paddingBottom: insets.bottom + TAB_BAR_HEIGHT + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="body" secondary>
          {t.newInspection.selectType}
        </ThemedText>

        {inspectionCategories.map((category) => (
          <View key={category.categoryKey}>
            <Spacer height={Spacing["2xl"]} />
            <ThemedText type="h3">
              {t.newInspection.categories[category.categoryKey]}
            </ThemedText>
            <Spacer height={Spacing.md} />
            <View style={styles.typeGrid}>
              {category.items.map((item) => (
                <TypeCard
                  key={item.type}
                  item={item}
                  onPress={() => handleTypeSelect(item.type)}
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  typeCard: {
    width: "47%",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    borderWidth: 1,
  },
  typeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  typeName: {
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
});
