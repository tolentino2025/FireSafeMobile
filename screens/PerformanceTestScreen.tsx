import React, { useState, useCallback, useEffect, useRef } from "react";
import { View, StyleSheet, TextInput, Pressable, Alert, Switch, Platform, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { SelectPicker } from "@/components/SelectPicker";
import { DatePickerField } from "@/components/DatePickerField";
import { SignatureCapture } from "@/components/SignatureCapture";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useInspections } from "@/contexts/InspectionContext";
import { Inspection } from "@/types/inspection";
import { Spacing, BorderRadius, AppColors } from "@/constants/theme";
import { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import {
  PerformanceTest,
  createEmptyPerformanceTest,
  createEmptyTestReading,
  calculateNetPressure,
  calculatePercentOfRated,
  evaluateShutoffTest,
  evaluateRatedFlowTest,
  evaluatePeakFlowTest,
  TestReading,
  DriverType,
  PumpOrientation,
  SupplySource,
  TestMethod,
  Deficiency,
} from "@/types/performanceTest";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { generateElectricPumpPdf } from "@/utils/performanceTestPdfGenerator";

type PerformanceTestScreenProps = NativeStackScreenProps<HomeStackParamList, "PerformanceTest">;

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  sectionRef?: React.RefObject<View | null>;
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

const getDraftStorageKey = (id?: string) => `performance_test_draft_${id || 'new'}`;
const AUTO_SAVE_DELAY = 2000;

export default function PerformanceTestScreen({ navigation, route }: PerformanceTestScreenProps) {
  const { testId } = route.params || {};
  const { fullTheme } = useTheme();
  const { t, language } = useLanguage();
  const { contractors, jobSites, appUsers, firePumps, firePumpPanels, companies, getJobSitesByContractor, getPanelsByPump, addElectricPerformanceTest, updateElectricPerformanceTest, getElectricPerformanceTestById, addInspection, updateInspection, inspections } = useInspections();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const [test, setTest] = useState<Partial<PerformanceTest>>(() => createEmptyPerformanceTest());
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPumpId, setSelectedPumpId] = useState<string>("");
  const [selectedInspectorId, setSelectedInspectorId] = useState<string>("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSubmittingRef = useRef<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const allElectricPumps = firePumps.filter(p => p.type === "electric_main");
  const electricPumps = selectedCompanyId 
    ? allElectricPumps.filter(p => p.companyId === selectedCompanyId)
    : allElectricPumps;
  const inspectors = appUsers;

  const sectionRefs = {
    contractor: useRef<View>(null),
    job: useRef<View>(null),
    pump: useRef<View>(null),
    driver: useRef<View>(null),
    controller: useRef<View>(null),
    power: useRef<View>(null),
    supply: useRef<View>(null),
    demand: useRef<View>(null),
    conditions: useRef<View>(null),
    results: useRef<View>(null),
    observations: useRef<View>(null),
    signatures: useRef<View>(null),
    attachments: useRef<View>(null),
  };

  useEffect(() => {
    const loadInitialData = async () => {
      if (testId) {
        const existingTest = getElectricPerformanceTestById(testId);
        if (existingTest) {
          setTest(existingTest);
          const testData = existingTest as any;
          if (testData.pumpEquipment?.pumpId) {
            setSelectedPumpId(testData.pumpEquipment.pumpId);
          }
          if (testData.signatures?.conductedBy?.userId) {
            setSelectedInspectorId(testData.signatures.conductedBy.userId);
          }
          activeDraftKeyRef.current = getDraftStorageKey(testId);
          return;
        }
      }
      loadDraft();
    };
    loadInitialData();
  }, [testId]);

  useEffect(() => {
    if (isSubmittingRef.current) {
      return;
    }
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(() => {
      if (!isSubmittingRef.current) {
        saveDraft();
      }
    }, AUTO_SAVE_DELAY);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [test]);

  const activeDraftKeyRef = useRef<string | null>(null);
  const saveInProgressRef = useRef<Promise<void> | null>(null);

  const resolveDraftKey = useCallback((currentTest: Partial<PerformanceTest>) => {
    return getDraftStorageKey(currentTest.id || testId || 'new');
  }, [testId]);

  const findExistingDraft = async (): Promise<{ key: string; data: string } | null> => {
    try {
      if (testId) {
        const key = getDraftStorageKey(testId);
        const data = await AsyncStorage.getItem(key);
        if (data) return { key, data };
      }
      
      const newKey = getDraftStorageKey('new');
      const newData = await AsyncStorage.getItem(newKey);
      if (newData) return { key: newKey, data: newData };
      
      return null;
    } catch (error) {
      console.error("Error finding draft:", error);
      return null;
    }
  };

  const loadDraft = async () => {
    try {
      const result = await findExistingDraft();
      if (result) {
        const parsedDraft = JSON.parse(result.data);
        activeDraftKeyRef.current = result.key;
        setTest(parsedDraft);
        if (parsedDraft.pumpEquipment?.pumpId) {
          setSelectedPumpId(parsedDraft.pumpEquipment.pumpId);
        }
        if (parsedDraft.signatures?.conductedBy?.userId) {
          setSelectedInspectorId(parsedDraft.signatures.conductedBy.userId);
        }
      } else {
        activeDraftKeyRef.current = getDraftStorageKey(testId || 'new');
      }
    } catch (error) {
      console.error("Error loading draft:", error);
    }
  };

  const saveDraft = async () => {
    if (saveInProgressRef.current) {
      await saveInProgressRef.current;
    }
    
    const saveOperation = (async () => {
      try {
        const newKey = resolveDraftKey(test);
        const oldKey = activeDraftKeyRef.current;
        
        await AsyncStorage.setItem(newKey, JSON.stringify(test));
        
        if (oldKey && oldKey !== newKey) {
          await AsyncStorage.removeItem(oldKey);
        }
        
        activeDraftKeyRef.current = newKey;
      } catch (error) {
        console.error("Error saving draft:", error);
      }
    })();
    
    saveInProgressRef.current = saveOperation;
    await saveOperation;
    saveInProgressRef.current = null;
  };

  const clearDraft = async () => {
    try {
      if (activeDraftKeyRef.current) {
        await AsyncStorage.removeItem(activeDraftKeyRef.current);
      }
      activeDraftKeyRef.current = null;
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

  const handleCompanySelect = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setSelectedPumpId("");
    setTest(prev => ({
      ...prev,
      pumpEquipment: {
        ...prev.pumpEquipment!,
        pumpId: "",
        pumpTag: "",
        manufacturer: "",
        model: "",
        serialNumber: "",
        ratedFlowGpm: "",
        ratedPressurePsi: "",
        ratedSpeedRpm: "",
      },
    }));
  };

  const handlePumpSelect = (pumpId: string) => {
    const pump = electricPumps.find(p => p.id === pumpId);
    if (pump) {
      setSelectedPumpId(pumpId);
      const panels = getPanelsByPump(pumpId);
      const panel = panels.length > 0 ? panels[0] : null;
      setTest(prev => ({
        ...prev,
        pumpEquipment: {
          ...prev.pumpEquipment!,
          pumpId: pumpId,
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
          driverType: "electric" as const,
          manufacturer: pump.manufacturer || "",
          model: pump.model || "",
          serialNumber: prev.driverInfo?.serialNumber || "",
          horsePower: pump.powerHP?.toString() || "",
          ratedRpm: prev.driverInfo && 'ratedRpm' in prev.driverInfo ? prev.driverInfo.ratedRpm : "",
          ratedVoltage: prev.driverInfo && 'ratedVoltage' in prev.driverInfo ? prev.driverInfo.ratedVoltage : "",
          phases: prev.driverInfo && 'phases' in prev.driverInfo ? prev.driverInfo.phases : "",
          hertz: prev.driverInfo && 'hertz' in prev.driverInfo ? prev.driverInfo.hertz : "",
          fullLoadAmperage: prev.driverInfo && 'fullLoadAmperage' in prev.driverInfo ? prev.driverInfo.fullLoadAmperage : "",
          lockedRotorAmperage: prev.driverInfo && 'lockedRotorAmperage' in prev.driverInfo ? prev.driverInfo.lockedRotorAmperage : "",
          serviceFactor: prev.driverInfo && 'serviceFactor' in prev.driverInfo ? prev.driverInfo.serviceFactor : "",
          enclosureType: prev.driverInfo && 'enclosureType' in prev.driverInfo ? prev.driverInfo.enclosureType : "",
          insulationClass: prev.driverInfo && 'insulationClass' in prev.driverInfo ? prev.driverInfo.insulationClass : "",
          frameSize: prev.driverInfo && 'frameSize' in prev.driverInfo ? prev.driverInfo.frameSize : "",
        },
        controllerInfo: {
          ...prev.controllerInfo!,
          manufacturer: panel?.manufacturer || "",
          model: panel?.model || "",
          serialNumber: panel?.serialNumber || "",
          supplyVoltage: panel?.supplyVoltage || "",
          startingType: panel?.startingType || "",
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
            userId: inspectorId,
            name: inspector.name,
            company: "",
          },
        },
      }));
    }
  };

  const updateContractorInfo = (field: string, value: string) => {
    setTest(prev => ({
      ...prev,
      contractorInfo: { ...prev.contractorInfo!, [field]: value },
    }));
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

  const updateDriverInfo = (field: string, value: string | boolean) => {
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

  const updatePowerSupply = (field: string, value: string | boolean) => {
    setTest(prev => ({
      ...prev,
      powerSupply: { ...prev.powerSupply!, [field]: value },
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

  const updateTestConditions = (field: string, value: string) => {
    setTest(prev => ({
      ...prev,
      testConditions: { ...prev.testConditions!, [field]: value },
    }));
  };

  const updateTestReading = (readingId: string, field: string, value: string) => {
    setTest(prev => {
      const readings = prev.testConditions!.readings.map(r => {
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
        testConditions: { ...prev.testConditions!, readings },
      };
    });
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
        t.common.success || "Success",
        t.performanceTest?.draftSaved || "Draft saved successfully"
      );
    } catch (error) {
      Alert.alert(t.common.error, t.performanceTest?.saveError || "Error saving draft");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!test.contractorInfo?.companyName?.trim()) {
      Alert.alert(t.common.error, t.performanceTest?.contractorRequired || "Contractor information is required");
      return;
    }
    if (!test.jobInfo?.jobName?.trim()) {
      Alert.alert(t.common.error, t.performanceTest?.jobRequired || "Job/Site information is required");
      return;
    }

    isSubmittingRef.current = true;
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    setIsSaving(true);
    try {
      const finalTest: PerformanceTest = {
        ...test as PerformanceTest,
        status: "completed",
        updatedAt: new Date().toISOString(),
      };
      
      const existingTest = getElectricPerformanceTestById(finalTest.id);
      if (existingTest) {
        await updateElectricPerformanceTest(finalTest.id, finalTest);
      } else {
        await addElectricPerformanceTest(finalTest);
      }

      const getLocalDateString = (d: Date = new Date()): string => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const inspectionId = `insp-electric-${finalTest.id}`;
      const existingInspection = inspections.find(i => i.id === inspectionId);
      
      const inspectionRecord: Inspection = {
        id: inspectionId,
        type: "electric_pump",
        status: "completed",
        propertyName: finalTest.jobInfo?.jobName || "",
        propertyAddress: `${finalTest.jobInfo?.address || ""}, ${finalTest.jobInfo?.city || ""}, ${finalTest.jobInfo?.state || ""}`.trim().replace(/^,\s*|,\s*$/g, ""),
        propertyPhone: "",
        inspectorName: finalTest.signatures?.conductedBy?.name || "",
        contractNo: finalTest.jobInfo?.jobNumber || "",
        date: finalTest.jobInfo?.testDate || getLocalDateString(),
        frequency: "annually",
        checklist: [],
        observations: finalTest.observationsDeficiencies?.generalObservations || "",
        signature: finalTest.signatures?.conductedBy?.signatureData || null,
        photos: [],
        geoLocation: null,
        performanceTestId: finalTest.id,
        createdAt: existingInspection?.createdAt || finalTest.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      if (existingInspection) {
        await updateInspection(inspectionId, inspectionRecord);
      } else {
        await addInspection(inspectionRecord);
      }
      
      await clearDraft();
      
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      Alert.alert(
        t.common.success || "Success",
        t.performanceTest?.testSaved || "Performance test saved successfully",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error("Error saving performance test:", error);
      Alert.alert(t.common.error, t.performanceTest?.saveError || "Error saving test");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPdf = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    try {
      const pdfSource = testId ? (getElectricPerformanceTestById(testId) || test) : test;
      const result = await generateElectricPumpPdf(pdfSource, language);
      
      if (!result.success) {
        Alert.alert(
          t.common?.error || "Error",
          result.message || t.performanceTest?.pdfError || "Error generating PDF"
        );
      }
    } catch (error) {
      console.error("Error exporting PDF:", error);
      Alert.alert(
        t.common?.error || "Error",
        t.performanceTest?.pdfError || "Error generating PDF"
      );
    }
  };

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

  const companyOptions = companies.map(c => ({
    id: c.id,
    label: c.name,
    sublabel: `${c.city}, ${c.state}`,
  }));

  const electricPumpOptions = electricPumps.map(p => ({
    id: p.id,
    label: p.tag,
    sublabel: `${p.manufacturer} - ${p.model}`,
  }));

  const inspectorOptions = inspectors.map(i => ({
    id: i.id,
    label: i.name,
    sublabel: i.role,
  }));

  const driverTypeOptions = [
    { id: "electric", label: t.performanceTest?.driverTypes?.electric || "Electric Motor" },
    { id: "diesel", label: t.performanceTest?.driverTypes?.diesel || "Diesel Engine" },
  ];

  const pumpOrientationOptions = [
    { id: "horizontal_split", label: t.performanceTest?.pumpOrientations?.horizontalSplit || "Horizontal Split Case" },
    { id: "vertical_inline", label: t.performanceTest?.pumpOrientations?.verticalInline || "Vertical Inline" },
    { id: "vertical_turbine", label: t.performanceTest?.pumpOrientations?.verticalTurbine || "Vertical Turbine" },
    { id: "end_suction", label: t.performanceTest?.pumpOrientations?.endSuction || "End Suction" },
  ];

  const supplySourceOptions = [
    { id: "city_water", label: t.performanceTest?.supplySources?.cityWater || "City Water" },
    { id: "tank", label: t.performanceTest?.supplySources?.tank || "Tank" },
    { id: "reservoir", label: t.performanceTest?.supplySources?.reservoir || "Reservoir" },
    { id: "pond", label: t.performanceTest?.supplySources?.pond || "Pond" },
    { id: "well", label: t.performanceTest?.supplySources?.well || "Well" },
    { id: "other", label: t.performanceTest?.supplySources?.other || "Other" },
  ];

  const testMethodOptions = [
    { id: "flow_meter", label: t.performanceTest?.testMethods?.flowMeter || "Flow Meter" },
    { id: "pitot_tube", label: t.performanceTest?.testMethods?.pitotTube || "Pitot Tube" },
    { id: "flow_loop", label: t.performanceTest?.testMethods?.flowLoop || "Flow Loop" },
    { id: "bypass", label: t.performanceTest?.testMethods?.bypass || "Bypass" },
    { id: "other", label: t.performanceTest?.testMethods?.other || "Other" },
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

  const renderTestReadingRow = (reading: TestReading, showElectric: boolean) => (
    <View key={reading.id} style={[styles.readingCard, { backgroundColor: fullTheme.colors.backgroundSecondary, borderColor: fullTheme.colors.border }]}>
      <View style={[styles.readingHeader, { backgroundColor: fullTheme.colors.primary }]}>
        <ThemedText type="body" style={styles.readingHeaderText}>
          {reading.flowPercent}% {t.performanceTest?.flow || "Flow"}
        </ThemedText>
      </View>
      
      <View style={styles.readingContent}>
        <View style={styles.readingFieldRow}>
          <View style={styles.readingFieldHalf}>
            <ThemedText type="small" secondary style={styles.readingFieldLabel}>{t.performanceTest?.gpm || "GPM"}</ThemedText>
            <TextInput
              style={[styles.readingFieldInput, { backgroundColor: fullTheme.colors.inputBackground, borderColor: fullTheme.colors.border, color: fullTheme.colors.textPrimary }]}
              value={reading.flowGpm}
              onChangeText={(v) => updateTestReading(reading.id, "flowGpm", v)}
              placeholder="0"
              placeholderTextColor={fullTheme.colors.placeholder}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.readingFieldHalf}>
            <ThemedText type="small" secondary style={styles.readingFieldLabel}>{t.performanceTest?.suction || "Suction"} ({t.performanceTest?.psi || "PSI"})</ThemedText>
            <TextInput
              style={[styles.readingFieldInput, { backgroundColor: fullTheme.colors.inputBackground, borderColor: fullTheme.colors.border, color: fullTheme.colors.textPrimary }]}
              value={reading.suctionPsi}
              onChangeText={(v) => updateTestReading(reading.id, "suctionPsi", v)}
              placeholder="0"
              placeholderTextColor={fullTheme.colors.placeholder}
              keyboardType="numeric"
            />
          </View>
        </View>
        
        <View style={styles.readingFieldRow}>
          <View style={styles.readingFieldHalf}>
            <ThemedText type="small" secondary style={styles.readingFieldLabel}>{t.performanceTest?.discharge || "Discharge"} ({t.performanceTest?.psi || "PSI"})</ThemedText>
            <TextInput
              style={[styles.readingFieldInput, { backgroundColor: fullTheme.colors.inputBackground, borderColor: fullTheme.colors.border, color: fullTheme.colors.textPrimary }]}
              value={reading.dischargePsi}
              onChangeText={(v) => updateTestReading(reading.id, "dischargePsi", v)}
              placeholder="0"
              placeholderTextColor={fullTheme.colors.placeholder}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.readingFieldHalf}>
            <ThemedText type="small" secondary style={styles.readingFieldLabel}>{t.performanceTest?.netPressure || "Net Pressure"} ({t.performanceTest?.psi || "PSI"})</ThemedText>
            <View style={[styles.readingFieldCalculated, { backgroundColor: fullTheme.colors.cardBackground, borderColor: fullTheme.colors.border }]}>
              <ThemedText type="body" style={{ fontWeight: "600" }}>{reading.netPressurePsi || "-"}</ThemedText>
            </View>
          </View>
        </View>
        
        <View style={styles.readingFieldRow}>
          <View style={styles.readingFieldFull}>
            <ThemedText type="small" secondary style={styles.readingFieldLabel}>{t.performanceTest?.rpm || "RPM"}</ThemedText>
            <TextInput
              style={[styles.readingFieldInput, { backgroundColor: fullTheme.colors.inputBackground, borderColor: fullTheme.colors.border, color: fullTheme.colors.textPrimary }]}
              value={reading.rpm}
              onChangeText={(v) => updateTestReading(reading.id, "rpm", v)}
              placeholder="0"
              placeholderTextColor={fullTheme.colors.placeholder}
              keyboardType="numeric"
            />
          </View>
        </View>
        
        {showElectric ? (
          <>
            <View style={styles.readingSubsection}>
              <ThemedText type="small" style={[styles.readingSubsectionTitle, { color: fullTheme.colors.primary }]}>
                {t.performanceTest?.voltage || "Voltage"} (V)
              </ThemedText>
            </View>
            <View style={styles.readingFieldRow}>
              <View style={styles.readingFieldThird}>
                <ThemedText type="small" secondary style={styles.readingFieldLabel}>L1-L2</ThemedText>
                <TextInput
                  style={[styles.readingFieldInput, { backgroundColor: fullTheme.colors.inputBackground, borderColor: fullTheme.colors.border, color: fullTheme.colors.textPrimary }]}
                  value={reading.voltageL1L2 || ""}
                  onChangeText={(v) => updateTestReading(reading.id, "voltageL1L2", v)}
                  placeholder="0"
                  placeholderTextColor={fullTheme.colors.placeholder}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.readingFieldThird}>
                <ThemedText type="small" secondary style={styles.readingFieldLabel}>L2-L3</ThemedText>
                <TextInput
                  style={[styles.readingFieldInput, { backgroundColor: fullTheme.colors.inputBackground, borderColor: fullTheme.colors.border, color: fullTheme.colors.textPrimary }]}
                  value={reading.voltageL2L3 || ""}
                  onChangeText={(v) => updateTestReading(reading.id, "voltageL2L3", v)}
                  placeholder="0"
                  placeholderTextColor={fullTheme.colors.placeholder}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.readingFieldThird}>
                <ThemedText type="small" secondary style={styles.readingFieldLabel}>L3-L1</ThemedText>
                <TextInput
                  style={[styles.readingFieldInput, { backgroundColor: fullTheme.colors.inputBackground, borderColor: fullTheme.colors.border, color: fullTheme.colors.textPrimary }]}
                  value={reading.voltageL3L1 || ""}
                  onChangeText={(v) => updateTestReading(reading.id, "voltageL3L1", v)}
                  placeholder="0"
                  placeholderTextColor={fullTheme.colors.placeholder}
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <View style={styles.readingSubsection}>
              <ThemedText type="small" style={[styles.readingSubsectionTitle, { color: fullTheme.colors.primary }]}>
                {t.performanceTest?.amperage || "Amperage"} (A)
              </ThemedText>
            </View>
            <View style={styles.readingFieldRow}>
              <View style={styles.readingFieldThird}>
                <ThemedText type="small" secondary style={styles.readingFieldLabel}>L1</ThemedText>
                <TextInput
                  style={[styles.readingFieldInput, { backgroundColor: fullTheme.colors.inputBackground, borderColor: fullTheme.colors.border, color: fullTheme.colors.textPrimary }]}
                  value={reading.amperageL1 || ""}
                  onChangeText={(v) => updateTestReading(reading.id, "amperageL1", v)}
                  placeholder="0"
                  placeholderTextColor={fullTheme.colors.placeholder}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.readingFieldThird}>
                <ThemedText type="small" secondary style={styles.readingFieldLabel}>L2</ThemedText>
                <TextInput
                  style={[styles.readingFieldInput, { backgroundColor: fullTheme.colors.inputBackground, borderColor: fullTheme.colors.border, color: fullTheme.colors.textPrimary }]}
                  value={reading.amperageL2 || ""}
                  onChangeText={(v) => updateTestReading(reading.id, "amperageL2", v)}
                  placeholder="0"
                  placeholderTextColor={fullTheme.colors.placeholder}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.readingFieldThird}>
                <ThemedText type="small" secondary style={styles.readingFieldLabel}>L3</ThemedText>
                <TextInput
                  style={[styles.readingFieldInput, { backgroundColor: fullTheme.colors.inputBackground, borderColor: fullTheme.colors.border, color: fullTheme.colors.textPrimary }]}
                  value={reading.amperageL3 || ""}
                  onChangeText={(v) => updateTestReading(reading.id, "amperageL3", v)}
                  placeholder="0"
                  placeholderTextColor={fullTheme.colors.placeholder}
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <View style={styles.readingFieldRow}>
              <View style={styles.readingFieldFull}>
                <ThemedText type="small" secondary style={styles.readingFieldLabel}>{t.performanceTest?.powerKw || "Power"} (kW)</ThemedText>
                <TextInput
                  style={[styles.readingFieldInput, { backgroundColor: fullTheme.colors.inputBackground, borderColor: fullTheme.colors.border, color: fullTheme.colors.textPrimary }]}
                  value={reading.powerKw || ""}
                  onChangeText={(v) => updateTestReading(reading.id, "powerKw", v)}
                  placeholder="0"
                  placeholderTextColor={fullTheme.colors.placeholder}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </>
        ) : null}
        
        <View style={styles.readingFieldRow}>
          <View style={styles.readingFieldFull}>
            <ThemedText type="small" secondary style={styles.readingFieldLabel}>{t.form?.observations || "Observations"}</ThemedText>
            <TextInput
              style={[styles.readingFieldInput, styles.readingObservationsInput, { backgroundColor: fullTheme.colors.inputBackground, borderColor: fullTheme.colors.border, color: fullTheme.colors.textPrimary }]}
              value={reading.observations}
              onChangeText={(v) => updateTestReading(reading.id, "observations", v)}
              placeholder={t.form?.observations || "Observations"}
              placeholderTextColor={fullTheme.colors.placeholder}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: fullTheme.colors.background }}>
      <ScreenKeyboardAwareScrollView scrollViewRef={scrollViewRef}>
        <ThemedText type="h2" style={styles.pageTitle}>
          {t.performanceTest?.title || "Fire Pump Annual Performance Test"}
        </ThemedText>
        <ThemedText type="body" secondary style={styles.subtitle}>
          {t.performanceTest?.subtitle || "NFPA 25 Compliant Test Form"}
        </ThemedText>
        <Spacer height={Spacing.lg} />

        <SummaryHeader
          contractor={test.contractorInfo?.companyName || ""}
          jobSite={test.jobInfo?.jobName || ""}
          inspector={test.signatures?.conductedBy?.name || ""}
          pumpTag={test.pumpEquipment?.pumpTag || ""}
          testDate={test.jobInfo?.testDate || ""}
        />
        <Spacer height={Spacing.xl} />

        <SectionCard title={t.performanceTest?.sections?.contractor || "1. Contractor Information"} sectionRef={sectionRefs.contractor}>
          <ThemedText type="body" style={styles.sectionSubtitle}>{t.performanceTest?.selectContractor || "Select Contractor"}</ThemedText>
          <Spacer height={Spacing.sm} />
          <SelectPicker
            options={contractorOptions}
            selectedId={test.contractorInfo?.contractorId}
            onSelect={handleContractorSelect}
            placeholder={t.contractors?.selectContractor || "Select a contractor"}
            title={t.contractors?.selectContractor || "Select Contractor"}
            emptyText={t.contractors?.noResults || "No contractors found"}
          />
          <Spacer height={Spacing.lg} />
          {renderInputField(t.performanceTest?.companyName || "Company Name", test.contractorInfo?.companyName || "", (v) => updateContractorInfo("companyName", v))}
          {renderInputField(t.performanceTest?.address || "Address", test.contractorInfo?.address || "", (v) => updateContractorInfo("address", v))}
          <View style={styles.row}>
            <View style={styles.flex1}>
              {renderInputField(t.performanceTest?.city || "City", test.contractorInfo?.city || "", (v) => updateContractorInfo("city", v))}
            </View>
            <View style={styles.flex1}>
              {renderInputField(t.performanceTest?.state || "State", test.contractorInfo?.state || "", (v) => updateContractorInfo("state", v))}
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.flex1}>
              {renderInputField(t.performanceTest?.zipCode || "ZIP Code", test.contractorInfo?.zipCode || "", (v) => updateContractorInfo("zipCode", v))}
            </View>
            <View style={styles.flex1}>
              {renderInputField(t.performanceTest?.phone || "Phone", test.contractorInfo?.phone || "", (v) => updateContractorInfo("phone", v), { keyboardType: "phone-pad" })}
            </View>
          </View>
          {renderInputField(t.performanceTest?.email || "Email", test.contractorInfo?.email || "", (v) => updateContractorInfo("email", v), { keyboardType: "email-address" })}
          {renderInputField(t.performanceTest?.licenseNumber || "License Number", test.contractorInfo?.licenseNumber || "", (v) => updateContractorInfo("licenseNumber", v))}
        </SectionCard>

        <Spacer height={Spacing.md} />

        <SectionCard title={t.performanceTest?.sections?.job || "2. Job/Site Information"} sectionRef={sectionRefs.job}>
          <ThemedText type="body" style={styles.sectionSubtitle}>{t.performanceTest?.selectJobSite || "Select Job Site"}</ThemedText>
          <Spacer height={Spacing.sm} />
          <SelectPicker
            options={jobSiteOptions}
            selectedId={test.jobInfo?.jobSiteId}
            onSelect={handleJobSiteSelect}
            placeholder={t.jobSites?.selectJobSite || "Select a job site"}
            title={t.jobSites?.selectJobSite || "Select Job Site"}
            emptyText={t.jobSites?.noResults || "No job sites found"}
          />
          <Spacer height={Spacing.lg} />
          {renderInputField(t.performanceTest?.jobName || "Job Name", test.jobInfo?.jobName || "", (v) => updateJobInfo("jobName", v))}
          {renderInputField(t.performanceTest?.jobNumber || "Job Number", test.jobInfo?.jobNumber || "", (v) => updateJobInfo("jobNumber", v))}
          {renderInputField(t.performanceTest?.address || "Address", test.jobInfo?.address || "", (v) => updateJobInfo("address", v))}
          <View style={styles.row}>
            <View style={styles.flex1}>
              {renderInputField(t.performanceTest?.city || "City", test.jobInfo?.city || "", (v) => updateJobInfo("city", v))}
            </View>
            <View style={styles.flex1}>
              {renderInputField(t.performanceTest?.state || "State", test.jobInfo?.state || "", (v) => updateJobInfo("state", v))}
            </View>
          </View>
          <View style={styles.fieldContainer}>
            <ThemedText type="body" style={styles.fieldLabel}>{t.performanceTest?.testDate || "Test Date"}</ThemedText>
            <DatePickerField
              value={test.jobInfo?.testDate || ""}
              onChange={(v) => updateJobInfo("testDate", v)}
              placeholder={t.performanceTest?.testDate || "Test Date"}
            />
          </View>
          {renderInputField(t.performanceTest?.testLocation || "Test Location", test.jobInfo?.testLocation || "", (v) => updateJobInfo("testLocation", v))}
          <ThemedText type="body" style={styles.fieldLabel}>{t.performanceTest?.testMethod || "Test Method"}</ThemedText>
          <Spacer height={Spacing.sm} />
          <SelectPicker
            options={testMethodOptions}
            selectedId={test.jobInfo?.testMethod}
            onSelect={(v) => updateJobInfo("testMethod", v)}
            placeholder={t.performanceTest?.selectTestMethod || "Select test method"}
            title={t.performanceTest?.testMethod || "Test Method"}
          />
          <Spacer height={Spacing.md} />
          {renderInputField(t.performanceTest?.weatherConditions || "Weather Conditions", test.jobInfo?.weatherConditions || "", (v) => updateJobInfo("weatherConditions", v))}
          {renderInputField(t.performanceTest?.ambientTemp || "Ambient Temperature (F)", test.jobInfo?.ambientTemperatureF || "", (v) => updateJobInfo("ambientTemperatureF", v), { keyboardType: "numeric" })}
        </SectionCard>

        <Spacer height={Spacing.md} />

        <SectionCard title={t.performanceTest?.sections?.pump || "3. Pump Equipment"} sectionRef={sectionRefs.pump}>
          <ThemedText type="body" style={styles.sectionSubtitle}>{t.performanceTest?.dieselPerformanceTest?.selectCompany || "Select Company"}</ThemedText>
          <Spacer height={Spacing.sm} />
          <SelectPicker
            options={companyOptions}
            selectedId={selectedCompanyId}
            onSelect={handleCompanySelect}
            placeholder={t.performanceTest?.dieselPerformanceTest?.selectCompany || "Select Company"}
            title={t.performanceTest?.dieselPerformanceTest?.selectCompany || "Select Company"}
          />
          <Spacer height={Spacing.lg} />
          <ThemedText type="body" style={styles.sectionSubtitle}>{t.performanceTest?.selectElectricPump || "Select Electric Pump"}</ThemedText>
          <Spacer height={Spacing.sm} />
          <SelectPicker
            options={electricPumpOptions}
            selectedId={selectedPumpId}
            onSelect={handlePumpSelect}
            placeholder={selectedCompanyId ? (t.performanceTest?.selectElectricPump || "Select Electric Pump") : (t.performanceTest?.dieselPerformanceTest?.selectCompanyFirst || "Select a company first")}
            title={t.performanceTest?.selectElectricPump || "Select Electric Pump"}
            emptyText={t.firePumps?.noResults || "No pumps found"}
            disabled={!selectedCompanyId}
          />
          <Spacer height={Spacing.lg} />
          {renderInputField(t.performanceTest?.pumpTag || "Pump Tag/ID", test.pumpEquipment?.pumpTag || "", (v) => updatePumpEquipment("pumpTag", v))}
          {renderInputField(t.performanceTest?.manufacturer || "Manufacturer", test.pumpEquipment?.manufacturer || "", (v) => updatePumpEquipment("manufacturer", v))}
          {renderInputField(t.performanceTest?.model || "Model", test.pumpEquipment?.model || "", (v) => updatePumpEquipment("model", v))}
          {renderInputField(t.performanceTest?.serialNumber || "Serial Number", test.pumpEquipment?.serialNumber || "", (v) => updatePumpEquipment("serialNumber", v))}
          <ThemedText type="body" style={styles.fieldLabel}>{t.performanceTest?.pumpOrientation || "Pump Orientation"}</ThemedText>
          <Spacer height={Spacing.sm} />
          <SelectPicker
            options={pumpOrientationOptions}
            selectedId={test.pumpEquipment?.pumpOrientation}
            onSelect={(v) => updatePumpEquipment("pumpOrientation", v)}
            placeholder={t.performanceTest?.selectOrientation || "Select orientation"}
            title={t.performanceTest?.pumpOrientation || "Pump Orientation"}
          />
          <Spacer height={Spacing.md} />
          {renderInputField(t.performanceTest?.yearInstalled || "Year Installed", test.pumpEquipment?.yearInstalled || "", (v) => updatePumpEquipment("yearInstalled", v), { keyboardType: "numeric" })}
          <View style={styles.row}>
            <View style={styles.flex1}>
              {renderInputField(t.performanceTest?.ratedFlowGpm || "Rated Flow (GPM)", test.pumpEquipment?.ratedFlowGpm || "", (v) => updatePumpEquipment("ratedFlowGpm", v), { keyboardType: "numeric" })}
            </View>
            <View style={styles.flex1}>
              {renderInputField(t.performanceTest?.ratedPressurePsi || "Rated Pressure (PSI)", test.pumpEquipment?.ratedPressurePsi || "", (v) => updatePumpEquipment("ratedPressurePsi", v), { keyboardType: "numeric" })}
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.flex1}>
              {renderInputField(t.performanceTest?.ratedSpeedRpm || "Rated Speed (RPM)", test.pumpEquipment?.ratedSpeedRpm || "", (v) => updatePumpEquipment("ratedSpeedRpm", v), { keyboardType: "numeric" })}
            </View>
            <View style={styles.flex1}>
              {renderInputField(t.performanceTest?.shutoffPressurePsi || "Shutoff Pressure (PSI)", test.pumpEquipment?.shutoffPressurePsi || "", (v) => updatePumpEquipment("shutoffPressurePsi", v), { keyboardType: "numeric" })}
            </View>
          </View>
          {renderInputField(t.performanceTest?.peakFlowGpm || "Peak Flow (150%) GPM", test.pumpEquipment?.peakFlowGpm || "", (v) => updatePumpEquipment("peakFlowGpm", v), { keyboardType: "numeric" })}
          <View style={styles.row}>
            <View style={styles.flex1}>
              {renderInputField(t.performanceTest?.impellerDiameter || "Impeller Diameter (in)", test.pumpEquipment?.impellerDiameterIn || "", (v) => updatePumpEquipment("impellerDiameterIn", v), { keyboardType: "numeric" })}
            </View>
            <View style={styles.flex1}>
              {renderInputField(t.performanceTest?.impellerType || "Impeller Type", test.pumpEquipment?.impellerType || "", (v) => updatePumpEquipment("impellerType", v))}
            </View>
          </View>
          {renderInputField(t.performanceTest?.numberOfStages || "Number of Stages", test.pumpEquipment?.numberOfStages || "", (v) => updatePumpEquipment("numberOfStages", v), { keyboardType: "numeric" })}
          <View style={styles.row}>
            <View style={styles.flex1}>
              {renderInputField(t.performanceTest?.suctionSize || "Suction Size (in)", test.pumpEquipment?.suctionSizeIn || "", (v) => updatePumpEquipment("suctionSizeIn", v), { keyboardType: "numeric" })}
            </View>
            <View style={styles.flex1}>
              {renderInputField(t.performanceTest?.dischargeSize || "Discharge Size (in)", test.pumpEquipment?.dischargeSizeIn || "", (v) => updatePumpEquipment("dischargeSizeIn", v), { keyboardType: "numeric" })}
            </View>
          </View>
          {renderInputField(t.performanceTest?.rotationDirection || "Rotation Direction", test.pumpEquipment?.rotationDirection || "", (v) => updatePumpEquipment("rotationDirection", v))}
        </SectionCard>

        <Spacer height={Spacing.md} />

        <SectionCard title={t.performanceTest?.sections?.driver || "4. Driver Information"} sectionRef={sectionRefs.driver}>
          <ThemedText type="body" style={styles.fieldLabel}>{t.performanceTest?.driverType || "Driver Type"}</ThemedText>
          <Spacer height={Spacing.sm} />
          <SelectPicker
            options={driverTypeOptions}
            selectedId={test.driverInfo?.driverType}
            onSelect={(v) => updateDriverInfo("driverType", v)}
            placeholder={t.performanceTest?.selectDriverType || "Select driver type"}
            title={t.performanceTest?.driverType || "Driver Type"}
          />
          <Spacer height={Spacing.md} />
          {renderInputField(t.performanceTest?.manufacturer || "Manufacturer", test.driverInfo?.manufacturer || "", (v) => updateDriverInfo("manufacturer", v))}
          {renderInputField(t.performanceTest?.model || "Model", test.driverInfo?.model || "", (v) => updateDriverInfo("model", v))}
          {renderInputField(t.performanceTest?.serialNumber || "Serial Number", test.driverInfo?.serialNumber || "", (v) => updateDriverInfo("serialNumber", v))}
          <View style={styles.row}>
            <View style={styles.flex1}>
              {renderInputField(t.performanceTest?.horsePower || "Horse Power", test.driverInfo?.horsePower || "", (v) => updateDriverInfo("horsePower", v), { keyboardType: "numeric" })}
            </View>
            <View style={styles.flex1}>
              {renderInputField(t.performanceTest?.ratedRpm || "Rated RPM", test.driverInfo?.ratedRpm || "", (v) => updateDriverInfo("ratedRpm", v), { keyboardType: "numeric" })}
            </View>
          </View>
          
          {test.driverInfo?.driverType === "electric" ? (
            <>
              <View style={styles.row}>
                <View style={styles.flex1}>
                  {renderInputField(t.performanceTest?.ratedVoltage || "Rated Voltage", (test.driverInfo as any)?.ratedVoltage || "", (v) => updateDriverInfo("ratedVoltage", v), { keyboardType: "numeric" })}
                </View>
                <View style={styles.flex1}>
                  {renderInputField(t.performanceTest?.phases || "Phases", (test.driverInfo as any)?.phases || "", (v) => updateDriverInfo("phases", v), { keyboardType: "numeric" })}
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.flex1}>
                  {renderInputField(t.performanceTest?.hertz || "Hertz", (test.driverInfo as any)?.hertz || "", (v) => updateDriverInfo("hertz", v), { keyboardType: "numeric" })}
                </View>
                <View style={styles.flex1}>
                  {renderInputField(t.performanceTest?.fla || "Full Load Amps", (test.driverInfo as any)?.fullLoadAmperage || "", (v) => updateDriverInfo("fullLoadAmperage", v), { keyboardType: "numeric" })}
                </View>
              </View>
              {renderInputField(t.performanceTest?.lra || "Locked Rotor Amps", (test.driverInfo as any)?.lockedRotorAmperage || "", (v) => updateDriverInfo("lockedRotorAmperage", v), { keyboardType: "numeric" })}
              <View style={styles.row}>
                <View style={styles.flex1}>
                  {renderInputField(t.performanceTest?.serviceFactor || "Service Factor", (test.driverInfo as any)?.serviceFactor || "", (v) => updateDriverInfo("serviceFactor", v))}
                </View>
                <View style={styles.flex1}>
                  {renderInputField(t.performanceTest?.enclosureType || "Enclosure Type", (test.driverInfo as any)?.enclosureType || "", (v) => updateDriverInfo("enclosureType", v))}
                </View>
              </View>
              {renderInputField(t.performanceTest?.insulationClass || "Insulation Class", (test.driverInfo as any)?.insulationClass || "", (v) => updateDriverInfo("insulationClass", v))}
              {renderInputField(t.performanceTest?.frameSize || "Frame Size", (test.driverInfo as any)?.frameSize || "", (v) => updateDriverInfo("frameSize", v))}
            </>
          ) : (
            <>
              <View style={styles.row}>
                <View style={styles.flex1}>
                  {renderInputField(t.performanceTest?.cylinders || "Number of Cylinders", (test.driverInfo as any)?.numberOfCylinders || "", (v) => updateDriverInfo("numberOfCylinders", v), { keyboardType: "numeric" })}
                </View>
                <View style={styles.flex1}>
                  {renderInputField(t.performanceTest?.displacement || "Displacement", (test.driverInfo as any)?.displacement || "", (v) => updateDriverInfo("displacement", v))}
                </View>
              </View>
              {renderInputField(t.performanceTest?.fuelTankCapacity || "Fuel Tank Capacity (gal)", (test.driverInfo as any)?.fuelTankCapacityGal || "", (v) => updateDriverInfo("fuelTankCapacityGal", v), { keyboardType: "numeric" })}
              <View style={styles.row}>
                <View style={styles.flex1}>
                  {renderInputField(t.performanceTest?.fuelLevel || "Fuel Level", (test.driverInfo as any)?.fuelLevel || "", (v) => updateDriverInfo("fuelLevel", v))}
                </View>
                <View style={styles.flex1}>
                  {renderInputField(t.performanceTest?.oilLevel || "Oil Level", (test.driverInfo as any)?.oilLevel || "", (v) => updateDriverInfo("oilLevel", v))}
                </View>
              </View>
              {renderInputField(t.performanceTest?.coolantLevel || "Coolant Level", (test.driverInfo as any)?.coolantLevel || "", (v) => updateDriverInfo("coolantLevel", v))}
              <View style={styles.row}>
                <View style={styles.flex1}>
                  {renderInputField(t.performanceTest?.batteryVoltage1 || "Battery 1 Voltage", (test.driverInfo as any)?.batteryVoltage1 || "", (v) => updateDriverInfo("batteryVoltage1", v), { keyboardType: "numeric" })}
                </View>
                <View style={styles.flex1}>
                  {renderInputField(t.performanceTest?.batteryVoltage2 || "Battery 2 Voltage", (test.driverInfo as any)?.batteryVoltage2 || "", (v) => updateDriverInfo("batteryVoltage2", v), { keyboardType: "numeric" })}
                </View>
              </View>
              {renderInputField(t.performanceTest?.engineBlockHeater || "Engine Block Heater Status", (test.driverInfo as any)?.engineBlockHeaterStatus || "", (v) => updateDriverInfo("engineBlockHeaterStatus", v))}
            </>
          )}
        </SectionCard>

        <Spacer height={Spacing.md} />

        <SectionCard title={t.performanceTest?.sections?.controller || "5. Controller Information"} sectionRef={sectionRefs.controller}>
          {renderInputField(t.performanceTest?.manufacturer || "Manufacturer", test.controllerInfo?.manufacturer || "", (v) => updateControllerInfo("manufacturer", v))}
          {renderInputField(t.performanceTest?.model || "Model", test.controllerInfo?.model || "", (v) => updateControllerInfo("model", v))}
          {renderInputField(t.performanceTest?.serialNumber || "Serial Number", test.controllerInfo?.serialNumber || "", (v) => updateControllerInfo("serialNumber", v))}
          {renderInputField(t.performanceTest?.panelTag || "Panel Tag", test.controllerInfo?.panelTag || "", (v) => updateControllerInfo("panelTag", v))}
          <View style={styles.row}>
            <View style={styles.flex1}>
              {renderInputField(t.performanceTest?.supplyVoltage || "Supply Voltage", test.controllerInfo?.supplyVoltage || "", (v) => updateControllerInfo("supplyVoltage", v))}
            </View>
            <View style={styles.flex1}>
              {renderInputField(t.performanceTest?.startingType || "Starting Type", test.controllerInfo?.startingType || "", (v) => updateControllerInfo("startingType", v))}
            </View>
          </View>
          {renderInputField(t.performanceTest?.transferSwitchType || "Transfer Switch Type", test.controllerInfo?.transferSwitchType || "", (v) => updateControllerInfo("transferSwitchType", v))}
          {renderSwitchField(t.performanceTest?.hasAutomaticTransfer || "Automatic Transfer Switch", test.controllerInfo?.hasAutomaticTransfer || false, (v) => updateControllerInfo("hasAutomaticTransfer", v))}
          <View style={styles.row}>
            <View style={styles.flex1}>
              {renderInputField(t.performanceTest?.pressureStart || "Pressure Setting - Start (PSI)", test.controllerInfo?.pressureSettingStart || "", (v) => updateControllerInfo("pressureSettingStart", v), { keyboardType: "numeric" })}
            </View>
            <View style={styles.flex1}>
              {renderInputField(t.performanceTest?.pressureStop || "Pressure Setting - Stop (PSI)", test.controllerInfo?.pressureSettingStop || "", (v) => updateControllerInfo("pressureSettingStop", v), { keyboardType: "numeric" })}
            </View>
          </View>
          {renderSwitchField(t.performanceTest?.hasLowSuctionCutoff || "Low Suction Cutoff", test.controllerInfo?.hasLowSuctionCutoff || false, (v) => updateControllerInfo("hasLowSuctionCutoff", v))}
          {test.controllerInfo?.hasLowSuctionCutoff ? (
            renderInputField(t.performanceTest?.lowSuctionCutoffPsi || "Low Suction Cutoff (PSI)", test.controllerInfo?.lowSuctionCutoffPsi || "", (v) => updateControllerInfo("lowSuctionCutoffPsi", v), { keyboardType: "numeric" })
          ) : null}
          {renderSwitchField(t.performanceTest?.hasPhaseReversal || "Phase Reversal Protection", test.controllerInfo?.hasPhaseReversal || false, (v) => updateControllerInfo("hasPhaseReversal", v))}
          {renderSwitchField(t.performanceTest?.hasPhaseLoss || "Phase Loss Protection", test.controllerInfo?.hasPhaseLoss || false, (v) => updateControllerInfo("hasPhaseLoss", v))}
          {renderSwitchField(t.performanceTest?.hasOvercurrent || "Overcurrent Protection", test.controllerInfo?.hasOvercurrent || false, (v) => updateControllerInfo("hasOvercurrent", v))}
        </SectionCard>

        <Spacer height={Spacing.md} />

        <SectionCard title={t.performanceTest?.sections?.power || "6. Power Supply"} sectionRef={sectionRefs.power}>
          {renderInputField(t.performanceTest?.normalSourceDesc || "Normal Power Source Description", test.powerSupply?.normalSourceDescription || "", (v) => updatePowerSupply("normalSourceDescription", v))}
          <ThemedText type="body" style={styles.fieldLabel}>{t.performanceTest?.normalSourceVoltage || "Normal Source Voltage"}</ThemedText>
          <View style={styles.row}>
            <View style={styles.flex1}>
              {renderInputField("L1-L2", test.powerSupply?.normalSourceVoltageL1L2 || "", (v) => updatePowerSupply("normalSourceVoltageL1L2", v), { keyboardType: "numeric" })}
            </View>
            <View style={styles.flex1}>
              {renderInputField("L2-L3", test.powerSupply?.normalSourceVoltageL2L3 || "", (v) => updatePowerSupply("normalSourceVoltageL2L3", v), { keyboardType: "numeric" })}
            </View>
            <View style={styles.flex1}>
              {renderInputField("L3-L1", test.powerSupply?.normalSourceVoltageL3L1 || "", (v) => updatePowerSupply("normalSourceVoltageL3L1", v), { keyboardType: "numeric" })}
            </View>
          </View>
          {renderSwitchField(t.performanceTest?.emergencySourceAvailable || "Emergency Source Available", test.powerSupply?.emergencySourceAvailable || false, (v) => updatePowerSupply("emergencySourceAvailable", v))}
          {test.powerSupply?.emergencySourceAvailable ? (
            <>
              {renderInputField(t.performanceTest?.emergencySourceDesc || "Emergency Source Description", test.powerSupply?.emergencySourceDescription || "", (v) => updatePowerSupply("emergencySourceDescription", v))}
              <ThemedText type="body" style={styles.fieldLabel}>{t.performanceTest?.emergencySourceVoltage || "Emergency Source Voltage"}</ThemedText>
              <View style={styles.row}>
                <View style={styles.flex1}>
                  {renderInputField("L1-L2", test.powerSupply?.emergencySourceVoltageL1L2 || "", (v) => updatePowerSupply("emergencySourceVoltageL1L2", v), { keyboardType: "numeric" })}
                </View>
                <View style={styles.flex1}>
                  {renderInputField("L2-L3", test.powerSupply?.emergencySourceVoltageL2L3 || "", (v) => updatePowerSupply("emergencySourceVoltageL2L3", v), { keyboardType: "numeric" })}
                </View>
                <View style={styles.flex1}>
                  {renderInputField("L3-L1", test.powerSupply?.emergencySourceVoltageL3L1 || "", (v) => updatePowerSupply("emergencySourceVoltageL3L1", v), { keyboardType: "numeric" })}
                </View>
              </View>
              {renderInputField(t.performanceTest?.transferTime || "Transfer Time (seconds)", test.powerSupply?.transferTimeSeconds || "", (v) => updatePowerSupply("transferTimeSeconds", v), { keyboardType: "numeric" })}
            </>
          ) : null}
        </SectionCard>

        <Spacer height={Spacing.md} />

        <SectionCard title={t.performanceTest?.sections?.supply || "7. Water Supply Conditions"} sectionRef={sectionRefs.supply}>
          <ThemedText type="body" style={styles.fieldLabel}>{t.performanceTest?.supplySource || "Supply Source"}</ThemedText>
          <Spacer height={Spacing.sm} />
          <SelectPicker
            options={supplySourceOptions}
            selectedId={test.supplyConditions?.supplySource}
            onSelect={(v) => updateSupplyConditions("supplySource", v)}
            placeholder={t.performanceTest?.selectSupplySource || "Select supply source"}
            title={t.performanceTest?.supplySource || "Supply Source"}
          />
          <Spacer height={Spacing.md} />
          {test.supplyConditions?.supplySource === "other" ? (
            renderInputField(t.performanceTest?.supplySourceOther || "Other Supply Source", test.supplyConditions?.supplySourceOther || "", (v) => updateSupplyConditions("supplySourceOther", v))
          ) : null}
          <View style={styles.row}>
            <View style={styles.flex1}>
              {renderInputField(t.performanceTest?.staticPressure || "Static Pressure (PSI)", test.supplyConditions?.staticPressurePsi || "", (v) => updateSupplyConditions("staticPressurePsi", v), { keyboardType: "numeric" })}
            </View>
            <View style={styles.flex1}>
              {renderInputField(t.performanceTest?.residualPressure || "Residual Pressure (PSI)", test.supplyConditions?.residualPressurePsi || "", (v) => updateSupplyConditions("residualPressurePsi", v), { keyboardType: "numeric" })}
            </View>
          </View>
          {renderInputField(t.performanceTest?.suctionReservoirLevel || "Suction Reservoir Level", test.supplyConditions?.suctionReservoirLevel || "", (v) => updateSupplyConditions("suctionReservoirLevel", v))}
          {renderInputField(t.performanceTest?.waterTemperature || "Water Temperature (F)", test.supplyConditions?.waterTemperatureF || "", (v) => updateSupplyConditions("waterTemperatureF", v), { keyboardType: "numeric" })}
          {renderSwitchField(t.performanceTest?.hasSuctionScreen || "Suction Screen Installed", test.supplyConditions?.hasSuctionScreen || false, (v) => updateSupplyConditions("hasSuctionScreen", v))}
          {test.supplyConditions?.hasSuctionScreen ? (
            renderInputField(t.performanceTest?.suctionScreenCondition || "Suction Screen Condition", test.supplyConditions?.suctionScreenCondition || "", (v) => updateSupplyConditions("suctionScreenCondition", v))
          ) : null}
        </SectionCard>

        <Spacer height={Spacing.md} />

        <SectionCard title={t.performanceTest?.sections?.demand || "8. System Demand"} sectionRef={sectionRefs.demand}>
          <View style={styles.row}>
            <View style={styles.flex1}>
              {renderInputField(t.performanceTest?.systemDemandGpm || "System Demand (GPM)", test.systemDemand?.systemDemandGpm || "", (v) => updateSystemDemand("systemDemandGpm", v), { keyboardType: "numeric" })}
            </View>
            <View style={styles.flex1}>
              {renderInputField(t.performanceTest?.systemDemandPsi || "System Demand (PSI)", test.systemDemand?.systemDemandPsi || "", (v) => updateSystemDemand("systemDemandPsi", v), { keyboardType: "numeric" })}
            </View>
          </View>
          {renderInputField(t.performanceTest?.hoseDemandGpm || "Hose Stream Demand (GPM)", test.systemDemand?.hoseDemandGpm || "", (v) => updateSystemDemand("hoseDemandGpm", v), { keyboardType: "numeric" })}
          <View style={styles.row}>
            <View style={styles.flex1}>
              {renderInputField(t.performanceTest?.totalDemandGpm || "Total Demand (GPM)", test.systemDemand?.totalDemandGpm || "", (v) => updateSystemDemand("totalDemandGpm", v), { keyboardType: "numeric" })}
            </View>
            <View style={styles.flex1}>
              {renderInputField(t.performanceTest?.totalDemandPsi || "Total Demand (PSI)", test.systemDemand?.totalDemandPsi || "", (v) => updateSystemDemand("totalDemandPsi", v), { keyboardType: "numeric" })}
            </View>
          </View>
        </SectionCard>

        <Spacer height={Spacing.md} />

        <SectionCard title={t.performanceTest?.sections?.conditions || "9. Test Conditions & Readings"} sectionRef={sectionRefs.conditions}>
          <View style={styles.row}>
            <View style={styles.flex1}>
              {renderInputField(t.performanceTest?.suctionGauge || "Suction Gauge (PSI)", test.testConditions?.suctionGaugePsi || "", (v) => updateTestConditions("suctionGaugePsi", v), { keyboardType: "numeric" })}
            </View>
            <View style={styles.flex1}>
              {renderInputField(t.performanceTest?.dischargeGauge || "Discharge Gauge (PSI)", test.testConditions?.dischargeGaugePsi || "", (v) => updateTestConditions("dischargeGaugePsi", v), { keyboardType: "numeric" })}
            </View>
          </View>
          {renderInputField(t.performanceTest?.flowMeterType || "Flow Meter Type", test.testConditions?.flowMeterType || "", (v) => updateTestConditions("flowMeterType", v))}
          <View style={styles.row}>
            <View style={styles.flex1}>
              {renderInputField(t.performanceTest?.flowMeterSize || "Flow Meter Size", test.testConditions?.flowMeterSize || "", (v) => updateTestConditions("flowMeterSize", v))}
            </View>
            <View style={styles.flex1}>
              <View style={styles.fieldContainer}>
                <ThemedText type="body" style={styles.fieldLabel}>{t.performanceTest?.calibrationDate || "Calibration Date"}</ThemedText>
                <DatePickerField
                  value={test.testConditions?.flowMeterCalibrationDate || ""}
                  onChange={(v) => updateTestConditions("flowMeterCalibrationDate", v)}
                  placeholder={t.performanceTest?.calibrationDate || "Calibration Date"}
                />
              </View>
            </View>
          </View>
          
          <Spacer height={Spacing.lg} />
          <ThemedText type="h3">{t.performanceTest?.testReadings || "Test Readings"}</ThemedText>
          <ThemedText type="small" secondary>{t.performanceTest?.readingsHelp || "Enter readings at each flow percentage"}</ThemedText>
          <Spacer height={Spacing.md} />
          
          {test.testConditions?.readings.map((reading) => renderTestReadingRow(reading, test.driverInfo?.driverType === "electric"))}
        </SectionCard>

        <Spacer height={Spacing.md} />

        <SectionCard title={t.performanceTest?.sections?.results || "10. Results Summary"} sectionRef={sectionRefs.results}>
          <ThemedText type="h4">{t.performanceTest?.shutoffTest || "Shutoff (Churn) Test"}</ThemedText>
          <Spacer height={Spacing.sm} />
          <View style={styles.row}>
            <View style={styles.flex1}>
              {renderInputField(t.performanceTest?.actual || "Actual (PSI)", test.resultsSummary?.shutoffPressureActual || "", (v) => updateResultsSummary("shutoffPressureActual", v), { keyboardType: "numeric" })}
            </View>
            <View style={styles.flex1}>
              {renderInputField(t.performanceTest?.rated || "Rated (PSI)", test.resultsSummary?.shutoffPressureRated || "", (v) => updateResultsSummary("shutoffPressureRated", v), { keyboardType: "numeric" })}
            </View>
          </View>
          
          <Spacer height={Spacing.lg} />
          <ThemedText type="h4">{t.performanceTest?.ratedFlowTest || "100% Rated Flow Test"}</ThemedText>
          <Spacer height={Spacing.sm} />
          <View style={styles.row}>
            <View style={styles.flex1}>
              {renderInputField(t.performanceTest?.actual || "Actual (PSI)", test.resultsSummary?.ratedFlowPressureActual || "", (v) => updateResultsSummary("ratedFlowPressureActual", v), { keyboardType: "numeric" })}
            </View>
            <View style={styles.flex1}>
              {renderInputField(t.performanceTest?.rated || "Rated (PSI)", test.resultsSummary?.ratedFlowPressureRated || "", (v) => updateResultsSummary("ratedFlowPressureRated", v), { keyboardType: "numeric" })}
            </View>
          </View>
          
          <Spacer height={Spacing.lg} />
          <ThemedText type="h4">{t.performanceTest?.peakFlowTest || "150% Peak Flow Test"}</ThemedText>
          <Spacer height={Spacing.sm} />
          <View style={styles.row}>
            <View style={styles.flex1}>
              {renderInputField(t.performanceTest?.actual || "Actual (PSI)", test.resultsSummary?.peakFlowPressureActual || "", (v) => updateResultsSummary("peakFlowPressureActual", v), { keyboardType: "numeric" })}
            </View>
            <View style={styles.flex1}>
              {renderInputField(t.performanceTest?.minimum || "Minimum (PSI)", test.resultsSummary?.peakFlowPressureMin || "", (v) => updateResultsSummary("peakFlowPressureMin", v), { keyboardType: "numeric" })}
            </View>
          </View>
        </SectionCard>

        <Spacer height={Spacing.md} />

        <SectionCard title={t.performanceTest?.sections?.observations || "11. Observations & Deficiencies"} sectionRef={sectionRefs.observations}>
          {renderInputField(t.performanceTest?.generalObservations || "General Observations", test.observationsDeficiencies?.generalObservations || "", (v) => updateObservations("generalObservations", v), { multiline: true })}
          
          <Spacer height={Spacing.lg} />
          <View style={styles.deficiencyHeader}>
            <ThemedText type="h4">{t.performanceTest?.deficiencies || "Deficiencies"}</ThemedText>
            <Pressable onPress={addDeficiency} style={[styles.addButton, { backgroundColor: fullTheme.colors.primary }]}>
              <Feather name="plus" size={16} color="#FFFFFF" />
              <ThemedText type="small" style={{ color: "#FFFFFF", marginLeft: Spacing.xs }}>{t.performanceTest?.addDeficiency || "Add"}</ThemedText>
            </Pressable>
          </View>
          
          {test.observationsDeficiencies?.deficiencies.map((deficiency, index) => (
            <View key={deficiency.id} style={[styles.deficiencyCard, { backgroundColor: fullTheme.colors.backgroundSecondary, borderColor: fullTheme.colors.border }]}>
              <View style={styles.deficiencyCardHeader}>
                <ThemedText type="body">{t.performanceTest?.deficiency || "Deficiency"} #{index + 1}</ThemedText>
                <Pressable onPress={() => removeDeficiency(deficiency.id)}>
                  <Feather name="trash-2" size={18} color={fullTheme.colors.error} />
                </Pressable>
              </View>
              {renderInputField(t.performanceTest?.description || "Description", deficiency.description, (v) => updateDeficiency(deficiency.id, "description", v), { multiline: true })}
              {renderInputField(t.performanceTest?.recommendedAction || "Recommended Action", deficiency.recommendedAction, (v) => updateDeficiency(deficiency.id, "recommendedAction", v))}
              <View style={styles.fieldContainer}>
                <ThemedText type="body" style={styles.fieldLabel}>{t.performanceTest?.targetDate || "Target Completion Date"}</ThemedText>
                <DatePickerField
                  value={deficiency.targetCompletionDate}
                  onChange={(v) => updateDeficiency(deficiency.id, "targetCompletionDate", v)}
                  placeholder={t.performanceTest?.targetDate || "Target Completion Date"}
                />
              </View>
            </View>
          ))}
          
          <Spacer height={Spacing.lg} />
          {renderInputField(t.performanceTest?.recommendedMaintenance || "Recommended Maintenance Actions", test.observationsDeficiencies?.recommendedMaintenanceActions || "", (v) => updateObservations("recommendedMaintenanceActions", v), { multiline: true })}
          <View style={styles.fieldContainer}>
            <ThemedText type="body" style={styles.fieldLabel}>{t.performanceTest?.nextTestDue || "Next Test Due Date"}</ThemedText>
            <DatePickerField
              value={test.observationsDeficiencies?.nextTestDueDate || ""}
              onChange={(v) => updateObservations("nextTestDueDate", v)}
              placeholder={t.performanceTest?.nextTestDue || "Next Test Due Date"}
            />
          </View>
        </SectionCard>

        <Spacer height={Spacing.md} />

        <SectionCard title={t.performanceTest?.sections?.signatures || "12. Signatures"} sectionRef={sectionRefs.signatures}>
          <ThemedText type="h4">{t.performanceTest?.conductedBy || "Test Conducted By"}</ThemedText>
          <Spacer height={Spacing.sm} />
          <ThemedText type="body" style={styles.sectionSubtitle}>{t.performanceTest?.selectInspector || "Select Inspector"}</ThemedText>
          <Spacer height={Spacing.sm} />
          <SelectPicker
            options={inspectorOptions}
            selectedId={selectedInspectorId}
            onSelect={handleInspectorSelect}
            placeholder={t.performanceTest?.selectInspector || "Select Inspector"}
            title={t.performanceTest?.selectInspector || "Select Inspector"}
            emptyText="No inspectors found"
          />
          <Spacer height={Spacing.lg} />
          {renderInputField(t.performanceTest?.name || "Name", test.signatures?.conductedBy.name || "", (v) => updateConductedBySignature("name", v))}
          {renderInputField(t.performanceTest?.titleField || "Title", test.signatures?.conductedBy.title || "", (v) => updateConductedBySignature("title", v))}
          {renderInputField(t.performanceTest?.company || "Company", test.signatures?.conductedBy.company || "", (v) => updateConductedBySignature("company", v))}
          <View style={styles.fieldContainer}>
            <ThemedText type="body" style={styles.fieldLabel}>{t.performanceTest?.date || "Date"}</ThemedText>
            <DatePickerField
              value={test.signatures?.conductedBy.date || ""}
              onChange={(v) => updateConductedBySignature("date", v)}
              placeholder={t.performanceTest?.date || "Date"}
            />
          </View>
          
          <Spacer height={Spacing.md} />
          <ThemedText type="body" style={styles.fieldLabel}>{t.performanceTest?.signature || "Signature"}</ThemedText>
          <Spacer height={Spacing.sm} />
          <SignatureCapture
            signature={test.signatures?.conductedBy.signatureData || null}
            onSignatureChange={(sig) => updateConductedBySignature("signatureData", sig)}
          />
        </SectionCard>

        <Spacer height={Spacing.md} />

        <SectionCard title={t.performanceTest?.sections?.attachments || "13. Attachments"} sectionRef={sectionRefs.attachments}>
          {renderSwitchField(t.performanceTest?.pumpCurveAttached || "Pump Curve Attached", test.attachments?.pumpCurveAttached || false, (v) => setTest(prev => ({ ...prev, attachments: { ...prev.attachments!, pumpCurveAttached: v } })))}
          {renderSwitchField(t.performanceTest?.previousTestAttached || "Previous Test Report Attached", test.attachments?.previousTestReportAttached || false, (v) => setTest(prev => ({ ...prev, attachments: { ...prev.attachments!, previousTestReportAttached: v } })))}
          {renderInputField(t.performanceTest?.additionalNotes || "Additional Notes", test.attachments?.additionalNotes || "", (v) => setTest(prev => ({ ...prev, attachments: { ...prev.attachments!, additionalNotes: v } })), { multiline: true })}
        </SectionCard>

        <Spacer height={Spacing.xl} />
        <View style={{ height: 80 + tabBarHeight }} />
      </ScreenKeyboardAwareScrollView>

      <View style={[styles.stickyBottomBar, { backgroundColor: fullTheme.colors.cardBackground, borderTopColor: fullTheme.colors.border, paddingBottom: Spacing.md, bottom: tabBarHeight }]}>
        <Pressable
          onPress={handleSaveDraft}
          style={[styles.actionButton, { backgroundColor: fullTheme.colors.backgroundSecondary, borderColor: fullTheme.colors.border }]}
        >
          <Feather name="save" size={18} color={fullTheme.colors.textPrimary} />
          <ThemedText type="small" style={{ marginLeft: Spacing.xs }}>{t.performanceTest?.saveDraft || "Save Draft"}</ThemedText>
        </Pressable>
        <Pressable
          onPress={handleSubmit}
          style={[styles.actionButton, styles.submitButton, { backgroundColor: fullTheme.colors.primary }]}
        >
          <Feather name="check-circle" size={18} color="#FFFFFF" />
          <ThemedText type="small" style={{ marginLeft: Spacing.xs, color: "#FFFFFF" }}>{t.performanceTest?.submit || "Submit"}</ThemedText>
        </Pressable>
        <Pressable
          onPress={handleExportPdf}
          style={[styles.actionButton, { backgroundColor: fullTheme.colors.backgroundSecondary, borderColor: fullTheme.colors.border }]}
        >
          <Feather name="file-text" size={18} color={fullTheme.colors.textPrimary} />
          <ThemedText type="small" style={{ marginLeft: Spacing.xs }}>{t.performanceTest?.exportPdf || "PDF"}</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pageTitle: {
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
  },
  summaryHeader: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
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
  jumpButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  section: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  sectionTitle: {
    flex: 1,
  },
  sectionContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  sectionSubtitle: {
    marginBottom: Spacing.xs,
  },
  fieldContainer: {
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    marginBottom: Spacing.xs,
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
  row: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  flex1: {
    flex: 1,
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
  readingLabel: {
    marginBottom: Spacing.sm,
    fontWeight: "600",
  },
  readingInputs: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  readingInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    fontSize: 14,
  },
  readingNetPressure: {
    width: 60,
    textAlign: "right",
  },
  readingCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    overflow: "hidden",
  },
  readingHeader: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  readingHeaderText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  readingContent: {
    padding: Spacing.md,
  },
  readingFieldRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  readingFieldHalf: {
    flex: 1,
  },
  readingFieldThird: {
    flex: 1,
  },
  readingFieldFull: {
    flex: 1,
  },
  readingFieldLabel: {
    marginBottom: Spacing.xs,
    fontSize: 12,
  },
  readingFieldInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    fontSize: 14,
  },
  readingFieldCalculated: {
    height: 40,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  readingSubsection: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  readingSubsectionTitle: {
    fontWeight: "600",
    fontSize: 12,
  },
  readingObservationsInput: {
    height: 60,
    paddingTop: Spacing.sm,
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
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  jumpModal: {
    width: "100%",
    maxHeight: "80%",
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  jumpModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
  },
  jumpModalList: {
    maxHeight: 400,
  },
  jumpModalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
});
