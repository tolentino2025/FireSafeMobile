import React, { useState, useMemo, useCallback } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import { ScreenFlatList } from "@/components/ScreenFlatList";
import { ThemedText } from "@/components/ThemedText";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useInspections } from "@/contexts/InspectionContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { InspectionsStackParamList } from "@/navigation/InspectionsStackNavigator";
import { InspectionSchedule } from "@/types/inspection";
import { getFrequencyLabel, getInspectionTypeLabel } from "@/utils/scheduleUtils";
import { parseLocalYMD, getLocalDateString } from "@/utils/dateUtils";

type InspectionScheduleScreenProps = {
  navigation: NativeStackNavigationProp<InspectionsStackParamList, "InspectionSchedule">;
};

type ScheduleFilter = "all" | "overdue" | "upcoming";

export default function InspectionScheduleScreen({ navigation }: InspectionScheduleScreenProps) {
  const { fullTheme } = useTheme();
  const { t, language } = useLanguage();
  const { schedules, companies, properties, firePumps } = useInspections();

  const [filter, setFilter] = useState<ScheduleFilter>("all");
  const [todayString, setTodayString] = useState(() => getLocalDateString());

  useFocusEffect(
    useCallback(() => {
      setTodayString(getLocalDateString());
    }, [])
  );

  const getDisplayName = (schedule: InspectionSchedule): string => {
    if (schedule.propertyId) {
      const property = properties.find((p) => p.id === schedule.propertyId);
      if (property) return property.name;
    }
    if (schedule.companyId) {
      const company = companies.find((c) => c.id === schedule.companyId);
      if (company) return company.name;
    }
    if (schedule.firePumpId) {
      const pump = firePumps.find((p) => p.id === schedule.firePumpId);
      if (pump) return pump.tag;
    }
    return getInspectionTypeLabel(schedule.inspectionType, language);
  };

  const isOverdue = useCallback((schedule: InspectionSchedule): boolean => {
    const dueDate = schedule.nextDueDate.split('T')[0];
    return dueDate < todayString;
  }, [todayString]);

  const filteredSchedules = useMemo(() => {
    let result = schedules.filter((s) => s.isActive);

    if (filter === "overdue") {
      result = result.filter((s) => isOverdue(s));
    } else if (filter === "upcoming") {
      result = result.filter((s) => !isOverdue(s));
    }

    return result.sort(
      (a, b) => parseLocalYMD(a.nextDueDate).getTime() - parseLocalYMD(b.nextDueDate).getTime()
    );
  }, [schedules, filter, isOverdue]);

  const formatDate = (dateString: string): string => {
    const date = parseLocalYMD(dateString);
    return date.toLocaleDateString(language === "pt-BR" ? "pt-BR" : "en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleSchedulePress = (schedule: InspectionSchedule) => {
    navigation.navigate("InspectionsList", {
      propertyId: schedule.propertyId,
      scheduleId: schedule.id,
    });
  };

  const renderItem = ({ item }: { item: InspectionSchedule }) => {
    const overdue = isOverdue(item);

    return (
      <>
        <Pressable
          onPress={() => handleSchedulePress(item)}
          style={({ pressed }) => [
            styles.card,
            {
              backgroundColor: fullTheme.colors.cardBackground,
              borderColor: fullTheme.colors.border,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Feather
                name="calendar"
                size={20}
                color={overdue ? fullTheme.colors.error : fullTheme.colors.primary}
              />
              <ThemedText type="body" style={styles.cardTitle}>
                {getDisplayName(item)}
              </ThemedText>
            </View>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: overdue
                    ? fullTheme.colors.error + "20"
                    : fullTheme.colors.success + "20",
                },
              ]}
            >
              <ThemedText
                type="small"
                style={{
                  color: overdue ? fullTheme.colors.error : fullTheme.colors.success,
                  fontWeight: "600",
                }}
              >
                {overdue
                  ? t.inspections.agenda.labels.overdue
                  : t.inspections.agenda.labels.upcoming}
              </ThemedText>
            </View>
          </View>

          <Spacer height={Spacing.sm} />

          <View style={styles.cardDetails}>
            <ThemedText type="small" secondary>
              {getInspectionTypeLabel(item.inspectionType, language)}
            </ThemedText>
            <ThemedText type="small" secondary>
              {getFrequencyLabel(item.frequency, language)}
            </ThemedText>
          </View>

          <Spacer height={Spacing.md} />

          <View style={styles.cardDates}>
            <View style={styles.dateRow}>
              <Feather
                name="clock"
                size={14}
                color={overdue ? fullTheme.colors.error : fullTheme.colors.textSecondary}
              />
              <ThemedText
                type="small"
                style={{
                  color: overdue ? fullTheme.colors.error : fullTheme.colors.textSecondary,
                  marginLeft: Spacing.xs,
                }}
              >
                {t.inspections.agenda.labels.nextDueDate}: {formatDate(item.nextDueDate)}
              </ThemedText>
            </View>
            {item.lastInspectionDate ? (
              <View style={styles.dateRow}>
                <Feather
                  name="check-circle"
                  size={14}
                  color={fullTheme.colors.textSecondary}
                />
                <ThemedText type="small" secondary style={{ marginLeft: Spacing.xs }}>
                  {t.inspections.agenda.labels.lastInspection}: {formatDate(item.lastInspectionDate)}
                </ThemedText>
              </View>
            ) : null}
          </View>
        </Pressable>
        <Spacer height={Spacing.md} />
      </>
    );
  };

  const renderHeader = () => (
    <>
      <View style={styles.filterRow}>
        {(["all", "overdue", "upcoming"] as ScheduleFilter[]).map((filterKey) => (
          <Pressable
            key={filterKey}
            onPress={() => setFilter(filterKey)}
            style={[
              styles.filterChip,
              {
                backgroundColor:
                  filter === filterKey
                    ? fullTheme.colors.primary
                    : fullTheme.colors.cardBackground,
                borderColor: fullTheme.colors.border,
              },
            ]}
          >
            <ThemedText
              type="small"
              style={{
                color: filter === filterKey ? "#FFFFFF" : fullTheme.colors.textPrimary,
                fontWeight: "600",
              }}
            >
              {t.inspections.agenda.filters[filterKey]}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <Spacer height={Spacing.xl} />
    </>
  );

  const renderEmpty = () => (
    <View style={[styles.emptyState, { backgroundColor: fullTheme.colors.cardBackground }]}>
      <Feather name="calendar" size={48} color={fullTheme.colors.textSecondary} />
      <Spacer height={Spacing.md} />
      <ThemedText type="body" style={{ textAlign: "center", fontWeight: "600" }}>
        {t.inspections.agenda.emptyTitle}
      </ThemedText>
      <Spacer height={Spacing.sm} />
      <ThemedText type="small" secondary style={{ textAlign: "center" }}>
        {t.inspections.agenda.emptySubtitle}
      </ThemedText>
    </View>
  );

  return (
    <ScreenFlatList
      data={filteredSchedules}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmpty}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
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
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flex: 1,
  },
  cardTitle: {
    fontWeight: "600",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  cardDetails: {
    flexDirection: "row",
    gap: Spacing.lg,
  },
  cardDates: {
    gap: Spacing.xs,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  emptyState: {
    padding: Spacing["3xl"],
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingBottom: 40,
  },
});
