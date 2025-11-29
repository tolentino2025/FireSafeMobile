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
import { Spacing, BorderRadius } from "@/constants/theme";
import { InspectionsStackParamList } from "@/navigation/InspectionsStackNavigator";

type InspectionsListScreenProps = {
  navigation: NativeStackNavigationProp<InspectionsStackParamList, "InspectionsList">;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function InspectionsListScreen({ navigation }: InspectionsListScreenProps) {
  const { fullTheme } = useTheme();
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
      <View style={[styles.searchContainer, { backgroundColor: fullTheme.colors.cardBackground, borderColor: fullTheme.colors.border }]}>
        <Feather name="search" size={20} color={fullTheme.colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: fullTheme.colors.textPrimary }]}
          placeholder={t.inspections.search}
          placeholderTextColor={fullTheme.colors.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 ? (
          <Pressable onPress={() => setSearchQuery("")}>
            <Feather name="x" size={20} color={fullTheme.colors.textSecondary} />
          </Pressable>
        ) : null}
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
                    ? fullTheme.colors.primary
                    : fullTheme.colors.cardBackground,
                borderColor: fullTheme.colors.border,
              },
            ]}
          >
            <ThemedText
              type="small"
              style={{
                color: statusFilter === status ? "#FFFFFF" : fullTheme.colors.textPrimary,
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
    <View style={[styles.emptyState, { backgroundColor: fullTheme.colors.cardBackground }]}>
      <Feather name="clipboard" size={48} color={fullTheme.colors.textSecondary} />
      <Spacer height={Spacing.md} />
      <ThemedText type="body" secondary style={{ textAlign: "center" }}>
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    height: 48,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    borderWidth: 1,
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
    borderWidth: 1,
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
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
});
