import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Image, Alert, ActivityIndicator } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as MailComposer from "expo-mail-composer";
import { Image as ExpoImage } from "expo-image";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useInspections, InspectionFrequency } from "@/contexts/InspectionContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { generateAndPrintPdf, generateAndSharePdf, generatePdfUri } from "@/utils/pdfGenerator";

const TAB_BAR_HEIGHT = 90;

type InspectionDetailScreenProps = NativeStackScreenProps<HomeStackParamList, "InspectionDetail">;

export default function InspectionDetailScreen({ navigation, route }: InspectionDetailScreenProps) {
  const { inspectionId } = route.params;
  const { fullTheme } = useTheme();
  const { t, language } = useLanguage();
  const { inspections, deleteInspection } = useInspections();
  const insets = useSafeAreaInsets();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

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
    const locale = language === "pt-BR" ? "pt-BR" : "en-US";
    return date.toLocaleDateString(locale, {
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
        return fullTheme.colors.success;
      case "in_progress":
        return fullTheme.colors.warning;
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
      default:
        return t.inspections.status.pending;
    }
  };

  const getFrequencyLabel = (freq: InspectionFrequency) => {
    const frequencyMapping: Record<InspectionFrequency, keyof typeof t.form.frequencies> = {
      daily: "daily",
      weekly: "weekly",
      monthly: "monthly",
      quarterly: "quarterly",
      annually: "annually",
      five_years: "fiveYears",
    };
    return t.form.frequencies[frequencyMapping[freq]];
  };

  const handleEdit = () => {
    navigation.navigate("InspectionForm", { type: inspection.type, inspectionId: inspection.id });
  };

  const handleDelete = () => {
    Alert.alert(
      t.common.delete,
      t.common.deleteConfirmation,
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

  const handlePrintPdf = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      await generateAndPrintPdf({
        inspection,
        language: language as "en" | "pt-BR",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      Alert.alert(t.common.error, t.report.shareError);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSharePdf = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      await generateAndSharePdf({
        inspection,
        language: language as "en" | "pt-BR",
      });
    } catch (error) {
      console.error("Error sharing PDF:", error);
      Alert.alert(t.common.error, t.report.shareError);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleEmailPdf = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      const isAvailable = await MailComposer.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert(t.common.error, t.common.emailNotAvailable);
        setIsGeneratingPdf(false);
        return;
      }

      const pdfUri = await generatePdfUri({
        inspection,
        language: language as "en" | "pt-BR",
      });

      await MailComposer.composeAsync({
        subject: `${t.report.title} - ${inspection.propertyName}`,
        body: `${t.report.inspectionDetails}\n\n${getTypeLabel()}\n${formatDate(inspection.date)}`,
        attachments: [pdfUri],
      });
    } catch (error) {
      console.error("Error emailing PDF:", error);
      Alert.alert(t.common.error, t.report.shareError);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const showShareOptions = () => {
    Alert.alert(
      t.report.share,
      "",
      [
        { text: t.report.generate, onPress: handlePrintPdf },
        { text: t.report.share, onPress: handleSharePdf },
        { text: t.report.email, onPress: handleEmailPdf },
        { text: t.common.cancel, style: "cancel" },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + TAB_BAR_HEIGHT + Spacing.xl },
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
          <ThemedText type="body" secondary>
            {getTypeLabel()}
          </ThemedText>
        </View>

        <Spacer height={Spacing["2xl"]} />

        <View style={[styles.infoCard, { backgroundColor: fullTheme.colors.cardBackground, borderColor: fullTheme.colors.border }]}>
          <InfoRow icon="map-pin" label={t.form.propertyAddress} value={inspection.propertyAddress || "-"} />
          <InfoRow icon="phone" label={t.form.propertyPhone} value={inspection.propertyPhone || "-"} />
          <InfoRow icon="user" label={t.form.inspector} value={inspection.inspectorName || "-"} />
          <InfoRow icon="file-text" label={t.form.contractNo} value={inspection.contractNo || "-"} />
          <InfoRow icon="calendar" label={t.form.date} value={formatDate(inspection.date)} />
          <InfoRow icon="clock" label={t.form.frequency} value={getFrequencyLabel(inspection.frequency)} isLast />
        </View>

        <Spacer height={Spacing["2xl"]} />

        <ThemedText type="h2">{t.checklist.title}</ThemedText>
        <Spacer height={Spacing.lg} />

        <View style={[styles.checklistCard, { backgroundColor: fullTheme.colors.cardBackground, borderColor: fullTheme.colors.border }]}>
          {inspection.checklist.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.checklistItem,
                index < inspection.checklist.length - 1 && styles.checklistItemBorder,
                { borderBottomColor: fullTheme.colors.border },
              ]}
            >
              <ThemedText type="body" style={styles.checklistLabel}>
                {item.label}
              </ThemedText>
              <View style={styles.checklistValue}>
                {item.value === "yes" ? (
                  <View style={[styles.valueBadge, { backgroundColor: `${fullTheme.colors.success}20` }]}>
                    <Feather name="check" size={14} color={fullTheme.colors.success} />
                    <ThemedText type="small" style={{ color: fullTheme.colors.success, marginLeft: 4 }}>
                      {t.checklist.yes}
                    </ThemedText>
                  </View>
                ) : null}
                {item.value === "no" ? (
                  <View style={[styles.valueBadge, { backgroundColor: `${fullTheme.colors.error}20` }]}>
                    <Feather name="x" size={14} color={fullTheme.colors.error} />
                    <ThemedText type="small" style={{ color: fullTheme.colors.error, marginLeft: 4 }}>
                      {t.checklist.no}
                    </ThemedText>
                  </View>
                ) : null}
                {item.value === "na" ? (
                  <View style={[styles.valueBadge, { backgroundColor: `${fullTheme.colors.textSecondary}20` }]}>
                    <Feather name="minus" size={14} color={fullTheme.colors.textSecondary} />
                    <ThemedText type="small" style={{ color: fullTheme.colors.textSecondary, marginLeft: 4 }}>
                      {t.checklist.na}
                    </ThemedText>
                  </View>
                ) : null}
                {item.value === null ? (
                  <ThemedText type="small" secondary>-</ThemedText>
                ) : null}
                {item.psiValue ? (
                  <ThemedText type="small" secondary style={{ marginLeft: Spacing.sm }}>
                    {item.psiValue} psi
                  </ThemedText>
                ) : null}
              </View>
            </View>
          ))}
        </View>

        {inspection.photos && inspection.photos.length > 0 ? (
          <>
            <Spacer height={Spacing["2xl"]} />
            <ThemedText type="h2">{t.form.photos}</ThemedText>
            <Spacer height={Spacing.md} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photosContainer}
            >
              {inspection.photos.map((photo) => (
                <View key={photo.id} style={[styles.photoCard, { backgroundColor: fullTheme.colors.cardBackground }]}>
                  <ExpoImage
                    source={{ uri: photo.uri }}
                    style={styles.photoImage}
                    contentFit="cover"
                  />
                  {photo.caption ? (
                    <ThemedText type="small" style={styles.photoCaption}>
                      {photo.caption}
                    </ThemedText>
                  ) : null}
                </View>
              ))}
            </ScrollView>
          </>
        ) : null}

        {inspection.observations ? (
          <>
            <Spacer height={Spacing["2xl"]} />
            <ThemedText type="h2">{t.form.observations}</ThemedText>
            <Spacer height={Spacing.md} />
            <View style={[styles.observationsCard, { backgroundColor: fullTheme.colors.cardBackground, borderColor: fullTheme.colors.border }]}>
              <ThemedText type="body">{inspection.observations}</ThemedText>
            </View>
          </>
        ) : null}

        {inspection.signature ? (
          <>
            <Spacer height={Spacing["2xl"]} />
            <ThemedText type="h2">{t.form.signature}</ThemedText>
            <Spacer height={Spacing.md} />
            <View style={[styles.signatureCard, { backgroundColor: fullTheme.colors.cardBackground, borderColor: fullTheme.colors.border }]}>
              <Image
                source={{ uri: inspection.signature }}
                style={styles.signatureImage}
                resizeMode="contain"
              />
            </View>
          </>
        ) : null}

        <Spacer height={Spacing["3xl"]} />

        <Button onPress={showShareOptions} disabled={isGeneratingPdf}>
          <View style={styles.buttonContent}>
            {isGeneratingPdf ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Feather name="share-2" size={18} color="#FFFFFF" />
                <ThemedText type="body" style={{ color: "#FFFFFF", marginLeft: Spacing.sm }}>
                  {t.report.share}
                </ThemedText>
              </>
            )}
          </View>
        </Button>

        <Spacer height={Spacing.md} />

        <View style={styles.actionRow}>
          <Button onPress={handleEdit} style={[styles.actionButton, { backgroundColor: fullTheme.colors.primaryDark }]}>
            {t.common.edit}
          </Button>
          <Button onPress={handleDelete} style={[styles.actionButton, { backgroundColor: fullTheme.colors.error }]}>
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
  const { fullTheme } = useTheme();
  return (
    <View
      style={[
        styles.infoRow,
        !isLast && styles.infoRowBorder,
        { borderBottomColor: fullTheme.colors.border },
      ]}
    >
      <View style={styles.infoRowLeft}>
        <Feather name={icon} size={18} color={fullTheme.colors.textSecondary} />
        <ThemedText type="small" secondary style={{ marginLeft: Spacing.sm }}>
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
    borderWidth: 1,
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
    borderWidth: 1,
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
    borderWidth: 1,
  },
  signatureCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: "center",
    borderWidth: 1,
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
  photosContainer: {
    gap: Spacing.md,
    paddingRight: Spacing.md,
  },
  photoCard: {
    width: 180,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  photoImage: {
    width: 180,
    height: 140,
  },
  photoCaption: {
    padding: Spacing.sm,
    fontSize: 11,
  },
});
