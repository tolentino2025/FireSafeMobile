import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { StatCard } from "@/components/StatCard";
import { InspectionCard } from "@/components/InspectionCard";
import { SyncStatus } from "@/components/SyncStatus";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useInspections, Inspection } from "@/contexts/InspectionContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import { parseLocalYMD } from "@/utils/dateUtils";

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<HomeStackParamList, "Home">;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { fullTheme } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const { inspections } = useInspections();
  const insets = useSafeAreaInsets();

  const fabScale = useSharedValue(1);
  const fabRotation = useSharedValue(0);

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: fabScale.value },
      { rotate: `${fabRotation.value}deg` },
    ],
  }));

  const handleFabPressIn = () => {
    fabScale.value = withSpring(1.1, { damping: 15, stiffness: 150 });
    fabRotation.value = withSpring(45, { damping: 15, stiffness: 150 });
  };

  const handleFabPressOut = () => {
    fabScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    fabRotation.value = withSpring(0, { damping: 15, stiffness: 150 });
  };

  const toggleLanguage = () => {
    setLanguage(language === "pt-BR" ? "en" : "pt-BR");
  };

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const thisWeekInspections = inspections.filter((insp) => {
    const date = parseLocalYMD(insp.date);
    return date >= startOfWeek;
  });

  const thisMonthInspections = inspections.filter((insp) => {
    const date = parseLocalYMD(insp.date);
    return date >= startOfMonth;
  });

  const incompleteInspections = inspections.filter(
    (insp) => insp.status !== "completed"
  );

  const recentInspections = [...inspections]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const handleInspectionPress = (inspection: Inspection) => {
    navigation.navigate("InspectionDetail", { inspectionId: inspection.id });
  };

  return (
    <>
      <ScreenScrollView>
        <View style={styles.header}>
          <ThemedText type="h2">{t.home.greeting}</ThemedText>
          <Pressable
            onPress={toggleLanguage}
            style={({ pressed }) => [
              styles.languageButton,
              { backgroundColor: fullTheme.colors.cardBackground, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <ThemedText type="small" style={styles.languageText}>
              {language === "pt-BR" ? "PT" : "EN"}
            </ThemedText>
          </Pressable>
        </View>

        <Spacer height={Spacing.lg} />

        <SyncStatus />

        <Spacer height={Spacing.xl} />

        <View style={styles.statsRow}>
          <StatCard
            title={t.home.thisWeek}
            value={thisWeekInspections.length}
            icon="calendar"
            color={fullTheme.colors.primary}
          />
          <StatCard
            title={t.home.thisMonth}
            value={thisMonthInspections.length}
            icon="check-circle"
            color={fullTheme.colors.success}
          />
          <StatCard
            title={t.home.incomplete}
            value={incompleteInspections.length}
            icon="clock"
            color={fullTheme.colors.warning}
          />
        </View>

        <Spacer height={Spacing["3xl"]} />

        <ThemedText type="h3">{t.home.recentActivity}</ThemedText>
        <Spacer height={Spacing.lg} />

        {recentInspections.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: fullTheme.colors.cardBackground }]}>
            <Feather name="clipboard" size={48} color={fullTheme.colors.textSecondary} />
            <Spacer height={Spacing.md} />
            <ThemedText type="body" secondary style={{ textAlign: "center" }}>
              {t.home.noInspections}
            </ThemedText>
          </View>
        ) : (
          recentInspections.map((inspection) => (
            <React.Fragment key={inspection.id}>
              <InspectionCard
                inspection={inspection}
                onPress={() => handleInspectionPress(inspection)}
              />
              <Spacer height={Spacing.md} />
            </React.Fragment>
          ))
        )}

        <Spacer height={80} />
      </ScreenScrollView>

      <AnimatedPressable
        onPress={() => navigation.navigate("NewInspection")}
        onPressIn={handleFabPressIn}
        onPressOut={handleFabPressOut}
        style={[
          styles.fab,
          { 
            bottom: insets.bottom + 70,
            backgroundColor: fullTheme.colors.primary,
            ...fullTheme.shadows.large,
          },
          fabAnimatedStyle,
        ]}
      >
        <Feather name="plus" size={28} color="#FFFFFF" />
      </AnimatedPressable>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  languageButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  languageText: {
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  emptyState: {
    padding: Spacing["3xl"],
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    position: "absolute",
    alignSelf: "center",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
});
