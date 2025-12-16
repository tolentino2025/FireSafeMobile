import React, { useCallback, useState } from "react";
import { View, TextInput, StyleSheet, Pressable, Platform, Alert, Linking } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ControlledTextInput } from "@/components/ControlledTextInput";
import { DatePickerField } from "@/components/DatePickerField";
import { TimePickerField } from "@/components/TimePickerField";
import { SignatureCapture } from "@/components/SignatureCapture";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { Spacing, BorderRadius, AppColors } from "@/constants/theme";
import { toUpperIfNotEmail } from "@/utils/textTransform";
import {
  HydrostaticTest,
  HydrostaticSystemType,
  HydrostaticNormRef,
  ApprovedBy,
  PressureReadingPoint,
  FillingMethod,
  PressureUnit,
  TimeUnit,
  ConclusionStatus,
} from "@/types/hydrostaticTest";
import { InspectionPhoto } from "@/contexts/InspectionContext";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";

interface HydrostaticTestSectionProps {
  hydrostaticTest: HydrostaticTest;
  onHydrostaticTestChange: (test: HydrostaticTest) => void;
  photos: InspectionPhoto[];
  onPhotosChange: (photos: InspectionPhoto[]) => void;
}

export function HydrostaticTestSection({
  hydrostaticTest,
  onHydrostaticTestChange,
  photos,
  onPhotosChange,
}: HydrostaticTestSectionProps) {
  const { theme, fullTheme } = useTheme();
  const { language } = useLanguage();

  const t = language === "pt-BR" ? {
    testIdentification: "IDENTIFICACAO DO TESTE",
    systemType: "Tipo de Sistema",
    hydrants: "Hidrantes",
    sprinklers: "Sprinklers",
    systemName: "Nome do Sistema",
    buildingType: "Tipo de Edificacao",
    protectedArea: "Area/Setor/Pavimento Protegido",
    normativeReferences: "Normas de Referencia",
    fmDataSheet: "Data Sheet FM Global",
    nbrStandard: "Norma NBR",
    approvedBy: "Projeto Aprovado por",
    cb: "Corpo de Bombeiros",
    fm: "FM Global",
    other: "Outro",
    specifyOther: "Especificar",
    testDate: "Data do Teste",
    startTime: "Hora Inicio",
    endTime: "Hora Termino",
    weather: "Condicoes Climaticas",
    partiesInvolved: "PARTES ENVOLVIDAS",
    owner: "Proprietario/Contratante",
    corporateName: "Razao Social",
    address: "Endereco",
    localResponsible: "Responsavel Local",
    role: "Cargo/Funcao",
    contact: "Contato (Telefone/Email)",
    executorCompany: "Empresa Executora",
    cnpj: "CNPJ",
    technicalResponsible: "Responsavel Tecnico",
    name: "Nome",
    creaCau: "CREA/CAU",
    artRrt: "ART/RRT",
    inspector: "Inspetor",
    signature: "Assinatura",
    preparation: "PREPARACAO",
    preChecks: "Verificacoes Previas",
    installedAsApprovedProject: "Sistema instalado conforme projeto aprovado",
    pipesAnchoredAndSupported: "Tubulacoes ancoradas e suportadas adequadamente",
    valvesCorrectlyInstalled: "Valvulas corretamente instaladas e acessiveis",
    visibleConnectionsAccessible: "Conexoes visiveis e acessiveis",
    untestedSectionsIsolated: "Trechos nao testados isolados",
    sensitiveEquipmentProtected: "Equipamentos sensiveis protegidos",
    instrumentation: "Instrumentacao",
    manometerBrand: "Marca do Manometro",
    manometerModel: "Modelo",
    measurementRange: "Faixa de Medicao",
    calibrationCertificate: "Certificado de Calibracao",
    pressureReadingPoint: "Ponto de Leitura de Pressao",
    highestPoint: "Ponto mais Alto",
    nearPump: "Proximo a Bomba",
    otherPoint: "Outro",
    specifyPoint: "Especificar Ponto",
    execution: "EXECUCAO",
    filling: "Enchimento",
    fillingMethod: "Metodo de Enchimento",
    gradual: "Gradual",
    bySector: "Por Setor",
    airElimination: "Eliminacao de Ar",
    reliefValvesOpen: "Valvulas de alivio abertas",
    purgersUsed: "Purgadores utilizados",
    pressure: "Pressao",
    workingPressure: "Pressao de Trabalho",
    testPressure: "Pressao de Teste",
    normativeCriteria: "Criterio Normativo Aplicado",
    minimumTestTime: "Tempo Minimo de Teste",
    minutes: "Minutos",
    hours: "Horas",
    monitoring: "Monitoramento",
    stabilizationStartTime: "Hora Inicio Estabilizacao",
    testEndTime: "Hora Termino Teste",
    initialPressure: "Pressao Inicial",
    finalPressure: "Pressao Final",
    pressureVariation: "Variacao de Pressao",
    results: "RESULTADOS",
    tightness: "Estanqueidade",
    noLeaks: "Nao houve vazamentos",
    noPressureDrop: "Nao houve queda de pressao",
    noVisibleDeformation: "Nao houve deformacao visivel",
    occurrences: "Ocorrencias",
    leaksFound: "Houve vazamento(s)",
    leaksDescription: "Descricao do(s) Vazamento(s)",
    pressureDropAboveAllowed: "Queda de pressao acima do permitido",
    structuralFailure: "Falha estrutural",
    failureDescription: "Descricao da Falha",
    photoEvidence: "REGISTRO FOTOGRAFICO",
    initialGaugePhotos: "Foto Inicial - Manometro",
    initialGeneralPhotos: "Foto Inicial - Visao Geral",
    duringTestPhotos: "Fotos Durante o Teste (Opcional)",
    finalGaugePhotos: "Foto Final - Manometro",
    finalGeneralPhotos: "Foto Final - Visao Geral",
    addPhoto: "Adicionar Foto",
    required: "(Obrigatoria)",
    optional: "(Opcional)",
    conclusion: "CONCLUSAO TECNICA",
    status: "Status",
    approved: "APROVADO",
    reproved: "REPROVADO",
    technicalConclusion: "Parecer Tecnico",
    declarationSignatures: "DECLARACAO E ASSINATURAS",
    declarationText: "Declaro que todas as informacoes prestadas neste relatorio sao verdadeiras e que o teste foi conduzido em conformidade com as normas aplicaveis.",
    declarationAccepted: "Li e aceito a declaracao acima",
    technicalResponsibleSignature: "Assinatura Responsavel Tecnico",
    inspectorSignature: "Assinatura Inspetor",
    ownerRepSignature: "Assinatura Representante Proprietario (Opcional)",
    date: "Data",
  } : {
    testIdentification: "TEST IDENTIFICATION",
    systemType: "System Type",
    hydrants: "Hydrants",
    sprinklers: "Sprinklers",
    systemName: "System Name",
    buildingType: "Building Type",
    protectedArea: "Protected Area/Sector/Floor",
    normativeReferences: "Reference Standards",
    fmDataSheet: "FM Global Data Sheet",
    nbrStandard: "NBR Standard",
    approvedBy: "Project Approved by",
    cb: "Fire Department",
    fm: "FM Global",
    other: "Other",
    specifyOther: "Specify",
    testDate: "Test Date",
    startTime: "Start Time",
    endTime: "End Time",
    weather: "Weather Conditions",
    partiesInvolved: "PARTIES INVOLVED",
    owner: "Owner/Client",
    corporateName: "Corporate Name",
    address: "Address",
    localResponsible: "Local Responsible",
    role: "Role/Position",
    contact: "Contact (Phone/Email)",
    executorCompany: "Executor Company",
    cnpj: "CNPJ/Tax ID",
    technicalResponsible: "Technical Responsible",
    name: "Name",
    creaCau: "CREA/CAU",
    artRrt: "ART/RRT",
    inspector: "Inspector",
    signature: "Signature",
    preparation: "PREPARATION",
    preChecks: "Pre-Checks",
    installedAsApprovedProject: "System installed as per approved project",
    pipesAnchoredAndSupported: "Pipes properly anchored and supported",
    valvesCorrectlyInstalled: "Valves correctly installed and accessible",
    visibleConnectionsAccessible: "Visible connections accessible",
    untestedSectionsIsolated: "Untested sections isolated",
    sensitiveEquipmentProtected: "Sensitive equipment protected",
    instrumentation: "Instrumentation",
    manometerBrand: "Manometer Brand",
    manometerModel: "Model",
    measurementRange: "Measurement Range",
    calibrationCertificate: "Calibration Certificate",
    pressureReadingPoint: "Pressure Reading Point",
    highestPoint: "Highest Point",
    nearPump: "Near Pump",
    otherPoint: "Other",
    specifyPoint: "Specify Point",
    execution: "EXECUTION",
    filling: "Filling",
    fillingMethod: "Filling Method",
    gradual: "Gradual",
    bySector: "By Sector",
    airElimination: "Air Elimination",
    reliefValvesOpen: "Relief valves open",
    purgersUsed: "Purgers used",
    pressure: "Pressure",
    workingPressure: "Working Pressure",
    testPressure: "Test Pressure",
    normativeCriteria: "Normative Criteria Applied",
    minimumTestTime: "Minimum Test Time",
    minutes: "Minutes",
    hours: "Hours",
    monitoring: "Monitoring",
    stabilizationStartTime: "Stabilization Start Time",
    testEndTime: "Test End Time",
    initialPressure: "Initial Pressure",
    finalPressure: "Final Pressure",
    pressureVariation: "Pressure Variation",
    results: "RESULTS",
    tightness: "Tightness",
    noLeaks: "No leaks found",
    noPressureDrop: "No pressure drop",
    noVisibleDeformation: "No visible deformation",
    occurrences: "Occurrences",
    leaksFound: "Leak(s) found",
    leaksDescription: "Leak(s) Description",
    pressureDropAboveAllowed: "Pressure drop above allowed",
    structuralFailure: "Structural failure",
    failureDescription: "Failure Description",
    photoEvidence: "PHOTO EVIDENCE",
    initialGaugePhotos: "Initial Photo - Gauge",
    initialGeneralPhotos: "Initial Photo - General View",
    duringTestPhotos: "Photos During Test (Optional)",
    finalGaugePhotos: "Final Photo - Gauge",
    finalGeneralPhotos: "Final Photo - General View",
    addPhoto: "Add Photo",
    required: "(Required)",
    optional: "(Optional)",
    conclusion: "TECHNICAL CONCLUSION",
    status: "Status",
    approved: "APPROVED",
    reproved: "REPROVED",
    technicalConclusion: "Technical Conclusion",
    declarationSignatures: "DECLARATION & SIGNATURES",
    declarationText: "I declare that all information provided in this report is true and that the test was conducted in accordance with applicable standards.",
    declarationAccepted: "I have read and accept the above declaration",
    technicalResponsibleSignature: "Technical Responsible Signature",
    inspectorSignature: "Inspector Signature",
    ownerRepSignature: "Owner Representative Signature (Optional)",
    date: "Date",
  };

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border },
  ];

  const toUpper = (v: string) => toUpperIfNotEmail(v, "text");

  const update = useCallback((updates: Partial<HydrostaticTest>) => {
    onHydrostaticTestChange({ ...hydrostaticTest, ...updates });
  }, [hydrostaticTest, onHydrostaticTestChange]);

  const SectionHeader = ({ title }: { title: string }) => (
    <View style={[styles.sectionHeader, { backgroundColor: fullTheme.colors.primary }]}>
      <ThemedText style={styles.sectionHeaderText}>{title}</ThemedText>
    </View>
  );

  const SubSectionHeader = ({ title }: { title: string }) => (
    <View style={[styles.subSectionHeader, { backgroundColor: fullTheme.colors.cardBackground, borderColor: fullTheme.colors.border }]}>
      <ThemedText type="h3" style={styles.subSectionTitle}>{title}</ThemedText>
    </View>
  );

  const RadioButton = ({ selected, onPress, label }: { selected: boolean; onPress: () => void; label: string }) => (
    <Pressable onPress={onPress} style={styles.radioRow}>
      <View style={[styles.radioOuter, { borderColor: selected ? fullTheme.colors.primary : fullTheme.colors.border }]}>
        {selected && <View style={[styles.radioInner, { backgroundColor: fullTheme.colors.primary }]} />}
      </View>
      <ThemedText style={styles.radioLabel}>{label}</ThemedText>
    </Pressable>
  );

  const Checkbox = ({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) => (
    <Pressable onPress={onToggle} style={styles.checkboxRow}>
      <View style={[styles.checkbox, { borderColor: checked ? fullTheme.colors.primary : fullTheme.colors.border, backgroundColor: checked ? fullTheme.colors.primary : 'transparent' }]}>
        {checked && <Feather name="check" size={14} color="#FFFFFF" />}
      </View>
      <ThemedText style={styles.checkboxLabel}>{label}</ThemedText>
    </Pressable>
  );

  const UnitToggle = ({ value, onChange, options }: { value: string; onChange: (v: any) => void; options: { value: string; label: string }[] }) => (
    <View style={styles.unitToggle}>
      {options.map((opt) => (
        <Pressable
          key={opt.value}
          onPress={() => onChange(opt.value)}
          style={[styles.unitButton, { backgroundColor: value === opt.value ? fullTheme.colors.primary : fullTheme.colors.cardBackground, borderColor: value === opt.value ? fullTheme.colors.primary : fullTheme.colors.border }]}
        >
          <ThemedText style={{ color: value === opt.value ? '#FFFFFF' : fullTheme.colors.textPrimary, fontSize: 12, fontWeight: '600' }}>{opt.label}</ThemedText>
        </Pressable>
      ))}
    </View>
  );

  const pickImage = async (category: string) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const newPhoto: InspectionPhoto = {
        id: `${category}_${Date.now()}`,
        uri: result.assets[0].uri,
        caption: category,
        timestamp: new Date().toISOString(),
      };
      onPhotosChange([...photos, newPhoto]);
      const photoIds = [...(hydrostaticTest.photoEvidence as any)[category] || [], newPhoto.id];
      update({ photoEvidence: { ...hydrostaticTest.photoEvidence, [category]: photoIds } });
    }
  };

  const takePhoto = async (category: string) => {
    // Request camera permission first
    const { status, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== "granted") {
      if (!canAskAgain && Platform.OS !== "web") {
        // Permission denied permanently - show alert to open settings
        Alert.alert(
          language === "pt-BR" ? "Permissao Necessaria" : "Permission Required",
          language === "pt-BR" 
            ? "A permissao de camera e necessaria para tirar fotos. Por favor, habilite nas configuracoes."
            : "Camera permission is required to take photos. Please enable it in settings.",
          [
            { text: language === "pt-BR" ? "Cancelar" : "Cancel", style: "cancel" },
            { 
              text: language === "pt-BR" ? "Abrir Configuracoes" : "Open Settings", 
              onPress: async () => {
                try {
                  await Linking.openSettings();
                } catch (error) {
                  // openSettings not supported on this platform
                }
              }
            }
          ]
        );
      }
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const newPhoto: InspectionPhoto = {
        id: `${category}_${Date.now()}`,
        uri: result.assets[0].uri,
        caption: category,
        timestamp: new Date().toISOString(),
      };
      onPhotosChange([...photos, newPhoto]);
      const photoIds = [...(hydrostaticTest.photoEvidence as any)[category] || [], newPhoto.id];
      update({ photoEvidence: { ...hydrostaticTest.photoEvidence, [category]: photoIds } });
    }
  };

  const removePhoto = (photoId: string, category: string) => {
    onPhotosChange(photos.filter(p => p.id !== photoId));
    const photoIds = ((hydrostaticTest.photoEvidence as any)[category] || []).filter((id: string) => id !== photoId);
    update({ photoEvidence: { ...hydrostaticTest.photoEvidence, [category]: photoIds } });
  };

  const PhotoSection = ({ title, category, required }: { title: string; category: string; required: boolean }) => {
    const categoryPhotos = photos.filter(p => ((hydrostaticTest.photoEvidence as any)[category] || []).includes(p.id));
    return (
      <View style={styles.photoSection}>
        <ThemedText type="body" style={{ fontWeight: '600' }}>{title} {required ? t.required : t.optional}</ThemedText>
        <Spacer height={Spacing.sm} />
        <View style={styles.photoGrid}>
          {categoryPhotos.map((photo) => (
            <View key={photo.id} style={styles.photoItem}>
              <Image source={{ uri: photo.uri }} style={styles.photoImage} contentFit="cover" />
              <Pressable onPress={() => removePhoto(photo.id, category)} style={styles.removePhotoBtn}>
                <Feather name="x" size={14} color="#FFFFFF" />
              </Pressable>
            </View>
          ))}
          <Pressable onPress={() => Platform.OS === 'web' ? pickImage(category) : takePhoto(category)} style={[styles.addPhotoBtn, { borderColor: fullTheme.colors.border }]}>
            <Feather name="camera" size={24} color={fullTheme.colors.primary} />
            <ThemedText type="small" style={{ color: fullTheme.colors.primary, marginTop: Spacing.xs }}>{t.addPhoto}</ThemedText>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SectionHeader title={t.testIdentification} />
      <View style={[styles.sectionContent, { borderColor: fullTheme.colors.border }]}>
        <ThemedText type="body" style={{ fontWeight: '600', marginBottom: Spacing.sm }}>{t.systemType} *</ThemedText>
        <View style={styles.radioGroup}>
          <RadioButton
            selected={hydrostaticTest.systemType === "hydrants"}
            onPress={() => update({ systemType: "hydrants" })}
            label={t.hydrants}
          />
          <RadioButton
            selected={hydrostaticTest.systemType === "sprinklers"}
            onPress={() => update({ systemType: "sprinklers" })}
            label={t.sprinklers}
          />
        </View>
        <Spacer height={Spacing.md} />

        <ThemedText type="small">{t.systemName}</ThemedText>
        <ControlledTextInput style={inputStyle} value={hydrostaticTest.systemName} onValueChange={(v) => update({ systemName: v })} transform={toUpper} placeholderTextColor={theme.placeholder} />
        <Spacer height={Spacing.md} />

        <ThemedText type="small">{t.buildingType}</ThemedText>
        <ControlledTextInput style={inputStyle} value={hydrostaticTest.buildingType} onValueChange={(v) => update({ buildingType: v })} transform={toUpper} placeholderTextColor={theme.placeholder} />
        <Spacer height={Spacing.md} />

        <ThemedText type="small">{t.protectedArea}</ThemedText>
        <ControlledTextInput style={inputStyle} value={hydrostaticTest.protectedArea} onValueChange={(v) => update({ protectedArea: v })} transform={toUpper} placeholderTextColor={theme.placeholder} />
        <Spacer height={Spacing.lg} />

        <ThemedText type="body" style={{ fontWeight: '600', marginBottom: Spacing.sm }}>{t.normativeReferences} *</ThemedText>
        <Checkbox checked={hydrostaticTest.normRefs.includes("NFPA_13")} onToggle={() => {
          const refs = hydrostaticTest.normRefs.includes("NFPA_13") ? hydrostaticTest.normRefs.filter(r => r !== "NFPA_13") : [...hydrostaticTest.normRefs, "NFPA_13"];
          update({ normRefs: refs as HydrostaticNormRef[] });
        }} label="NFPA 13" />
        <Checkbox checked={hydrostaticTest.normRefs.includes("NFPA_14")} onToggle={() => {
          const refs = hydrostaticTest.normRefs.includes("NFPA_14") ? hydrostaticTest.normRefs.filter(r => r !== "NFPA_14") : [...hydrostaticTest.normRefs, "NFPA_14"];
          update({ normRefs: refs as HydrostaticNormRef[] });
        }} label="NFPA 14" />
        <Checkbox checked={hydrostaticTest.normRefs.includes("NFPA_25")} onToggle={() => {
          const refs = hydrostaticTest.normRefs.includes("NFPA_25") ? hydrostaticTest.normRefs.filter(r => r !== "NFPA_25") : [...hydrostaticTest.normRefs, "NFPA_25"];
          update({ normRefs: refs as HydrostaticNormRef[] });
        }} label="NFPA 25" />
        <Checkbox checked={hydrostaticTest.normRefs.includes("FM_GLOBAL")} onToggle={() => {
          const refs = hydrostaticTest.normRefs.includes("FM_GLOBAL") ? hydrostaticTest.normRefs.filter(r => r !== "FM_GLOBAL") : [...hydrostaticTest.normRefs, "FM_GLOBAL"];
          update({ normRefs: refs as HydrostaticNormRef[] });
        }} label="FM Global" />
        {hydrostaticTest.normRefs.includes("FM_GLOBAL") && (
          <>
            <Spacer height={Spacing.sm} />
            <ThemedText type="small">{t.fmDataSheet}</ThemedText>
            <ControlledTextInput style={inputStyle} value={hydrostaticTest.fmDataSheet || ""} onValueChange={(v) => update({ fmDataSheet: v })} transform={toUpper} placeholderTextColor={theme.placeholder} />
          </>
        )}
        <Checkbox checked={hydrostaticTest.normRefs.includes("NBR")} onToggle={() => {
          const refs = hydrostaticTest.normRefs.includes("NBR") ? hydrostaticTest.normRefs.filter(r => r !== "NBR") : [...hydrostaticTest.normRefs, "NBR"];
          update({ normRefs: refs as HydrostaticNormRef[] });
        }} label="NBR" />
        {hydrostaticTest.normRefs.includes("NBR") && (
          <>
            <Spacer height={Spacing.sm} />
            <ThemedText type="small">{t.nbrStandard}</ThemedText>
            <ControlledTextInput style={inputStyle} value={hydrostaticTest.nbrStandard || ""} onValueChange={(v) => update({ nbrStandard: v })} transform={toUpper} placeholderTextColor={theme.placeholder} />
          </>
        )}
        <Spacer height={Spacing.lg} />

        <ThemedText type="body" style={{ fontWeight: '600', marginBottom: Spacing.sm }}>{t.approvedBy}</ThemedText>
        <View style={styles.radioGroup}>
          <RadioButton selected={hydrostaticTest.approvedBy === "CB"} onPress={() => update({ approvedBy: "CB" })} label={t.cb} />
          <RadioButton selected={hydrostaticTest.approvedBy === "FM"} onPress={() => update({ approvedBy: "FM" })} label={t.fm} />
          <RadioButton selected={hydrostaticTest.approvedBy === "OUTRO"} onPress={() => update({ approvedBy: "OUTRO" })} label={t.other} />
        </View>
        {hydrostaticTest.approvedBy === "OUTRO" && (
          <>
            <Spacer height={Spacing.sm} />
            <ThemedText type="small">{t.specifyOther}</ThemedText>
            <ControlledTextInput style={inputStyle} value={hydrostaticTest.approvedByOtherText || ""} onValueChange={(v) => update({ approvedByOtherText: v })} transform={toUpper} placeholderTextColor={theme.placeholder} />
          </>
        )}
        <Spacer height={Spacing.lg} />

        <View style={styles.row}>
          <View style={styles.thirdField}>
            <ThemedText type="small">{t.testDate} *</ThemedText>
            <DatePickerField value={hydrostaticTest.testDate} onChange={(v) => update({ testDate: v })} />
          </View>
          <View style={styles.thirdField}>
            <ThemedText type="small">{t.startTime} *</ThemedText>
            <TimePickerField value={hydrostaticTest.startTime} onChange={(v) => update({ startTime: v })} />
          </View>
          <View style={styles.thirdField}>
            <ThemedText type="small">{t.endTime} *</ThemedText>
            <TimePickerField value={hydrostaticTest.endTime} onChange={(v) => update({ endTime: v })} />
          </View>
        </View>
        <Spacer height={Spacing.md} />

        <ThemedText type="small">{t.weather}</ThemedText>
        <ControlledTextInput style={inputStyle} value={hydrostaticTest.weather || ""} onValueChange={(v) => update({ weather: v })} transform={toUpper} placeholderTextColor={theme.placeholder} />
      </View>

      <Spacer height={Spacing.lg} />
      <SectionHeader title={t.partiesInvolved} />
      <View style={[styles.sectionContent, { borderColor: fullTheme.colors.border }]}>
        <SubSectionHeader title={t.owner} />
        <View style={styles.subSectionContent}>
          <ThemedText type="small">{t.corporateName} *</ThemedText>
          <ControlledTextInput style={inputStyle} value={hydrostaticTest.owner.corporateName} onValueChange={(v) => update({ owner: { ...hydrostaticTest.owner, corporateName: v } })} transform={toUpper} placeholderTextColor={theme.placeholder} />
          <Spacer height={Spacing.md} />
          <ThemedText type="small">{t.address} *</ThemedText>
          <ControlledTextInput style={inputStyle} value={hydrostaticTest.owner.address} onValueChange={(v) => update({ owner: { ...hydrostaticTest.owner, address: v } })} transform={toUpper} placeholderTextColor={theme.placeholder} />
          <Spacer height={Spacing.md} />
          <View style={styles.row}>
            <View style={styles.halfField}>
              <ThemedText type="small">{t.localResponsible} *</ThemedText>
              <ControlledTextInput style={inputStyle} value={hydrostaticTest.owner.localResponsible} onValueChange={(v) => update({ owner: { ...hydrostaticTest.owner, localResponsible: v } })} transform={toUpper} placeholderTextColor={theme.placeholder} />
            </View>
            <View style={styles.halfField}>
              <ThemedText type="small">{t.role} *</ThemedText>
              <ControlledTextInput style={inputStyle} value={hydrostaticTest.owner.role} onValueChange={(v) => update({ owner: { ...hydrostaticTest.owner, role: v } })} transform={toUpper} placeholderTextColor={theme.placeholder} />
            </View>
          </View>
          <Spacer height={Spacing.md} />
          <ThemedText type="small">{t.contact} *</ThemedText>
          <TextInput style={inputStyle} value={hydrostaticTest.owner.contact} onChangeText={(v) => update({ owner: { ...hydrostaticTest.owner, contact: v } })} placeholderTextColor={theme.placeholder} keyboardType="phone-pad" />
        </View>

        <SubSectionHeader title={t.executorCompany} />
        <View style={styles.subSectionContent}>
          <ThemedText type="small">{t.corporateName} *</ThemedText>
          <ControlledTextInput style={inputStyle} value={hydrostaticTest.executorCompany.corporateName} onValueChange={(v) => update({ executorCompany: { ...hydrostaticTest.executorCompany, corporateName: v } })} transform={toUpper} placeholderTextColor={theme.placeholder} />
          <Spacer height={Spacing.md} />
          <View style={styles.row}>
            <View style={styles.halfField}>
              <ThemedText type="small">{t.cnpj} *</ThemedText>
              <TextInput style={inputStyle} value={hydrostaticTest.executorCompany.cnpj} onChangeText={(v) => update({ executorCompany: { ...hydrostaticTest.executorCompany, cnpj: v } })} placeholderTextColor={theme.placeholder} keyboardType="numeric" />
            </View>
            <View style={styles.halfField}>
              <ThemedText type="small">{t.address} *</ThemedText>
              <ControlledTextInput style={inputStyle} value={hydrostaticTest.executorCompany.address} onValueChange={(v) => update({ executorCompany: { ...hydrostaticTest.executorCompany, address: v } })} transform={toUpper} placeholderTextColor={theme.placeholder} />
            </View>
          </View>
        </View>

        <SubSectionHeader title={t.technicalResponsible} />
        <View style={styles.subSectionContent}>
          <View style={styles.row}>
            <View style={styles.halfField}>
              <ThemedText type="small">{t.name} *</ThemedText>
              <ControlledTextInput style={inputStyle} value={hydrostaticTest.executorCompany.technicalResponsible.name} onValueChange={(v) => update({ executorCompany: { ...hydrostaticTest.executorCompany, technicalResponsible: { ...hydrostaticTest.executorCompany.technicalResponsible, name: v } } })} transform={toUpper} placeholderTextColor={theme.placeholder} />
            </View>
            <View style={styles.halfField}>
              <ThemedText type="small">{t.creaCau} *</ThemedText>
              <ControlledTextInput style={inputStyle} value={hydrostaticTest.executorCompany.technicalResponsible.creaCau} onValueChange={(v) => update({ executorCompany: { ...hydrostaticTest.executorCompany, technicalResponsible: { ...hydrostaticTest.executorCompany.technicalResponsible, creaCau: v } } })} transform={toUpper} placeholderTextColor={theme.placeholder} />
            </View>
          </View>
          <Spacer height={Spacing.md} />
          <ThemedText type="small">{t.artRrt}</ThemedText>
          <ControlledTextInput style={inputStyle} value={hydrostaticTest.executorCompany.technicalResponsible.artRrt || ""} onValueChange={(v) => update({ executorCompany: { ...hydrostaticTest.executorCompany, technicalResponsible: { ...hydrostaticTest.executorCompany.technicalResponsible, artRrt: v } } })} transform={toUpper} placeholderTextColor={theme.placeholder} />
        </View>

        <SubSectionHeader title={t.inspector} />
        <View style={styles.subSectionContent}>
          <View style={styles.row}>
            <View style={styles.halfField}>
              <ThemedText type="small">{t.name} *</ThemedText>
              <ControlledTextInput style={inputStyle} value={hydrostaticTest.inspector.name} onValueChange={(v) => update({ inspector: { ...hydrostaticTest.inspector, name: v } })} transform={toUpper} placeholderTextColor={theme.placeholder} />
            </View>
            <View style={styles.halfField}>
              <ThemedText type="small">{t.role} *</ThemedText>
              <ControlledTextInput style={inputStyle} value={hydrostaticTest.inspector.role} onValueChange={(v) => update({ inspector: { ...hydrostaticTest.inspector, role: v } })} transform={toUpper} placeholderTextColor={theme.placeholder} />
            </View>
          </View>
        </View>
      </View>

      <Spacer height={Spacing.lg} />
      <SectionHeader title={t.preparation} />
      <View style={[styles.sectionContent, { borderColor: fullTheme.colors.border }]}>
        <SubSectionHeader title={t.preChecks} />
        <View style={styles.subSectionContent}>
          <Checkbox checked={hydrostaticTest.preChecks.installedAsApprovedProject} onToggle={() => update({ preChecks: { ...hydrostaticTest.preChecks, installedAsApprovedProject: !hydrostaticTest.preChecks.installedAsApprovedProject } })} label={t.installedAsApprovedProject} />
          <Checkbox checked={hydrostaticTest.preChecks.pipesAnchoredAndSupported} onToggle={() => update({ preChecks: { ...hydrostaticTest.preChecks, pipesAnchoredAndSupported: !hydrostaticTest.preChecks.pipesAnchoredAndSupported } })} label={t.pipesAnchoredAndSupported} />
          <Checkbox checked={hydrostaticTest.preChecks.valvesCorrectlyInstalled} onToggle={() => update({ preChecks: { ...hydrostaticTest.preChecks, valvesCorrectlyInstalled: !hydrostaticTest.preChecks.valvesCorrectlyInstalled } })} label={t.valvesCorrectlyInstalled} />
          <Checkbox checked={hydrostaticTest.preChecks.visibleConnectionsAccessible} onToggle={() => update({ preChecks: { ...hydrostaticTest.preChecks, visibleConnectionsAccessible: !hydrostaticTest.preChecks.visibleConnectionsAccessible } })} label={t.visibleConnectionsAccessible} />
          <Checkbox checked={hydrostaticTest.preChecks.untestedSectionsIsolated} onToggle={() => update({ preChecks: { ...hydrostaticTest.preChecks, untestedSectionsIsolated: !hydrostaticTest.preChecks.untestedSectionsIsolated } })} label={t.untestedSectionsIsolated} />
          <Checkbox checked={hydrostaticTest.preChecks.sensitiveEquipmentProtected} onToggle={() => update({ preChecks: { ...hydrostaticTest.preChecks, sensitiveEquipmentProtected: !hydrostaticTest.preChecks.sensitiveEquipmentProtected } })} label={t.sensitiveEquipmentProtected} />
        </View>

        <SubSectionHeader title={t.instrumentation} />
        <View style={styles.subSectionContent}>
          <View style={styles.row}>
            <View style={styles.halfField}>
              <ThemedText type="small">{t.manometerBrand}</ThemedText>
              <ControlledTextInput style={inputStyle} value={hydrostaticTest.instrumentation.manometerBrand} onValueChange={(v) => update({ instrumentation: { ...hydrostaticTest.instrumentation, manometerBrand: v } })} transform={toUpper} placeholderTextColor={theme.placeholder} />
            </View>
            <View style={styles.halfField}>
              <ThemedText type="small">{t.manometerModel}</ThemedText>
              <ControlledTextInput style={inputStyle} value={hydrostaticTest.instrumentation.manometerModel} onValueChange={(v) => update({ instrumentation: { ...hydrostaticTest.instrumentation, manometerModel: v } })} transform={toUpper} placeholderTextColor={theme.placeholder} />
            </View>
          </View>
          <Spacer height={Spacing.md} />
          <View style={styles.row}>
            <View style={styles.halfField}>
              <ThemedText type="small">{t.measurementRange}</ThemedText>
              <ControlledTextInput style={inputStyle} value={hydrostaticTest.instrumentation.measurementRange} onValueChange={(v) => update({ instrumentation: { ...hydrostaticTest.instrumentation, measurementRange: v } })} transform={toUpper} placeholder="0-25 bar" placeholderTextColor={theme.placeholder} />
            </View>
            <View style={styles.halfField}>
              <ThemedText type="small">{t.calibrationCertificate}</ThemedText>
              <ControlledTextInput style={inputStyle} value={hydrostaticTest.instrumentation.calibrationCertificate || ""} onValueChange={(v) => update({ instrumentation: { ...hydrostaticTest.instrumentation, calibrationCertificate: v } })} transform={toUpper} placeholderTextColor={theme.placeholder} />
            </View>
          </View>
          <Spacer height={Spacing.md} />
          <ThemedText type="body" style={{ fontWeight: '600', marginBottom: Spacing.sm }}>{t.pressureReadingPoint}</ThemedText>
          <View style={styles.radioGroup}>
            <RadioButton selected={hydrostaticTest.instrumentation.pressureReadingPoint === "HIGHEST_POINT"} onPress={() => update({ instrumentation: { ...hydrostaticTest.instrumentation, pressureReadingPoint: "HIGHEST_POINT" } })} label={t.highestPoint} />
            <RadioButton selected={hydrostaticTest.instrumentation.pressureReadingPoint === "NEAR_PUMP"} onPress={() => update({ instrumentation: { ...hydrostaticTest.instrumentation, pressureReadingPoint: "NEAR_PUMP" } })} label={t.nearPump} />
            <RadioButton selected={hydrostaticTest.instrumentation.pressureReadingPoint === "OTHER"} onPress={() => update({ instrumentation: { ...hydrostaticTest.instrumentation, pressureReadingPoint: "OTHER" } })} label={t.otherPoint} />
          </View>
          {hydrostaticTest.instrumentation.pressureReadingPoint === "OTHER" && (
            <>
              <Spacer height={Spacing.sm} />
              <ThemedText type="small">{t.specifyPoint}</ThemedText>
              <ControlledTextInput style={inputStyle} value={hydrostaticTest.instrumentation.pressureReadingPointOther || ""} onValueChange={(v) => update({ instrumentation: { ...hydrostaticTest.instrumentation, pressureReadingPointOther: v } })} transform={toUpper} placeholderTextColor={theme.placeholder} />
            </>
          )}
        </View>
      </View>

      <Spacer height={Spacing.lg} />
      <SectionHeader title={t.execution} />
      <View style={[styles.sectionContent, { borderColor: fullTheme.colors.border }]}>
        <SubSectionHeader title={t.filling} />
        <View style={styles.subSectionContent}>
          <ThemedText type="body" style={{ fontWeight: '600', marginBottom: Spacing.sm }}>{t.fillingMethod}</ThemedText>
          <View style={styles.radioGroup}>
            <RadioButton selected={hydrostaticTest.filling.method === "GRADUAL"} onPress={() => update({ filling: { ...hydrostaticTest.filling, method: "GRADUAL" } })} label={t.gradual} />
            <RadioButton selected={hydrostaticTest.filling.method === "BY_SECTOR"} onPress={() => update({ filling: { ...hydrostaticTest.filling, method: "BY_SECTOR" } })} label={t.bySector} />
          </View>
          <Spacer height={Spacing.md} />
          <ThemedText type="body" style={{ fontWeight: '600', marginBottom: Spacing.sm }}>{t.airElimination}</ThemedText>
          <Checkbox checked={hydrostaticTest.filling.airElimination.reliefValvesOpen} onToggle={() => update({ filling: { ...hydrostaticTest.filling, airElimination: { ...hydrostaticTest.filling.airElimination, reliefValvesOpen: !hydrostaticTest.filling.airElimination.reliefValvesOpen } } })} label={t.reliefValvesOpen} />
          <Checkbox checked={hydrostaticTest.filling.airElimination.purgersUsed} onToggle={() => update({ filling: { ...hydrostaticTest.filling, airElimination: { ...hydrostaticTest.filling.airElimination, purgersUsed: !hydrostaticTest.filling.airElimination.purgersUsed } } })} label={t.purgersUsed} />
        </View>

        <SubSectionHeader title={t.pressure} />
        <View style={styles.subSectionContent}>
          <View style={styles.row}>
            <View style={styles.halfField}>
              <ThemedText type="small">{t.workingPressure}</ThemedText>
              <View style={styles.inputWithUnit}>
                <TextInput style={[inputStyle, { flex: 1 }]} value={hydrostaticTest.pressure.workingPressureValue} onChangeText={(v) => update({ pressure: { ...hydrostaticTest.pressure, workingPressureValue: v } })} keyboardType="decimal-pad" placeholderTextColor={theme.placeholder} />
                <UnitToggle value={hydrostaticTest.pressure.workingPressureUnit} onChange={(v: PressureUnit) => update({ pressure: { ...hydrostaticTest.pressure, workingPressureUnit: v } })} options={[{ value: "bar", label: "bar" }, { value: "psi", label: "psi" }]} />
              </View>
            </View>
            <View style={styles.halfField}>
              <ThemedText type="small">{t.testPressure}</ThemedText>
              <View style={styles.inputWithUnit}>
                <TextInput style={[inputStyle, { flex: 1 }]} value={hydrostaticTest.pressure.testPressureValue} onChangeText={(v) => update({ pressure: { ...hydrostaticTest.pressure, testPressureValue: v } })} keyboardType="decimal-pad" placeholderTextColor={theme.placeholder} />
                <UnitToggle value={hydrostaticTest.pressure.testPressureUnit} onChange={(v: PressureUnit) => update({ pressure: { ...hydrostaticTest.pressure, testPressureUnit: v } })} options={[{ value: "bar", label: "bar" }, { value: "psi", label: "psi" }]} />
              </View>
            </View>
          </View>
          <Spacer height={Spacing.md} />
          <ThemedText type="small">{t.normativeCriteria}</ThemedText>
          <ControlledTextInput style={[inputStyle, styles.textArea]} value={hydrostaticTest.pressure.normativeCriteriaText || ""} onValueChange={(v) => update({ pressure: { ...hydrostaticTest.pressure, normativeCriteriaText: v } })} transform={toUpper} multiline placeholderTextColor={theme.placeholder} />
          <Spacer height={Spacing.md} />
          <ThemedText type="small">{t.minimumTestTime}</ThemedText>
          <View style={styles.inputWithUnit}>
            <TextInput style={[inputStyle, { flex: 1 }]} value={hydrostaticTest.pressure.minimumTestTimeValue} onChangeText={(v) => update({ pressure: { ...hydrostaticTest.pressure, minimumTestTimeValue: v } })} keyboardType="numeric" placeholderTextColor={theme.placeholder} />
            <UnitToggle value={hydrostaticTest.pressure.minimumTestTimeUnit} onChange={(v: TimeUnit) => update({ pressure: { ...hydrostaticTest.pressure, minimumTestTimeUnit: v } })} options={[{ value: "minutes", label: t.minutes }, { value: "hours", label: t.hours }]} />
          </View>
        </View>

        <SubSectionHeader title={t.monitoring} />
        <View style={styles.subSectionContent}>
          <View style={styles.row}>
            <View style={styles.halfField}>
              <ThemedText type="small">{t.stabilizationStartTime}</ThemedText>
              <TimePickerField value={hydrostaticTest.monitoring.stabilizationStartTime} onChange={(v) => update({ monitoring: { ...hydrostaticTest.monitoring, stabilizationStartTime: v } })} />
            </View>
            <View style={styles.halfField}>
              <ThemedText type="small">{t.testEndTime}</ThemedText>
              <TimePickerField value={hydrostaticTest.monitoring.testEndTime} onChange={(v) => update({ monitoring: { ...hydrostaticTest.monitoring, testEndTime: v } })} />
            </View>
          </View>
          <Spacer height={Spacing.md} />
          <View style={styles.row}>
            <View style={styles.halfField}>
              <ThemedText type="small">{t.initialPressure}</ThemedText>
              <View style={styles.inputWithUnit}>
                <TextInput style={[inputStyle, { flex: 1 }]} value={hydrostaticTest.monitoring.initialPressureValue} onChangeText={(v) => update({ monitoring: { ...hydrostaticTest.monitoring, initialPressureValue: v } })} keyboardType="decimal-pad" placeholderTextColor={theme.placeholder} />
                <UnitToggle value={hydrostaticTest.monitoring.initialPressureUnit} onChange={(v: PressureUnit) => update({ monitoring: { ...hydrostaticTest.monitoring, initialPressureUnit: v } })} options={[{ value: "bar", label: "bar" }, { value: "psi", label: "psi" }]} />
              </View>
            </View>
            <View style={styles.halfField}>
              <ThemedText type="small">{t.finalPressure}</ThemedText>
              <View style={styles.inputWithUnit}>
                <TextInput style={[inputStyle, { flex: 1 }]} value={hydrostaticTest.monitoring.finalPressureValue} onChangeText={(v) => update({ monitoring: { ...hydrostaticTest.monitoring, finalPressureValue: v } })} keyboardType="decimal-pad" placeholderTextColor={theme.placeholder} />
                <UnitToggle value={hydrostaticTest.monitoring.finalPressureUnit} onChange={(v: PressureUnit) => update({ monitoring: { ...hydrostaticTest.monitoring, finalPressureUnit: v } })} options={[{ value: "bar", label: "bar" }, { value: "psi", label: "psi" }]} />
              </View>
            </View>
          </View>
          <Spacer height={Spacing.md} />
          <ThemedText type="small">{t.pressureVariation}</ThemedText>
          <View style={styles.inputWithUnit}>
            <TextInput style={[inputStyle, { flex: 1 }]} value={hydrostaticTest.monitoring.pressureVariationValue} onChangeText={(v) => update({ monitoring: { ...hydrostaticTest.monitoring, pressureVariationValue: v } })} keyboardType="decimal-pad" placeholderTextColor={theme.placeholder} />
            <UnitToggle value={hydrostaticTest.monitoring.pressureVariationUnit} onChange={(v: PressureUnit) => update({ monitoring: { ...hydrostaticTest.monitoring, pressureVariationUnit: v } })} options={[{ value: "bar", label: "bar" }, { value: "psi", label: "psi" }]} />
          </View>
        </View>
      </View>

      <Spacer height={Spacing.lg} />
      <SectionHeader title={t.results} />
      <View style={[styles.sectionContent, { borderColor: fullTheme.colors.border }]}>
        <SubSectionHeader title={t.tightness} />
        <View style={styles.subSectionContent}>
          <Checkbox checked={hydrostaticTest.results.noLeaks} onToggle={() => update({ results: { ...hydrostaticTest.results, noLeaks: !hydrostaticTest.results.noLeaks } })} label={t.noLeaks} />
          <Checkbox checked={hydrostaticTest.results.noPressureDrop} onToggle={() => update({ results: { ...hydrostaticTest.results, noPressureDrop: !hydrostaticTest.results.noPressureDrop } })} label={t.noPressureDrop} />
          <Checkbox checked={hydrostaticTest.results.noVisibleDeformation} onToggle={() => update({ results: { ...hydrostaticTest.results, noVisibleDeformation: !hydrostaticTest.results.noVisibleDeformation } })} label={t.noVisibleDeformation} />
        </View>

        <SubSectionHeader title={t.occurrences} />
        <View style={styles.subSectionContent}>
          <Checkbox checked={hydrostaticTest.results.leaksFound} onToggle={() => update({ results: { ...hydrostaticTest.results, leaksFound: !hydrostaticTest.results.leaksFound } })} label={t.leaksFound} />
          {hydrostaticTest.results.leaksFound && (
            <>
              <Spacer height={Spacing.sm} />
              <ThemedText type="small">{t.leaksDescription}</ThemedText>
              <ControlledTextInput style={[inputStyle, styles.textArea]} value={hydrostaticTest.results.leaksDescription || ""} onValueChange={(v) => update({ results: { ...hydrostaticTest.results, leaksDescription: v } })} transform={toUpper} multiline placeholderTextColor={theme.placeholder} />
            </>
          )}
          <Checkbox checked={hydrostaticTest.results.pressureDropAboveAllowed} onToggle={() => update({ results: { ...hydrostaticTest.results, pressureDropAboveAllowed: !hydrostaticTest.results.pressureDropAboveAllowed } })} label={t.pressureDropAboveAllowed} />
          <Checkbox checked={hydrostaticTest.results.structuralFailure} onToggle={() => update({ results: { ...hydrostaticTest.results, structuralFailure: !hydrostaticTest.results.structuralFailure } })} label={t.structuralFailure} />
          {hydrostaticTest.results.structuralFailure && (
            <>
              <Spacer height={Spacing.sm} />
              <ThemedText type="small">{t.failureDescription}</ThemedText>
              <ControlledTextInput style={[inputStyle, styles.textArea]} value={hydrostaticTest.results.failureDescription || ""} onValueChange={(v) => update({ results: { ...hydrostaticTest.results, failureDescription: v } })} transform={toUpper} multiline placeholderTextColor={theme.placeholder} />
            </>
          )}
        </View>
      </View>

      <Spacer height={Spacing.lg} />
      <SectionHeader title={t.photoEvidence} />
      <View style={[styles.sectionContent, { borderColor: fullTheme.colors.border }]}>
        <PhotoSection title={t.initialGaugePhotos} category="initialGaugePhotoIds" required={true} />
        <Spacer height={Spacing.md} />
        <PhotoSection title={t.initialGeneralPhotos} category="initialGeneralPhotoIds" required={true} />
        <Spacer height={Spacing.md} />
        <PhotoSection title={t.duringTestPhotos} category="duringTestPhotoIds" required={false} />
        <Spacer height={Spacing.md} />
        <PhotoSection title={t.finalGaugePhotos} category="finalGaugePhotoIds" required={true} />
        <Spacer height={Spacing.md} />
        <PhotoSection title={t.finalGeneralPhotos} category="finalGeneralPhotoIds" required={true} />
      </View>

      <Spacer height={Spacing.lg} />
      <SectionHeader title={t.conclusion} />
      <View style={[styles.sectionContent, { borderColor: fullTheme.colors.border }]}>
        <ThemedText type="body" style={{ fontWeight: '600', marginBottom: Spacing.sm }}>{t.status} *</ThemedText>
        <View style={styles.radioGroup}>
          <RadioButton selected={hydrostaticTest.conclusion.status === "APPROVED"} onPress={() => update({ conclusion: { ...hydrostaticTest.conclusion, status: "APPROVED" } })} label={t.approved} />
          <RadioButton selected={hydrostaticTest.conclusion.status === "REPROVED"} onPress={() => update({ conclusion: { ...hydrostaticTest.conclusion, status: "REPROVED" } })} label={t.reproved} />
        </View>
        <Spacer height={Spacing.md} />
        <ThemedText type="small">{t.technicalConclusion} *</ThemedText>
        <ControlledTextInput style={[inputStyle, styles.largeTextArea]} value={hydrostaticTest.conclusion.technicalConclusionText || ""} onValueChange={(v) => update({ conclusion: { ...hydrostaticTest.conclusion, technicalConclusionText: v } })} transform={toUpper} multiline numberOfLines={6} textAlignVertical="top" placeholderTextColor={theme.placeholder} />
      </View>

      <Spacer height={Spacing.lg} />
      <SectionHeader title={t.declarationSignatures} />
      <View style={[styles.sectionContent, { borderColor: fullTheme.colors.border }]}>
        <ThemedText type="body" style={{ marginBottom: Spacing.md }}>{t.declarationText}</ThemedText>
        <Checkbox checked={hydrostaticTest.declarationAccepted} onToggle={() => update({ declarationAccepted: !hydrostaticTest.declarationAccepted })} label={t.declarationAccepted + " *"} />
        <Spacer height={Spacing.lg} />

        <SubSectionHeader title={t.technicalResponsibleSignature} />
        <View style={styles.subSectionContent}>
          <SignatureCapture
            signature={hydrostaticTest.signatures.technicalResponsibleSignatureId || ""}
            onSignatureChange={(sig) => update({ signatures: { ...hydrostaticTest.signatures, technicalResponsibleSignatureId: sig || "" } })}
          />
          <Spacer height={Spacing.sm} />
          <ThemedText type="small">{t.date}</ThemedText>
          <DatePickerField value={hydrostaticTest.signatures.dates.technicalResponsibleDate || ""} onChange={(v) => update({ signatures: { ...hydrostaticTest.signatures, dates: { ...hydrostaticTest.signatures.dates, technicalResponsibleDate: v } } })} />
        </View>

        <SubSectionHeader title={t.inspectorSignature} />
        <View style={styles.subSectionContent}>
          <SignatureCapture
            signature={hydrostaticTest.signatures.inspectorSignatureId || ""}
            onSignatureChange={(sig) => update({ signatures: { ...hydrostaticTest.signatures, inspectorSignatureId: sig || "" } })}
          />
          <Spacer height={Spacing.sm} />
          <ThemedText type="small">{t.date}</ThemedText>
          <DatePickerField value={hydrostaticTest.signatures.dates.inspectorDate || ""} onChange={(v) => update({ signatures: { ...hydrostaticTest.signatures, dates: { ...hydrostaticTest.signatures.dates, inspectorDate: v } } })} />
        </View>

        <SubSectionHeader title={t.ownerRepSignature} />
        <View style={styles.subSectionContent}>
          <SignatureCapture
            signature={hydrostaticTest.signatures.ownerRepSignatureId || ""}
            onSignatureChange={(sig) => update({ signatures: { ...hydrostaticTest.signatures, ownerRepSignatureId: sig || "" } })}
          />
          <Spacer height={Spacing.sm} />
          <ThemedText type="small">{t.date}</ThemedText>
          <DatePickerField value={hydrostaticTest.signatures.dates.ownerRepDate || ""} onChange={(v) => update({ signatures: { ...hydrostaticTest.signatures, dates: { ...hydrostaticTest.signatures.dates, ownerRepDate: v } } })} />
        </View>
      </View>

      <Spacer height={Spacing["4xl"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  sectionHeaderText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  sectionContent: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: BorderRadius.md,
    borderBottomRightRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  subSectionHeader: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  subSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  subSectionContent: {
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 16,
    marginTop: Spacing.xs,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  largeTextArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfField: {
    flex: 1,
  },
  thirdField: {
    flex: 1,
  },
  radioGroup: {
    gap: Spacing.sm,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  radioLabel: {
    fontSize: 15,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  checkboxLabel: {
    fontSize: 15,
    flex: 1,
  },
  inputWithUnit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  unitToggle: {
    flexDirection: 'row',
  },
  unitButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
  },
  photoSection: {
    marginTop: Spacing.sm,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  photoItem: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoBtn: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
