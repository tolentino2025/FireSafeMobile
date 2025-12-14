import React, { useState, useCallback, useEffect, useRef } from "react";
import { View, StyleSheet, TextInput, Pressable, Alert, Switch, Platform } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { SelectPicker } from "@/components/SelectPicker";
import { SignatureCapture } from "@/components/SignatureCapture";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useInspections } from "@/contexts/InspectionContext";
import { Spacing, BorderRadius, AppColors } from "@/constants/theme";
import { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import {
  DieselPerformanceTest,
  DieselTestReading,
  createEmptyDieselPerformanceTest,
  createEmptyDieselTestReading,
  calculateNetPressure,
  Deficiency,
} from "@/types/performanceTest";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

type DieselPerformanceTestScreenProps = NativeStackScreenProps<HomeStackParamList, "DieselPerformanceTest">;

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  sectionRef?: React.RefObject<View>;
}

function SectionCard({ title, children, sectionRef }: SectionCardProps) {
  const { fullTheme } = useTheme();

  return (
    <View 
      ref={sectionRef}
      style={[styles.section, { backgroundColor: fullTheme.colors.cardBackground, borderColor: fullTheme.colors.border }]}
    >
      <View style={styles.sectionHeader}>
        <ThemedText type="h3" style={styles.sectionTitle}>{title}</ThemedText>
      </View>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );
}

interface SummaryHeaderProps {
  contractor: string;
  jobSite: string;
  inspector: string;
  pumpTag: string;
  testDate: string;
}

function SummaryHeader({ contractor, jobSite, inspector, pumpTag, testDate }: SummaryHeaderProps) {
  const { fullTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <View style={[styles.summaryHeader, { backgroundColor: fullTheme.colors.primary, borderColor: fullTheme.colors.primaryDark }]}>
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <ThemedText type="small" style={styles.summaryLabel}>
            {t.performanceTest?.contractor || "Contractor"}
          </ThemedText>
          <ThemedText type="body" style={styles.summaryValue}>
            {contractor || "-"}
          </ThemedText>
        </View>
        <View style={styles.summaryItem}>
          <ThemedText type="small" style={styles.summaryLabel}>
            {t.performanceTest?.jobSite || "Job/Site"}
          </ThemedText>
          <ThemedText type="body" style={styles.summaryValue}>
            {jobSite || "-"}
          </ThemedText>
        </View>
      </View>
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <ThemedText type="small" style={styles.summaryLabel}>
            {t.performanceTest?.inspector || "Inspector"}
          </ThemedText>
          <ThemedText type="body" style={styles.summaryValue}>
            {inspector || "-"}
          </ThemedText>
        </View>
        <View style={styles.summaryItem}>
          <ThemedText type="small" style={styles.summaryLabel}>
            {t.performanceTest?.pumpTag || "Pump"}
          </ThemedText>
          <ThemedText type="body" style={styles.summaryValue}>
            {pumpTag || "-"}
          </ThemedText>
        </View>
      </View>
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <ThemedText type="small" style={styles.summaryLabel}>
            {t.performanceTest?.testDate || "Test Date"}
          </ThemedText>
          <ThemedText type="body" style={styles.summaryValue}>
            {testDate || "-"}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const getDraftStorageKey = (id?: string) => `diesel_performance_test_draft_${id || 'new'}`;
const DIESEL_TESTS_STORAGE_KEY = "@firesafe_diesel_performance_tests";
const AUTO_SAVE_DELAY = 2000;

export default function DieselPerformanceTestScreen({ navigation, route }: DieselPerformanceTestScreenProps) {
  const { testId } = route.params || {};
  const { fullTheme } = useTheme();
  const { t } = useLanguage();
  const { contractors, jobSites, appUsers, firePumps, firePumpPanels, getJobSitesByContractor, getDieselPerformanceTestById, addDieselPerformanceTest, updateDieselPerformanceTest, getPanelsByPump } = useInspections();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const [test, setTest] = useState<Partial<DieselPerformanceTest>>(() => createEmptyDieselPerformanceTest());
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPumpId, setSelectedPumpId] = useState<string>("");
  const [selectedInspectorId, setSelectedInspectorId] = useState<string>("");
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const dieselPumps = firePumps.filter(p => p.type === "diesel_main");
  const inspectors = appUsers;

  const restoreSelectedIds = (testData: Partial<DieselPerformanceTest>) => {
    if (testData.pumpEquipment?.pumpTag) {
      const pump = dieselPumps.find(p => p.tag === testData.pumpEquipment?.pumpTag);
      if (pump) setSelectedPumpId(pump.id);
    }
    if (testData.signatures?.conductedBy?.name) {
      const inspector = inspectors.find(i => i.name === testData.signatures?.conductedBy?.name);
      if (inspector) setSelectedInspectorId(inspector.id);
    }
  };

  useEffect(() => {
    if (testId) {
      const existingTest = getDieselPerformanceTestById(testId);
      if (existingTest) {
        setTest(existingTest);
        restoreSelectedIds(existingTest);
        return;
      }
    }
    loadDraft();
  }, [testId]);

  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(() => {
      saveDraft();
    }, AUTO_SAVE_DELAY);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [test]);

  const activeDraftKeyRef = useRef<string | null>(null);

  const loadDraft = async () => {
    try {
      const key = getDraftStorageKey(testId || 'new');
      const data = await AsyncStorage.getItem(key);
      if (data) {
        const parsedDraft = JSON.parse(data);
        activeDraftKeyRef.current = key;
        setTest(parsedDraft);
        restoreSelectedIds(parsedDraft);
      } else {
        activeDraftKeyRef.current = key;
      }
    } catch (error) {
      console.error("Error loading draft:", error);
    }
  };

  const saveDraft = async () => {
    try {
      const key = getDraftStorageKey(test.id || testId || 'new');
      await AsyncStorage.setItem(key, JSON.stringify(test));
      activeDraftKeyRef.current = key;
    } catch (error) {
      console.error("Error saving draft:", error);
    }
  };

  const clearDraft = async () => {
    try {
      if (activeDraftKeyRef.current) {
        await AsyncStorage.removeItem(activeDraftKeyRef.current);
      }
    } catch (error) {
      console.error("Error clearing draft:", error);
    }
  };

  const handleContractorSelect = (contractorId: string) => {
    const contractor = contractors.find(c => c.id === contractorId);
    if (contractor) {
      setTest(prev => ({
        ...prev,
        contractorInfo: {
          ...prev.contractorInfo!,
          contractorId,
          companyName: contractor.name,
          address: contractor.address,
          city: contractor.city,
          state: contractor.state,
          zipCode: contractor.zipCode,
          phone: contractor.phone,
          fax: contractor.fax || "",
          email: contractor.email,
          licenseNumber: contractor.licenseNumber || "",
        },
      }));
    }
  };

  const handleJobSiteSelect = (jobSiteId: string) => {
    const jobSite = jobSites.find(j => j.id === jobSiteId);
    if (jobSite) {
      setTest(prev => ({
        ...prev,
        jobInfo: {
          ...prev.jobInfo!,
          jobSiteId,
          jobName: jobSite.jobName,
          jobNumber: jobSite.jobNumber || "",
          address: jobSite.address,
          city: jobSite.city,
          state: jobSite.state,
        },
      }));
    }
  };

  const handlePumpSelect = (pumpId: string) => {
    const pump = dieselPumps.find(p => p.id === pumpId);
    if (pump) {
      setSelectedPumpId(pumpId);
      const panels = getPanelsByPump(pumpId);
      const panel = panels.length > 0 ? panels[0] : null;
      setTest(prev => ({
        ...prev,
        pumpEquipment: {
          ...prev.pumpEquipment!,
          pumpTag: pump.tag,
          manufacturer: pump.manufacturer || "",
          model: pump.model || "",
          serialNumber: pump.serialNumber || "",
          ratedFlowGpm: pump.ratedFlowGpm?.toString() || "",
          ratedPressurePsi: pump.ratedPressurePsi?.toString() || "",
          ratedSpeedRpm: pump.ratedSpeedRpm?.toString() || "",
        },
        driverInfo: {
          ...prev.driverInfo!,
          manufacturer: pump.manufacturer || "",
          model: pump.model || "",
          horsePower: pump.powerHP?.toString() || "",
        },
        controllerInfo: {
          ...prev.controllerInfo!,
          manufacturer: panel?.manufacturer || "",
          model: panel?.model || "",
          serialNumber: panel?.serialNumber || "",
          panelTag: panel?.tag || "",
          supplyVoltage: panel?.supplyVoltage || "",
          startingType: panel?.startingType || "",
          hasAutomaticTransfer: panel?.hasAutomaticTransfer || false,
        },
      }));
    }
  };

  const handleInspectorSelect = (inspectorId: string) => {
    const inspector = inspectors.find(i => i.id === inspectorId);
    if (inspector) {
      setSelectedInspectorId(inspectorId);
      setTest(prev => ({
        ...prev,
        signatures: {
          ...prev.signatures!,
          conductedBy: {
            ...prev.signatures!.conductedBy,
            name: inspector.name,
            company: "",
          },
        },
      }));
    }
  };

  const updateJobInfo = (field: string, value: string) => {
    setTest(prev => ({
      ...prev,
      jobInfo: { ...prev.jobInfo!, [field]: value },
    }));
  };

  const updatePumpEquipment = (field: string, value: string) => {
    setTest(prev => ({
      ...prev,
      pumpEquipment: { ...prev.pumpEquipment!, [field]: value },
    }));
  };

  const updateDriverInfo = (field: string, value: string) => {
    setTest(prev => ({
      ...prev,
      driverInfo: { ...prev.driverInfo!, [field]: value },
    }));
  };

  const updateControllerInfo = (field: string, value: string | boolean) => {
    setTest(prev => ({
      ...prev,
      controllerInfo: { ...prev.controllerInfo!, [field]: value },
    }));
  };

  const updateBatteryInfo = (field: string, value: string) => {
    setTest(prev => ({
      ...prev,
      batteryInfo: { ...prev.batteryInfo!, [field]: value },
    }));
  };

  const updateSupplyConditions = (field: string, value: string | boolean) => {
    setTest(prev => ({
      ...prev,
      supplyConditions: { ...prev.supplyConditions!, [field]: value },
    }));
  };

  const updateSystemDemand = (field: string, value: string) => {
    setTest(prev => ({
      ...prev,
      systemDemand: { ...prev.systemDemand!, [field]: value },
    }));
  };

  const updateDieselReading = (readingId: string, field: string, value: string) => {
    setTest(prev => {
      const readings = prev.dieselReadings!.map(r => {
        if (r.id === readingId) {
          const updated = { ...r, [field]: value };
          if (field === "dischargePsi" || field === "suctionPsi") {
            updated.netPressurePsi = calculateNetPressure(
              field === "dischargePsi" ? value : r.dischargePsi,
              field === "suctionPsi" ? value : r.suctionPsi
            );
          }
          return updated;
        }
        return r;
      });
      return {
        ...prev,
        dieselReadings: readings,
      };
    });
  };

  const updateMultiplePumpOperation = (field: string, value: string | boolean) => {
    setTest(prev => ({
      ...prev,
      multiplePumpOperation: { ...prev.multiplePumpOperation!, [field]: value },
    }));
  };

  const updateTransferSwitchTest = (field: string, value: string | boolean) => {
    setTest(prev => ({
      ...prev,
      transferSwitchTest: { ...prev.transferSwitchTest!, [field]: value },
    }));
  };

  const updateResultsSummary = (field: string, value: string | boolean) => {
    setTest(prev => ({
      ...prev,
      resultsSummary: { ...prev.resultsSummary!, [field]: value },
    }));
  };

  const updateObservations = (field: string, value: string) => {
    setTest(prev => ({
      ...prev,
      observationsDeficiencies: { ...prev.observationsDeficiencies!, [field]: value },
    }));
  };

  const addDeficiency = () => {
    const newDeficiency: Deficiency = {
      id: Date.now().toString(),
      description: "",
      severity: "minor",
      recommendedAction: "",
      targetCompletionDate: "",
      resolved: false,
    };
    setTest(prev => ({
      ...prev,
      observationsDeficiencies: {
        ...prev.observationsDeficiencies!,
        deficiencies: [...prev.observationsDeficiencies!.deficiencies, newDeficiency],
      },
    }));
  };

  const updateDeficiency = (id: string, field: string, value: string | boolean) => {
    setTest(prev => ({
      ...prev,
      observationsDeficiencies: {
        ...prev.observationsDeficiencies!,
        deficiencies: prev.observationsDeficiencies!.deficiencies.map(d =>
          d.id === id ? { ...d, [field]: value } : d
        ),
      },
    }));
  };

  const removeDeficiency = (id: string) => {
    setTest(prev => ({
      ...prev,
      observationsDeficiencies: {
        ...prev.observationsDeficiencies!,
        deficiencies: prev.observationsDeficiencies!.deficiencies.filter(d => d.id !== id),
      },
    }));
  };

  const updateConductedBySignature = (field: string, value: string | null) => {
    setTest(prev => ({
      ...prev,
      signatures: {
        ...prev.signatures!,
        conductedBy: { ...prev.signatures!.conductedBy, [field]: value },
      },
    }));
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await saveDraft();
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert(
        "Success",
        t.performanceTest?.draftSaved || "Draft saved successfully"
      );
    } catch (error) {
      Alert.alert(t.common?.error || "Error", t.performanceTest?.saveError || "Error saving draft");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!test.contractorInfo?.companyName?.trim()) {
      Alert.alert(t.common?.error || "Error", t.performanceTest?.contractorRequired || "Contractor information is required");
      return;
    }
    if (!test.jobInfo?.jobName?.trim()) {
      Alert.alert(t.common?.error || "Error", t.performanceTest?.jobRequired || "Job/Site information is required");
      return;
    }

    setIsSaving(true);
    try {
      const finalTest: DieselPerformanceTest = {
        ...test as DieselPerformanceTest,
        status: "completed",
        updatedAt: new Date().toISOString(),
      };
      
      const existingTest = getDieselPerformanceTestById(finalTest.id);
      if (existingTest) {
        await updateDieselPerformanceTest(finalTest.id, finalTest);
      } else {
        await addDieselPerformanceTest(finalTest);
      }
      
      await clearDraft();
      
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      Alert.alert(
        "Success",
        t.performanceTest?.testSaved || "Performance test saved successfully",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error("Error saving performance test:", error);
      Alert.alert(t.common?.error || "Error", t.performanceTest?.saveError || "Error saving test");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPdf = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert(
      t.performanceTest?.exportPdf || "Export PDF",
      t.performanceTest?.exportPdfMessage || "PDF export will be available soon"
    );
  };

  const dt = t.performanceTest?.dieselPerformanceTest;

  const contractorOptions = contractors.map(c => ({
    id: c.id,
    label: c.name,
    sublabel: `${c.city}, ${c.state}`,
  }));

  const availableJobSites = test.contractorInfo?.contractorId 
    ? getJobSitesByContractor(test.contractorInfo.contractorId)
    : jobSites;

  const jobSiteOptions = availableJobSites.map(j => ({
    id: j.id,
    label: j.jobName,
    sublabel: `${j.city}, ${j.state}`,
  }));

  const dieselPumpOptions = dieselPumps.map(p => ({
    id: p.id,
    label: p.tag,
    sublabel: `${p.manufacturer} - ${p.model}`,
  }));

  const inspectorOptions = inspectors.map(i => ({
    id: i.id,
    label: i.name,
    sublabel: i.role,
  }));

  const supplySourceOptions = [
    { id: "city_water", label: t.performanceTest?.supplySources?.cityWater || "City Water" },
    { id: "tank", label: t.performanceTest?.supplySources?.tank || "Tank" },
    { id: "reservoir", label: t.performanceTest?.supplySources?.reservoir || "Reservoir" },
    { id: "pond", label: t.performanceTest?.supplySources?.pond || "Pond" },
    { id: "well", label: t.performanceTest?.supplySources?.well || "Well" },
    { id: "other", label: t.performanceTest?.supplySources?.other || "Other" },
  ];

  const inputStyle = [
    styles.input,
    { backgroundColor: fullTheme.colors.inputBackground, color: fullTheme.colors.textPrimary, borderColor: fullTheme.colors.border },
  ];

  const renderInputField = (
    label: string,
    value: string,
    onChange: (text: string) => void,
    options?: { keyboardType?: "default" | "numeric" | "phone-pad" | "email-address"; placeholder?: string; multiline?: boolean }
  ) => (
    <View style={styles.fieldContainer}>
      <ThemedText type="body" style={styles.fieldLabel}>{label}</ThemedText>
      <TextInput
        style={[inputStyle, options?.multiline ? styles.textArea : null]}
        value={value}
        onChangeText={onChange}
        placeholder={options?.placeholder || label}
        placeholderTextColor={fullTheme.colors.placeholder}
        keyboardType={options?.keyboardType || "default"}
        multiline={options?.multiline}
        numberOfLines={options?.multiline ? 4 : 1}
        textAlignVertical={options?.multiline ? "top" : "center"}
      />
    </View>
  );

  const renderSwitchField = (label: string, value: boolean, onChange: (val: boolean) => void) => (
    <View style={styles.switchContainer}>
      <ThemedText type="body" style={{ flex: 1 }}>{label}</ThemedText>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: fullTheme.colors.border, true: fullTheme.colors.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );

  const renderDieselReadingRow = (reading: DieselTestReading) => (
    <View key={reading.id} style={[styles.readingRow, { borderBottomColor: fullTheme.colors.border }]}>
      <View style={styles.readingHeader}>
        <ThemedText type="body" style={styles.readingLabel}>
          {reading.flowPercent}% {t.performanceTest?.flow || "Flow"}
        </ThemedText>
        <View style={styles.netPressureContainer}>
          <ThemedText type="small" style={{ color: fullTheme.colors.textSecondary }}>
            {t.performanceTest?.netPressure || "Net PSI"}
          </ThemedText>
          <ThemedText type="body" style={[styles.readingNetPressure, { color: fullTheme.colors.primary }]}>
            {reading.netPressurePsi || "-"}
          </ThemedText>
        </View>
      </View>
      <View style={styles.readingInputs}>
        <View style={styles.readingInputWrapper}>
          <ThemedText type="small" style={[styles.inputLabel, { color: fullTheme.colors.textSecondary }]}>GPM</ThemedText>
          <TextInput
            style={[styles.readingInput, { backgroundColor: fullTheme.colors.inputBackground, borderColor: fullTheme.colors.border, color: fullTheme.colors.textPrimary }]}
            value={reading.flowGpm}
            onChangeText={(v) => updateDieselReading(reading.id, "flowGpm", v)}
            placeholder="0"
            placeholderTextColor={fullTheme.colors.placeholder}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.readingInputWrapper}>
          <ThemedText type="small" style={[styles.inputLabel, { color: fullTheme.colors.textSecondary }]}>{t.performanceTest?.suction || "Sucção"}</ThemedText>
          <TextInput
            style={[styles.readingInput, { backgroundColor: fullTheme.colors.inputBackground, borderColor: fullTheme.colors.border, color: fullTheme.colors.textPrimary }]}
            value={reading.suctionPsi}
            onChangeText={(v) => updateDieselReading(reading.id, "suctionPsi", v)}
            placeholder="0"
            placeholderTextColor={fullTheme.colors.placeholder}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.readingInputWrapper}>
          <ThemedText type="small" style={[styles.inputLabel, { color: fullTheme.colors.textSecondary }]}>{t.performanceTest?.discharge || "Descarga"}</ThemedText>
          <TextInput
            style={[styles.readingInput, { backgroundColor: fullTheme.colors.inputBackground, borderColor: fullTheme.colors.border, color: fullTheme.colors.textPrimary }]}
            value={reading.dischargePsi}
            onChangeText={(v) => updateDieselReading(reading.id, "dischargePsi", v)}
            placeholder="0"
            placeholderTextColor={fullTheme.colors.placeholder}
            keyboardType="numeric"
          />
        </View>
      </View>
    </View>
  );

  const handleGeneratePumpCurve = () => {
    const validReadings = (test.dieselReadings || [])
      .filter(r => {
        const flowGpm = parseFloat(r.flowGpm);
        const suctionPsi = parseFloat(r.suctionPsi);
        const dischargePsi = parseFloat(r.dischargePsi);
        return !isNaN(flowGpm) && !isNaN(suctionPsi) && !isNaN(dischargePsi);
      })
      .map(r => {
        const suctionPsi = parseFloat(r.suctionPsi);
        const dischargePsi = parseFloat(r.dischargePsi);
        const calculatedNetPressure = (dischargePsi - suctionPsi).toFixed(1);
        return {
          ...r,
          netPressurePsi: r.netPressurePsi || calculatedNetPressure,
        };
      });
    
    if (validReadings.length < 2) {
      Alert.alert(
        dt?.pumpCurve?.insufficientData || "Insufficient Data",
        dt?.pumpCurve?.needMoreReadings || "Please enter at least 2 complete readings (Flow GPM, Suction PSI, Discharge PSI) to generate the pump curve."
      );
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    navigation.navigate("PumpCurveChart", {
      readings: validReadings,
      pumpTag: test.pumpEquipment?.pumpTag || "",
      ratedFlowGpm: test.pumpEquipment?.ratedFlowGpm || "",
      ratedPressurePsi: test.pumpEquipment?.ratedPressurePsi || "",
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: fullTheme.colors.background }}>
      <ScreenKeyboardAwareScrollView>
        <ThemedText type="h2" style={styles.pageTitle}>
          {dt?.title || "Fire Pump Annual Performance Test - Diesel Engine"}
        </ThemedText>
        <ThemedText type="body" style={[styles.pageSubtitle, { color: fullTheme.colors.textSecondary }]}>
          {dt?.subtitle || "Diesel Engine - Per NFPA 25"}
        </ThemedText>

        <Spacer height={Spacing.lg} />

        <SummaryHeader
          contractor={test.contractorInfo?.companyName || ""}
          jobSite={test.jobInfo?.jobName || ""}
          inspector={test.signatures?.conductedBy?.name || ""}
          pumpTag={test.pumpEquipment?.pumpTag || ""}
          testDate={test.jobInfo?.testDate || ""}
        />

        <Spacer height={Spacing.lg} />

        {/* Section 1: General Information */}
        <SectionCard title={dt?.sections?.general || "1. General Information"}>
          <SelectPicker
            title={t.performanceTest?.selectContractor || "Select Contractor"}
            options={contractorOptions}
            selectedId={test.contractorInfo?.contractorId || ""}
            onSelect={handleContractorSelect}
            placeholder={t.performanceTest?.selectContractor || "Select Contractor"}
          />
          <Spacer height={Spacing.md} />
          <SelectPicker
            title={t.performanceTest?.selectJobSite || "Select Job Site"}
            options={jobSiteOptions}
            selectedId={test.jobInfo?.jobSiteId || ""}
            onSelect={handleJobSiteSelect}
            placeholder={t.performanceTest?.selectJobSite || "Select Job Site"}
          />
          <Spacer height={Spacing.md} />
          <SelectPicker
            title={dt?.selectDieselPump || "Select Diesel Pump"}
            options={dieselPumpOptions}
            selectedId={selectedPumpId}
            onSelect={handlePumpSelect}
            placeholder={dt?.selectDieselPump || "Select Diesel Pump"}
          />
          <Spacer height={Spacing.md} />
          <SelectPicker
            title={t.performanceTest?.selectInspector || "Select Inspector"}
            options={inspectorOptions}
            selectedId={selectedInspectorId}
            onSelect={handleInspectorSelect}
            placeholder={t.performanceTest?.selectInspector || "Select Inspector"}
          />
          <Spacer height={Spacing.md} />
          {renderInputField(
            t.performanceTest?.testDate || "Test Date",
            test.jobInfo?.testDate || "",
            (v) => updateJobInfo("testDate", v)
          )}
        </SectionCard>

        <Spacer height={Spacing.md} />

        {/* Section 2: Pump Equipment */}
        <SectionCard title={dt?.sections?.pump || "2. Pump Equipment"}>
          {renderInputField(dt?.make || "Make", test.pumpEquipment?.manufacturer || "", (v) => updatePumpEquipment("manufacturer", v))}
          {renderInputField(t.performanceTest?.model || "Model", test.pumpEquipment?.model || "", (v) => updatePumpEquipment("model", v))}
          {renderInputField(t.performanceTest?.serialNumber || "Serial Number", test.pumpEquipment?.serialNumber || "", (v) => updatePumpEquipment("serialNumber", v))}
          {renderInputField(dt?.stages || "Stages", test.pumpEquipment?.numberOfStages || "", (v) => updatePumpEquipment("numberOfStages", v), { keyboardType: "numeric" })}
          {renderInputField(dt?.impellerDiameter || "Impeller Diameter", test.pumpEquipment?.impellerDiameterIn || "", (v) => updatePumpEquipment("impellerDiameterIn", v))}
          {renderInputField(dt?.ratedCapacity || "Rated Capacity (GPM)", test.pumpEquipment?.ratedFlowGpm || "", (v) => updatePumpEquipment("ratedFlowGpm", v), { keyboardType: "numeric" })}
          {renderInputField(dt?.ratedPressure || "Rated Pressure (PSI)", test.pumpEquipment?.ratedPressurePsi || "", (v) => updatePumpEquipment("ratedPressurePsi", v), { keyboardType: "numeric" })}
          {renderInputField(dt?.speed || "Rated Speed (RPM)", test.pumpEquipment?.ratedSpeedRpm || "", (v) => updatePumpEquipment("ratedSpeedRpm", v), { keyboardType: "numeric" })}
        </SectionCard>

        <Spacer height={Spacing.md} />

        {/* Section 3: Diesel Engine Information */}
        <SectionCard title={dt?.sections?.driver || "3. Diesel Engine Information"}>
          {renderInputField(dt?.engineMake || "Engine Make", test.driverInfo?.manufacturer || "", (v) => updateDriverInfo("manufacturer", v))}
          {renderInputField(dt?.engineModel || "Engine Model", test.driverInfo?.model || "", (v) => updateDriverInfo("model", v))}
          {renderInputField(t.performanceTest?.serialNumber || "Serial Number", test.driverInfo?.serialNumber || "", (v) => updateDriverInfo("serialNumber", v))}
          {renderInputField(dt?.horsepower || "Horsepower", test.driverInfo?.horsePower || "", (v) => updateDriverInfo("horsePower", v), { keyboardType: "numeric" })}
          {renderInputField(dt?.ratedSpeed || "Rated Speed (RPM)", test.driverInfo?.ratedRpm || "", (v) => updateDriverInfo("ratedRpm", v), { keyboardType: "numeric" })}
          {renderInputField("Number of Cylinders", test.driverInfo?.numberOfCylinders || "", (v) => updateDriverInfo("numberOfCylinders", v), { keyboardType: "numeric" })}
          {renderInputField(dt?.fuelType || "Fuel Type", test.driverInfo?.fuelTankCapacityGal || "", (v) => updateDriverInfo("fuelTankCapacityGal", v))}
        </SectionCard>

        <Spacer height={Spacing.md} />

        {/* Section 4: Controller Information */}
        <SectionCard title={dt?.sections?.controller || "4. Controller Information"}>
          {renderInputField(t.performanceTest?.manufacturer || "Manufacturer", test.controllerInfo?.manufacturer || "", (v) => updateControllerInfo("manufacturer", v))}
          {renderInputField(t.performanceTest?.model || "Model", test.controllerInfo?.model || "", (v) => updateControllerInfo("model", v))}
          {renderInputField(t.performanceTest?.serialNumber || "Serial Number", test.controllerInfo?.serialNumber || "", (v) => updateControllerInfo("serialNumber", v))}
          {renderInputField(dt?.turnsOnAt || "Turns On At (PSI)", test.controllerInfo?.pressureSettingStart || "", (v) => updateControllerInfo("pressureSettingStart", v), { keyboardType: "numeric" })}
          {renderInputField(dt?.turnsOffAt || "Turns Off At (PSI)", test.controllerInfo?.pressureSettingStop || "", (v) => updateControllerInfo("pressureSettingStop", v), { keyboardType: "numeric" })}
          {renderSwitchField("Automatic Transfer", test.controllerInfo?.hasAutomaticTransfer || false, (v) => updateControllerInfo("hasAutomaticTransfer", v))}
        </SectionCard>

        <Spacer height={Spacing.md} />

        {/* Section 5: Battery Information */}
        <SectionCard title={dt?.sections?.power || "5. Power Supply (Batteries)"}>
          {renderInputField(dt?.startingBatteriesType || "Starting Batteries Type", test.batteryInfo?.startingBatteriesType || "", (v) => updateBatteryInfo("startingBatteriesType", v))}
          {renderInputField(dt?.batteryVoltage || "Battery 1 Voltage", test.batteryInfo?.battery1Voltage || "", (v) => updateBatteryInfo("battery1Voltage", v), { keyboardType: "numeric" })}
          {renderInputField(dt?.batteryVoltage || "Battery 2 Voltage", test.batteryInfo?.battery2Voltage || "", (v) => updateBatteryInfo("battery2Voltage", v), { keyboardType: "numeric" })}
          {renderInputField(dt?.batteryChargerType || "Battery Charger Type", test.batteryInfo?.chargerType || "", (v) => updateBatteryInfo("chargerType", v))}
          {renderInputField(dt?.batteryChargerVoltage || "Charger Voltage", test.batteryInfo?.chargerVoltage || "", (v) => updateBatteryInfo("chargerVoltage", v), { keyboardType: "numeric" })}
          {renderInputField(dt?.alternatePowerSource || "Alternate Power Source", test.batteryInfo?.alternatePowerSource || "", (v) => updateBatteryInfo("alternatePowerSource", v))}
        </SectionCard>

        <Spacer height={Spacing.md} />

        {/* Section 6: Water Supply Conditions */}
        <SectionCard title={dt?.sections?.waterSupply || "6. Water Supply Conditions"}>
          <SelectPicker
            title={dt?.waterSupplyType || "Water Supply Type"}
            options={supplySourceOptions}
            selectedId={test.supplyConditions?.supplySource || "city_water"}
            onSelect={(v) => updateSupplyConditions("supplySource", v)}
            placeholder={dt?.waterSupplyType || "Select Water Supply Type"}
          />
          <Spacer height={Spacing.md} />
          {renderInputField(t.performanceTest?.staticPressure || "Static Pressure (PSI)", test.supplyConditions?.staticPressurePsi || "", (v) => updateSupplyConditions("staticPressurePsi", v), { keyboardType: "numeric" })}
          {renderInputField(t.performanceTest?.residualPressure || "Residual Pressure (PSI)", test.supplyConditions?.residualPressurePsi || "", (v) => updateSupplyConditions("residualPressurePsi", v), { keyboardType: "numeric" })}
          {renderInputField("Water Temperature (F)", test.supplyConditions?.waterTemperatureF || "", (v) => updateSupplyConditions("waterTemperatureF", v), { keyboardType: "numeric" })}
        </SectionCard>

        <Spacer height={Spacing.md} />

        {/* Section 7: System Demand */}
        <SectionCard title={dt?.sections?.demand || "7. System Demand"}>
          {renderInputField(dt?.systemDemandFlow || "System Demand Flow (GPM)", test.systemDemand?.systemDemandGpm || "", (v) => updateSystemDemand("systemDemandGpm", v), { keyboardType: "numeric" })}
          {renderInputField(dt?.systemDemandPressure || "System Demand Pressure (PSI)", test.systemDemand?.systemDemandPsi || "", (v) => updateSystemDemand("systemDemandPsi", v), { keyboardType: "numeric" })}
          {renderInputField("Hose Demand (GPM)", test.systemDemand?.hoseDemandGpm || "", (v) => updateSystemDemand("hoseDemandGpm", v), { keyboardType: "numeric" })}
          {renderInputField("Total Demand (GPM)", test.systemDemand?.totalDemandGpm || "", (v) => updateSystemDemand("totalDemandGpm", v), { keyboardType: "numeric" })}
        </SectionCard>

        <Spacer height={Spacing.md} />

        {/* Section 8: Test Conditions & Readings */}
        <SectionCard title={dt?.sections?.readings || "8. Test Conditions & Readings"}>
          <View style={styles.readingsHeader}>
            <View style={styles.readingsHeaderItem}>
              <ThemedText type="small" style={{ color: fullTheme.colors.textSecondary, textAlign: "center" }}>
                {t.performanceTest?.flow || "Flow"}
              </ThemedText>
              <ThemedText type="small" style={{ color: fullTheme.colors.textSecondary, textAlign: "center" }}>
                (GPM)
              </ThemedText>
            </View>
            <View style={styles.readingsHeaderItem}>
              <ThemedText type="small" style={{ color: fullTheme.colors.textSecondary, textAlign: "center" }}>
                {t.performanceTest?.suction || "Suction"}
              </ThemedText>
              <ThemedText type="small" style={{ color: fullTheme.colors.textSecondary, textAlign: "center" }}>
                (PSI)
              </ThemedText>
            </View>
            <View style={styles.readingsHeaderItem}>
              <ThemedText type="small" style={{ color: fullTheme.colors.textSecondary, textAlign: "center" }}>
                {t.performanceTest?.discharge || "Discharge"}
              </ThemedText>
              <ThemedText type="small" style={{ color: fullTheme.colors.textSecondary, textAlign: "center" }}>
                (PSI)
              </ThemedText>
            </View>
            <View style={styles.readingsHeaderItem}>
              <ThemedText type="small" style={{ color: fullTheme.colors.textSecondary, textAlign: "center" }}>
                {t.performanceTest?.netPressure || "Net"}
              </ThemedText>
              <ThemedText type="small" style={{ color: fullTheme.colors.textSecondary, textAlign: "center" }}>
                (PSI)
              </ThemedText>
            </View>
          </View>
          {test.dieselReadings?.map(reading => renderDieselReadingRow(reading))}
          <Spacer height={Spacing.lg} />
          <Pressable 
            style={[styles.pumpCurveButton, { backgroundColor: fullTheme.colors.primary }]}
            onPress={handleGeneratePumpCurve}
          >
            <Feather name="trending-up" size={20} color="#FFFFFF" />
            <ThemedText type="body" style={{ color: "#FFFFFF", marginLeft: Spacing.sm, fontWeight: "600" }}>
              {dt?.pumpCurve?.generateCurve || "Generate Pump Curve"}
            </ThemedText>
          </Pressable>
        </SectionCard>

        <Spacer height={Spacing.md} />

        {/* Section 10: Multiple Pump Operation */}
        <SectionCard title={dt?.sections?.multiplePump || "10. Multiple Pump Operation"}>
          {renderSwitchField("Is Multiple Pump System?", test.multiplePumpOperation?.isMultiplePumpSystem || false, (v) => updateMultiplePumpOperation("isMultiplePumpSystem", v))}
          {test.multiplePumpOperation?.isMultiplePumpSystem ? (
            <>
              {renderInputField("Number of Pumps", test.multiplePumpOperation?.numberOfPumps || "", (v) => updateMultiplePumpOperation("numberOfPumps", v), { keyboardType: "numeric" })}
              {renderInputField("Operation Sequence", test.multiplePumpOperation?.pumpOperationSequence || "", (v) => updateMultiplePumpOperation("pumpOperationSequence", v), { multiline: true })}
              {renderSwitchField("All Pumps Tested Individually?", test.multiplePumpOperation?.allPumpsTestedIndividually || false, (v) => updateMultiplePumpOperation("allPumpsTestedIndividually", v))}
            </>
          ) : null}
        </SectionCard>

        <Spacer height={Spacing.md} />

        {/* Section 11: Transfer Switch Test */}
        <SectionCard title={dt?.sections?.transferSwitch || "11. Additional Tests - Transfer Switch"}>
          {renderSwitchField("Has Transfer Switch?", test.transferSwitchTest?.hasTransferSwitch || false, (v) => updateTransferSwitchTest("hasTransferSwitch", v))}
          {test.transferSwitchTest?.hasTransferSwitch ? (
            <>
              {renderInputField("Transfer Switch Type", test.transferSwitchTest?.transferSwitchType || "", (v) => updateTransferSwitchTest("transferSwitchType", v))}
              {renderInputField("Normal to Emergency (seconds)", test.transferSwitchTest?.normalToEmergencySeconds || "", (v) => updateTransferSwitchTest("normalToEmergencySeconds", v), { keyboardType: "numeric" })}
              {renderInputField("Emergency to Normal (seconds)", test.transferSwitchTest?.emergencyToNormalSeconds || "", (v) => updateTransferSwitchTest("emergencyToNormalSeconds", v), { keyboardType: "numeric" })}
            </>
          ) : null}
        </SectionCard>

        <Spacer height={Spacing.md} />

        {/* Section 12: Results Summary */}
        <SectionCard title={dt?.sections?.results || "12. Results Summary"}>
          {renderInputField("Shutoff Pressure Actual (PSI)", test.resultsSummary?.shutoffPressureActual || "", (v) => updateResultsSummary("shutoffPressureActual", v), { keyboardType: "numeric" })}
          {renderInputField("Rated Flow Pressure Actual (PSI)", test.resultsSummary?.ratedFlowPressureActual || "", (v) => updateResultsSummary("ratedFlowPressureActual", v), { keyboardType: "numeric" })}
          {renderInputField("Peak Flow Pressure Actual (PSI)", test.resultsSummary?.peakFlowPressureActual || "", (v) => updateResultsSummary("peakFlowPressureActual", v), { keyboardType: "numeric" })}
          <View style={styles.resultRow}>
            <ThemedText type="body">{"Overall Result"}:</ThemedText>
            <ThemedText 
              type="h3" 
              style={{ 
                color: test.resultsSummary?.overallResult === "pass" 
                  ? fullTheme.colors.success 
                  : test.resultsSummary?.overallResult === "conditional"
                  ? fullTheme.colors.warning
                  : fullTheme.colors.error 
              }}
            >
              {test.resultsSummary?.overallResult?.toUpperCase() || "PENDING"}
            </ThemedText>
          </View>
        </SectionCard>

        <Spacer height={Spacing.md} />

        {/* Section 13: Observations & Deficiencies */}
        <SectionCard title={dt?.sections?.observations || "13. Observations & Deficiencies"}>
          {renderInputField(
            t.performanceTest?.observations || "General Observations",
            test.observationsDeficiencies?.generalObservations || "",
            (v) => updateObservations("generalObservations", v),
            { multiline: true }
          )}
          <Spacer height={Spacing.md} />
          <View style={styles.deficiencyHeader}>
            <ThemedText type="body">{t.performanceTest?.deficiencies || "Deficiencies"}</ThemedText>
            <Pressable 
              style={[styles.addButton, { backgroundColor: fullTheme.colors.primary }]}
              onPress={addDeficiency}
            >
              <Feather name="plus" size={16} color="#FFFFFF" />
              <ThemedText type="small" style={{ color: "#FFFFFF", marginLeft: 4 }}>
                {t.performanceTest?.addDeficiency || "Add"}
              </ThemedText>
            </Pressable>
          </View>
          {test.observationsDeficiencies?.deficiencies.map(def => (
            <View key={def.id} style={[styles.deficiencyCard, { backgroundColor: fullTheme.colors.cardBackground, borderColor: fullTheme.colors.border }]}>
              <View style={styles.deficiencyCardHeader}>
                <ThemedText type="body">{t.performanceTest?.deficiencyDescription || "Deficiency"}</ThemedText>
                <Pressable onPress={() => removeDeficiency(def.id)}>
                  <Feather name="trash-2" size={18} color={fullTheme.colors.error} />
                </Pressable>
              </View>
              {renderInputField(t.performanceTest?.deficiencyDescription || "Description", def.description, (v) => updateDeficiency(def.id, "description", v), { multiline: true })}
              {renderInputField(t.performanceTest?.recommendedAction || "Recommended Action", def.recommendedAction, (v) => updateDeficiency(def.id, "recommendedAction", v))}
            </View>
          ))}
        </SectionCard>

        <Spacer height={Spacing.md} />

        {/* Section 14: Signatures */}
        <SectionCard title={dt?.sections?.signatures || "14. Signatures"}>
          <ThemedText type="body" style={styles.fieldLabel}>{t.performanceTest?.conductedBy || "Conducted By"}</ThemedText>
          {renderInputField(t.performanceTest?.printName || "Print Name", test.signatures?.conductedBy?.name || "", (v) => updateConductedBySignature("name", v))}
          {renderInputField(t.performanceTest?.signatureJobTitle || "Title", test.signatures?.conductedBy?.title || "", (v) => updateConductedBySignature("title", v))}
          {renderInputField(t.performanceTest?.date || "Date", test.signatures?.conductedBy?.date || "", (v) => updateConductedBySignature("date", v))}
          <Spacer height={Spacing.md} />
          <ThemedText type="body" style={styles.fieldLabel}>{t.performanceTest?.signature || "Signature"}</ThemedText>
          <SignatureCapture
            onSignatureChange={(sig: string | null) => updateConductedBySignature("signatureData", sig)}
            signature={test.signatures?.conductedBy?.signatureData || null}
          />
        </SectionCard>

        <Spacer height={Spacing.md} />

        {/* Section 15: Attachments */}
        <SectionCard title={dt?.sections?.attachments || "15. Attachments"}>
          {renderInputField(
            "Additional Notes",
            test.attachments?.additionalNotes || "",
            (v) => setTest(prev => ({ ...prev, attachments: { ...prev.attachments!, additionalNotes: v } })),
            { multiline: true }
          )}
          {renderSwitchField(
            "Pump Curve Attached",
            test.attachments?.pumpCurveAttached || false,
            (v) => setTest(prev => ({ ...prev, attachments: { ...prev.attachments!, pumpCurveAttached: v } }))
          )}
          {renderSwitchField(
            "Previous Test Report Attached",
            test.attachments?.previousTestReportAttached || false,
            (v) => setTest(prev => ({ ...prev, attachments: { ...prev.attachments!, previousTestReportAttached: v } }))
          )}
        </SectionCard>

        <Spacer height={Spacing.xl} />
        <View style={{ height: 80 + tabBarHeight }} />
      </ScreenKeyboardAwareScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={[styles.stickyBottomBar, { backgroundColor: fullTheme.colors.cardBackground, borderTopColor: fullTheme.colors.border, paddingBottom: Spacing.lg + insets.bottom, bottom: tabBarHeight + Spacing.sm }]}>
        <Pressable 
          style={[styles.actionButton, { borderColor: fullTheme.colors.border }]}
          onPress={handleSaveDraft}
          disabled={isSaving}
        >
          <Feather name="save" size={18} color={fullTheme.colors.textPrimary} />
          <ThemedText type="body" style={{ marginLeft: Spacing.sm }}>
            {t.performanceTest?.saveDraft || "Save Draft"}
          </ThemedText>
        </Pressable>

        <Pressable 
          style={[styles.actionButton, styles.submitButton, { backgroundColor: fullTheme.colors.primary }]}
          onPress={handleSubmit}
        >
          <Feather name="check-circle" size={18} color="#FFFFFF" />
          <ThemedText type="body" style={{ marginLeft: Spacing.sm, color: "#FFFFFF" }}>
            {t.performanceTest?.finalizeTest || "Finalize Test"}
          </ThemedText>
        </Pressable>

        <Pressable 
          style={[styles.actionButton, { borderColor: fullTheme.colors.border }]}
          onPress={handleExportPdf}
        >
          <Feather name="file-text" size={18} color={fullTheme.colors.textPrimary} />
          <ThemedText type="body" style={{ marginLeft: Spacing.sm }}>
            {t.performanceTest?.exportPdf || "PDF"}
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pageTitle: {
    textAlign: "center",
    marginTop: Spacing.lg,
  },
  pageSubtitle: {
    textAlign: "center",
    marginTop: Spacing.xs,
  },
  summaryHeader: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.md,
    borderWidth: 1,
  },
  summaryRow: {
    flexDirection: "row",
    marginBottom: Spacing.sm,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    color: "rgba(255,255,255,0.7)",
    marginBottom: 2,
  },
  summaryValue: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  section: {
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  sectionHeader: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  sectionTitle: {
    fontWeight: "600",
  },
  sectionContent: {
    padding: Spacing.lg,
  },
  fieldContainer: {
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    marginBottom: Spacing.xs,
    fontWeight: "500",
  },
  input: {
    height: Spacing.inputHeight,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    paddingTop: Spacing.md,
    textAlignVertical: "top",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  readingRow: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  readingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  readingLabel: {
    fontWeight: "600",
  },
  readingInputs: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing.sm,
  },
  readingInputWrapper: {
    flex: 1,
  },
  inputLabel: {
    marginBottom: Spacing.xs,
    fontSize: 11,
  },
  readingInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    fontSize: 14,
    textAlign: "center",
  },
  readingNetPressure: {
    fontWeight: "700",
    fontSize: 16,
  },
  netPressureContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  readingsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  readingsHeaderItem: {
    flex: 1,
    alignItems: "center",
  },
  pumpCurveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    marginTop: Spacing.md,
  },
  deficiencyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  deficiencyCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  deficiencyCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  stickyBottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderTopWidth: 1,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  submitButton: {
    borderWidth: 0,
  },
});
