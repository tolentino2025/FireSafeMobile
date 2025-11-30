import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, TextInput, Pressable, Alert, Platform } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
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
import { SelectPicker } from "@/components/SelectPicker";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useInspections, Inspection, ChecklistItem, InspectionType, InspectionFrequency, InspectionPhoto, Company, AppUser, FirePump, FirePumpControlPanel } from "@/contexts/InspectionContext";
import { Spacing, BorderRadius, AppColors } from "@/constants/theme";
import { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import { getChecklistForType } from "@/utils/checklistTemplates";
import { scheduleInspectionReminder } from "@/utils/notifications";
import { toUpperIfNotEmail } from "@/utils/textTransform";

type InspectionFormScreenProps = NativeStackScreenProps<HomeStackParamList, "InspectionForm">;

const frequencies: InspectionFrequency[] = ["daily", "weekly", "monthly", "quarterly", "annually", "five_years"];

export default function InspectionFormScreen({ navigation, route }: InspectionFormScreenProps) {
  const { type, inspectionId } = route.params;
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const { inspections, addInspection, updateInspection, companies, appUsers, firePumps, firePumpPanels, getFirePumpsByCompany, getPanelsByPump } = useInspections();

  const existingInspection = inspectionId
    ? inspections.find((i) => i.id === inspectionId)
    : undefined;

  const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>(existingInspection?.companyId);
  const [selectedInspectorId, setSelectedInspectorId] = useState<string | undefined>(existingInspection?.inspectorId);
  const [selectedFirePumpId, setSelectedFirePumpId] = useState<string | undefined>(existingInspection?.firePumpId);
  const [selectedFirePumpPanelId, setSelectedFirePumpPanelId] = useState<string | undefined>(existingInspection?.firePumpPanelId);
  const [propertyName, setPropertyName] = useState(existingInspection?.propertyName || "");
  const [propertyAddress, setPropertyAddress] = useState(existingInspection?.propertyAddress || "");
  const [propertyPhone, setPropertyPhone] = useState(existingInspection?.propertyPhone || "");
  const [inspectorName, setInspectorName] = useState(existingInspection?.inspectorName || "");
  const [inspectorEmail, setInspectorEmail] = useState(existingInspection?.inspectorData?.email || "");
  const [inspectorPhone, setInspectorPhone] = useState(existingInspection?.inspectorData?.phone || "");
  const [contractNo, setContractNo] = useState(existingInspection?.contractNo || "");
  const [date, setDate] = useState(existingInspection?.date || new Date().toISOString().split("T")[0]);
  const [frequency, setFrequency] = useState<InspectionFrequency>(existingInspection?.frequency || "weekly");
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    existingInspection?.checklist || getChecklistForType(type, existingInspection?.frequency || "weekly", t.checklistItems)
  );
  const [observations, setObservations] = useState(existingInspection?.observations || "");
  const [signature, setSignature] = useState<string | null>(existingInspection?.signature || null);
  const [photos, setPhotos] = useState<InspectionPhoto[]>(existingInspection?.photos || []);
  const [autoSaved, setAutoSaved] = useState(false);
  const [isNewInspection] = useState(!existingInspection);

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

  useEffect(() => {
    if (isNewInspection) {
      setChecklist(getChecklistForType(type, frequency, t.checklistItems));
    }
  }, [frequency, type, isNewInspection]);

  const handleCompanySelect = (companyId: string) => {
    setSelectedCompanyId(companyId);
    const company = companies.find((c) => c.id === companyId);
    if (company) {
      setPropertyName(company.name);
      setPropertyAddress(
        [company.address, company.city, company.state, company.zipCode]
          .filter(Boolean)
          .join(", ")
      );
      setPropertyPhone(company.contactPhone);
    }
  };

  const handleInspectorSelect = (inspectorId: string) => {
    setSelectedInspectorId(inspectorId);
    const inspector = appUsers.find((u) => u.id === inspectorId);
    if (inspector) {
      setInspectorName(inspector.name);
      setInspectorEmail(inspector.email);
      setInspectorPhone(inspector.phone);
    }
  };

  const isPumpInspection = type === "pump_weekly" || type === "pump_monthly" || type === "pump_annual";

  const handleFirePumpSelect = (pumpId: string) => {
    setSelectedFirePumpId(pumpId);
    setSelectedFirePumpPanelId(undefined);
  };

  const handleFirePumpPanelSelect = (panelId: string) => {
    setSelectedFirePumpPanelId(panelId);
  };

  const availablePumps = selectedCompanyId ? getFirePumpsByCompany(selectedCompanyId) : [];
  const availablePanels = selectedFirePumpId ? getPanelsByPump(selectedFirePumpId) : [];

  const getPumpTypeLabel = (pumpType: string) => {
    switch (pumpType) {
      case "electric_main":
        return t.firePumps.electricMain;
      case "diesel_main":
        return t.firePumps.dieselMain;
      case "jockey":
        return t.firePumps.jockey;
      default:
        return pumpType;
    }
  };

  const pumpOptions = availablePumps.map((pump) => ({
    id: pump.id,
    label: `${pump.tag} - ${getPumpTypeLabel(pump.type)}`,
    sublabel: pump.manufacturer && pump.model ? `${pump.manufacturer} ${pump.model}` : pump.manufacturer || "",
  }));

  const panelOptions = availablePanels.map((panel) => ({
    id: panel.id,
    label: panel.tag,
    sublabel: panel.manufacturer && panel.model ? `${panel.manufacturer} ${panel.model}` : panel.startingType || "",
  }));

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

  const handleNumericFieldChange = (itemId: string, fieldId: string, value: string) => {
    setChecklist((prev) =>
      prev.map((item) => {
        if (item.id === itemId && item.numericFields) {
          return {
            ...item,
            numericFields: item.numericFields.map((field) =>
              field.id === fieldId ? { ...field, value } : field
            ),
          };
        }
        return item;
      })
    );
  };

  const handleNotesChange = (itemId: string, notes: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, notes } : item))
    );
  };

  const handleSubmit = async () => {
    if (!propertyName.trim()) {
      Alert.alert(t.common.error, t.form.required);
      return;
    }

    const selectedCompany = selectedCompanyId ? companies.find((c) => c.id === selectedCompanyId) : undefined;
    const selectedInspector = selectedInspectorId ? appUsers.find((u) => u.id === selectedInspectorId) : undefined;
    const selectedPump = selectedFirePumpId ? firePumps.find((p) => p.id === selectedFirePumpId) : undefined;
    const selectedPanel = selectedFirePumpPanelId ? firePumpPanels.find((p) => p.id === selectedFirePumpPanelId) : undefined;

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
      companyId: selectedCompanyId,
      companyData: selectedCompany,
      inspectorId: selectedInspectorId,
      inspectorData: selectedInspector,
      firePumpId: isPumpInspection ? selectedFirePumpId : undefined,
      firePumpData: isPumpInspection ? selectedPump : undefined,
      firePumpPanelId: isPumpInspection ? selectedFirePumpPanelId : undefined,
      firePumpPanelData: isPumpInspection ? selectedPanel : undefined,
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
      console.error("Error saving inspection:", error);
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

  const companyOptions = companies.map((c) => ({
    id: c.id,
    label: c.name,
    sublabel: c.city ? `${c.city}, ${c.state}` : c.address,
  }));

  const inspectorOptions = appUsers.map((u) => ({
    id: u.id,
    label: u.name,
    sublabel: u.role || "Inspetor",
  }));

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

      <ThemedText type="h3">{t.companies.selectCompany}</ThemedText>
      <Spacer height={Spacing.sm} />
      <SelectPicker
        options={companyOptions}
        selectedId={selectedCompanyId}
        onSelect={handleCompanySelect}
        placeholder={t.companies.noCompanySelected}
        title={t.companies.selectCompany}
        emptyText={t.companies.noResults}
      />

      {isPumpInspection ? (
        <>
          <Spacer height={Spacing.lg} />
          <ThemedText type="h3">{t.firePumps.selectPump}</ThemedText>
          <Spacer height={Spacing.sm} />
          {selectedCompanyId ? (
            <SelectPicker
              options={pumpOptions}
              selectedId={selectedFirePumpId}
              onSelect={handleFirePumpSelect}
              placeholder={t.firePumps.noPumpSelected}
              title={t.firePumps.selectPump}
              emptyText={t.firePumps.noResults}
            />
          ) : (
            <ThemedText type="small" secondary>{t.firePumps.selectCompanyFirst}</ThemedText>
          )}

          {selectedFirePumpId ? (
            <>
              <Spacer height={Spacing.lg} />
              <ThemedText type="h3">{t.firePumps.selectPanel}</ThemedText>
              <Spacer height={Spacing.sm} />
              <SelectPicker
                options={panelOptions}
                selectedId={selectedFirePumpPanelId}
                onSelect={handleFirePumpPanelSelect}
                placeholder={t.firePumps.noPanelSelected}
                title={t.firePumps.selectPanel}
                emptyText={t.firePumps.noPanels}
              />
            </>
          ) : null}
        </>
      ) : null}

      <Spacer height={Spacing.lg} />

      <ThemedText type="h3">{t.form.propertyName}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={propertyName}
        onChangeText={(text) => setPropertyName(toUpperIfNotEmail(text, "propertyName"))}
        placeholder={t.form.propertyName}
        placeholderTextColor={theme.placeholder}
        autoCapitalize="characters"
      />

      <Spacer height={Spacing.lg} />

      <ThemedText type="h3">{t.form.propertyAddress}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={propertyAddress}
        onChangeText={(text) => setPropertyAddress(toUpperIfNotEmail(text, "propertyAddress"))}
        placeholder={t.form.propertyAddress}
        placeholderTextColor={theme.placeholder}
        autoCapitalize="characters"
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
            onChangeText={(text) => setContractNo(toUpperIfNotEmail(text, "contractNo"))}
            placeholder={t.form.contractNo}
            placeholderTextColor={theme.placeholder}
            autoCapitalize="characters"
          />
        </View>
      </View>

      <Spacer height={Spacing["2xl"]} />

      <ThemedText type="h3">{t.users.selectInspector}</ThemedText>
      <Spacer height={Spacing.sm} />
      <SelectPicker
        options={inspectorOptions}
        selectedId={selectedInspectorId}
        onSelect={handleInspectorSelect}
        placeholder={t.users.noInspectorSelected}
        title={t.users.selectInspector}
        emptyText={t.users.noResults}
      />

      <Spacer height={Spacing.lg} />

      <ThemedText type="h3">{t.form.inspector}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={inspectorName}
        onChangeText={(text) => setInspectorName(toUpperIfNotEmail(text, "inspectorName"))}
        placeholder={t.form.inspector}
        placeholderTextColor={theme.placeholder}
        autoCapitalize="characters"
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
        </View>
      </View>

      <Spacer height={Spacing.sm} />

      <View style={styles.frequencyGrid}>
        {frequencies.map((freq) => (
          <Pressable
            key={freq}
            onPress={() => setFrequency(freq)}
            style={[
              styles.frequencyChip,
              {
                backgroundColor:
                  frequency === freq ? AppColors.primary : theme.backgroundDefault,
                borderWidth: 1,
                borderColor: frequency === freq ? AppColors.primary : theme.border,
              },
            ]}
          >
            <ThemedText
              type="small"
              style={{
                color: frequency === freq ? "#FFFFFF" : theme.text,
                fontSize: 12,
                fontWeight: frequency === freq ? "600" : "400",
              }}
            >
              {getFrequencyLabel(freq)}
            </ThemedText>
          </Pressable>
        ))}
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
          onNumericFieldChange={(fieldId, value) => handleNumericFieldChange(item.id, fieldId, value)}
          onNotesChange={(notes) => handleNotesChange(item.id, notes)}
          showNotes={true}
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
        onChangeText={(text) => setObservations(toUpperIfNotEmail(text, "observations"))}
        placeholder={t.form.observations}
        placeholderTextColor={theme.placeholder}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        autoCapitalize="characters"
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
  frequencyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  frequencyChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  textArea: {
    height: 120,
    paddingTop: Spacing.md,
  },
});
