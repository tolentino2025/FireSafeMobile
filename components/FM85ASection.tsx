import React, { useState, useCallback } from "react";
import { View, TextInput, StyleSheet, Pressable, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { DatePickerField } from "@/components/DatePickerField";
import { SignatureCapture } from "@/components/SignatureCapture";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { Spacing, BorderRadius, AppColors } from "@/constants/theme";
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

interface FM85ASectionProps {
  certificate: FM85ACertificate;
  onCertificateChange: (certificate: FM85ACertificate) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

type YesNo = 'Y' | 'N' | '';

export function FM85ASection({ certificate, onCertificateChange, isExpanded, onToggleExpand }: FM85ASectionProps) {
  const { theme, fullTheme } = useTheme();
  const { t, language } = useLanguage();
  const fm85a = (t as any).fm85a || {};

  const [expandedSubSections, setExpandedSubSections] = useState<Record<string, boolean>>({
    contractor: true,
    client: true,
    sprinklers: false,
    pipe: false,
    pipeConnections: false,
    pipeHangers: false,
    alarmValves: false,
    detectionValves: false,
    controlValves: false,
    checkValves: false,
    miscComponents: false,
    otherComponents: false,
    tests: false,
    signatures: false,
  });

  const toggleSubSection = (section: string) => {
    setExpandedSubSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border },
  ];

  const updateCertificate = useCallback((updates: Partial<FM85ACertificate>) => {
    onCertificateChange({ ...certificate, ...updates });
  }, [certificate, onCertificateChange]);

  const SubSectionHeader = ({ title, section }: { title: string; section: string }) => (
    <Pressable
      style={[styles.subSectionHeader, { backgroundColor: fullTheme.colors.backgroundSecondary, borderColor: fullTheme.colors.border }]}
      onPress={() => toggleSubSection(section)}
    >
      <ThemedText type="h4">{title}</ThemedText>
      <Feather
        name={expandedSubSections[section] ? "chevron-up" : "chevron-down"}
        size={20}
        color={theme.text}
      />
    </Pressable>
  );

  const YesNoSelector = ({ value, onChange, label }: { value: YesNo; onChange: (v: YesNo) => void; label: string }) => (
    <View style={styles.yesNoRow}>
      <ThemedText style={styles.yesNoLabel}>{label}</ThemedText>
      <View style={styles.yesNoButtons}>
        {(['Y', 'N'] as YesNo[]).map((opt) => (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={[
              styles.yesNoButton,
              { 
                backgroundColor: value === opt ? AppColors.primary : theme.backgroundDefault,
                borderColor: value === opt ? AppColors.primary : theme.border,
              }
            ]}
          >
            <ThemedText style={{ color: value === opt ? '#FFFFFF' : theme.text, fontWeight: '600' }}>
              {opt === 'Y' ? (language === 'pt-BR' ? 'Sim' : 'Yes') : (language === 'pt-BR' ? 'Nao' : 'No')}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    </View>
  );

  const renderContractorSection = () => (
    <>
      <SubSectionHeader title={fm85a.contractorInfo || "Contractor Information"} section="contractor" />
      {expandedSubSections.contractor && (
        <View style={styles.sectionContent}>
          <ThemedText type="small">{fm85a.date || "Date"}</ThemedText>
          <DatePickerField
            value={certificate.contractorInfo.date}
            onChange={(d) => updateCertificate({
              contractorInfo: { ...certificate.contractorInfo, date: d }
            })}
            placeholder={fm85a.date || "Date"}
          />
          <Spacer height={Spacing.md} />
          <ThemedText type="small">{fm85a.contractorCompanyName || "Contractor Company Name"}</ThemedText>
          <TextInput
            style={inputStyle}
            value={certificate.contractorInfo.contractorCompanyName}
            onChangeText={(v) => updateCertificate({
              contractorInfo: { ...certificate.contractorInfo, contractorCompanyName: v }
            })}
            placeholder={fm85a.contractorCompanyName || "Contractor Company Name"}
            placeholderTextColor={theme.placeholder}
          />
          <Spacer height={Spacing.md} />
          <ThemedText type="small">{fm85a.contractorCompanyAddress || "Contractor Company Address"}</ThemedText>
          <TextInput
            style={inputStyle}
            value={certificate.contractorInfo.contractorCompanyAddress}
            onChangeText={(v) => updateCertificate({
              contractorInfo: { ...certificate.contractorInfo, contractorCompanyAddress: v }
            })}
            placeholder={fm85a.contractorCompanyAddress || "Contractor Company Address"}
            placeholderTextColor={theme.placeholder}
          />
        </View>
      )}
    </>
  );

  const renderClientSection = () => (
    <>
      <SubSectionHeader title={fm85a.clientInfo || "FM Global Client Information"} section="client" />
      {expandedSubSections.client && (
        <View style={styles.sectionContent}>
          <View style={styles.row}>
            <View style={styles.halfField}>
              <ThemedText type="small">{fm85a.indexNo || "Index No"}</ThemedText>
              <TextInput
                style={inputStyle}
                value={certificate.clientInfo.fmGlobalIndexNo}
                onChangeText={(v) => updateCertificate({
                  clientInfo: { ...certificate.clientInfo, fmGlobalIndexNo: v }
                })}
                placeholder={fm85a.indexNo || "Index No"}
                placeholderTextColor={theme.placeholder}
              />
            </View>
            <View style={styles.halfField}>
              <ThemedText type="small">{fm85a.accountNo || "Account No"}</ThemedText>
              <TextInput
                style={inputStyle}
                value={certificate.clientInfo.fmGlobalAccountNo}
                onChangeText={(v) => updateCertificate({
                  clientInfo: { ...certificate.clientInfo, fmGlobalAccountNo: v }
                })}
                placeholder={fm85a.accountNo || "Account No"}
                placeholderTextColor={theme.placeholder}
              />
            </View>
          </View>
          <Spacer height={Spacing.md} />
          <YesNoSelector
            label={fm85a.ownerOrTenant || "Owner/Tenant"}
            value={certificate.clientInfo.isBuildingOwnerOrTenant}
            onChange={(v) => updateCertificate({
              clientInfo: { ...certificate.clientInfo, isBuildingOwnerOrTenant: v }
            })}
          />
          <Spacer height={Spacing.md} />
          <ThemedText type="small">{fm85a.buildingNameNo || "Building Name/No"}</ThemedText>
          <TextInput
            style={inputStyle}
            value={certificate.clientInfo.buildingNameOrNo}
            onChangeText={(v) => updateCertificate({
              clientInfo: { ...certificate.clientInfo, buildingNameOrNo: v }
            })}
            placeholder={fm85a.buildingNameNo || "Building Name/No"}
            placeholderTextColor={theme.placeholder}
          />
          <Spacer height={Spacing.md} />
          <ThemedText type="small">{fm85a.clientName || "Client Name"}</ThemedText>
          <TextInput
            style={inputStyle}
            value={certificate.clientInfo.fmGlobalClientName}
            onChangeText={(v) => updateCertificate({
              clientInfo: { ...certificate.clientInfo, fmGlobalClientName: v }
            })}
            placeholder={fm85a.clientName || "Client Name"}
            placeholderTextColor={theme.placeholder}
          />
          <Spacer height={Spacing.md} />
          <ThemedText type="small">{fm85a.clientAddress || "Client Address"}</ThemedText>
          <TextInput
            style={inputStyle}
            value={certificate.clientInfo.fmGlobalClientAddress}
            onChangeText={(v) => updateCertificate({
              clientInfo: { ...certificate.clientInfo, fmGlobalClientAddress: v }
            })}
            placeholder={fm85a.clientAddress || "Client Address"}
            placeholderTextColor={theme.placeholder}
          />
          <Spacer height={Spacing.md} />
          <ThemedText type="small">{fm85a.occupancyDescription || "Occupancy Description"}</ThemedText>
          <TextInput
            style={[inputStyle, styles.textArea]}
            value={certificate.clientInfo.occupancyDescription}
            onChangeText={(v) => updateCertificate({
              clientInfo: { ...certificate.clientInfo, occupancyDescription: v }
            })}
            placeholder={fm85a.occupancyDescription || "Occupancy Description"}
            placeholderTextColor={theme.placeholder}
            multiline
          />
        </View>
      )}
    </>
  );

  const renderSprinklersSection = () => {
    const addSprinkler = () => {
      updateCertificate({
        sprinklers: [...certificate.sprinklers, createEmptySprinkler()]
      });
    };
    const removeSprinkler = (index: number) => {
      updateCertificate({
        sprinklers: certificate.sprinklers.filter((_, i) => i !== index)
      });
    };
    const updateSprinkler = (index: number, field: keyof FM85ASprinkler, value: string) => {
      const updated = [...certificate.sprinklers];
      updated[index] = { ...updated[index], [field]: value };
      updateCertificate({ sprinklers: updated });
    };

    return (
      <>
        <SubSectionHeader title={fm85a.sprinklersSection || "Automatic Sprinklers"} section="sprinklers" />
        {expandedSubSections.sprinklers && (
          <View style={styles.sectionContent}>
            {certificate.sprinklers.map((item, idx) => (
              <View key={idx} style={[styles.tableRow, { borderColor: theme.border }]}>
                <View style={styles.tableRowHeader}>
                  <ThemedText type="small" style={{ fontWeight: '600' }}>
                    {(fm85a.sprinkler || "Sprinkler")} #{idx + 1}
                  </ThemedText>
                  <Pressable onPress={() => removeSprinkler(idx)} style={styles.removeBtn}>
                    <Feather name="trash-2" size={16} color={AppColors.error} />
                  </Pressable>
                </View>
                <View style={styles.row}>
                  <View style={styles.thirdField}>
                    <ThemedText type="small">{fm85a.manufacturer || "Manufacturer"}</ThemedText>
                    <TextInput style={inputStyle} value={item.manufacturer} onChangeText={(v) => updateSprinkler(idx, 'manufacturer', v)} placeholderTextColor={theme.placeholder} />
                  </View>
                  <View style={styles.thirdField}>
                    <ThemedText type="small">{fm85a.model || "Model"}</ThemedText>
                    <TextInput style={inputStyle} value={item.modelTradeName} onChangeText={(v) => updateSprinkler(idx, 'modelTradeName', v)} placeholderTextColor={theme.placeholder} />
                  </View>
                  <View style={styles.thirdField}>
                    <ThemedText type="small">{fm85a.kFactor || "K-Factor"}</ThemedText>
                    <TextInput style={inputStyle} value={item.kFactor} onChangeText={(v) => updateSprinkler(idx, 'kFactor', v)} keyboardType="numeric" placeholderTextColor={theme.placeholder} />
                  </View>
                </View>
                <Spacer height={Spacing.sm} />
                <View style={styles.row}>
                  <View style={styles.thirdField}>
                    <ThemedText type="small">{fm85a.temperature || "Temp"}</ThemedText>
                    <TextInput style={inputStyle} value={item.temperatureRating} onChangeText={(v) => updateSprinkler(idx, 'temperatureRating', v)} placeholderTextColor={theme.placeholder} />
                  </View>
                  <View style={styles.thirdField}>
                    <ThemedText type="small">{fm85a.sin || "SIN"}</ThemedText>
                    <TextInput style={inputStyle} value={item.sin} onChangeText={(v) => updateSprinkler(idx, 'sin', v)} placeholderTextColor={theme.placeholder} />
                  </View>
                  <View style={styles.thirdField}>
                    <ThemedText type="small">{fm85a.year || "Year"}</ThemedText>
                    <TextInput style={inputStyle} value={item.yearOfManufacture} onChangeText={(v) => updateSprinkler(idx, 'yearOfManufacture', v)} keyboardType="numeric" placeholderTextColor={theme.placeholder} />
                  </View>
                </View>
                <Spacer height={Spacing.sm} />
                <ThemedText type="small">{fm85a.quantity || "Quantity"}</ThemedText>
                <TextInput style={inputStyle} value={item.quantity} onChangeText={(v) => updateSprinkler(idx, 'quantity', v)} keyboardType="numeric" placeholderTextColor={theme.placeholder} />
              </View>
            ))}
            <Pressable onPress={addSprinkler} style={[styles.addButton, { borderColor: AppColors.primary }]}>
              <Feather name="plus" size={16} color={AppColors.primary} />
              <ThemedText style={{ color: AppColors.primary, marginLeft: Spacing.xs }}>{fm85a.addRow || "+ Add Row"}</ThemedText>
            </Pressable>
          </View>
        )}
      </>
    );
  };

  const renderPipeSection = () => {
    const addPipe = () => updateCertificate({ pipe: [...certificate.pipe, createEmptyPipe()] });
    const removePipe = (index: number) => updateCertificate({ pipe: certificate.pipe.filter((_: FM85APipe, i: number) => i !== index) });
    const updatePipe = (index: number, field: keyof FM85APipe, value: string) => {
      const updated = [...certificate.pipe];
      updated[index] = { ...updated[index], [field]: value };
      updateCertificate({ pipe: updated });
    };

    return (
      <>
        <SubSectionHeader title={fm85a.pipeSection || "Automatic Sprinkler Pipe"} section="pipe" />
        {expandedSubSections.pipe && (
          <View style={styles.sectionContent}>
            {certificate.pipe.map((item: FM85APipe, idx: number) => (
              <View key={idx} style={[styles.tableRow, { borderColor: theme.border }]}>
                <View style={styles.tableRowHeader}>
                  <ThemedText type="small" style={{ fontWeight: '600' }}>{(fm85a.pipe || "Pipe")} #{idx + 1}</ThemedText>
                  <Pressable onPress={() => removePipe(idx)} style={styles.removeBtn}>
                    <Feather name="trash-2" size={16} color={AppColors.error} />
                  </Pressable>
                </View>
                <View style={styles.row}>
                  <View style={styles.halfField}>
                    <ThemedText type="small">{fm85a.manufacturer || "Manufacturer"}</ThemedText>
                    <TextInput style={inputStyle} value={item.manufacturer} onChangeText={(v) => updatePipe(idx, 'manufacturer', v)} placeholderTextColor={theme.placeholder} />
                  </View>
                  <View style={styles.halfField}>
                    <ThemedText type="small">{fm85a.model || "Model"}</ThemedText>
                    <TextInput style={inputStyle} value={item.modelTradeName} onChangeText={(v) => updatePipe(idx, 'modelTradeName', v)} placeholderTextColor={theme.placeholder} />
                  </View>
                </View>
                <Spacer height={Spacing.sm} />
                <ThemedText type="small">{fm85a.productDescription || "Product Description"}</ThemedText>
                <TextInput style={inputStyle} value={item.productDescription} onChangeText={(v) => updatePipe(idx, 'productDescription', v)} placeholderTextColor={theme.placeholder} />
                <Spacer height={Spacing.sm} />
                <View style={styles.row}>
                  <View style={styles.thirdField}>
                    <ThemedText type="small">{fm85a.schedule || "Schedule"}</ThemedText>
                    <TextInput style={inputStyle} value={item.schedule} onChangeText={(v) => updatePipe(idx, 'schedule', v)} placeholderTextColor={theme.placeholder} />
                  </View>
                  <View style={styles.thirdField}>
                    <ThemedText type="small">{fm85a.connectionType || "Conn Type"}</ThemedText>
                    <TextInput style={inputStyle} value={item.connectionType} onChangeText={(v) => updatePipe(idx, 'connectionType', v)} placeholderTextColor={theme.placeholder} />
                  </View>
                  <View style={styles.thirdField}>
                    <ThemedText type="small">{fm85a.maxPressure || "Max PSI"}</ThemedText>
                    <TextInput style={inputStyle} value={item.maxWorkingPressure} onChangeText={(v) => updatePipe(idx, 'maxWorkingPressure', v)} keyboardType="numeric" placeholderTextColor={theme.placeholder} />
                  </View>
                </View>
              </View>
            ))}
            <Pressable onPress={addPipe} style={[styles.addButton, { borderColor: AppColors.primary }]}>
              <Feather name="plus" size={16} color={AppColors.primary} />
              <ThemedText style={{ color: AppColors.primary, marginLeft: Spacing.xs }}>{fm85a.addRow || "+ Add Row"}</ThemedText>
            </Pressable>
          </View>
        )}
      </>
    );
  };

  const renderAlarmValvesSection = () => {
    const addValve = () => updateCertificate({ alarmCheckDryPipeReleaseValves: [...certificate.alarmCheckDryPipeReleaseValves, createEmptyAlarmCheckDryPipeReleaseValve()] });
    const removeValve = (index: number) => updateCertificate({ alarmCheckDryPipeReleaseValves: certificate.alarmCheckDryPipeReleaseValves.filter((_, i) => i !== index) });
    const updateValve = (index: number, field: keyof FM85AAlarmCheckDryPipeReleaseValve, value: string) => {
      const updated = [...certificate.alarmCheckDryPipeReleaseValves];
      updated[index] = { ...updated[index], [field]: value };
      updateCertificate({ alarmCheckDryPipeReleaseValves: updated });
    };

    return (
      <>
        <SubSectionHeader title={fm85a.alarmValvesSection || "Alarm-Check/Dry-Pipe/Auto-Release Valves"} section="alarmValves" />
        {expandedSubSections.alarmValves && (
          <View style={styles.sectionContent}>
            {certificate.alarmCheckDryPipeReleaseValves.map((item, idx) => (
              <View key={idx} style={[styles.tableRow, { borderColor: theme.border }]}>
                <View style={styles.tableRowHeader}>
                  <ThemedText type="small" style={{ fontWeight: '600' }}>{(fm85a.valve || "Valve")} #{idx + 1}</ThemedText>
                  <Pressable onPress={() => removeValve(idx)} style={styles.removeBtn}>
                    <Feather name="trash-2" size={16} color={AppColors.error} />
                  </Pressable>
                </View>
                <View style={styles.row}>
                  <View style={styles.halfField}>
                    <ThemedText type="small">{fm85a.type || "Type"}</ThemedText>
                    <TextInput style={inputStyle} value={item.type} onChangeText={(v) => updateValve(idx, 'type', v)} placeholderTextColor={theme.placeholder} />
                  </View>
                  <View style={styles.halfField}>
                    <ThemedText type="small">{fm85a.manufacturer || "Manufacturer"}</ThemedText>
                    <TextInput style={inputStyle} value={item.manufacturer} onChangeText={(v) => updateValve(idx, 'manufacturer', v)} placeholderTextColor={theme.placeholder} />
                  </View>
                </View>
                <Spacer height={Spacing.sm} />
                <View style={styles.row}>
                  <View style={styles.thirdField}>
                    <ThemedText type="small">{fm85a.model || "Model"}</ThemedText>
                    <TextInput style={inputStyle} value={item.model} onChangeText={(v) => updateValve(idx, 'model', v)} placeholderTextColor={theme.placeholder} />
                  </View>
                  <View style={styles.thirdField}>
                    <ThemedText type="small">{fm85a.serialNumber || "Serial"}</ThemedText>
                    <TextInput style={inputStyle} value={item.serialNumber} onChangeText={(v) => updateValve(idx, 'serialNumber', v)} placeholderTextColor={theme.placeholder} />
                  </View>
                  <View style={styles.thirdField}>
                    <ThemedText type="small">{fm85a.quantity || "Qty"}</ThemedText>
                    <TextInput style={inputStyle} value={item.quantity} onChangeText={(v) => updateValve(idx, 'quantity', v)} keyboardType="numeric" placeholderTextColor={theme.placeholder} />
                  </View>
                </View>
              </View>
            ))}
            <Pressable onPress={addValve} style={[styles.addButton, { borderColor: AppColors.primary }]}>
              <Feather name="plus" size={16} color={AppColors.primary} />
              <ThemedText style={{ color: AppColors.primary, marginLeft: Spacing.xs }}>{fm85a.addRow || "+ Add Row"}</ThemedText>
            </Pressable>
            <Spacer height={Spacing.md} />
            <ThemedText type="h4">{fm85a.autoReleaseQuestions || "If Automatic-Release Type Valve"}</ThemedText>
            <Spacer height={Spacing.sm} />
            <ThemedText type="small">{fm85a.detectionType || "Detection Type"}</ThemedText>
            <View style={styles.optionRow}>
              {(['electronic', 'hydraulic', 'pneumatic'] as const).map(opt => (
                <Pressable key={opt} onPress={() => updateCertificate({
                  automaticReleaseValveQuestions: { ...certificate.automaticReleaseValveQuestions, detectionType: opt }
                })} style={[styles.optionButton, {
                  backgroundColor: certificate.automaticReleaseValveQuestions.detectionType === opt ? AppColors.primary : theme.backgroundDefault,
                  borderColor: certificate.automaticReleaseValveQuestions.detectionType === opt ? AppColors.primary : theme.border,
                }]}>
                  <ThemedText style={{ color: certificate.automaticReleaseValveQuestions.detectionType === opt ? '#FFF' : theme.text, fontSize: 12 }}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
            <Spacer height={Spacing.sm} />
            <ThemedText type="small">{fm85a.interlockArrangement || "Interlock Arrangement"}</ThemedText>
            <View style={styles.optionRow}>
              {(['single', 'double', 'non-interlock'] as const).map(opt => (
                <Pressable key={opt} onPress={() => updateCertificate({
                  automaticReleaseValveQuestions: { ...certificate.automaticReleaseValveQuestions, interlockArrangement: opt }
                })} style={[styles.optionButton, {
                  backgroundColor: certificate.automaticReleaseValveQuestions.interlockArrangement === opt ? AppColors.primary : theme.backgroundDefault,
                  borderColor: certificate.automaticReleaseValveQuestions.interlockArrangement === opt ? AppColors.primary : theme.border,
                }]}>
                  <ThemedText style={{ color: certificate.automaticReleaseValveQuestions.interlockArrangement === opt ? '#FFF' : theme.text, fontSize: 12 }}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
            <Spacer height={Spacing.sm} />
            <YesNoSelector
              label={fm85a.airPressureSupervised || "Air Pressure Supervised?"}
              value={certificate.automaticReleaseValveQuestions.airPressureSupervised}
              onChange={(v) => updateCertificate({
                automaticReleaseValveQuestions: { ...certificate.automaticReleaseValveQuestions, airPressureSupervised: v }
              })}
            />
            <YesNoSelector
              label={fm85a.manualOperationArranged || "Manual Operation Arranged?"}
              value={certificate.automaticReleaseValveQuestions.manualOperationArranged}
              onChange={(v) => updateCertificate({
                automaticReleaseValveQuestions: { ...certificate.automaticReleaseValveQuestions, manualOperationArranged: v }
              })}
            />
          </View>
        )}
      </>
    );
  };

  const renderMiscComponentsSection = () => {
    const miscItems = [
      { key: 'waterflowAlarm', label: fm85a.waterflowAlarm || 'Waterflow Alarm' },
      { key: 'quickOpeningDevice', label: fm85a.quickOpeningDevice || 'Quick Opening Device' },
      { key: 'pressureGauge', label: fm85a.pressureGauge || 'Pressure Gauge' },
      { key: 'fireDepartmentConnection', label: fm85a.fdc || 'Fire Dept Connection' },
      { key: 'reliefValve', label: fm85a.reliefValve || 'Relief Valve' },
      { key: 'testConnection', label: fm85a.testConnection || 'Test Connection' },
      { key: 'drainValve', label: fm85a.drainValve || 'Drain Valve' },
    ] as const;

    return (
      <>
        <SubSectionHeader title={fm85a.miscComponentsSection || "Miscellaneous Components"} section="miscComponents" />
        {expandedSubSections.miscComponents && (
          <View style={styles.sectionContent}>
            {miscItems.map(({ key, label }) => (
              <View key={key} style={[styles.miscItem, { borderColor: theme.border }]}>
                <ThemedText style={styles.miscLabel}>{label}</ThemedText>
                <View style={styles.row}>
                  <View style={styles.thirdField}>
                    <TextInput
                      style={inputStyle}
                      placeholder={fm85a.manufacturer || "Mfr"}
                      placeholderTextColor={theme.placeholder}
                      value={(certificate.miscComponents as any)[key].manufacturer}
                      onChangeText={(v) => updateCertificate({
                        miscComponents: {
                          ...certificate.miscComponents,
                          [key]: { ...certificate.miscComponents[key as keyof typeof certificate.miscComponents], manufacturer: v }
                        }
                      })}
                    />
                  </View>
                  <View style={styles.thirdField}>
                    <TextInput
                      style={inputStyle}
                      placeholder={fm85a.model || "Model"}
                      placeholderTextColor={theme.placeholder}
                      value={(certificate.miscComponents as any)[key].model}
                      onChangeText={(v) => updateCertificate({
                        miscComponents: {
                          ...certificate.miscComponents,
                          [key]: { ...certificate.miscComponents[key as keyof typeof certificate.miscComponents], model: v }
                        }
                      })}
                    />
                  </View>
                  <View style={styles.thirdField}>
                    <TextInput
                      style={inputStyle}
                      placeholder={fm85a.quantity || "Qty"}
                      placeholderTextColor={theme.placeholder}
                      keyboardType="numeric"
                      value={(certificate.miscComponents as any)[key].quantity}
                      onChangeText={(v) => updateCertificate({
                        miscComponents: {
                          ...certificate.miscComponents,
                          [key]: { ...certificate.miscComponents[key as keyof typeof certificate.miscComponents], quantity: v }
                        }
                      })}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </>
    );
  };

  const renderTestsSection = () => (
    <>
      <SubSectionHeader title={fm85a.testsSection || "Tests"} section="tests" />
      {expandedSubSections.tests && (
        <View style={styles.sectionContent}>
          <ThemedText type="h4">{fm85a.hydrostaticTest || "Hydrostatic Test"}</ThemedText>
          <View style={styles.row}>
            <View style={styles.thirdField}>
              <ThemedText type="small">{fm85a.testedPsi || "PSI"}</ThemedText>
              <TextInput style={inputStyle} value={certificate.tests.hydrostatic.testedPressurePsi} onChangeText={(v) => updateCertificate({
                tests: { ...certificate.tests, hydrostatic: { ...certificate.tests.hydrostatic, testedPressurePsi: v } }
              })} keyboardType="numeric" placeholderTextColor={theme.placeholder} />
            </View>
            <View style={styles.thirdField}>
              <ThemedText type="small">{fm85a.durationHours || "Hours"}</ThemedText>
              <TextInput style={inputStyle} value={certificate.tests.hydrostatic.durationHours} onChangeText={(v) => updateCertificate({
                tests: { ...certificate.tests, hydrostatic: { ...certificate.tests.hydrostatic, durationHours: v } }
              })} keyboardType="numeric" placeholderTextColor={theme.placeholder} />
            </View>
            <View style={styles.thirdField}>
              <ThemedText type="small">{fm85a.pressureDrop || "Drop"}</ThemedText>
              <TextInput style={inputStyle} value={certificate.tests.hydrostatic.pressureDropPsi} onChangeText={(v) => updateCertificate({
                tests: { ...certificate.tests, hydrostatic: { ...certificate.tests.hydrostatic, pressureDropPsi: v } }
              })} keyboardType="numeric" placeholderTextColor={theme.placeholder} />
            </View>
          </View>
          <Spacer height={Spacing.md} />
          <ThemedText type="h4">{fm85a.pneumaticTest || "Pneumatic Test"}</ThemedText>
          <View style={styles.row}>
            <View style={styles.thirdField}>
              <ThemedText type="small">{fm85a.testedPsi || "PSI"}</ThemedText>
              <TextInput style={inputStyle} value={certificate.tests.pneumatic.testedPressurePsi} onChangeText={(v) => updateCertificate({
                tests: { ...certificate.tests, pneumatic: { ...certificate.tests.pneumatic, testedPressurePsi: v } }
              })} keyboardType="numeric" placeholderTextColor={theme.placeholder} />
            </View>
            <View style={styles.thirdField}>
              <ThemedText type="small">{fm85a.durationHours || "Hours"}</ThemedText>
              <TextInput style={inputStyle} value={certificate.tests.pneumatic.durationHours} onChangeText={(v) => updateCertificate({
                tests: { ...certificate.tests, pneumatic: { ...certificate.tests.pneumatic, durationHours: v } }
              })} keyboardType="numeric" placeholderTextColor={theme.placeholder} />
            </View>
            <View style={styles.thirdField}>
              <ThemedText type="small">{fm85a.pressureDrop || "Drop"}</ThemedText>
              <TextInput style={inputStyle} value={certificate.tests.pneumatic.pressureDropPsi} onChangeText={(v) => updateCertificate({
                tests: { ...certificate.tests, pneumatic: { ...certificate.tests.pneumatic, pressureDropPsi: v } }
              })} keyboardType="numeric" placeholderTextColor={theme.placeholder} />
            </View>
          </View>
          <Spacer height={Spacing.md} />
          <ThemedText type="h4">{fm85a.waterflowAlarmsTest || "Waterflow Alarms Test"}</ThemedText>
          <View style={styles.row}>
            <View style={styles.halfField}>
              <ThemedText type="small">{fm85a.totalTested || "Total Tested"}</ThemedText>
              <TextInput style={inputStyle} value={certificate.tests.waterflowAlarm.totalDevicesTested} onChangeText={(v) => updateCertificate({
                tests: { ...certificate.tests, waterflowAlarm: { ...certificate.tests.waterflowAlarm, totalDevicesTested: v } }
              })} keyboardType="numeric" placeholderTextColor={theme.placeholder} />
            </View>
            <View style={styles.halfField}>
              <ThemedText type="small">{fm85a.over60Seconds || ">60 Seconds"}</ThemedText>
              <TextInput style={inputStyle} value={certificate.tests.waterflowAlarm.devicesOver60Seconds} onChangeText={(v) => updateCertificate({
                tests: { ...certificate.tests, waterflowAlarm: { ...certificate.tests.waterflowAlarm, devicesOver60Seconds: v } }
              })} keyboardType="numeric" placeholderTextColor={theme.placeholder} />
            </View>
          </View>
          <Spacer height={Spacing.md} />
          <YesNoSelector
            label={fm85a.weldedConnectionsQuestion1 || "Welding procedures complied?"}
            value={certificate.tests.weldedPipeConnectionsYesNo.weldingProceduresComplied}
            onChange={(v) => updateCertificate({
              tests: { ...certificate.tests, weldedPipeConnectionsYesNo: { ...certificate.tests.weldedPipeConnectionsYesNo, weldingProceduresComplied: v } }
            })}
          />
          <YesNoSelector
            label={fm85a.weldedConnectionsQuestion2 || "Welders qualified?"}
            value={certificate.tests.weldedPipeConnectionsYesNo.weldersQualified}
            onChange={(v) => updateCertificate({
              tests: { ...certificate.tests, weldedPipeConnectionsYesNo: { ...certificate.tests.weldedPipeConnectionsYesNo, weldersQualified: v } }
            })}
          />
          <YesNoSelector
            label={fm85a.weldedConnectionsQuestion3 || "QC procedure ensured discs/coupons clean?"}
            value={certificate.tests.weldedPipeConnectionsYesNo.qcProcedureEnsuredDiscsCouponsRetrievedAndClean}
            onChange={(v) => updateCertificate({
              tests: { ...certificate.tests, weldedPipeConnectionsYesNo: { ...certificate.tests.weldedPipeConnectionsYesNo, qcProcedureEnsuredDiscsCouponsRetrievedAndClean: v } }
            })}
          />
          <Spacer height={Spacing.md} />
          <YesNoSelector
            label={fm85a.undergroundVerified || "Underground verified on FM85B?"}
            value={certificate.tests.undergroundMains.verifiedOnFM85B}
            onChange={(v) => updateCertificate({
              tests: { ...certificate.tests, undergroundMains: { ...certificate.tests.undergroundMains, verifiedOnFM85B: v } }
            })}
          />
          {certificate.tests.undergroundMains.verifiedOnFM85B === 'N' && (
            <>
              <ThemedText type="small">{fm85a.ifNoWhatForm || "If No, what form used?"}</ThemedText>
              <TextInput style={inputStyle} value={certificate.tests.undergroundMains.ifNoWhatFormUsed} onChangeText={(v) => updateCertificate({
                tests: { ...certificate.tests, undergroundMains: { ...certificate.tests.undergroundMains, ifNoWhatFormUsed: v } }
              })} placeholderTextColor={theme.placeholder} />
            </>
          )}
          <Spacer height={Spacing.md} />
          <ThemedText type="small">{fm85a.contractorFlushed || "What contractor flushed?"}</ThemedText>
          <TextInput style={inputStyle} value={certificate.tests.undergroundMains.whatContractorFlushed} onChangeText={(v) => updateCertificate({
            tests: { ...certificate.tests, undergroundMains: { ...certificate.tests.undergroundMains, whatContractorFlushed: v } }
          })} placeholderTextColor={theme.placeholder} />
          <Spacer height={Spacing.md} />
          <YesNoSelector
            label={fm85a.personInstructed || "Person in charge instructed?"}
            value={certificate.tests.instructionMaterialsYesNo.personInChargeInstructed}
            onChange={(v) => updateCertificate({
              tests: { ...certificate.tests, instructionMaterialsYesNo: { ...certificate.tests.instructionMaterialsYesNo, personInChargeInstructed: v } }
            })}
          />
          <YesNoSelector
            label={fm85a.copiesLeft || "Copies left on premises?"}
            value={certificate.tests.instructionMaterialsYesNo.copiesLeftOnPremises}
            onChange={(v) => updateCertificate({
              tests: { ...certificate.tests, instructionMaterialsYesNo: { ...certificate.tests.instructionMaterialsYesNo, copiesLeftOnPremises: v } }
            })}
          />
          {(certificate.tests.instructionMaterialsYesNo.personInChargeInstructed === 'N' || certificate.tests.instructionMaterialsYesNo.copiesLeftOnPremises === 'N') && (
            <>
              <ThemedText type="small">{fm85a.ifNoExplain || "If No, explain"}</ThemedText>
              <TextInput style={[inputStyle, styles.textArea]} value={certificate.tests.instructionMaterialsYesNo.ifNoExplain} onChangeText={(v) => updateCertificate({
                tests: { ...certificate.tests, instructionMaterialsYesNo: { ...certificate.tests.instructionMaterialsYesNo, ifNoExplain: v } }
              })} multiline placeholderTextColor={theme.placeholder} />
            </>
          )}
          <Spacer height={Spacing.md} />
          <ThemedText type="small">{fm85a.dateSystemLeftInService || "Date system left in service"}</ThemedText>
          <DatePickerField
            value={certificate.tests.dateSystemLeftInServiceAllValvesOpen}
            onChange={(v) => updateCertificate({
              tests: { ...certificate.tests, dateSystemLeftInServiceAllValvesOpen: v }
            })}
            placeholder={fm85a.dateSystemLeftInService || "Date"}
          />
        </View>
      )}
    </>
  );

  const renderSignaturesSection = () => (
    <>
      <SubSectionHeader title={fm85a.signaturesSection || "Signatures"} section="signatures" />
      {expandedSubSections.signatures && (
        <View style={styles.sectionContent}>
          <ThemedText type="h4">{fm85a.propertyOwnerAgent || "Property Owner/Authorized Agent"}</ThemedText>
          <Spacer height={Spacing.sm} />
          <ThemedText type="small">{fm85a.name || "Name"}</ThemedText>
          <TextInput style={inputStyle} value={certificate.signatures.propertyOwnerAuthorizedAgentName} onChangeText={(v) => updateCertificate({
            signatures: { ...certificate.signatures, propertyOwnerAuthorizedAgentName: v }
          })} placeholderTextColor={theme.placeholder} />
          <Spacer height={Spacing.sm} />
          <ThemedText type="small">{fm85a.title || "Title"}</ThemedText>
          <TextInput style={inputStyle} value={certificate.signatures.propertyOwnerSignatureTitle} onChangeText={(v) => updateCertificate({
            signatures: { ...certificate.signatures, propertyOwnerSignatureTitle: v }
          })} placeholderTextColor={theme.placeholder} />
          <Spacer height={Spacing.sm} />
          <ThemedText type="small">{fm85a.signature || "Signature"}</ThemedText>
          <SignatureCapture
            signature={certificate.signatures.propertyOwnerSignature}
            onSignatureChange={(sig) => updateCertificate({
              signatures: { ...certificate.signatures, propertyOwnerSignature: sig || '' }
            })}
          />
          <Spacer height={Spacing.sm} />
          <ThemedText type="small">{fm85a.date || "Date"}</ThemedText>
          <DatePickerField
            value={certificate.signatures.propertyOwnerDate}
            onChange={(d) => updateCertificate({
              signatures: { ...certificate.signatures, propertyOwnerDate: d }
            })}
            placeholder={fm85a.date || "Date"}
          />
          <Spacer height={Spacing.lg} />
          <ThemedText type="h4">{fm85a.sprinklerContractor || "Sprinkler Contractor"}</ThemedText>
          <Spacer height={Spacing.sm} />
          <ThemedText type="small">{fm85a.name || "Name"}</ThemedText>
          <TextInput style={inputStyle} value={certificate.signatures.sprinklerContractorName} onChangeText={(v) => updateCertificate({
            signatures: { ...certificate.signatures, sprinklerContractorName: v }
          })} placeholderTextColor={theme.placeholder} />
          <Spacer height={Spacing.sm} />
          <ThemedText type="small">{fm85a.title || "Title"}</ThemedText>
          <TextInput style={inputStyle} value={certificate.signatures.sprinklerContractorSignatureTitle} onChangeText={(v) => updateCertificate({
            signatures: { ...certificate.signatures, sprinklerContractorSignatureTitle: v }
          })} placeholderTextColor={theme.placeholder} />
          <Spacer height={Spacing.sm} />
          <ThemedText type="small">{fm85a.signature || "Signature"}</ThemedText>
          <SignatureCapture
            signature={certificate.signatures.sprinklerContractorSignature}
            onSignatureChange={(sig) => updateCertificate({
              signatures: { ...certificate.signatures, sprinklerContractorSignature: sig || '' }
            })}
          />
          <Spacer height={Spacing.sm} />
          <ThemedText type="small">{fm85a.date || "Date"}</ThemedText>
          <DatePickerField
            value={certificate.signatures.sprinklerContractorDate}
            onChange={(d) => updateCertificate({
              signatures: { ...certificate.signatures, sprinklerContractorDate: d }
            })}
            placeholder={fm85a.date || "Date"}
          />
        </View>
      )}
    </>
  );

  const renderAdditionalNotesSection = () => (
    <View style={styles.sectionContent}>
      <ThemedText type="h4">{fm85a.additionalNotes || "Additional Explanations/Comments/Notes"}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={[inputStyle, styles.largeTextArea]}
        value={certificate.additionalNotes}
        onChangeText={(v) => updateCertificate({ additionalNotes: v })}
        placeholder={fm85a.additionalNotesPlaceholder || "Enter additional comments..."}
        placeholderTextColor={theme.placeholder}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.mainHeader, { backgroundColor: fullTheme.colors.primary }]}
        onPress={onToggleExpand}
      >
        <ThemedText style={styles.mainHeaderText}>
          {fm85a.title || "CERTIFICATE OF MATERIALS AND TESTS FM GLOBAL (FM85A)"}
        </ThemedText>
        <Feather
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={24}
          color="#FFFFFF"
        />
      </Pressable>
      
      {isExpanded && (
        <View style={[styles.content, { borderColor: fullTheme.colors.border }]}>
          {renderContractorSection()}
          {renderClientSection()}
          {renderSprinklersSection()}
          {renderPipeSection()}
          {renderAlarmValvesSection()}
          {renderMiscComponentsSection()}
          {renderTestsSection()}
          {renderSignaturesSection()}
          {renderAdditionalNotesSection()}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  mainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  mainHeaderText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    flex: 1,
  },
  content: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: BorderRadius.md,
    borderBottomRightRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  subSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  sectionContent: {
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  textArea: {
    height: 80,
    paddingTop: Spacing.md,
  },
  largeTextArea: {
    height: 120,
    paddingTop: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  halfField: {
    flex: 1,
  },
  thirdField: {
    flex: 1,
  },
  tableRow: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  tableRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  removeBtn: {
    padding: Spacing.xs,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    borderStyle: 'dashed',
  },
  yesNoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  yesNoLabel: {
    flex: 1,
    fontSize: 14,
  },
  yesNoButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  yesNoButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  optionButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  miscItem: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  miscLabel: {
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
});
