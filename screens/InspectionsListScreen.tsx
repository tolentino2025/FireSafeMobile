import React, { useState, useMemo } from "react";
import { View, StyleSheet, TextInput, Pressable } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ScreenFlatList } from "@/components/ScreenFlatList";
import { ThemedText } from "@/components/ThemedText";
import { InspectionCard } from "@/components/InspectionCard";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useInspections, Inspection } from "@/contexts/InspectionContext";
import { Spacing, BorderRadius, AppColors, Shadows } from "@/constants/theme";
import { InspectionsStackParamList } from "@/navigation/InspectionsStackNavigator";

type InspectionsListScreenProps = {
  navigation: NativeStackNavigationProp<InspectionsStackParamList, "InspectionsList">;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function InspectionsListScreen({ navigation }: InspectionsListScreenProps) {
  const { theme, isDark } = useTheme();
  const { t } = useLanguage();
  const { inspections } = useInspections();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

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

  const filteredInspections = useMemo(() => {
    let result = [...inspections];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (insp) =>
          insp.propertyName.toLowerCase().includes(query) ||
          insp.propertyAddress.toLowerCase().includes(query) ||
          insp.inspectorName.toLowerCase().includes(query)
      );
    }

    if (statusFilter) {
      result = result.filter((insp) => insp.status === statusFilter);
    }

    return result.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [inspections, searchQuery, statusFilter]);

  const handleInspectionPress = (inspection: Inspection) => {
    navigation.navigate("InspectionDetail", { inspectionId: inspection.id });
  };

  const renderItem = ({ item }: { item: Inspection }) => (
    <>
      <InspectionCard
        inspection={item}
        onPress={() => handleInspectionPress(item)}
      />
      <Spacer height={Spacing.md} />
    </>
  );

  const renderHeader = () => (
    <>
      <View style={[styles.searchContainer, { backgroundColor: theme.backgroundDefault }]}>
        <Feather name="search" size={20} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder={t.inspections.search}
          placeholderTextColor={theme.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <Feather name="x" size={20} color={theme.textSecondary} />
          </Pressable>
        )}
      </View>

      <Spacer height={Spacing.md} />

      <View style={styles.filterRow}>
        {["completed", "in_progress", "pending"].map((status) => (
          <Pressable
            key={status}
            onPress={() => setStatusFilter(statusFilter === status ? null : status)}
            style={[
              styles.filterChip,
              {
                backgroundColor:
                  statusFilter === status
                    ? AppColors.primary
                    : theme.backgroundDefault,
              },
            ]}
          >
            <ThemedText
              type="small"
              style={{
                color: statusFilter === status ? "#FFFFFF" : theme.text,
                fontWeight: "600",
              }}
            >
              {status === "completed"
                ? t.inspections.status.completed
                : status === "in_progress"
                ? t.inspections.status.inProgress
                : t.inspections.status.pending}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <Spacer height={Spacing.xl} />
    </>
  );

  const renderEmpty = () => (
    <View style={[styles.emptyState, { backgroundColor: theme.backgroundDefault }]}>
      <Feather name="clipboard" size={48} color={theme.textSecondary} />
      <Spacer height={Spacing.md} />
      <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center" }}>
        {t.inspections.noResults}
      </ThemedText>
    </View>
  );

  return (
    <>
      <ScreenFlatList
        data={filteredInspections}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
      />

      <AnimatedPressable
        onPress={() => navigation.navigate("InspectionForm", { type: "wet_pipe" })}
        onPressIn={handleFabPressIn}
        onPressOut={handleFabPressOut}
        style={[
          styles.fab,
          { bottom: insets.bottom + 70 },
          fabAnimatedStyle,
        ]}
      >
        <Feather name="plus" size={28} color="#FFFFFF" />
      </AnimatedPressable>
    </>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    height: 48,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },
  filterRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  emptyState: {
    padding: Spacing["3xl"],
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingBottom: 80,
  },
  fab: {
    position: "absolute",
    alignSelf: "center",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: AppColors.primary,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    ...Shadows.large,
  },
});
