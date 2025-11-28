import React from "react";
import { View, StyleSheet, ScrollView, Image, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useInspections } from "@/contexts/InspectionContext";
import { Spacing, BorderRadius, AppColors } from "@/constants/theme";
import { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type InspectionDetailScreenProps = NativeStackScreenProps<HomeStackParamList, "InspectionDetail">;

export default function InspectionDetailScreen({ navigation, route }: InspectionDetailScreenProps) {
  const { inspectionId } = route.params;
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { inspections, deleteInspection } = useInspections();
  const insets = useSafeAreaInsets();

  const inspection = inspections.find((i) => i.id === inspectionId);

  if (!inspection) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="body">{t.common.error}</ThemedText>
      </ThemedView>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getTypeLabel = () => {
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
      aboveground: "aboveground",
      underground: "underground",
      hydrant_flow: "hydrantFlow",
      water_tank: "waterTank",
      hazard_eval: "hazardEval",
      standpipe: "standpipe",
    };
    return t.inspectionTypes[mapping[inspection.type] || "wetPipe"];
  };

  const getStatusColor = () => {
    switch (inspection.status) {
      case "completed":
        return AppColors.success;
      case "in_progress":
        return AppColors.warning;
      default:
        return AppColors.secondary;
    }
  };

  const getStatusLabel = () => {
    switch (inspection.status) {
      case "completed":
        return t.inspections.status.completed;
      case "in_progress":
        return t.inspections.status.inProgress;
      default:
        return t.inspections.status.pending;
    }
  };

  const handleEdit = () => {
    navigation.navigate("InspectionForm", { type: inspection.type, inspectionId: inspection.id });
  };

  const handleDelete = () => {
    Alert.alert(
      t.common.delete,
      "Are you sure you want to delete this inspection?",
      [
        { text: t.common.cancel, style: "cancel" },
        {
          text: t.common.delete,
          style: "destructive",
          onPress: async () => {
            await deleteInspection(inspection.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleExportPDF = () => {
    Alert.alert("Export PDF", "PDF export functionality will be available in the next version.");
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor()}20` }]}>
            <ThemedText type="small" style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusLabel()}
            </ThemedText>
          </View>
          <ThemedText type="h1">{inspection.propertyName}</ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            {getTypeLabel()}
          </ThemedText>
        </View>

        <Spacer height={Spacing["2xl"]} />

        <View style={[styles.infoCard, { backgroundColor: theme.backgroundDefault }]}>
          <InfoRow icon="map-pin" label={t.form.propertyAddress} value={inspection.propertyAddress || "-"} />
          <InfoRow icon="phone" label={t.form.propertyPhone} value={inspection.propertyPhone || "-"} />
          <InfoRow icon="user" label={t.form.inspector} value={inspection.inspectorName || "-"} />
          <InfoRow icon="file-text" label={t.form.contractNo} value={inspection.contractNo || "-"} />
          <InfoRow icon="calendar" label={t.form.date} value={formatDate(inspection.date)} />
          <InfoRow icon="clock" label={t.form.frequency} value={t.form.frequencies[inspection.frequency]} isLast />
        </View>

        <Spacer height={Spacing["2xl"]} />

        <ThemedText type="h2">Checklist</ThemedText>
        <Spacer height={Spacing.lg} />

        <View style={[styles.checklistCard, { backgroundColor: theme.backgroundDefault }]}>
          {inspection.checklist.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.checklistItem,
                index < inspection.checklist.length - 1 && styles.checklistItemBorder,
                { borderBottomColor: theme.border },
              ]}
            >
              <ThemedText type="body" style={styles.checklistLabel}>
                {item.label}
              </ThemedText>
              <View style={styles.checklistValue}>
                {item.value === "yes" && (
                  <View style={[styles.valueBadge, { backgroundColor: `${AppColors.success}20` }]}>
                    <Feather name="check" size={14} color={AppColors.success} />
                    <ThemedText type="small" style={{ color: AppColors.success, marginLeft: 4 }}>
                      {t.checklist.yes}
                    </ThemedText>
                  </View>
                )}
                {item.value === "no" && (
                  <View style={[styles.valueBadge, { backgroundColor: `${AppColors.error}20` }]}>
                    <Feather name="x" size={14} color={AppColors.error} />
                    <ThemedText type="small" style={{ color: AppColors.error, marginLeft: 4 }}>
                      {t.checklist.no}
                    </ThemedText>
                  </View>
                )}
                {item.value === "na" && (
                  <View style={[styles.valueBadge, { backgroundColor: `${theme.textSecondary}20` }]}>
                    <Feather name="minus" size={14} color={theme.textSecondary} />
                    <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: 4 }}>
                      {t.checklist.na}
                    </ThemedText>
                  </View>
                )}
                {item.value === null && (
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>-</ThemedText>
                )}
                {item.psiValue && (
                  <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: Spacing.sm }}>
                    {item.psiValue} psi
                  </ThemedText>
                )}
              </View>
            </View>
          ))}
        </View>

        {inspection.observations && (
          <>
            <Spacer height={Spacing["2xl"]} />
            <ThemedText type="h2">{t.form.observations}</ThemedText>
            <Spacer height={Spacing.md} />
            <View style={[styles.observationsCard, { backgroundColor: theme.backgroundDefault }]}>
              <ThemedText type="body">{inspection.observations}</ThemedText>
            </View>
          </>
        )}

        {inspection.signature && (
          <>
            <Spacer height={Spacing["2xl"]} />
            <ThemedText type="h2">{t.form.signature}</ThemedText>
            <Spacer height={Spacing.md} />
            <View style={[styles.signatureCard, { backgroundColor: theme.backgroundDefault }]}>
              <Image
                source={{ uri: inspection.signature }}
                style={styles.signatureImage}
                resizeMode="contain"
              />
            </View>
          </>
        )}

        <Spacer height={Spacing["3xl"]} />

        <Button onPress={handleExportPDF}>
          <View style={styles.buttonContent}>
            <Feather name="download" size={18} color="#FFFFFF" />
            <ThemedText type="body" style={{ color: "#FFFFFF", marginLeft: Spacing.sm }}>
              Export PDF
            </ThemedText>
          </View>
        </Button>

        <Spacer height={Spacing.md} />

        <View style={styles.actionRow}>
          <Button onPress={handleEdit} style={[styles.actionButton, { backgroundColor: AppColors.secondary }]}>
            {t.common.edit}
          </Button>
          <Button onPress={handleDelete} style={[styles.actionButton, { backgroundColor: AppColors.error }]}>
            {t.common.delete}
          </Button>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

interface InfoRowProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  isLast?: boolean;
}

function InfoRow({ icon, label, value, isLast }: InfoRowProps) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.infoRow,
        !isLast && styles.infoRowBorder,
        { borderBottomColor: theme.border },
      ]}
    >
      <View style={styles.infoRowLeft}>
        <Feather name={icon} size={18} color={theme.textSecondary} />
        <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: Spacing.sm }}>
          {label}
        </ThemedText>
      </View>
      <ThemedText type="body" style={styles.infoRowValue}>
        {value}
      </ThemedText>
    </View>
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
    paddingTop: Spacing.xl,
  },
  headerSection: {
    alignItems: "flex-start",
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  infoCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
  },
  infoRowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoRowValue: {
    flex: 1,
    textAlign: "right",
  },
  checklistCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  checklistItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  checklistItemBorder: {
    borderBottomWidth: 1,
  },
  checklistLabel: {
    flex: 1,
    marginRight: Spacing.md,
  },
  checklistValue: {
    flexDirection: "row",
    alignItems: "center",
  },
  valueBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  observationsCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  signatureCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: "center",
  },
  signatureImage: {
    width: "100%",
    height: 150,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  actionRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
