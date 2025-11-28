import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, TextInput, Pressable, Alert, Platform } from "react-native";
import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
} from "react-native-reanimated";

import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { ChecklistItemRow } from "@/components/ChecklistItemRow";
import { SignatureCapture } from "@/components/SignatureCapture";
import { PhotoCapture } from "@/components/PhotoCapture";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useInspections, Inspection, ChecklistItem, InspectionType, InspectionFrequency, InspectionPhoto } from "@/contexts/InspectionContext";
import { Spacing, BorderRadius, AppColors } from "@/constants/theme";
import { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import { getChecklistForType } from "@/utils/checklistTemplates";
import { scheduleInspectionReminder, cancelInspectionReminder } from "@/utils/notifications";

type InspectionFormScreenProps = NativeStackScreenProps<HomeStackParamList, "InspectionForm">;

const frequencies: InspectionFrequency[] = ["daily", "weekly", "monthly", "quarterly", "annually", "five_years"];

export default function InspectionFormScreen({ navigation, route }: InspectionFormScreenProps) {
  const { type, inspectionId } = route.params;
  const { theme, isDark } = useTheme();
  const { t, language } = useLanguage();
  const { inspections, addInspection, updateInspection, properties } = useInspections();

  const existingInspection = inspectionId
    ? inspections.find((i) => i.id === inspectionId)
    : undefined;

  const [propertyName, setPropertyName] = useState(existingInspection?.propertyName || "");
  const [propertyAddress, setPropertyAddress] = useState(existingInspection?.propertyAddress || "");
  const [propertyPhone, setPropertyPhone] = useState(existingInspection?.propertyPhone || "");
  const [inspectorName, setInspectorName] = useState(existingInspection?.inspectorName || "");
  const [contractNo, setContractNo] = useState(existingInspection?.contractNo || "");
  const [date, setDate] = useState(existingInspection?.date || new Date().toISOString().split("T")[0]);
  const [frequency, setFrequency] = useState<InspectionFrequency>(existingInspection?.frequency || "weekly");
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    existingInspection?.checklist || getChecklistForType(type)
  );
  const [observations, setObservations] = useState(existingInspection?.observations || "");
  const [signature, setSignature] = useState<string | null>(existingInspection?.signature || null);
  const [photos, setPhotos] = useState<InspectionPhoto[]>(existingInspection?.photos || []);
  const [autoSaved, setAutoSaved] = useState(false);

  const autoSaveOpacity = useSharedValue(0);

  const autoSaveStyle = useAnimatedStyle(() => ({
    opacity: autoSaveOpacity.value,
  }));

  const showAutoSaveIndicator = useCallback(() => {
    autoSaveOpacity.value = withSequence(
      withSpring(1, { damping: 15 }),
      withRepeat(
        withSequence(
          withSpring(0.5, { damping: 15 }),
          withSpring(1, { damping: 15 })
        ),
        2
      ),
      withSpring(0, { damping: 15 })
    );
    setAutoSaved(true);
    setTimeout(() => setAutoSaved(false), 3000);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (propertyName || observations || checklist.some((item) => item.value !== null)) {
        showAutoSaveIndicator();
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [propertyName, observations, checklist, showAutoSaveIndicator]);

  const handleChecklistChange = (id: string, value: "yes" | "no" | "na" | null) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, value } : item))
    );
  };

  const handleChecklistPsiChange = (id: string, psiValue: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, psiValue } : item))
    );
  };

  const handleSubmit = async () => {
    if (!propertyName.trim()) {
      Alert.alert(t.common.error, t.form.required);
      return;
    }

    const inspectionData: Inspection = {
      id: existingInspection?.id || Date.now().toString(),
      type,
      status: "completed",
      propertyId: "",
      propertyName,
      propertyAddress,
      propertyPhone,
      inspectorName,
      contractNo,
      date,
      frequency,
      checklist,
      observations,
      signature,
      photos,
      createdAt: existingInspection?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (existingInspection) {
        await updateInspection(existingInspection.id, inspectionData);
      } else {
        await addInspection(inspectionData);
      }
      
      const schedulingResult = await scheduleNextInspectionReminder(inspectionData);
      
      if (schedulingResult && (schedulingResult.notificationId || schedulingResult.scheduledDate)) {
        await updateInspection(inspectionData.id, {
          notificationId: schedulingResult.notificationId || undefined,
          scheduledDate: schedulingResult.scheduledDate,
        });
      }
      
      navigation.goBack();
    } catch (error) {
      Alert.alert(t.common.error, t.report.shareError);
    }
  };
  
  const scheduleNextInspectionReminder = async (inspection: Inspection): Promise<{ notificationId: string | null; scheduledDate: string } | null> => {
    try {
      const inspectionDate = new Date(inspection.date);
      let nextDate = new Date(inspectionDate);
      
      switch (inspection.frequency) {
        case "daily":
          nextDate.setDate(nextDate.getDate() + 1);
          break;
        case "weekly":
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case "monthly":
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        case "quarterly":
          nextDate.setMonth(nextDate.getMonth() + 3);
          break;
        case "annually":
          nextDate.setFullYear(nextDate.getFullYear() + 1);
          break;
        case "five_years":
          nextDate.setFullYear(nextDate.getFullYear() + 5);
          break;
      }
      
      if (nextDate > new Date()) {
        const notificationId = await scheduleInspectionReminder({
          inspectionId: inspection.id,
          propertyName: inspection.propertyName,
          inspectionType: t.inspectionTypes[getTypeKey(inspection.type)],
          scheduledDate: nextDate,
          language: language as "en" | "pt-BR",
        });
        
        return {
          notificationId,
          scheduledDate: nextDate.toISOString(),
        };
      }
      return null;
    } catch (error) {
      console.log("Could not schedule notification:", error);
      return null;
    }
  };
  
  const getTypeKey = (type: InspectionType): keyof typeof t.inspectionTypes => {
    const mapping: Record<InspectionType, keyof typeof t.inspectionTypes> = {
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
    return mapping[type];
  };

  const getFrequencyLabel = (freq: InspectionFrequency) => {
    return t.form.frequencies[freq];
  };

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border },
  ];

  return (
    <ScreenKeyboardAwareScrollView>
      <Animated.View style={[styles.autoSaveIndicator, autoSaveStyle]}>
        <Feather name="check-circle" size={14} color={AppColors.success} />
        <ThemedText type="small" style={{ color: AppColors.success, marginLeft: Spacing.xs }}>
          {t.form.autoSaved}
        </ThemedText>
      </Animated.View>

      <ThemedText type="h3">{t.form.propertyName}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={propertyName}
        onChangeText={setPropertyName}
        placeholder={t.form.propertyName}
        placeholderTextColor={theme.placeholder}
      />

      <Spacer height={Spacing.lg} />

      <ThemedText type="h3">{t.form.propertyAddress}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={propertyAddress}
        onChangeText={setPropertyAddress}
        placeholder={t.form.propertyAddress}
        placeholderTextColor={theme.placeholder}
      />

      <Spacer height={Spacing.lg} />

      <View style={styles.row}>
        <View style={styles.halfField}>
          <ThemedText type="h3">{t.form.propertyPhone}</ThemedText>
          <Spacer height={Spacing.sm} />
          <TextInput
            style={inputStyle}
            value={propertyPhone}
            onChangeText={setPropertyPhone}
            placeholder={t.form.propertyPhone}
            placeholderTextColor={theme.placeholder}
            keyboardType="phone-pad"
          />
        </View>
        <View style={styles.halfField}>
          <ThemedText type="h3">{t.form.contractNo}</ThemedText>
          <Spacer height={Spacing.sm} />
          <TextInput
            style={inputStyle}
            value={contractNo}
            onChangeText={setContractNo}
            placeholder={t.form.contractNo}
            placeholderTextColor={theme.placeholder}
          />
        </View>
      </View>

      <Spacer height={Spacing.lg} />

      <ThemedText type="h3">{t.form.inspector}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={inspectorName}
        onChangeText={setInspectorName}
        placeholder={t.form.inspector}
        placeholderTextColor={theme.placeholder}
      />

      <Spacer height={Spacing.lg} />

      <View style={styles.row}>
        <View style={styles.halfField}>
          <ThemedText type="h3">{t.form.date}</ThemedText>
          <Spacer height={Spacing.sm} />
          <TextInput
            style={inputStyle}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.placeholder}
          />
        </View>
        <View style={styles.halfField}>
          <ThemedText type="h3">{t.form.frequency}</ThemedText>
          <Spacer height={Spacing.sm} />
          <View style={styles.frequencyRow}>
            {frequencies.slice(0, 3).map((freq) => (
              <Pressable
                key={freq}
                onPress={() => setFrequency(freq)}
                style={[
                  styles.frequencyChip,
                  {
                    backgroundColor:
                      frequency === freq ? AppColors.primary : theme.backgroundDefault,
                  },
                ]}
              >
                <ThemedText
                  type="small"
                  style={{
                    color: frequency === freq ? "#FFFFFF" : theme.text,
                    fontSize: 11,
                  }}
                >
                  {getFrequencyLabel(freq)}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      <Spacer height={Spacing["3xl"]} />

      <ThemedText type="h2">Checklist</ThemedText>
      <Spacer height={Spacing.lg} />

      {checklist.map((item) => (
        <ChecklistItemRow
          key={item.id}
          item={item}
          onValueChange={(value) => handleChecklistChange(item.id, value)}
          onPsiChange={(psi) => handleChecklistPsiChange(item.id, psi)}
        />
      ))}

      <Spacer height={Spacing["2xl"]} />

      <ThemedText type="h3">{t.form.photos}</ThemedText>
      <Spacer height={Spacing.sm} />
      <PhotoCapture photos={photos} onPhotosChange={setPhotos} />

      <Spacer height={Spacing["2xl"]} />

      <ThemedText type="h3">{t.form.observations}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={[inputStyle, styles.textArea]}
        value={observations}
        onChangeText={setObservations}
        placeholder={t.form.observations}
        placeholderTextColor={theme.placeholder}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <Spacer height={Spacing["2xl"]} />

      <ThemedText type="h3">{t.form.signature}</ThemedText>
      <Spacer height={Spacing.sm} />
      <SignatureCapture
        signature={signature}
        onSignatureChange={setSignature}
      />

      <Spacer height={Spacing["3xl"]} />

      <Button onPress={handleSubmit}>{t.form.submit}</Button>

      <Spacer height={Spacing["4xl"]} />
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  autoSaveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  input: {
    height: Spacing.inputHeight,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  halfField: {
    flex: 1,
  },
  frequencyRow: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  frequencyChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  textArea: {
    height: 120,
    paddingTop: Spacing.md,
  },
});
