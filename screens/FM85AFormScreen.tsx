import React, { useState, useEffect, useLayoutEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  Platform,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { SignatureCapture } from "@/components/SignatureCapture";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";
import {
  FM85ACertificate,
  FM85ASprinkler,
  FM85APipe,
  FM85APipeConnection,
  FM85APipeHanger,
  FM85AAlarmCheckDryPipeReleaseValve,
  FM85ADetectionReleaseValve,
  FM85AControlOrPressureReducingValve,
  FM85ACheckOrBackflowValve,
  FM85AOtherComponent,
  FM85ADryPipeOrAutoReleaseTesting,
  FM85APressureReducingValveTesting,
  FM85ABlankTestingGasket,
  FM85ADrainTest,
  createEmptyFM85ACertificate,
  createEmptySprinkler,
  createEmptyPipe,
  createEmptyPipeConnection,
  createEmptyPipeHanger,
  createEmptyAlarmCheckDryPipeReleaseValve,
  createEmptyDetectionReleaseValve,
  createEmptyControlOrPressureReducingValve,
  createEmptyCheckOrBackflowValve,
  createEmptyOtherComponent,
  createEmptyDryPipeOrAutoReleaseTesting,
  createEmptyPressureReducingValveTesting,
  createEmptyBlankTestingGasket,
  createEmptyDrainTest,
} from "@/types/fm85a";
import AsyncStorage from "@react-native-async-storage/async-storage";

type FM85AFormScreenProps = NativeStackScreenProps<any, "FM85AForm">;

const FM85A_STORAGE_KEY = "fm85a_certificates";

export default function FM85AFormScreen({ navigation, route }: FM85AFormScreenProps) {
  const { theme, fullTheme } = useTheme();
  const { t, language } = useLanguage();
  const certificateId = route.params?.certificateId;
  const isEditing = !!certificateId;

  const [certificate, setCertificate] = useState<FM85ACertificate>(createEmptyFM85ACertificate());
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    contractor: true,
    client: true,
    sprinklers: false,
    pipe: false,
    pipeConnections: false,
    pipeHangers: false,
    alarmValves: false,
    autoReleaseQuestions: false,
    detectionValves: false,
    detectionElectricQuestions: false,
    controlValves: false,
    checkValves: false,
    miscComponents: false,
    otherComponents: false,
    testsHydrostatic: false,
    testsDryPipe: false,
    testsPressureReducing: false,
    testsBlankGaskets: false,
    testsWelded: false,
    testsDrain: false,
    testsUnderground: false,
    testsInstruction: false,
    signatures: false,
    notes: false,
  });
  const [showDatePicker, setShowDatePicker] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fm85a = t.fm85a || {};

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: isEditing 
        ? (fm85a.editCertificate || "Edit FM85A Certificate")
        : (fm85a.newCertificate || "New FM85A Certificate"),
    });
  }, [navigation, isEditing, fm85a]);

  useEffect(() => {
    if (isEditing) {
      loadCertificate();
    } else {
      const newCert = createEmptyFM85ACertificate();
      newCert.id = Date.now().toString();
      newCert.createdAt = new Date().toISOString();
      newCert.updatedAt = new Date().toISOString();
      newCert.contractorInfo.date = new Date().toISOString().split('T')[0];
      setCertificate(newCert);
    }
  }, [certificateId]);

  const loadCertificate = async () => {
    try {
      const stored = await AsyncStorage.getItem(FM85A_STORAGE_KEY);
      if (stored) {
        const certificates: FM85ACertificate[] = JSON.parse(stored);
        const found = certificates.find(c => c.id === certificateId);
        if (found) {
          setCertificate(found);
        }
      }
    } catch (error) {
      console.error("Error loading FM85A certificate:", error);
    }
  };

  const saveCertificate = async (showAlert = true) => {
    setIsSaving(true);
    try {
      const stored = await AsyncStorage.getItem(FM85A_STORAGE_KEY);
      let certificates: FM85ACertificate[] = stored ? JSON.parse(stored) : [];
      
      const updatedCert = {
        ...certificate,
        updatedAt: new Date().toISOString(),
      };

      const existingIndex = certificates.findIndex(c => c.id === updatedCert.id);
      if (existingIndex >= 0) {
        certificates[existingIndex] = updatedCert;
      } else {
        certificates.push(updatedCert);
      }

      await AsyncStorage.setItem(FM85A_STORAGE_KEY, JSON.stringify(certificates));
      
      if (showAlert) {
        Alert.alert(
          t.common?.success || "Success",
          fm85a.savedSuccessfully || "Certificate saved successfully",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error("Error saving FM85A certificate:", error);
      Alert.alert(t.common?.error || "Error", fm85a.saveError || "Failed to save certificate");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateContractorInfo = (field: string, value: string) => {
    setCertificate(prev => ({
      ...prev,
      contractorInfo: { ...prev.contractorInfo, [field]: value }
    }));
  };

  const updateClientInfo = (field: string, value: string) => {
    setCertificate(prev => ({
      ...prev,
      clientInfo: { ...prev.clientInfo, [field]: value }
    }));
  };

  const updateTests = (field: string, value: any) => {
    setCertificate(prev => ({
      ...prev,
      tests: { ...prev.tests, [field]: value }
    }));
  };

  const updateSignatures = (field: string, value: string) => {
    setCertificate(prev => ({
      ...prev,
      signatures: { ...prev.signatures, [field]: value }
    }));
  };

  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString + "T00:00:00");
      return date.toLocaleDateString(language === "pt-BR" ? "pt-BR" : "en-US");
    } catch {
      return dateString;
    }
  };

  const handleDateChange = (field: string, event: any, selectedDate?: Date) => {
    setShowDatePicker(null);
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      if (field.startsWith("contractor.")) {
        updateContractorInfo(field.replace("contractor.", ""), dateStr);
      } else if (field.startsWith("signatures.")) {
        updateSignatures(field.replace("signatures.", ""), dateStr);
      } else if (field === "dateSystemLeftInService") {
        updateTests("dateSystemLeftInServiceAllValvesOpen", dateStr);
      }
    }
  };

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }
  ];

  const SectionHeader = ({ title, section, count }: { title: string; section: string; count?: number }) => (
    <Pressable
      style={[styles.sectionHeader, { backgroundColor: fullTheme.colors.primary + "15", borderColor: fullTheme.colors.primary }]}
      onPress={() => toggleSection(section)}
    >
      <View style={styles.sectionHeaderLeft}>
        <ThemedText style={[styles.sectionTitle, { color: fullTheme.colors.primary }]}>
          {title}
        </ThemedText>
        {count !== undefined && count > 0 && (
          <View style={[styles.countBadge, { backgroundColor: fullTheme.colors.primary }]}>
            <Text style={styles.countText}>{count}</Text>
          </View>
        )}
      </View>
      <Feather
        name={expandedSections[section] ? "chevron-up" : "chevron-down"}
        size={20}
        color={fullTheme.colors.primary}
      />
    </Pressable>
  );

  const YesNoSelector = ({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) => (
    <View style={styles.yesNoContainer}>
      <ThemedText style={styles.fieldLabel}>{label}</ThemedText>
      <View style={styles.yesNoButtons}>
        <Pressable
          style={[
            styles.yesNoButton,
            value === "Y" && { backgroundColor: fullTheme.colors.success },
            { borderColor: theme.border }
          ]}
          onPress={() => onChange("Y")}
        >
          <Text style={[styles.yesNoText, value === "Y" && { color: "#fff" }]}>Y</Text>
        </Pressable>
        <Pressable
          style={[
            styles.yesNoButton,
            value === "N" && { backgroundColor: fullTheme.colors.error },
            { borderColor: theme.border }
          ]}
          onPress={() => onChange("N")}
        >
          <Text style={[styles.yesNoText, value === "N" && { color: "#fff" }]}>N</Text>
        </Pressable>
      </View>
    </View>
  );

  const DatePickerField = ({ value, label, fieldKey }: { value: string; label: string; fieldKey: string }) => (
    <View style={styles.fieldContainer}>
      <ThemedText style={styles.fieldLabel}>{label}</ThemedText>
      <Pressable
        style={[inputStyle, styles.dateInput]}
        onPress={() => setShowDatePicker(fieldKey)}
      >
        <ThemedText>{value ? formatDateForDisplay(value) : (fm85a.selectDate || "Select date")}</ThemedText>
        <Feather name="calendar" size={18} color={theme.textSecondary} />
      </Pressable>
      {showDatePicker === fieldKey && (
        <DateTimePicker
          value={value ? new Date(value + "T00:00:00") : new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(e, d) => handleDateChange(fieldKey, e, d)}
        />
      )}
    </View>
  );

  const addTableRow = <T,>(
    array: T[],
    createEmpty: () => T,
    updateFn: (newArray: T[]) => void
  ) => {
    updateFn([...array, createEmpty()]);
  };

  const removeTableRow = <T,>(
    array: T[],
    index: number,
    updateFn: (newArray: T[]) => void
  ) => {
    const newArray = [...array];
    newArray.splice(index, 1);
    updateFn(newArray);
  };

  const updateTableRow = <T,>(
    array: T[],
    index: number,
    field: keyof T,
    value: string,
    updateFn: (newArray: T[]) => void
  ) => {
    const newArray = [...array];
    (newArray[index] as any)[field] = value;
    updateFn(newArray);
  };

  const TableAddButton = ({ onPress }: { onPress: () => void }) => (
    <Pressable style={[styles.addButton, { borderColor: fullTheme.colors.primary }]} onPress={onPress}>
      <Feather name="plus" size={16} color={fullTheme.colors.primary} />
      <Text style={[styles.addButtonText, { color: fullTheme.colors.primary }]}>
        {fm85a.addRow || "Add Row"}
      </Text>
    </Pressable>
  );

  const TableRemoveButton = ({ onPress }: { onPress: () => void }) => (
    <Pressable style={styles.removeButton} onPress={onPress}>
      <Feather name="trash-2" size={16} color={fullTheme.colors.error} />
    </Pressable>
  );

  const renderSprinklersTable = () => (
    <>
      {certificate.sprinklers.map((item, index) => (
        <View key={index} style={[styles.tableRow, { borderColor: theme.border }]}>
          <View style={styles.tableRowHeader}>
            <ThemedText style={styles.tableRowTitle}>{fm85a.sprinkler || "Sprinkler"} #{index + 1}</ThemedText>
            <TableRemoveButton onPress={() => removeTableRow(
              certificate.sprinklers,
              index,
              (arr) => setCertificate(prev => ({ ...prev, sprinklers: arr }))
            )} />
          </View>
          <TextInput
            style={inputStyle}
            placeholder={fm85a.manufacturer || "Manufacturer"}
            placeholderTextColor={theme.textSecondary}
            value={item.manufacturer}
            onChangeText={(v) => updateTableRow(certificate.sprinklers, index, "manufacturer", v, (arr) => setCertificate(prev => ({ ...prev, sprinklers: arr })))}
          />
          <TextInput
            style={inputStyle}
            placeholder={fm85a.modelTradeName || "Model/Trade Name"}
            placeholderTextColor={theme.textSecondary}
            value={item.modelTradeName}
            onChangeText={(v) => updateTableRow(certificate.sprinklers, index, "modelTradeName", v, (arr) => setCertificate(prev => ({ ...prev, sprinklers: arr })))}
          />
          <View style={styles.rowHalf}>
            <TextInput
              style={[inputStyle, styles.halfInput]}
              placeholder={fm85a.kFactor || "K-Factor"}
              placeholderTextColor={theme.textSecondary}
              value={item.kFactor}
              onChangeText={(v) => updateTableRow(certificate.sprinklers, index, "kFactor", v, (arr) => setCertificate(prev => ({ ...prev, sprinklers: arr })))}
              keyboardType="numeric"
            />
            <TextInput
              style={[inputStyle, styles.halfInput]}
              placeholder={fm85a.temperatureRating || "Temp Rating"}
              placeholderTextColor={theme.textSecondary}
              value={item.temperatureRating}
              onChangeText={(v) => updateTableRow(certificate.sprinklers, index, "temperatureRating", v, (arr) => setCertificate(prev => ({ ...prev, sprinklers: arr })))}
            />
          </View>
          <View style={styles.rowHalf}>
            <TextInput
              style={[inputStyle, styles.halfInput]}
              placeholder={fm85a.sin || "SIN"}
              placeholderTextColor={theme.textSecondary}
              value={item.sin}
              onChangeText={(v) => updateTableRow(certificate.sprinklers, index, "sin", v, (arr) => setCertificate(prev => ({ ...prev, sprinklers: arr })))}
            />
            <TextInput
              style={[inputStyle, styles.halfInput]}
              placeholder={fm85a.yearOfManufacture || "Year"}
              placeholderTextColor={theme.textSecondary}
              value={item.yearOfManufacture}
              onChangeText={(v) => updateTableRow(certificate.sprinklers, index, "yearOfManufacture", v, (arr) => setCertificate(prev => ({ ...prev, sprinklers: arr })))}
              keyboardType="numeric"
            />
          </View>
          <TextInput
            style={inputStyle}
            placeholder={fm85a.quantity || "Quantity"}
            placeholderTextColor={theme.textSecondary}
            value={item.quantity}
            onChangeText={(v) => updateTableRow(certificate.sprinklers, index, "quantity", v, (arr) => setCertificate(prev => ({ ...prev, sprinklers: arr })))}
            keyboardType="numeric"
          />
        </View>
      ))}
      <TableAddButton onPress={() => addTableRow(
        certificate.sprinklers,
        createEmptySprinkler,
        (arr) => setCertificate(prev => ({ ...prev, sprinklers: arr }))
      )} />
    </>
  );

  const renderPipeTable = () => (
    <>
      {certificate.pipe.map((item, index) => (
        <View key={index} style={[styles.tableRow, { borderColor: theme.border }]}>
          <View style={styles.tableRowHeader}>
            <ThemedText style={styles.tableRowTitle}>{fm85a.pipe || "Pipe"} #{index + 1}</ThemedText>
            <TableRemoveButton onPress={() => removeTableRow(
              certificate.pipe,
              index,
              (arr) => setCertificate(prev => ({ ...prev, pipe: arr }))
            )} />
          </View>
          <TextInput style={inputStyle} placeholder={fm85a.manufacturer || "Manufacturer"} placeholderTextColor={theme.textSecondary} value={item.manufacturer} onChangeText={(v) => updateTableRow(certificate.pipe, index, "manufacturer", v, (arr) => setCertificate(prev => ({ ...prev, pipe: arr })))} />
          <TextInput style={inputStyle} placeholder={fm85a.modelTradeName || "Model/Trade Name"} placeholderTextColor={theme.textSecondary} value={item.modelTradeName} onChangeText={(v) => updateTableRow(certificate.pipe, index, "modelTradeName", v, (arr) => setCertificate(prev => ({ ...prev, pipe: arr })))} />
          <TextInput style={inputStyle} placeholder={fm85a.productDescription || "Product Description"} placeholderTextColor={theme.textSecondary} value={item.productDescription} onChangeText={(v) => updateTableRow(certificate.pipe, index, "productDescription", v, (arr) => setCertificate(prev => ({ ...prev, pipe: arr })))} />
          <View style={styles.rowHalf}>
            <TextInput style={[inputStyle, styles.halfInput]} placeholder={fm85a.schedule || "Schedule"} placeholderTextColor={theme.textSecondary} value={item.schedule} onChangeText={(v) => updateTableRow(certificate.pipe, index, "schedule", v, (arr) => setCertificate(prev => ({ ...prev, pipe: arr })))} />
            <TextInput style={[inputStyle, styles.halfInput]} placeholder={fm85a.connectionType || "Connection Type"} placeholderTextColor={theme.textSecondary} value={item.connectionType} onChangeText={(v) => updateTableRow(certificate.pipe, index, "connectionType", v, (arr) => setCertificate(prev => ({ ...prev, pipe: arr })))} />
          </View>
          <TextInput style={inputStyle} placeholder={fm85a.maxWorkingPressure || "Max Working Pressure"} placeholderTextColor={theme.textSecondary} value={item.maxWorkingPressure} onChangeText={(v) => updateTableRow(certificate.pipe, index, "maxWorkingPressure", v, (arr) => setCertificate(prev => ({ ...prev, pipe: arr })))} keyboardType="numeric" />
        </View>
      ))}
      <TableAddButton onPress={() => addTableRow(certificate.pipe, createEmptyPipe, (arr) => setCertificate(prev => ({ ...prev, pipe: arr })))} />
    </>
  );

  const renderPipeConnectionsTable = () => (
    <>
      {certificate.pipeConnections.map((item, index) => (
        <View key={index} style={[styles.tableRow, { borderColor: theme.border }]}>
          <View style={styles.tableRowHeader}>
            <ThemedText style={styles.tableRowTitle}>{fm85a.pipeConnection || "Pipe Connection"} #{index + 1}</ThemedText>
            <TableRemoveButton onPress={() => removeTableRow(certificate.pipeConnections, index, (arr) => setCertificate(prev => ({ ...prev, pipeConnections: arr })))} />
          </View>
          <TextInput style={inputStyle} placeholder={fm85a.manufacturer || "Manufacturer"} placeholderTextColor={theme.textSecondary} value={item.manufacturer} onChangeText={(v) => updateTableRow(certificate.pipeConnections, index, "manufacturer", v, (arr) => setCertificate(prev => ({ ...prev, pipeConnections: arr })))} />
          <TextInput style={inputStyle} placeholder={fm85a.modelTradeName || "Model/Trade Name"} placeholderTextColor={theme.textSecondary} value={item.modelTradeName} onChangeText={(v) => updateTableRow(certificate.pipeConnections, index, "modelTradeName", v, (arr) => setCertificate(prev => ({ ...prev, pipeConnections: arr })))} />
          <TextInput style={inputStyle} placeholder={fm85a.productDescription || "Product Description"} placeholderTextColor={theme.textSecondary} value={item.productDescription} onChangeText={(v) => updateTableRow(certificate.pipeConnections, index, "productDescription", v, (arr) => setCertificate(prev => ({ ...prev, pipeConnections: arr })))} />
          <View style={styles.rowHalf}>
            <TextInput style={[inputStyle, styles.halfInput]} placeholder={fm85a.pipeEnds || "Pipe Ends"} placeholderTextColor={theme.textSecondary} value={item.pipeEnds} onChangeText={(v) => updateTableRow(certificate.pipeConnections, index, "pipeEnds", v, (arr) => setCertificate(prev => ({ ...prev, pipeConnections: arr })))} />
            <TextInput style={[inputStyle, styles.halfInput]} placeholder={fm85a.maxWorkingPressure || "Max Pressure"} placeholderTextColor={theme.textSecondary} value={item.maxWorkingPressure} onChangeText={(v) => updateTableRow(certificate.pipeConnections, index, "maxWorkingPressure", v, (arr) => setCertificate(prev => ({ ...prev, pipeConnections: arr })))} keyboardType="numeric" />
          </View>
        </View>
      ))}
      <TableAddButton onPress={() => addTableRow(certificate.pipeConnections, createEmptyPipeConnection, (arr) => setCertificate(prev => ({ ...prev, pipeConnections: arr })))} />
    </>
  );

  const renderPipeHangersTable = () => (
    <>
      {certificate.pipeHangers.map((item, index) => (
        <View key={index} style={[styles.tableRow, { borderColor: theme.border }]}>
          <View style={styles.tableRowHeader}>
            <ThemedText style={styles.tableRowTitle}>{fm85a.pipeHanger || "Pipe Hanger"} #{index + 1}</ThemedText>
            <TableRemoveButton onPress={() => removeTableRow(certificate.pipeHangers, index, (arr) => setCertificate(prev => ({ ...prev, pipeHangers: arr })))} />
          </View>
          <TextInput style={inputStyle} placeholder={fm85a.manufacturer || "Manufacturer"} placeholderTextColor={theme.textSecondary} value={item.manufacturer} onChangeText={(v) => updateTableRow(certificate.pipeHangers, index, "manufacturer", v, (arr) => setCertificate(prev => ({ ...prev, pipeHangers: arr })))} />
          <TextInput style={inputStyle} placeholder={fm85a.modelTradeName || "Model/Trade Name"} placeholderTextColor={theme.textSecondary} value={item.modelTradeName} onChangeText={(v) => updateTableRow(certificate.pipeHangers, index, "modelTradeName", v, (arr) => setCertificate(prev => ({ ...prev, pipeHangers: arr })))} />
          <TextInput style={inputStyle} placeholder={fm85a.productDescription || "Product Description"} placeholderTextColor={theme.textSecondary} value={item.productDescription} onChangeText={(v) => updateTableRow(certificate.pipeHangers, index, "productDescription", v, (arr) => setCertificate(prev => ({ ...prev, pipeHangers: arr })))} />
          <View style={styles.rowHalf}>
            <TextInput style={[inputStyle, styles.halfInput]} placeholder={fm85a.hangerRodSize || "Hanger Rod Size"} placeholderTextColor={theme.textSecondary} value={item.hangerRodSize} onChangeText={(v) => updateTableRow(certificate.pipeHangers, index, "hangerRodSize", v, (arr) => setCertificate(prev => ({ ...prev, pipeHangers: arr })))} />
            <TextInput style={[inputStyle, styles.halfInput]} placeholder={fm85a.nominalPipeSize || "Nom. Pipe Size"} placeholderTextColor={theme.textSecondary} value={item.nominalPipeSize} onChangeText={(v) => updateTableRow(certificate.pipeHangers, index, "nominalPipeSize", v, (arr) => setCertificate(prev => ({ ...prev, pipeHangers: arr })))} />
          </View>
          <TextInput style={inputStyle} placeholder={fm85a.componentDescription || "Component Description"} placeholderTextColor={theme.textSecondary} value={item.componentDescription} onChangeText={(v) => updateTableRow(certificate.pipeHangers, index, "componentDescription", v, (arr) => setCertificate(prev => ({ ...prev, pipeHangers: arr })))} />
        </View>
      ))}
      <TableAddButton onPress={() => addTableRow(certificate.pipeHangers, createEmptyPipeHanger, (arr) => setCertificate(prev => ({ ...prev, pipeHangers: arr })))} />
    </>
  );

  const renderAlarmValvesTable = () => (
    <>
      {certificate.alarmCheckDryPipeReleaseValves.map((item, index) => (
        <View key={index} style={[styles.tableRow, { borderColor: theme.border }]}>
          <View style={styles.tableRowHeader}>
            <ThemedText style={styles.tableRowTitle}>{fm85a.valve || "Valve"} #{index + 1}</ThemedText>
            <TableRemoveButton onPress={() => removeTableRow(certificate.alarmCheckDryPipeReleaseValves, index, (arr) => setCertificate(prev => ({ ...prev, alarmCheckDryPipeReleaseValves: arr })))} />
          </View>
          <TextInput style={inputStyle} placeholder={fm85a.type || "Type"} placeholderTextColor={theme.textSecondary} value={item.type} onChangeText={(v) => updateTableRow(certificate.alarmCheckDryPipeReleaseValves, index, "type", v, (arr) => setCertificate(prev => ({ ...prev, alarmCheckDryPipeReleaseValves: arr })))} />
          <TextInput style={inputStyle} placeholder={fm85a.manufacturer || "Manufacturer"} placeholderTextColor={theme.textSecondary} value={item.manufacturer} onChangeText={(v) => updateTableRow(certificate.alarmCheckDryPipeReleaseValves, index, "manufacturer", v, (arr) => setCertificate(prev => ({ ...prev, alarmCheckDryPipeReleaseValves: arr })))} />
          <TextInput style={inputStyle} placeholder={fm85a.model || "Model"} placeholderTextColor={theme.textSecondary} value={item.model} onChangeText={(v) => updateTableRow(certificate.alarmCheckDryPipeReleaseValves, index, "model", v, (arr) => setCertificate(prev => ({ ...prev, alarmCheckDryPipeReleaseValves: arr })))} />
          <View style={styles.rowHalf}>
            <TextInput style={[inputStyle, styles.halfInput]} placeholder={fm85a.serialNumber || "Serial Number"} placeholderTextColor={theme.textSecondary} value={item.serialNumber} onChangeText={(v) => updateTableRow(certificate.alarmCheckDryPipeReleaseValves, index, "serialNumber", v, (arr) => setCertificate(prev => ({ ...prev, alarmCheckDryPipeReleaseValves: arr })))} />
            <TextInput style={[inputStyle, styles.halfInput]} placeholder={fm85a.quantity || "Quantity"} placeholderTextColor={theme.textSecondary} value={item.quantity} onChangeText={(v) => updateTableRow(certificate.alarmCheckDryPipeReleaseValves, index, "quantity", v, (arr) => setCertificate(prev => ({ ...prev, alarmCheckDryPipeReleaseValves: arr })))} keyboardType="numeric" />
          </View>
        </View>
      ))}
      <TableAddButton onPress={() => addTableRow(certificate.alarmCheckDryPipeReleaseValves, createEmptyAlarmCheckDryPipeReleaseValve, (arr) => setCertificate(prev => ({ ...prev, alarmCheckDryPipeReleaseValves: arr })))} />
    </>
  );

  const renderDetectionValvesTable = () => (
    <>
      {certificate.detectionReleaseValves.map((item, index) => (
        <View key={index} style={[styles.tableRow, { borderColor: theme.border }]}>
          <View style={styles.tableRowHeader}>
            <ThemedText style={styles.tableRowTitle}>{fm85a.detectionValve || "Detection Valve"} #{index + 1}</ThemedText>
            <TableRemoveButton onPress={() => removeTableRow(certificate.detectionReleaseValves, index, (arr) => setCertificate(prev => ({ ...prev, detectionReleaseValves: arr })))} />
          </View>
          <TextInput style={inputStyle} placeholder={fm85a.type || "Type"} placeholderTextColor={theme.textSecondary} value={item.type} onChangeText={(v) => updateTableRow(certificate.detectionReleaseValves, index, "type", v, (arr) => setCertificate(prev => ({ ...prev, detectionReleaseValves: arr })))} />
          <TextInput style={inputStyle} placeholder={fm85a.manufacturer || "Manufacturer"} placeholderTextColor={theme.textSecondary} value={item.manufacturer} onChangeText={(v) => updateTableRow(certificate.detectionReleaseValves, index, "manufacturer", v, (arr) => setCertificate(prev => ({ ...prev, detectionReleaseValves: arr })))} />
          <TextInput style={inputStyle} placeholder={fm85a.model || "Model"} placeholderTextColor={theme.textSecondary} value={item.model} onChangeText={(v) => updateTableRow(certificate.detectionReleaseValves, index, "model", v, (arr) => setCertificate(prev => ({ ...prev, detectionReleaseValves: arr })))} />
          <View style={styles.rowHalf}>
            <TextInput style={[inputStyle, styles.halfInput]} placeholder={fm85a.protectedArea || "Protected Area"} placeholderTextColor={theme.textSecondary} value={item.protectedArea} onChangeText={(v) => updateTableRow(certificate.detectionReleaseValves, index, "protectedArea", v, (arr) => setCertificate(prev => ({ ...prev, detectionReleaseValves: arr })))} />
            <TextInput style={[inputStyle, styles.halfInput]} placeholder={fm85a.quantity || "Quantity"} placeholderTextColor={theme.textSecondary} value={item.quantity} onChangeText={(v) => updateTableRow(certificate.detectionReleaseValves, index, "quantity", v, (arr) => setCertificate(prev => ({ ...prev, detectionReleaseValves: arr })))} keyboardType="numeric" />
          </View>
          <View style={styles.rowHalf}>
            <TextInput style={[inputStyle, styles.halfInput]} placeholder={fm85a.linearSpacing || "Linear Spacing"} placeholderTextColor={theme.textSecondary} value={item.linearSpacing} onChangeText={(v) => updateTableRow(certificate.detectionReleaseValves, index, "linearSpacing", v, (arr) => setCertificate(prev => ({ ...prev, detectionReleaseValves: arr })))} />
            <TextInput style={[inputStyle, styles.halfInput]} placeholder={fm85a.areaSpacing || "Area Spacing"} placeholderTextColor={theme.textSecondary} value={item.areaSpacing} onChangeText={(v) => updateTableRow(certificate.detectionReleaseValves, index, "areaSpacing", v, (arr) => setCertificate(prev => ({ ...prev, detectionReleaseValves: arr })))} />
          </View>
        </View>
      ))}
      <TableAddButton onPress={() => addTableRow(certificate.detectionReleaseValves, createEmptyDetectionReleaseValve, (arr) => setCertificate(prev => ({ ...prev, detectionReleaseValves: arr })))} />
    </>
  );

  const renderControlValvesTable = () => (
    <>
      {certificate.controlOrPressureReducingValves.map((item, index) => (
        <View key={index} style={[styles.tableRow, { borderColor: theme.border }]}>
          <View style={styles.tableRowHeader}>
            <ThemedText style={styles.tableRowTitle}>{fm85a.controlValve || "Control Valve"} #{index + 1}</ThemedText>
            <TableRemoveButton onPress={() => removeTableRow(certificate.controlOrPressureReducingValves, index, (arr) => setCertificate(prev => ({ ...prev, controlOrPressureReducingValves: arr })))} />
          </View>
          <TextInput style={inputStyle} placeholder={fm85a.type || "Type"} placeholderTextColor={theme.textSecondary} value={item.type} onChangeText={(v) => updateTableRow(certificate.controlOrPressureReducingValves, index, "type", v, (arr) => setCertificate(prev => ({ ...prev, controlOrPressureReducingValves: arr })))} />
          <TextInput style={inputStyle} placeholder={fm85a.manufacturer || "Manufacturer"} placeholderTextColor={theme.textSecondary} value={item.manufacturer} onChangeText={(v) => updateTableRow(certificate.controlOrPressureReducingValves, index, "manufacturer", v, (arr) => setCertificate(prev => ({ ...prev, controlOrPressureReducingValves: arr })))} />
          <TextInput style={inputStyle} placeholder={fm85a.model || "Model"} placeholderTextColor={theme.textSecondary} value={item.model} onChangeText={(v) => updateTableRow(certificate.controlOrPressureReducingValves, index, "model", v, (arr) => setCertificate(prev => ({ ...prev, controlOrPressureReducingValves: arr })))} />
          <View style={styles.rowHalf}>
            <TextInput style={[inputStyle, styles.halfInput]} placeholder={fm85a.serialNumber || "Serial Number"} placeholderTextColor={theme.textSecondary} value={item.serialNumber} onChangeText={(v) => updateTableRow(certificate.controlOrPressureReducingValves, index, "serialNumber", v, (arr) => setCertificate(prev => ({ ...prev, controlOrPressureReducingValves: arr })))} />
            <TextInput style={[inputStyle, styles.halfInput]} placeholder={fm85a.quantity || "Quantity"} placeholderTextColor={theme.textSecondary} value={item.quantity} onChangeText={(v) => updateTableRow(certificate.controlOrPressureReducingValves, index, "quantity", v, (arr) => setCertificate(prev => ({ ...prev, controlOrPressureReducingValves: arr })))} keyboardType="numeric" />
          </View>
        </View>
      ))}
      <TableAddButton onPress={() => addTableRow(certificate.controlOrPressureReducingValves, createEmptyControlOrPressureReducingValve, (arr) => setCertificate(prev => ({ ...prev, controlOrPressureReducingValves: arr })))} />
    </>
  );

  const renderCheckValvesTable = () => (
    <>
      {certificate.checkOrBackflowValves.map((item, index) => (
        <View key={index} style={[styles.tableRow, { borderColor: theme.border }]}>
          <View style={styles.tableRowHeader}>
            <ThemedText style={styles.tableRowTitle}>{fm85a.checkValve || "Check Valve"} #{index + 1}</ThemedText>
            <TableRemoveButton onPress={() => removeTableRow(certificate.checkOrBackflowValves, index, (arr) => setCertificate(prev => ({ ...prev, checkOrBackflowValves: arr })))} />
          </View>
          <TextInput style={inputStyle} placeholder={fm85a.type || "Type"} placeholderTextColor={theme.textSecondary} value={item.type} onChangeText={(v) => updateTableRow(certificate.checkOrBackflowValves, index, "type", v, (arr) => setCertificate(prev => ({ ...prev, checkOrBackflowValves: arr })))} />
          <TextInput style={inputStyle} placeholder={fm85a.manufacturer || "Manufacturer"} placeholderTextColor={theme.textSecondary} value={item.manufacturer} onChangeText={(v) => updateTableRow(certificate.checkOrBackflowValves, index, "manufacturer", v, (arr) => setCertificate(prev => ({ ...prev, checkOrBackflowValves: arr })))} />
          <TextInput style={inputStyle} placeholder={fm85a.model || "Model"} placeholderTextColor={theme.textSecondary} value={item.model} onChangeText={(v) => updateTableRow(certificate.checkOrBackflowValves, index, "model", v, (arr) => setCertificate(prev => ({ ...prev, checkOrBackflowValves: arr })))} />
          <View style={styles.rowHalf}>
            <TextInput style={[inputStyle, styles.halfInput]} placeholder={fm85a.serialNumber || "Serial Number"} placeholderTextColor={theme.textSecondary} value={item.serialNumber} onChangeText={(v) => updateTableRow(certificate.checkOrBackflowValves, index, "serialNumber", v, (arr) => setCertificate(prev => ({ ...prev, checkOrBackflowValves: arr })))} />
            <TextInput style={[inputStyle, styles.halfInput]} placeholder={fm85a.quantity || "Quantity"} placeholderTextColor={theme.textSecondary} value={item.quantity} onChangeText={(v) => updateTableRow(certificate.checkOrBackflowValves, index, "quantity", v, (arr) => setCertificate(prev => ({ ...prev, checkOrBackflowValves: arr })))} keyboardType="numeric" />
          </View>
        </View>
      ))}
      <TableAddButton onPress={() => addTableRow(certificate.checkOrBackflowValves, createEmptyCheckOrBackflowValve, (arr) => setCertificate(prev => ({ ...prev, checkOrBackflowValves: arr })))} />
    </>
  );

  const renderMiscComponents = () => {
    const miscItems = [
      { key: "waterflowAlarm", label: fm85a.waterflowAlarm || "Waterflow Alarm" },
      { key: "quickOpeningDevice", label: fm85a.quickOpeningDevice || "Quick Opening Device" },
      { key: "pressureGauge", label: fm85a.pressureGauge || "Pressure Gauge" },
      { key: "fireDepartmentConnection", label: fm85a.fireDepartmentConnection || "Fire Dept. Connection" },
      { key: "reliefValve", label: fm85a.reliefValve || "Relief Valve" },
      { key: "testConnection", label: fm85a.testConnection || "Test Connection" },
      { key: "drainValve", label: fm85a.drainValve || "Drain Valve" },
    ];

    return (
      <>
        {miscItems.map(({ key, label }) => (
          <View key={key} style={[styles.miscItem, { borderColor: theme.border }]}>
            <ThemedText style={styles.miscLabel}>{label}</ThemedText>
            <View style={styles.rowThird}>
              <TextInput
                style={[inputStyle, styles.thirdInput]}
                placeholder={fm85a.manufacturer || "Manufacturer"}
                placeholderTextColor={theme.textSecondary}
                value={(certificate.miscComponents as any)[key].manufacturer}
                onChangeText={(v) => setCertificate(prev => ({
                  ...prev,
                  miscComponents: {
                    ...prev.miscComponents,
                    [key]: { ...prev.miscComponents[key as keyof typeof prev.miscComponents], manufacturer: v }
                  }
                }))}
              />
              <TextInput
                style={[inputStyle, styles.thirdInput]}
                placeholder={fm85a.model || "Model"}
                placeholderTextColor={theme.textSecondary}
                value={(certificate.miscComponents as any)[key].model}
                onChangeText={(v) => setCertificate(prev => ({
                  ...prev,
                  miscComponents: {
                    ...prev.miscComponents,
                    [key]: { ...prev.miscComponents[key as keyof typeof prev.miscComponents], model: v }
                  }
                }))}
              />
              <TextInput
                style={[inputStyle, styles.thirdInput]}
                placeholder={fm85a.qty || "Qty"}
                placeholderTextColor={theme.textSecondary}
                value={(certificate.miscComponents as any)[key].quantity}
                onChangeText={(v) => setCertificate(prev => ({
                  ...prev,
                  miscComponents: {
                    ...prev.miscComponents,
                    [key]: { ...prev.miscComponents[key as keyof typeof prev.miscComponents], quantity: v }
                  }
                }))}
                keyboardType="numeric"
              />
            </View>
          </View>
        ))}
      </>
    );
  };

  const renderOtherComponentsTable = () => (
    <>
      {certificate.otherComponents.map((item, index) => (
        <View key={index} style={[styles.tableRow, { borderColor: theme.border }]}>
          <View style={styles.tableRowHeader}>
            <ThemedText style={styles.tableRowTitle}>{fm85a.component || "Component"} #{index + 1}</ThemedText>
            <TableRemoveButton onPress={() => removeTableRow(certificate.otherComponents, index, (arr) => setCertificate(prev => ({ ...prev, otherComponents: arr })))} />
          </View>
          <TextInput style={inputStyle} placeholder={fm85a.component || "Component"} placeholderTextColor={theme.textSecondary} value={item.component} onChangeText={(v) => updateTableRow(certificate.otherComponents, index, "component", v, (arr) => setCertificate(prev => ({ ...prev, otherComponents: arr })))} />
          <TextInput style={inputStyle} placeholder={fm85a.manufacturer || "Manufacturer"} placeholderTextColor={theme.textSecondary} value={item.manufacturer} onChangeText={(v) => updateTableRow(certificate.otherComponents, index, "manufacturer", v, (arr) => setCertificate(prev => ({ ...prev, otherComponents: arr })))} />
          <View style={styles.rowHalf}>
            <TextInput style={[inputStyle, styles.halfInput]} placeholder={fm85a.model || "Model"} placeholderTextColor={theme.textSecondary} value={item.model} onChangeText={(v) => updateTableRow(certificate.otherComponents, index, "model", v, (arr) => setCertificate(prev => ({ ...prev, otherComponents: arr })))} />
            <TextInput style={[inputStyle, styles.halfInput]} placeholder={fm85a.quantity || "Quantity"} placeholderTextColor={theme.textSecondary} value={item.quantity} onChangeText={(v) => updateTableRow(certificate.otherComponents, index, "quantity", v, (arr) => setCertificate(prev => ({ ...prev, otherComponents: arr })))} keyboardType="numeric" />
          </View>
        </View>
      ))}
      <TableAddButton onPress={() => addTableRow(certificate.otherComponents, createEmptyOtherComponent, (arr) => setCertificate(prev => ({ ...prev, otherComponents: arr })))} />
    </>
  );

  const renderDryPipeTestingTable = () => (
    <>
      {certificate.tests.dryPipeOrAutoReleaseTesting.map((item, index) => (
        <View key={index} style={[styles.tableRow, { borderColor: theme.border }]}>
          <View style={styles.tableRowHeader}>
            <ThemedText style={styles.tableRowTitle}>{fm85a.system || "System"} #{index + 1}</ThemedText>
            <TableRemoveButton onPress={() => {
              const newArr = [...certificate.tests.dryPipeOrAutoReleaseTesting];
              newArr.splice(index, 1);
              updateTests("dryPipeOrAutoReleaseTesting", newArr);
            }} />
          </View>
          <TextInput style={inputStyle} placeholder={fm85a.systemNoName || "System No./Name"} placeholderTextColor={theme.textSecondary} value={item.systemNoName} onChangeText={(v) => {
            const newArr = [...certificate.tests.dryPipeOrAutoReleaseTesting];
            newArr[index] = { ...newArr[index], systemNoName: v };
            updateTests("dryPipeOrAutoReleaseTesting", newArr);
          }} />
          <View style={styles.rowHalf}>
            <TextInput style={[inputStyle, styles.halfInput]} placeholder={fm85a.waterPressureBelowValve || "Water Press. Below Valve"} placeholderTextColor={theme.textSecondary} value={item.waterPressureBelowValve} keyboardType="numeric" onChangeText={(v) => {
              const newArr = [...certificate.tests.dryPipeOrAutoReleaseTesting];
              newArr[index] = { ...newArr[index], waterPressureBelowValve: v };
              updateTests("dryPipeOrAutoReleaseTesting", newArr);
            }} />
            <TextInput style={[inputStyle, styles.halfInput]} placeholder={fm85a.systemAirPressure || "System Air Pressure"} placeholderTextColor={theme.textSecondary} value={item.systemAirPressure} keyboardType="numeric" onChangeText={(v) => {
              const newArr = [...certificate.tests.dryPipeOrAutoReleaseTesting];
              newArr[index] = { ...newArr[index], systemAirPressure: v };
              updateTests("dryPipeOrAutoReleaseTesting", newArr);
            }} />
          </View>
          <TextInput style={inputStyle} placeholder={fm85a.minPressureReqAtSprinkler || "Min Pressure Req. at Sprinkler"} placeholderTextColor={theme.textSecondary} value={item.minPressureReqAtSprinkler} keyboardType="numeric" onChangeText={(v) => {
            const newArr = [...certificate.tests.dryPipeOrAutoReleaseTesting];
            newArr[index] = { ...newArr[index], minPressureReqAtSprinkler: v };
            updateTests("dryPipeOrAutoReleaseTesting", newArr);
          }} />
          <TextInput style={inputStyle} placeholder={fm85a.requiredWaterDeliveryTime || "Required Water Delivery Time"} placeholderTextColor={theme.textSecondary} value={item.requiredWaterDeliveryTime} onChangeText={(v) => {
            const newArr = [...certificate.tests.dryPipeOrAutoReleaseTesting];
            newArr[index] = { ...newArr[index], requiredWaterDeliveryTime: v };
            updateTests("dryPipeOrAutoReleaseTesting", newArr);
          }} />
          <View style={styles.rowHalf}>
            <TextInput style={[inputStyle, styles.halfInput]} placeholder={fm85a.withoutQOD || "Without QOD"} placeholderTextColor={theme.textSecondary} value={item.withoutQOD} onChangeText={(v) => {
              const newArr = [...certificate.tests.dryPipeOrAutoReleaseTesting];
              newArr[index] = { ...newArr[index], withoutQOD: v };
              updateTests("dryPipeOrAutoReleaseTesting", newArr);
            }} />
            <TextInput style={[inputStyle, styles.halfInput]} placeholder={fm85a.withQOD || "With QOD"} placeholderTextColor={theme.textSecondary} value={item.withQOD} onChangeText={(v) => {
              const newArr = [...certificate.tests.dryPipeOrAutoReleaseTesting];
              newArr[index] = { ...newArr[index], withQOD: v };
              updateTests("dryPipeOrAutoReleaseTesting", newArr);
            }} />
          </View>
        </View>
      ))}
      <TableAddButton onPress={() => updateTests("dryPipeOrAutoReleaseTesting", [...certificate.tests.dryPipeOrAutoReleaseTesting, createEmptyDryPipeOrAutoReleaseTesting()])} />
    </>
  );

  const renderPressureReducingTable = () => (
    <>
      {certificate.tests.pressureReducingValveTesting.map((item, index) => (
        <View key={index} style={[styles.tableRow, { borderColor: theme.border }]}>
          <View style={styles.tableRowHeader}>
            <ThemedText style={styles.tableRowTitle}>{fm85a.prvTest || "PRV Test"} #{index + 1}</ThemedText>
            <TableRemoveButton onPress={() => {
              const newArr = [...certificate.tests.pressureReducingValveTesting];
              newArr.splice(index, 1);
              updateTests("pressureReducingValveTesting", newArr);
            }} />
          </View>
          <TextInput style={inputStyle} placeholder={fm85a.location || "Location"} placeholderTextColor={theme.textSecondary} value={item.location} onChangeText={(v) => {
            const newArr = [...certificate.tests.pressureReducingValveTesting];
            newArr[index] = { ...newArr[index], location: v };
            updateTests("pressureReducingValveTesting", newArr);
          }} />
          <View style={styles.rowThird}>
            <TextInput style={[inputStyle, styles.thirdInput]} placeholder={fm85a.make || "Make"} placeholderTextColor={theme.textSecondary} value={item.make} onChangeText={(v) => {
              const newArr = [...certificate.tests.pressureReducingValveTesting];
              newArr[index] = { ...newArr[index], make: v };
              updateTests("pressureReducingValveTesting", newArr);
            }} />
            <TextInput style={[inputStyle, styles.thirdInput]} placeholder={fm85a.model || "Model"} placeholderTextColor={theme.textSecondary} value={item.model} onChangeText={(v) => {
              const newArr = [...certificate.tests.pressureReducingValveTesting];
              newArr[index] = { ...newArr[index], model: v };
              updateTests("pressureReducingValveTesting", newArr);
            }} />
            <TextInput style={[inputStyle, styles.thirdInput]} placeholder={fm85a.setting || "Setting"} placeholderTextColor={theme.textSecondary} value={item.setting} onChangeText={(v) => {
              const newArr = [...certificate.tests.pressureReducingValveTesting];
              newArr[index] = { ...newArr[index], setting: v };
              updateTests("pressureReducingValveTesting", newArr);
            }} />
          </View>
          <ThemedText style={styles.subLabel}>{fm85a.staticPressure || "Static Pressure"}</ThemedText>
          <View style={styles.rowHalf}>
            <TextInput style={[inputStyle, styles.halfInput]} placeholder={fm85a.inlet || "Inlet (psi)"} placeholderTextColor={theme.textSecondary} value={item.staticPressureInlet} keyboardType="numeric" onChangeText={(v) => {
              const newArr = [...certificate.tests.pressureReducingValveTesting];
              newArr[index] = { ...newArr[index], staticPressureInlet: v };
              updateTests("pressureReducingValveTesting", newArr);
            }} />
            <TextInput style={[inputStyle, styles.halfInput]} placeholder={fm85a.outlet || "Outlet (psi)"} placeholderTextColor={theme.textSecondary} value={item.staticPressureOutlet} keyboardType="numeric" onChangeText={(v) => {
              const newArr = [...certificate.tests.pressureReducingValveTesting];
              newArr[index] = { ...newArr[index], staticPressureOutlet: v };
              updateTests("pressureReducingValveTesting", newArr);
            }} />
          </View>
          <ThemedText style={styles.subLabel}>{fm85a.residualPressure || "Residual Pressure"}</ThemedText>
          <View style={styles.rowHalf}>
            <TextInput style={[inputStyle, styles.halfInput]} placeholder={fm85a.inlet || "Inlet (psi)"} placeholderTextColor={theme.textSecondary} value={item.residualPressureInlet} keyboardType="numeric" onChangeText={(v) => {
              const newArr = [...certificate.tests.pressureReducingValveTesting];
              newArr[index] = { ...newArr[index], residualPressureInlet: v };
              updateTests("pressureReducingValveTesting", newArr);
            }} />
            <TextInput style={[inputStyle, styles.halfInput]} placeholder={fm85a.outlet || "Outlet (psi)"} placeholderTextColor={theme.textSecondary} value={item.residualPressureOutlet} keyboardType="numeric" onChangeText={(v) => {
              const newArr = [...certificate.tests.pressureReducingValveTesting];
              newArr[index] = { ...newArr[index], residualPressureOutlet: v };
              updateTests("pressureReducingValveTesting", newArr);
            }} />
          </View>
          <TextInput style={inputStyle} placeholder={fm85a.flowRate || "Flow Rate (gpm)"} placeholderTextColor={theme.textSecondary} value={item.flowRate} keyboardType="numeric" onChangeText={(v) => {
            const newArr = [...certificate.tests.pressureReducingValveTesting];
            newArr[index] = { ...newArr[index], flowRate: v };
            updateTests("pressureReducingValveTesting", newArr);
          }} />
        </View>
      ))}
      <TableAddButton onPress={() => updateTests("pressureReducingValveTesting", [...certificate.tests.pressureReducingValveTesting, createEmptyPressureReducingValveTesting()])} />
    </>
  );

  const renderBlankGasketsTable = () => (
    <>
      {certificate.tests.blankTestingGaskets.map((item, index) => (
        <View key={index} style={[styles.tableRow, { borderColor: theme.border }]}>
          <View style={styles.tableRowHeader}>
            <ThemedText style={styles.tableRowTitle}>{fm85a.gasket || "Gasket"} #{index + 1}</ThemedText>
            <TableRemoveButton onPress={() => {
              const newArr = [...certificate.tests.blankTestingGaskets];
              newArr.splice(index, 1);
              updateTests("blankTestingGaskets", newArr);
            }} />
          </View>
          <View style={styles.rowThird}>
            <TextInput style={[inputStyle, styles.thirdInput]} placeholder={fm85a.numberUsed || "# Used"} placeholderTextColor={theme.textSecondary} value={item.numberUsed} keyboardType="numeric" onChangeText={(v) => {
              const newArr = [...certificate.tests.blankTestingGaskets];
              newArr[index] = { ...newArr[index], numberUsed: v };
              updateTests("blankTestingGaskets", newArr);
            }} />
            <TextInput style={[inputStyle, styles.thirdInput]} placeholder={fm85a.location || "Location"} placeholderTextColor={theme.textSecondary} value={item.location} onChangeText={(v) => {
              const newArr = [...certificate.tests.blankTestingGaskets];
              newArr[index] = { ...newArr[index], location: v };
              updateTests("blankTestingGaskets", newArr);
            }} />
            <TextInput style={[inputStyle, styles.thirdInput]} placeholder={fm85a.numberRemoved || "# Removed"} placeholderTextColor={theme.textSecondary} value={item.numberRemoved} keyboardType="numeric" onChangeText={(v) => {
              const newArr = [...certificate.tests.blankTestingGaskets];
              newArr[index] = { ...newArr[index], numberRemoved: v };
              updateTests("blankTestingGaskets", newArr);
            }} />
          </View>
        </View>
      ))}
      <TableAddButton onPress={() => updateTests("blankTestingGaskets", [...certificate.tests.blankTestingGaskets, createEmptyBlankTestingGasket()])} />
    </>
  );

  const renderDrainTestsTable = () => (
    <>
      {certificate.tests.drainTests.map((item, index) => (
        <View key={index} style={[styles.tableRow, { borderColor: theme.border }]}>
          <View style={styles.tableRowHeader}>
            <ThemedText style={styles.tableRowTitle}>{fm85a.drainTest || "Drain Test"} #{index + 1}</ThemedText>
            <TableRemoveButton onPress={() => {
              const newArr = [...certificate.tests.drainTests];
              newArr.splice(index, 1);
              updateTests("drainTests", newArr);
            }} />
          </View>
          <TextInput style={inputStyle} placeholder={fm85a.systemNameNo || "System Name/No."} placeholderTextColor={theme.textSecondary} value={item.systemNameNo} onChangeText={(v) => {
            const newArr = [...certificate.tests.drainTests];
            newArr[index] = { ...newArr[index], systemNameNo: v };
            updateTests("drainTests", newArr);
          }} />
          <View style={styles.rowThird}>
            <TextInput style={[inputStyle, styles.thirdInput]} placeholder={fm85a.staticPsi || "Static (psi)"} placeholderTextColor={theme.textSecondary} value={item.staticPressure} keyboardType="numeric" onChangeText={(v) => {
              const newArr = [...certificate.tests.drainTests];
              newArr[index] = { ...newArr[index], staticPressure: v };
              updateTests("drainTests", newArr);
            }} />
            <TextInput style={[inputStyle, styles.thirdInput]} placeholder={fm85a.residualPsi || "Residual (psi)"} placeholderTextColor={theme.textSecondary} value={item.residualPressure} keyboardType="numeric" onChangeText={(v) => {
              const newArr = [...certificate.tests.drainTests];
              newArr[index] = { ...newArr[index], residualPressure: v };
              updateTests("drainTests", newArr);
            }} />
            <TextInput style={[inputStyle, styles.thirdInput]} placeholder={fm85a.staticAfter || "Static After"} placeholderTextColor={theme.textSecondary} value={item.staticPressureAfterwards} keyboardType="numeric" onChangeText={(v) => {
              const newArr = [...certificate.tests.drainTests];
              newArr[index] = { ...newArr[index], staticPressureAfterwards: v };
              updateTests("drainTests", newArr);
            }} />
          </View>
        </View>
      ))}
      <TableAddButton onPress={() => updateTests("drainTests", [...certificate.tests.drainTests, createEmptyDrainTest()])} />
    </>
  );

  return (
    <ScreenKeyboardAwareScrollView>
      <ThemedView style={styles.container}>
        <View style={[styles.headerBanner, { backgroundColor: fullTheme.colors.primary }]}>
          <Text style={styles.headerBannerText}>
            {fm85a.title || "CERTIFICATE OF MATERIALS AND TESTS FM GLOBAL (FM85A)"}
          </Text>
        </View>

        <SectionHeader title={fm85a.contractorInfo || "Contractor Information"} section="contractor" />
        {expandedSections.contractor && (
          <View style={styles.sectionContent}>
            <DatePickerField
              value={certificate.contractorInfo.date}
              label={fm85a.date || "Date"}
              fieldKey="contractor.date"
            />
            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel}>{fm85a.contractorCompanyName || "Contractor Company Name"}</ThemedText>
              <TextInput
                style={inputStyle}
                value={certificate.contractorInfo.contractorCompanyName}
                onChangeText={(v) => updateContractorInfo("contractorCompanyName", v)}
                placeholder={fm85a.enterCompanyName || "Enter company name"}
                placeholderTextColor={theme.textSecondary}
              />
            </View>
            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel}>{fm85a.contractorCompanyAddress || "Contractor Company Address"}</ThemedText>
              <TextInput
                style={[inputStyle, styles.multilineInput]}
                value={certificate.contractorInfo.contractorCompanyAddress}
                onChangeText={(v) => updateContractorInfo("contractorCompanyAddress", v)}
                placeholder={fm85a.enterAddress || "Enter address"}
                placeholderTextColor={theme.textSecondary}
                multiline
              />
            </View>
          </View>
        )}

        <SectionHeader title={fm85a.clientInfo || "FM Global Client Information"} section="client" />
        {expandedSections.client && (
          <View style={styles.sectionContent}>
            <View style={styles.rowHalf}>
              <View style={[styles.fieldContainer, styles.halfInput]}>
                <ThemedText style={styles.fieldLabel}>{fm85a.indexNo || "Index No."}</ThemedText>
                <TextInput style={inputStyle} value={certificate.clientInfo.fmGlobalIndexNo} onChangeText={(v) => updateClientInfo("fmGlobalIndexNo", v)} placeholder="00-000-000" placeholderTextColor={theme.textSecondary} />
              </View>
              <View style={[styles.fieldContainer, styles.halfInput]}>
                <ThemedText style={styles.fieldLabel}>{fm85a.accountNo || "Account No."}</ThemedText>
                <TextInput style={inputStyle} value={certificate.clientInfo.fmGlobalAccountNo} onChangeText={(v) => updateClientInfo("fmGlobalAccountNo", v)} placeholder="000000" placeholderTextColor={theme.textSecondary} />
              </View>
            </View>
            <YesNoSelector
              value={certificate.clientInfo.isBuildingOwnerOrTenant}
              onChange={(v) => updateClientInfo("isBuildingOwnerOrTenant", v)}
              label={fm85a.isBuildingOwnerOrTenant || "Is Building Owner or Tenant?"}
            />
            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel}>{fm85a.buildingNameOrNo || "Building Name or No."}</ThemedText>
              <TextInput style={inputStyle} value={certificate.clientInfo.buildingNameOrNo} onChangeText={(v) => updateClientInfo("buildingNameOrNo", v)} placeholderTextColor={theme.textSecondary} />
            </View>
            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel}>{fm85a.clientName || "FM Global Client Name"}</ThemedText>
              <TextInput style={inputStyle} value={certificate.clientInfo.fmGlobalClientName} onChangeText={(v) => updateClientInfo("fmGlobalClientName", v)} placeholderTextColor={theme.textSecondary} />
            </View>
            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel}>{fm85a.clientAddress || "FM Global Client Address"}</ThemedText>
              <TextInput style={[inputStyle, styles.multilineInput]} value={certificate.clientInfo.fmGlobalClientAddress} onChangeText={(v) => updateClientInfo("fmGlobalClientAddress", v)} multiline placeholderTextColor={theme.textSecondary} />
            </View>
            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel}>{fm85a.occupancyDescription || "Occupancy Description"}</ThemedText>
              <TextInput style={[inputStyle, styles.multilineInput]} value={certificate.clientInfo.occupancyDescription} onChangeText={(v) => updateClientInfo("occupancyDescription", v)} multiline placeholderTextColor={theme.textSecondary} />
            </View>
          </View>
        )}

        <SectionHeader title={fm85a.automaticSprinklers || "Automatic Sprinklers"} section="sprinklers" count={certificate.sprinklers.length} />
        {expandedSections.sprinklers && <View style={styles.sectionContent}>{renderSprinklersTable()}</View>}

        <SectionHeader title={fm85a.automaticSprinklerPipe || "Automatic Sprinkler Pipe"} section="pipe" count={certificate.pipe.length} />
        {expandedSections.pipe && <View style={styles.sectionContent}>{renderPipeTable()}</View>}

        <SectionHeader title={fm85a.pipeConnections || "Pipe Connections"} section="pipeConnections" count={certificate.pipeConnections.length} />
        {expandedSections.pipeConnections && <View style={styles.sectionContent}>{renderPipeConnectionsTable()}</View>}

        <SectionHeader title={fm85a.pipeHangers || "Pipe Hangers"} section="pipeHangers" count={certificate.pipeHangers.length} />
        {expandedSections.pipeHangers && <View style={styles.sectionContent}>{renderPipeHangersTable()}</View>}

        <SectionHeader title={fm85a.alarmCheckDryPipeValves || "Alarm-Check/Dry-Pipe/Auto-Release Valves"} section="alarmValves" count={certificate.alarmCheckDryPipeReleaseValves.length} />
        {expandedSections.alarmValves && <View style={styles.sectionContent}>{renderAlarmValvesTable()}</View>}

        <SectionHeader title={fm85a.autoReleaseValveQuestions || "If Automatic-Release Type Valve"} section="autoReleaseQuestions" />
        {expandedSections.autoReleaseQuestions && (
          <View style={styles.sectionContent}>
            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel}>{fm85a.detectionType || "Detection Type"}</ThemedText>
              <View style={styles.optionButtons}>
                {["electronic", "hydraulic", "pneumatic"].map((opt) => (
                  <Pressable
                    key={opt}
                    style={[styles.optionButton, certificate.automaticReleaseValveQuestions.detectionType === opt && { backgroundColor: fullTheme.colors.primary }, { borderColor: theme.border }]}
                    onPress={() => setCertificate(prev => ({ ...prev, automaticReleaseValveQuestions: { ...prev.automaticReleaseValveQuestions, detectionType: opt as any } }))}
                  >
                    <Text style={[styles.optionText, certificate.automaticReleaseValveQuestions.detectionType === opt && { color: "#fff" }]}>{opt}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel}>{fm85a.interlockArrangement || "Interlock Arrangement"}</ThemedText>
              <View style={styles.optionButtons}>
                {["single", "double", "non-interlock"].map((opt) => (
                  <Pressable
                    key={opt}
                    style={[styles.optionButton, certificate.automaticReleaseValveQuestions.interlockArrangement === opt && { backgroundColor: fullTheme.colors.primary }, { borderColor: theme.border }]}
                    onPress={() => setCertificate(prev => ({ ...prev, automaticReleaseValveQuestions: { ...prev.automaticReleaseValveQuestions, interlockArrangement: opt as any } }))}
                  >
                    <Text style={[styles.optionText, certificate.automaticReleaseValveQuestions.interlockArrangement === opt && { color: "#fff" }]}>{opt}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <YesNoSelector
              value={certificate.automaticReleaseValveQuestions.airPressureSupervised}
              onChange={(v) => setCertificate(prev => ({ ...prev, automaticReleaseValveQuestions: { ...prev.automaticReleaseValveQuestions, airPressureSupervised: v as any } }))}
              label={fm85a.airPressureSupervised || "Air Pressure Supervised?"}
            />
            <YesNoSelector
              value={certificate.automaticReleaseValveQuestions.manualOperationArranged}
              onChange={(v) => setCertificate(prev => ({ ...prev, automaticReleaseValveQuestions: { ...prev.automaticReleaseValveQuestions, manualOperationArranged: v as any } }))}
              label={fm85a.manualOperationArranged || "Manual Operation Arranged?"}
            />
          </View>
        )}

        <SectionHeader title={fm85a.detectionReleaseValves || "Detection for Auto-Release Valves"} section="detectionValves" count={certificate.detectionReleaseValves.length} />
        {expandedSections.detectionValves && <View style={styles.sectionContent}>{renderDetectionValvesTable()}</View>}

        <SectionHeader title={fm85a.detectionElectricQuestions || "If Detection is Electric"} section="detectionElectricQuestions" />
        {expandedSections.detectionElectricQuestions && (
          <View style={styles.sectionContent}>
            <YesNoSelector
              value={certificate.detectionElectricQuestions.circuitrySupervisedPerDS540}
              onChange={(v) => setCertificate(prev => ({ ...prev, detectionElectricQuestions: { ...prev.detectionElectricQuestions, circuitrySupervisedPerDS540: v as any } }))}
              label={fm85a.circuitrySupervisedDS540 || "Circuitry Supervised per DS 5-40?"}
            />
            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel}>{fm85a.controlPanelMakeModel || "Auto Release Control Panel Make/Model"}</ThemedText>
              <TextInput style={inputStyle} value={certificate.detectionElectricQuestions.automaticReleaseControlPanelMakeModel} onChangeText={(v) => setCertificate(prev => ({ ...prev, detectionElectricQuestions: { ...prev.detectionElectricQuestions, automaticReleaseControlPanelMakeModel: v } }))} placeholderTextColor={theme.textSecondary} />
            </View>
            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel}>{fm85a.solenoidValveMakeModel || "Solenoid Release Valve Make/Model"}</ThemedText>
              <TextInput style={inputStyle} value={certificate.detectionElectricQuestions.solenoidReleaseValveMakeModel} onChangeText={(v) => setCertificate(prev => ({ ...prev, detectionElectricQuestions: { ...prev.detectionElectricQuestions, solenoidReleaseValveMakeModel: v } }))} placeholderTextColor={theme.textSecondary} />
            </View>
          </View>
        )}

        <SectionHeader title={fm85a.controlPressureReducingValves || "Control/Pressure-Reducing Valves"} section="controlValves" count={certificate.controlOrPressureReducingValves.length} />
        {expandedSections.controlValves && <View style={styles.sectionContent}>{renderControlValvesTable()}</View>}

        <SectionHeader title={fm85a.checkBackflowValves || "Check/Backflow Preventer Valves"} section="checkValves" count={certificate.checkOrBackflowValves.length} />
        {expandedSections.checkValves && <View style={styles.sectionContent}>{renderCheckValvesTable()}</View>}

        <SectionHeader title={fm85a.miscellaneousComponents || "Miscellaneous Components"} section="miscComponents" />
        {expandedSections.miscComponents && <View style={styles.sectionContent}>{renderMiscComponents()}</View>}

        <SectionHeader title={fm85a.otherComponents || "Other Components"} section="otherComponents" count={certificate.otherComponents.length} />
        {expandedSections.otherComponents && <View style={styles.sectionContent}>{renderOtherComponentsTable()}</View>}

        <SectionHeader title={fm85a.testsHydrostaticPneumatic || "Tests: Hydrostatic & Pneumatic"} section="testsHydrostatic" />
        {expandedSections.testsHydrostatic && (
          <View style={styles.sectionContent}>
            <ThemedText style={styles.subSectionTitle}>{fm85a.hydrostaticTest || "Hydrostatic Test"}</ThemedText>
            <View style={styles.rowThird}>
              <TextInput style={[inputStyle, styles.thirdInput]} placeholder={fm85a.testedPsi || "Tested (psi)"} placeholderTextColor={theme.textSecondary} value={certificate.tests.hydrostatic.testedPressurePsi} keyboardType="numeric" onChangeText={(v) => setCertificate(prev => ({ ...prev, tests: { ...prev.tests, hydrostatic: { ...prev.tests.hydrostatic, testedPressurePsi: v } } }))} />
              <TextInput style={[inputStyle, styles.thirdInput]} placeholder={fm85a.durationHours || "Duration (hrs)"} placeholderTextColor={theme.textSecondary} value={certificate.tests.hydrostatic.durationHours} keyboardType="numeric" onChangeText={(v) => setCertificate(prev => ({ ...prev, tests: { ...prev.tests, hydrostatic: { ...prev.tests.hydrostatic, durationHours: v } } }))} />
              <TextInput style={[inputStyle, styles.thirdInput]} placeholder={fm85a.pressureDropPsi || "Drop (psi)"} placeholderTextColor={theme.textSecondary} value={certificate.tests.hydrostatic.pressureDropPsi} keyboardType="numeric" onChangeText={(v) => setCertificate(prev => ({ ...prev, tests: { ...prev.tests, hydrostatic: { ...prev.tests.hydrostatic, pressureDropPsi: v } } }))} />
            </View>

            <ThemedText style={styles.subSectionTitle}>{fm85a.pneumaticTest || "Pneumatic Test"}</ThemedText>
            <View style={styles.rowThird}>
              <TextInput style={[inputStyle, styles.thirdInput]} placeholder={fm85a.testedPsi || "Tested (psi)"} placeholderTextColor={theme.textSecondary} value={certificate.tests.pneumatic.testedPressurePsi} keyboardType="numeric" onChangeText={(v) => setCertificate(prev => ({ ...prev, tests: { ...prev.tests, pneumatic: { ...prev.tests.pneumatic, testedPressurePsi: v } } }))} />
              <TextInput style={[inputStyle, styles.thirdInput]} placeholder={fm85a.durationHours || "Duration (hrs)"} placeholderTextColor={theme.textSecondary} value={certificate.tests.pneumatic.durationHours} keyboardType="numeric" onChangeText={(v) => setCertificate(prev => ({ ...prev, tests: { ...prev.tests, pneumatic: { ...prev.tests.pneumatic, durationHours: v } } }))} />
              <TextInput style={[inputStyle, styles.thirdInput]} placeholder={fm85a.pressureDropPsi || "Drop (psi)"} placeholderTextColor={theme.textSecondary} value={certificate.tests.pneumatic.pressureDropPsi} keyboardType="numeric" onChangeText={(v) => setCertificate(prev => ({ ...prev, tests: { ...prev.tests, pneumatic: { ...prev.tests.pneumatic, pressureDropPsi: v } } }))} />
            </View>

            <ThemedText style={styles.subSectionTitle}>{fm85a.waterflowAlarmTest || "Waterflow Alarm Test"}</ThemedText>
            <View style={styles.rowHalf}>
              <TextInput style={[inputStyle, styles.halfInput]} placeholder={fm85a.totalDevicesTested || "Total Tested"} placeholderTextColor={theme.textSecondary} value={certificate.tests.waterflowAlarm.totalDevicesTested} keyboardType="numeric" onChangeText={(v) => setCertificate(prev => ({ ...prev, tests: { ...prev.tests, waterflowAlarm: { ...prev.tests.waterflowAlarm, totalDevicesTested: v } } }))} />
              <TextInput style={[inputStyle, styles.halfInput]} placeholder={fm85a.devicesOver60Seconds || "> 60 sec"} placeholderTextColor={theme.textSecondary} value={certificate.tests.waterflowAlarm.devicesOver60Seconds} keyboardType="numeric" onChangeText={(v) => setCertificate(prev => ({ ...prev, tests: { ...prev.tests, waterflowAlarm: { ...prev.tests.waterflowAlarm, devicesOver60Seconds: v } } }))} />
            </View>
          </View>
        )}

        <SectionHeader title={fm85a.dryPipeAutoReleaseTesting || "Dry Pipe/Auto-Release Testing"} section="testsDryPipe" count={certificate.tests.dryPipeOrAutoReleaseTesting.length} />
        {expandedSections.testsDryPipe && (
          <View style={styles.sectionContent}>
            {renderDryPipeTestingTable()}
            <View style={styles.divider} />
            <YesNoSelector
              value={certificate.tests.autoReleaseValveTestQuestions.valveOperatedManuallyAndAutomatically}
              onChange={(v) => setCertificate(prev => ({ ...prev, tests: { ...prev.tests, autoReleaseValveTestQuestions: { ...prev.tests.autoReleaseValveTestQuestions, valveOperatedManuallyAndAutomatically: v as any } } }))}
              label={fm85a.valveOperatedManuallyAuto || "Valve operated manually and automatically?"}
            />
            <YesNoSelector
              value={certificate.tests.autoReleaseValveTestQuestions.ifDetectionElectronicWereAllUnitsTested}
              onChange={(v) => setCertificate(prev => ({ ...prev, tests: { ...prev.tests, autoReleaseValveTestQuestions: { ...prev.tests.autoReleaseValveTestQuestions, ifDetectionElectronicWereAllUnitsTested: v as any } } }))}
              label={fm85a.allDetectionUnitsTested || "If detection electronic, were all units tested?"}
            />
          </View>
        )}

        <SectionHeader title={fm85a.pressureReducingValveTesting || "Pressure-Reducing Valve Testing"} section="testsPressureReducing" count={certificate.tests.pressureReducingValveTesting.length} />
        {expandedSections.testsPressureReducing && <View style={styles.sectionContent}>{renderPressureReducingTable()}</View>}

        <SectionHeader title={fm85a.blankTestingGaskets || "Blank Testing Gaskets"} section="testsBlankGaskets" count={certificate.tests.blankTestingGaskets.length} />
        {expandedSections.testsBlankGaskets && <View style={styles.sectionContent}>{renderBlankGasketsTable()}</View>}

        <SectionHeader title={fm85a.weldedPipeConnections || "Welded Pipe Connections"} section="testsWelded" />
        {expandedSections.testsWelded && (
          <View style={styles.sectionContent}>
            <YesNoSelector
              value={certificate.tests.weldedPipeConnectionsYesNo.weldingProceduresComplied}
              onChange={(v) => setCertificate(prev => ({ ...prev, tests: { ...prev.tests, weldedPipeConnectionsYesNo: { ...prev.tests.weldedPipeConnectionsYesNo, weldingProceduresComplied: v as any } } }))}
              label={fm85a.weldingProceduresComplied || "Welding procedures complied?"}
            />
            <YesNoSelector
              value={certificate.tests.weldedPipeConnectionsYesNo.weldersQualified}
              onChange={(v) => setCertificate(prev => ({ ...prev, tests: { ...prev.tests, weldedPipeConnectionsYesNo: { ...prev.tests.weldedPipeConnectionsYesNo, weldersQualified: v as any } } }))}
              label={fm85a.weldersQualified || "Welders qualified?"}
            />
            <YesNoSelector
              value={certificate.tests.weldedPipeConnectionsYesNo.qcProcedureEnsuredDiscsCouponsRetrievedAndClean}
              onChange={(v) => setCertificate(prev => ({ ...prev, tests: { ...prev.tests, weldedPipeConnectionsYesNo: { ...prev.tests.weldedPipeConnectionsYesNo, qcProcedureEnsuredDiscsCouponsRetrievedAndClean: v as any } } }))}
              label={fm85a.qcProcedureEnsured || "QC procedure ensured discs/coupons retrieved and clean?"}
            />
          </View>
        )}

        <SectionHeader title={fm85a.drainTests || "Drain Tests"} section="testsDrain" count={certificate.tests.drainTests.length} />
        {expandedSections.testsDrain && <View style={styles.sectionContent}>{renderDrainTestsTable()}</View>}

        <SectionHeader title={fm85a.undergroundMains || "Underground Mains"} section="testsUnderground" />
        {expandedSections.testsUnderground && (
          <View style={styles.sectionContent}>
            <YesNoSelector
              value={certificate.tests.undergroundMains.verifiedOnFM85B}
              onChange={(v) => setCertificate(prev => ({ ...prev, tests: { ...prev.tests, undergroundMains: { ...prev.tests.undergroundMains, verifiedOnFM85B: v as any } } }))}
              label={fm85a.verifiedOnFM85B || "Verified on FM85B?"}
            />
            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel}>{fm85a.ifNoWhatFormUsed || "If No, what form used?"}</ThemedText>
              <TextInput style={inputStyle} value={certificate.tests.undergroundMains.ifNoWhatFormUsed} onChangeText={(v) => setCertificate(prev => ({ ...prev, tests: { ...prev.tests, undergroundMains: { ...prev.tests.undergroundMains, ifNoWhatFormUsed: v } } }))} placeholderTextColor={theme.textSecondary} />
            </View>
            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel}>{fm85a.whatContractorFlushed || "What contractor flushed?"}</ThemedText>
              <TextInput style={inputStyle} value={certificate.tests.undergroundMains.whatContractorFlushed} onChangeText={(v) => setCertificate(prev => ({ ...prev, tests: { ...prev.tests, undergroundMains: { ...prev.tests.undergroundMains, whatContractorFlushed: v } } }))} placeholderTextColor={theme.textSecondary} />
            </View>
          </View>
        )}

        <SectionHeader title={fm85a.instructionMaterials || "Instruction Materials"} section="testsInstruction" />
        {expandedSections.testsInstruction && (
          <View style={styles.sectionContent}>
            <YesNoSelector
              value={certificate.tests.instructionMaterialsYesNo.personInChargeInstructed}
              onChange={(v) => setCertificate(prev => ({ ...prev, tests: { ...prev.tests, instructionMaterialsYesNo: { ...prev.tests.instructionMaterialsYesNo, personInChargeInstructed: v as any } } }))}
              label={fm85a.personInChargeInstructed || "Person in charge instructed?"}
            />
            <YesNoSelector
              value={certificate.tests.instructionMaterialsYesNo.copiesLeftOnPremises}
              onChange={(v) => setCertificate(prev => ({ ...prev, tests: { ...prev.tests, instructionMaterialsYesNo: { ...prev.tests.instructionMaterialsYesNo, copiesLeftOnPremises: v as any } } }))}
              label={fm85a.copiesLeftOnPremises || "Copies left on premises?"}
            />
            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel}>{fm85a.ifNoExplain || "If No, explain"}</ThemedText>
              <TextInput style={[inputStyle, styles.multilineInput]} value={certificate.tests.instructionMaterialsYesNo.ifNoExplain} onChangeText={(v) => setCertificate(prev => ({ ...prev, tests: { ...prev.tests, instructionMaterialsYesNo: { ...prev.tests.instructionMaterialsYesNo, ifNoExplain: v } } }))} multiline placeholderTextColor={theme.textSecondary} />
            </View>
            <DatePickerField
              value={certificate.tests.dateSystemLeftInServiceAllValvesOpen}
              label={fm85a.dateSystemLeftInService || "Date system left in service (all valves open)"}
              fieldKey="dateSystemLeftInService"
            />
          </View>
        )}

        <SectionHeader title={fm85a.signatures || "Signatures"} section="signatures" />
        {expandedSections.signatures && (
          <View style={styles.sectionContent}>
            <ThemedText style={styles.subSectionTitle}>{fm85a.propertyOwnerAgent || "Property Owner / Authorized Agent"}</ThemedText>
            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel}>{fm85a.name || "Name"}</ThemedText>
              <TextInput style={inputStyle} value={certificate.signatures.propertyOwnerAuthorizedAgentName} onChangeText={(v) => updateSignatures("propertyOwnerAuthorizedAgentName", v)} placeholderTextColor={theme.textSecondary} />
            </View>
            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel}>{fm85a.title || "Title"}</ThemedText>
              <TextInput style={inputStyle} value={certificate.signatures.propertyOwnerSignatureTitle} onChangeText={(v) => updateSignatures("propertyOwnerSignatureTitle", v)} placeholderTextColor={theme.textSecondary} />
            </View>
            <DatePickerField value={certificate.signatures.propertyOwnerDate} label={fm85a.date || "Date"} fieldKey="signatures.propertyOwnerDate" />
            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel}>{fm85a.signature || "Signature"}</ThemedText>
              <SignatureCapture
                signature={certificate.signatures.propertyOwnerSignature || null}
                onSignatureChange={(sig: string | null) => updateSignatures("propertyOwnerSignature", sig || "")}
              />
            </View>

            <View style={styles.divider} />

            <ThemedText style={styles.subSectionTitle}>{fm85a.sprinklerContractor || "Sprinkler Contractor"}</ThemedText>
            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel}>{fm85a.name || "Name"}</ThemedText>
              <TextInput style={inputStyle} value={certificate.signatures.sprinklerContractorName} onChangeText={(v) => updateSignatures("sprinklerContractorName", v)} placeholderTextColor={theme.textSecondary} />
            </View>
            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel}>{fm85a.title || "Title"}</ThemedText>
              <TextInput style={inputStyle} value={certificate.signatures.sprinklerContractorSignatureTitle} onChangeText={(v) => updateSignatures("sprinklerContractorSignatureTitle", v)} placeholderTextColor={theme.textSecondary} />
            </View>
            <DatePickerField value={certificate.signatures.sprinklerContractorDate} label={fm85a.date || "Date"} fieldKey="signatures.sprinklerContractorDate" />
            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel}>{fm85a.signature || "Signature"}</ThemedText>
              <SignatureCapture
                signature={certificate.signatures.sprinklerContractorSignature || null}
                onSignatureChange={(sig: string | null) => updateSignatures("sprinklerContractorSignature", sig || "")}
              />
            </View>
          </View>
        )}

        <SectionHeader title={fm85a.additionalNotes || "Additional Notes / Comments"} section="notes" />
        {expandedSections.notes && (
          <View style={styles.sectionContent}>
            <TextInput
              style={[inputStyle, styles.notesInput]}
              value={certificate.additionalNotes}
              onChangeText={(v) => setCertificate(prev => ({ ...prev, additionalNotes: v }))}
              placeholder={fm85a.enterNotes || "Enter additional notes, comments, or explanations..."}
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={6}
            />
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.saveButton, { backgroundColor: fullTheme.colors.primary }]}
            onPress={() => saveCertificate(true)}
            disabled={isSaving}
          >
            <Feather name="save" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>
              {isSaving ? (fm85a.saving || "Saving...") : (fm85a.save || "Save")}
            </Text>
          </Pressable>
        </View>
      </ThemedView>
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.md,
  },
  headerBanner: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  headerBannerText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.xs,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  countBadge: {
    marginLeft: Spacing.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  countText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  sectionContent: {
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  fieldContainer: {
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  notesInput: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  dateInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowHalf: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  halfInput: {
    flex: 1,
  },
  rowThird: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  thirdInput: {
    flex: 1,
  },
  tableRow: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  tableRowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  tableRowTitle: {
    fontWeight: "600",
    fontSize: 14,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  addButtonText: {
    fontWeight: "500",
  },
  removeButton: {
    padding: Spacing.xs,
  },
  yesNoContainer: {
    marginBottom: Spacing.md,
  },
  yesNoButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  yesNoButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
  },
  yesNoText: {
    fontWeight: "600",
  },
  optionButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  optionButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
  },
  optionText: {
    fontSize: 14,
    textTransform: "capitalize",
  },
  miscItem: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  miscLabel: {
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  subLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: Spacing.md,
  },
  buttonContainer: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
