import React, { useState } from "react";
import { View, StyleSheet, TextInput, Alert, Switch } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { SelectPicker } from "@/components/SelectPicker";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  useInspections, 
  FirePumpControlPanel,
  StartingMethodType,
  NEMARating,
} from "@/contexts/InspectionContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { PropertiesStackParamList } from "@/navigation/PropertiesStackNavigator";
import { toUpperIfNotEmail } from "@/utils/textTransform";

type FirePumpPanelFormScreenProps = NativeStackScreenProps<PropertiesStackParamList, "FirePumpPanelForm">;

export default function FirePumpPanelFormScreen({ navigation, route }: FirePumpPanelFormScreenProps) {
  const { pumpId, panelId } = route.params || {};
  const { fullTheme, theme } = useTheme();
  const { t } = useLanguage();
  const { 
    firePumpPanels, 
    addFirePumpPanel, 
    updateFirePumpPanel,
    deleteFirePumpPanel,
  } = useInspections();

  const existingPanel = panelId ? firePumpPanels.find((p) => p.id === panelId) : undefined;

  const [tag, setTag] = useState(existingPanel?.tag || "");
  const [manufacturer, setManufacturer] = useState(existingPanel?.manufacturer || "");
  const [model, setModel] = useState(existingPanel?.model || "");
  const [serialNumber, setSerialNumber] = useState(existingPanel?.serialNumber || "");
  const [supplyVoltage, setSupplyVoltage] = useState(existingPanel?.supplyVoltage || "");
  const [startingType, setStartingType] = useState<StartingMethodType | undefined>(existingPanel?.startingType);
  const [hasAutomaticTransfer, setHasAutomaticTransfer] = useState(existingPanel?.hasAutomaticTransfer || false);
  const [listedApprovedBy, setListedApprovedBy] = useState(existingPanel?.listedApprovedBy || "");
  const [nemaRating, setNemaRating] = useState<NEMARating | undefined>(existingPanel?.nemaRating);
  const [mainBreakerRating, setMainBreakerRating] = useState(existingPanel?.mainBreakerRating || "");
  const [controlVoltage, setControlVoltage] = useState(existingPanel?.controlVoltage || "");
  const [hasPressureMaintenance, setHasPressureMaintenance] = useState(existingPanel?.hasPressureMaintenance || false);
  const [hasSequentialStart, setHasSequentialStart] = useState(existingPanel?.hasSequentialStart || false);
  const [hasAlarmRelay, setHasAlarmRelay] = useState(existingPanel?.hasAlarmRelay || false);
  const [hasRemoteStart, setHasRemoteStart] = useState(existingPanel?.hasRemoteStart || false);
  const [hasEmergencyRun, setHasEmergencyRun] = useState(existingPanel?.hasEmergencyRun || false);
  const [hasPhaseReversalProtection, setHasPhaseReversalProtection] = useState(existingPanel?.hasPhaseReversalProtection || false);
  const [hasGroundFaultProtection, setHasGroundFaultProtection] = useState(existingPanel?.hasGroundFaultProtection || false);
  const [undervoltageSettings, setUndervoltageSettings] = useState(existingPanel?.undervoltageSettings || "");
  const [overvoltageSettings, setOvervoltageSettings] = useState(existingPanel?.overvoltageSettings || "");
  const [comments, setComments] = useState(existingPanel?.comments || "");

  const startingTypeOptions = [
    { id: "across_the_line", label: t.firePumps.startingTypes.acrossTheLine },
    { id: "reduced_voltage", label: t.firePumps.startingTypes.reducedVoltage },
    { id: "soft_starter", label: t.firePumps.startingTypes.softStarter },
    { id: "vfd", label: t.firePumps.startingTypes.vfd },
    { id: "wye_delta", label: t.firePumps.startingTypes.wyeDelta },
    { id: "part_winding", label: t.firePumps.startingTypes.partWinding },
  ];

  const nemaRatingOptions = [
    { id: "1", label: t.firePumps.nemaRatings["1"] },
    { id: "3r", label: t.firePumps.nemaRatings["3r"] },
    { id: "4", label: t.firePumps.nemaRatings["4"] },
    { id: "4x", label: t.firePumps.nemaRatings["4x"] },
    { id: "12", label: t.firePumps.nemaRatings["12"] },
  ];

  const handleSubmit = async () => {
    if (!tag.trim()) {
      Alert.alert(t.common.error, t.form.required);
      return;
    }

    const panelData: FirePumpControlPanel = {
      id: existingPanel?.id || Date.now().toString(),
      pumpId: existingPanel?.pumpId || pumpId || "",
      tag,
      manufacturer: manufacturer || undefined,
      model: model || undefined,
      serialNumber: serialNumber || undefined,
      supplyVoltage: supplyVoltage || undefined,
      startingType: startingType || undefined,
      hasAutomaticTransfer,
      listedApprovedBy: listedApprovedBy || undefined,
      nemaRating: nemaRating || undefined,
      mainBreakerRating: mainBreakerRating || undefined,
      controlVoltage: controlVoltage || undefined,
      hasPressureMaintenance,
      hasSequentialStart,
      hasAlarmRelay,
      hasRemoteStart,
      hasEmergencyRun,
      hasPhaseReversalProtection,
      hasGroundFaultProtection,
      undervoltageSettings: undervoltageSettings || undefined,
      overvoltageSettings: overvoltageSettings || undefined,
      comments: comments || undefined,
      createdAt: existingPanel?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (existingPanel) {
        await updateFirePumpPanel(existingPanel.id, panelData);
      } else {
        await addFirePumpPanel(panelData);
      }
      navigation.goBack();
    } catch (error) {
      console.error("Error saving panel:", error);
      Alert.alert(t.common.error, t.report.shareError);
    }
  };

  const handleDeletePanel = () => {
    Alert.alert(
      t.common.delete,
      t.firePumps.deletePanelConfirmation,
      [
        { text: t.common.cancel, style: "cancel" },
        {
          text: t.common.delete,
          style: "destructive",
          onPress: async () => {
            try {
              await deleteFirePumpPanel(existingPanel!.id);
              navigation.goBack();
            } catch (error) {
              console.error("Error deleting panel:", error);
            }
          },
        },
      ]
    );
  };

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border },
  ];

  return (
    <ScreenKeyboardAwareScrollView>
      <ThemedText type="h3" style={{ marginBottom: Spacing.lg }}>
        {t.firePumps.panelInfo}
      </ThemedText>

      <ThemedText type="body">{t.firePumps.panelTag} *</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={tag}
        onChangeText={(text) => setTag(toUpperIfNotEmail(text, "tag"))}
        placeholder="QPC-01"
        placeholderTextColor={theme.placeholder}
        autoCapitalize="characters"
      />

      <Spacer height={Spacing.lg} />

      <ThemedText type="body">{t.firePumps.manufacturer}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={manufacturer}
        onChangeText={(text) => setManufacturer(toUpperIfNotEmail(text, "manufacturer"))}
        placeholder="FIRETROL, TORNATECH, etc."
        placeholderTextColor={theme.placeholder}
        autoCapitalize="characters"
      />

      <Spacer height={Spacing.lg} />

      <View style={styles.row}>
        <View style={styles.halfField}>
          <ThemedText type="body">{t.firePumps.model}</ThemedText>
          <Spacer height={Spacing.sm} />
          <TextInput
            style={inputStyle}
            value={model}
            onChangeText={(text) => setModel(toUpperIfNotEmail(text, "model"))}
            placeholder="FTA1100-JY100"
            placeholderTextColor={theme.placeholder}
            autoCapitalize="characters"
          />
        </View>
        <Spacer width={Spacing.md} />
        <View style={styles.halfField}>
          <ThemedText type="body">{t.firePumps.serialNumber}</ThemedText>
          <Spacer height={Spacing.sm} />
          <TextInput
            style={inputStyle}
            value={serialNumber}
            onChangeText={(text) => setSerialNumber(toUpperIfNotEmail(text, "serialNumber"))}
            placeholder="SN-87654321"
            placeholderTextColor={theme.placeholder}
            autoCapitalize="characters"
          />
        </View>
      </View>

      <Spacer height={Spacing.lg} />

      <ThemedText type="body">{t.firePumps.listedApprovedBy}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={listedApprovedBy}
        onChangeText={(text) => setListedApprovedBy(toUpperIfNotEmail(text, "listedApprovedBy"))}
        placeholder="UL, FM, ETL"
        placeholderTextColor={theme.placeholder}
        autoCapitalize="characters"
      />

      <Spacer height={Spacing.lg} />

      <ThemedText type="body">{t.firePumps.nemaRating}</ThemedText>
      <Spacer height={Spacing.sm} />
      <SelectPicker
        options={nemaRatingOptions}
        selectedId={nemaRating || ""}
        onSelect={(id) => setNemaRating(id as NEMARating)}
        placeholder={t.firePumps.nemaRating}
        title={t.firePumps.nemaRating}
      />

      <Spacer height={Spacing.lg} />

      <View style={styles.row}>
        <View style={styles.halfField}>
          <ThemedText type="body">{t.firePumps.supplyVoltage}</ThemedText>
          <Spacer height={Spacing.sm} />
          <TextInput
            style={inputStyle}
            value={supplyVoltage}
            onChangeText={setSupplyVoltage}
            placeholder="480V / 3F / 60Hz"
            placeholderTextColor={theme.placeholder}
          />
        </View>
        <Spacer width={Spacing.md} />
        <View style={styles.halfField}>
          <ThemedText type="body">{t.firePumps.controlVoltage}</ThemedText>
          <Spacer height={Spacing.sm} />
          <TextInput
            style={inputStyle}
            value={controlVoltage}
            onChangeText={setControlVoltage}
            placeholder="120"
            placeholderTextColor={theme.placeholder}
            keyboardType="numeric"
          />
        </View>
      </View>

      <Spacer height={Spacing.lg} />

      <ThemedText type="body">{t.firePumps.mainBreakerRating}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={mainBreakerRating}
        onChangeText={setMainBreakerRating}
        placeholder="200"
        placeholderTextColor={theme.placeholder}
        keyboardType="numeric"
      />

      <Spacer height={Spacing.lg} />

      <ThemedText type="body">{t.firePumps.startingType}</ThemedText>
      <Spacer height={Spacing.sm} />
      <SelectPicker
        options={startingTypeOptions}
        selectedId={startingType || ""}
        onSelect={(id) => setStartingType(id as StartingMethodType)}
        placeholder={t.firePumps.startingType}
        title={t.firePumps.startingType}
      />

      <Spacer height={Spacing.lg} />

      <View style={styles.row}>
        <View style={styles.halfField}>
          <ThemedText type="body">{t.firePumps.undervoltageSettings}</ThemedText>
          <Spacer height={Spacing.sm} />
          <TextInput
            style={inputStyle}
            value={undervoltageSettings}
            onChangeText={setUndervoltageSettings}
            placeholder="85%"
            placeholderTextColor={theme.placeholder}
          />
        </View>
        <Spacer width={Spacing.md} />
        <View style={styles.halfField}>
          <ThemedText type="body">{t.firePumps.overvoltageSettings}</ThemedText>
          <Spacer height={Spacing.sm} />
          <TextInput
            style={inputStyle}
            value={overvoltageSettings}
            onChangeText={setOvervoltageSettings}
            placeholder="110%"
            placeholderTextColor={theme.placeholder}
          />
        </View>
      </View>

      <Spacer height={Spacing["3xl"]} />

      <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
        {t.firePumps.panelInfo}
      </ThemedText>

      <View style={styles.switchRow}>
        <ThemedText type="body">{t.firePumps.hasAutomaticTransfer}</ThemedText>
        <Switch
          value={hasAutomaticTransfer}
          onValueChange={setHasAutomaticTransfer}
          trackColor={{ false: fullTheme.colors.border, true: fullTheme.colors.primary }}
          thumbColor="#FFFFFF"
        />
      </View>

      <Spacer height={Spacing.md} />

      <View style={styles.switchRow}>
        <ThemedText type="body">{t.firePumps.hasPressureMaintenance}</ThemedText>
        <Switch
          value={hasPressureMaintenance}
          onValueChange={setHasPressureMaintenance}
          trackColor={{ false: fullTheme.colors.border, true: fullTheme.colors.primary }}
          thumbColor="#FFFFFF"
        />
      </View>

      <Spacer height={Spacing.md} />

      <View style={styles.switchRow}>
        <ThemedText type="body">{t.firePumps.hasSequentialStart}</ThemedText>
        <Switch
          value={hasSequentialStart}
          onValueChange={setHasSequentialStart}
          trackColor={{ false: fullTheme.colors.border, true: fullTheme.colors.primary }}
          thumbColor="#FFFFFF"
        />
      </View>

      <Spacer height={Spacing.md} />

      <View style={styles.switchRow}>
        <ThemedText type="body">{t.firePumps.hasAlarmRelay}</ThemedText>
        <Switch
          value={hasAlarmRelay}
          onValueChange={setHasAlarmRelay}
          trackColor={{ false: fullTheme.colors.border, true: fullTheme.colors.primary }}
          thumbColor="#FFFFFF"
        />
      </View>

      <Spacer height={Spacing.md} />

      <View style={styles.switchRow}>
        <ThemedText type="body">{t.firePumps.hasRemoteStart}</ThemedText>
        <Switch
          value={hasRemoteStart}
          onValueChange={setHasRemoteStart}
          trackColor={{ false: fullTheme.colors.border, true: fullTheme.colors.primary }}
          thumbColor="#FFFFFF"
        />
      </View>

      <Spacer height={Spacing.md} />

      <View style={styles.switchRow}>
        <ThemedText type="body">{t.firePumps.hasEmergencyRun}</ThemedText>
        <Switch
          value={hasEmergencyRun}
          onValueChange={setHasEmergencyRun}
          trackColor={{ false: fullTheme.colors.border, true: fullTheme.colors.primary }}
          thumbColor="#FFFFFF"
        />
      </View>

      <Spacer height={Spacing.md} />

      <View style={styles.switchRow}>
        <ThemedText type="body">{t.firePumps.hasPhaseReversalProtection}</ThemedText>
        <Switch
          value={hasPhaseReversalProtection}
          onValueChange={setHasPhaseReversalProtection}
          trackColor={{ false: fullTheme.colors.border, true: fullTheme.colors.primary }}
          thumbColor="#FFFFFF"
        />
      </View>

      <Spacer height={Spacing.md} />

      <View style={styles.switchRow}>
        <ThemedText type="body">{t.firePumps.hasGroundFaultProtection}</ThemedText>
        <Switch
          value={hasGroundFaultProtection}
          onValueChange={setHasGroundFaultProtection}
          trackColor={{ false: fullTheme.colors.border, true: fullTheme.colors.primary }}
          thumbColor="#FFFFFF"
        />
      </View>

      <Spacer height={Spacing.lg} />

      <ThemedText type="body">{t.firePumps.comments}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={[inputStyle, styles.textArea]}
        value={comments}
        onChangeText={setComments}
        placeholder={t.firePumps.comments}
        placeholderTextColor={theme.placeholder}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      <Spacer height={Spacing["3xl"]} />

      <Button onPress={handleSubmit}>{t.form.save}</Button>

      {existingPanel ? (
        <>
          <Spacer height={Spacing.lg} />
          <Button variant="outline" onPress={handleDeletePanel}>
            {t.common.delete}
          </Button>
        </>
      ) : null}

      <Spacer height={Spacing["4xl"]} />
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
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
    paddingBottom: Spacing.md,
  },
  row: {
    flexDirection: "row",
  },
  halfField: {
    flex: 1,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
