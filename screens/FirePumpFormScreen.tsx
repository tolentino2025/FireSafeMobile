import React, { useState } from "react";
import { View, StyleSheet, TextInput, Alert, Pressable, Platform, Switch } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { SelectPicker } from "@/components/SelectPicker";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  useInspections, 
  FirePump, 
  FirePumpControlPanel, 
  PumpType,
  PumpOrientation,
  EnclosureType,
  InsulationClass,
  FuelType,
  GovernorType,
} from "@/contexts/InspectionContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { PropertiesStackParamList } from "@/navigation/PropertiesStackNavigator";
import { toUpperIfNotEmail } from "@/utils/textTransform";

type FirePumpFormScreenProps = NativeStackScreenProps<PropertiesStackParamList, "FirePumpForm">;

function PanelCard({
  panel,
  onPress,
  onDelete,
}: {
  panel: FirePumpControlPanel;
  onPress: () => void;
  onDelete: () => void;
}) {
  const { fullTheme } = useTheme();

  const handleLongPress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onDelete();
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={handleLongPress}
      style={[styles.panelCard, { 
        backgroundColor: fullTheme.colors.cardBackground,
        borderColor: fullTheme.colors.border,
      }]}
    >
      <View style={[styles.panelIconContainer, { backgroundColor: `${fullTheme.colors.primary}15` }]}>
        <Feather name="cpu" size={20} color={fullTheme.colors.primary} />
      </View>
      <View style={styles.panelCardContent}>
        <ThemedText type="body" numberOfLines={1}>{panel.tag}</ThemedText>
        <ThemedText type="small" secondary numberOfLines={1}>
          {panel.manufacturer ? `${panel.manufacturer}` : ""}{panel.model ? ` - ${panel.model}` : ""}
        </ThemedText>
      </View>
      <Feather name="chevron-right" size={18} color={fullTheme.colors.textSecondary} />
    </Pressable>
  );
}

export default function FirePumpFormScreen({ navigation, route }: FirePumpFormScreenProps) {
  const { pumpId, companyId } = route.params || {};
  const { fullTheme, theme } = useTheme();
  const { t } = useLanguage();
  const { 
    firePumps, 
    addFirePump, 
    updateFirePump, 
    deleteFirePump,
    getPanelsByPump,
    deleteFirePumpPanel,
  } = useInspections();

  const existingPump = pumpId ? firePumps.find((p) => p.id === pumpId) : undefined;
  const panels = pumpId ? getPanelsByPump(pumpId) : [];

  const [tag, setTag] = useState(existingPump?.tag || "");
  const [type, setType] = useState<PumpType>(existingPump?.type || "electric_main");
  const [manufacturer, setManufacturer] = useState(existingPump?.manufacturer || "");
  const [model, setModel] = useState(existingPump?.model || "");
  const [serialNumber, setSerialNumber] = useState(existingPump?.serialNumber || "");
  const [ratedFlowGpm, setRatedFlowGpm] = useState(existingPump?.ratedFlowGpm?.toString() || "");
  const [ratedPressurePsi, setRatedPressurePsi] = useState(existingPump?.ratedPressurePsi?.toString() || "");
  const [ratedSpeedRpm, setRatedSpeedRpm] = useState(existingPump?.ratedSpeedRpm?.toString() || "");
  const [powerHP, setPowerHP] = useState(existingPump?.powerHP?.toString() || "");
  const [voltage, setVoltage] = useState(existingPump?.voltage || "");
  const [phases, setPhases] = useState(existingPump?.phases?.toString() || "");
  const [frequency, setFrequency] = useState(existingPump?.frequency?.toString() || "60");
  const [pumpOrientation, setPumpOrientation] = useState<PumpOrientation | undefined>(existingPump?.pumpOrientation);
  const [numberOfStages, setNumberOfStages] = useState(existingPump?.numberOfStages?.toString() || "");
  const [impellerDiameter, setImpellerDiameter] = useState(existingPump?.impellerDiameter || "");
  const [suctionSize, setSuctionSize] = useState(existingPump?.suctionSize || "");
  const [dischargeSize, setDischargeSize] = useState(existingPump?.dischargeSize || "");
  const [ulFmListed, setUlFmListed] = useState(existingPump?.ulFmListed || false);
  const [motorManufacturer, setMotorManufacturer] = useState(existingPump?.motorManufacturer || "");
  const [motorModel, setMotorModel] = useState(existingPump?.motorModel || "");
  const [motorSerialNumber, setMotorSerialNumber] = useState(existingPump?.motorSerialNumber || "");
  const [fullLoadAmperage, setFullLoadAmperage] = useState(existingPump?.fullLoadAmperage?.toString() || "");
  const [lockedRotorAmperage, setLockedRotorAmperage] = useState(existingPump?.lockedRotorAmperage?.toString() || "");
  const [serviceFactor, setServiceFactor] = useState(existingPump?.serviceFactor?.toString() || "");
  const [frameSize, setFrameSize] = useState(existingPump?.frameSize || "");
  const [enclosureType, setEnclosureType] = useState<EnclosureType | undefined>(existingPump?.enclosureType);
  const [insulationClass, setInsulationClass] = useState<InsulationClass | undefined>(existingPump?.insulationClass);
  const [engineManufacturer, setEngineManufacturer] = useState(existingPump?.engineManufacturer || "");
  const [engineModel, setEngineModel] = useState(existingPump?.engineModel || "");
  const [engineSerialNumber, setEngineSerialNumber] = useState(existingPump?.engineSerialNumber || "");
  const [numberOfCylinders, setNumberOfCylinders] = useState(existingPump?.numberOfCylinders?.toString() || "");
  const [displacement, setDisplacement] = useState(existingPump?.displacement || "");
  const [ratedEngineHP, setRatedEngineHP] = useState(existingPump?.ratedEngineHP?.toString() || "");
  const [ratedEngineRPM, setRatedEngineRPM] = useState(existingPump?.ratedEngineRPM?.toString() || "");
  const [fuelType, setFuelType] = useState<FuelType | undefined>(existingPump?.fuelType);
  const [fuelTankCapacity, setFuelTankCapacity] = useState(existingPump?.fuelTankCapacity?.toString() || "");
  const [oilCapacity, setOilCapacity] = useState(existingPump?.oilCapacity?.toString() || "");
  const [coolantCapacity, setCoolantCapacity] = useState(existingPump?.coolantCapacity?.toString() || "");
  const [governorType, setGovernorType] = useState<GovernorType | undefined>(existingPump?.governorType);
  const [isTurboSupercharged, setIsTurboSupercharged] = useState(existingPump?.isTurboSupercharged || false);
  const [battery1Voltage, setBattery1Voltage] = useState(existingPump?.battery1Voltage?.toString() || "");
  const [battery1CCA, setBattery1CCA] = useState(existingPump?.battery1CCA?.toString() || "");
  const [battery2Voltage, setBattery2Voltage] = useState(existingPump?.battery2Voltage?.toString() || "");
  const [battery2CCA, setBattery2CCA] = useState(existingPump?.battery2CCA?.toString() || "");
  const [batteryChargerManufacturer, setBatteryChargerManufacturer] = useState(existingPump?.batteryChargerManufacturer || "");
  const [batteryChargerModel, setBatteryChargerModel] = useState(existingPump?.batteryChargerModel || "");
  const [comments, setComments] = useState(existingPump?.comments || "");

  const isElectric = type === "electric_main" || type === "jockey";
  const isDiesel = type === "diesel_main";

  const pumpTypeOptions = [
    { id: "electric_main", label: t.firePumps.electricMain },
    { id: "diesel_main", label: t.firePumps.dieselMain },
    { id: "jockey", label: t.firePumps.jockey },
  ];

  const orientationOptions = [
    { id: "horizontal_split_case", label: t.firePumps.orientations.horizontalSplitCase },
    { id: "vertical_inline", label: t.firePumps.orientations.verticalInline },
    { id: "vertical_turbine", label: t.firePumps.orientations.verticalTurbine },
    { id: "end_suction", label: t.firePumps.orientations.endSuction },
  ];

  const enclosureTypeOptions = [
    { id: "tefc", label: t.firePumps.enclosureTypes.tefc },
    { id: "odp", label: t.firePumps.enclosureTypes.odp },
    { id: "xp", label: t.firePumps.enclosureTypes.xp },
    { id: "wpii", label: t.firePumps.enclosureTypes.wpii },
  ];

  const insulationClassOptions = [
    { id: "a", label: t.firePumps.insulationClasses.a },
    { id: "b", label: t.firePumps.insulationClasses.b },
    { id: "f", label: t.firePumps.insulationClasses.f },
    { id: "h", label: t.firePumps.insulationClasses.h },
  ];

  const fuelTypeOptions = [
    { id: "diesel", label: t.firePumps.fuelTypes.diesel },
    { id: "lpg", label: t.firePumps.fuelTypes.lpg },
    { id: "natural_gas", label: t.firePumps.fuelTypes.naturalGas },
  ];

  const governorTypeOptions = [
    { id: "mechanical", label: t.firePumps.governorTypes.mechanical },
    { id: "electronic", label: t.firePumps.governorTypes.electronic },
    { id: "isochronous", label: t.firePumps.governorTypes.isochronous },
  ];

  const handleSubmit = async () => {
    if (!tag.trim()) {
      Alert.alert(t.common.error, t.form.required);
      return;
    }

    const pumpData: FirePump = {
      id: existingPump?.id || Date.now().toString(),
      companyId: existingPump?.companyId || companyId || "",
      tag,
      type,
      manufacturer: manufacturer || undefined,
      model: model || undefined,
      serialNumber: serialNumber || undefined,
      ratedFlowGpm: ratedFlowGpm ? parseFloat(ratedFlowGpm) : undefined,
      ratedPressurePsi: ratedPressurePsi ? parseFloat(ratedPressurePsi) : undefined,
      ratedSpeedRpm: ratedSpeedRpm ? parseFloat(ratedSpeedRpm) : undefined,
      powerHP: powerHP ? parseFloat(powerHP) : undefined,
      voltage: voltage || undefined,
      phases: phases ? parseInt(phases, 10) : undefined,
      frequency: frequency ? parseInt(frequency, 10) : undefined,
      pumpOrientation: pumpOrientation || undefined,
      numberOfStages: numberOfStages ? parseInt(numberOfStages, 10) : undefined,
      impellerDiameter: impellerDiameter || undefined,
      suctionSize: suctionSize || undefined,
      dischargeSize: dischargeSize || undefined,
      ulFmListed: ulFmListed || undefined,
      motorManufacturer: isElectric ? motorManufacturer || undefined : undefined,
      motorModel: isElectric ? motorModel || undefined : undefined,
      motorSerialNumber: isElectric ? motorSerialNumber || undefined : undefined,
      fullLoadAmperage: isElectric && fullLoadAmperage ? parseFloat(fullLoadAmperage) : undefined,
      lockedRotorAmperage: isElectric && lockedRotorAmperage ? parseFloat(lockedRotorAmperage) : undefined,
      serviceFactor: isElectric && serviceFactor ? parseFloat(serviceFactor) : undefined,
      frameSize: isElectric ? frameSize || undefined : undefined,
      enclosureType: isElectric ? enclosureType : undefined,
      insulationClass: isElectric ? insulationClass : undefined,
      engineManufacturer: isDiesel ? engineManufacturer || undefined : undefined,
      engineModel: isDiesel ? engineModel || undefined : undefined,
      engineSerialNumber: isDiesel ? engineSerialNumber || undefined : undefined,
      numberOfCylinders: isDiesel && numberOfCylinders ? parseInt(numberOfCylinders, 10) : undefined,
      displacement: isDiesel ? displacement || undefined : undefined,
      ratedEngineHP: isDiesel && ratedEngineHP ? parseFloat(ratedEngineHP) : undefined,
      ratedEngineRPM: isDiesel && ratedEngineRPM ? parseFloat(ratedEngineRPM) : undefined,
      fuelType: isDiesel ? fuelType : undefined,
      fuelTankCapacity: isDiesel && fuelTankCapacity ? parseFloat(fuelTankCapacity) : undefined,
      oilCapacity: isDiesel && oilCapacity ? parseFloat(oilCapacity) : undefined,
      coolantCapacity: isDiesel && coolantCapacity ? parseFloat(coolantCapacity) : undefined,
      governorType: isDiesel ? governorType : undefined,
      isTurboSupercharged: isDiesel ? isTurboSupercharged : undefined,
      battery1Voltage: isDiesel && battery1Voltage ? parseFloat(battery1Voltage) : undefined,
      battery1CCA: isDiesel && battery1CCA ? parseFloat(battery1CCA) : undefined,
      battery2Voltage: isDiesel && battery2Voltage ? parseFloat(battery2Voltage) : undefined,
      battery2CCA: isDiesel && battery2CCA ? parseFloat(battery2CCA) : undefined,
      batteryChargerManufacturer: isDiesel ? batteryChargerManufacturer || undefined : undefined,
      batteryChargerModel: isDiesel ? batteryChargerModel || undefined : undefined,
      comments: comments || undefined,
      createdAt: existingPump?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (existingPump) {
        await updateFirePump(existingPump.id, pumpData);
      } else {
        await addFirePump(pumpData);
      }
      navigation.goBack();
    } catch (error) {
      console.error("Error saving pump:", error);
      Alert.alert(t.common.error, t.report.shareError);
    }
  };

  const handleDeletePump = () => {
    Alert.alert(
      t.common.delete,
      t.firePumps.deleteConfirmation,
      [
        { text: t.common.cancel, style: "cancel" },
        {
          text: t.common.delete,
          style: "destructive",
          onPress: async () => {
            try {
              await deleteFirePump(existingPump!.id);
              navigation.goBack();
            } catch (error) {
              console.error("Error deleting pump:", error);
            }
          },
        },
      ]
    );
  };

  const handleAddPanel = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("FirePumpPanelForm", { pumpId: existingPump!.id });
  };

  const handlePanelPress = (panel: FirePumpControlPanel) => {
    navigation.navigate("FirePumpPanelForm", { pumpId: existingPump!.id, panelId: panel.id });
  };

  const handleDeletePanel = (panel: FirePumpControlPanel) => {
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
              await deleteFirePumpPanel(panel.id);
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
        {t.firePumps.pumpInfo}
      </ThemedText>

      <ThemedText type="body">{t.firePumps.tag} *</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={tag}
        onChangeText={(text) => setTag(toUpperIfNotEmail(text, "tag"))}
        placeholder="BP-01"
        placeholderTextColor={theme.placeholder}
        autoCapitalize="characters"
      />

      <Spacer height={Spacing.lg} />

      <ThemedText type="body">{t.firePumps.type}</ThemedText>
      <Spacer height={Spacing.sm} />
      <SelectPicker
        options={pumpTypeOptions}
        selectedId={type}
        onSelect={(id) => setType(id as PumpType)}
        placeholder={t.firePumps.type}
        title={t.firePumps.type}
      />

      <Spacer height={Spacing.lg} />

      <ThemedText type="body">{t.firePumps.manufacturer}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={manufacturer}
        onChangeText={(text) => setManufacturer(toUpperIfNotEmail(text, "manufacturer"))}
        placeholder="AURORA, PATTERSON, etc."
        placeholderTextColor={theme.placeholder}
        autoCapitalize="characters"
      />

      <Spacer height={Spacing.lg} />

      <ThemedText type="body">{t.firePumps.model}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={model}
        onChangeText={(text) => setModel(toUpperIfNotEmail(text, "model"))}
        placeholder="8x6x11"
        placeholderTextColor={theme.placeholder}
        autoCapitalize="characters"
      />

      <Spacer height={Spacing.lg} />

      <ThemedText type="body">{t.firePumps.serialNumber}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={serialNumber}
        onChangeText={(text) => setSerialNumber(toUpperIfNotEmail(text, "serialNumber"))}
        placeholder="SN-12345678"
        placeholderTextColor={theme.placeholder}
        autoCapitalize="characters"
      />

      <Spacer height={Spacing.lg} />

      <ThemedText type="body">{t.firePumps.pumpOrientation}</ThemedText>
      <Spacer height={Spacing.sm} />
      <SelectPicker
        options={orientationOptions}
        selectedId={pumpOrientation || ""}
        onSelect={(id) => setPumpOrientation(id as PumpOrientation)}
        placeholder={t.firePumps.pumpOrientation}
        title={t.firePumps.pumpOrientation}
      />

      <Spacer height={Spacing.lg} />

      <View style={styles.row}>
        <View style={styles.halfField}>
          <ThemedText type="body">{t.firePumps.ratedFlowGpm}</ThemedText>
          <Spacer height={Spacing.sm} />
          <TextInput
            style={inputStyle}
            value={ratedFlowGpm}
            onChangeText={setRatedFlowGpm}
            placeholder="1000"
            placeholderTextColor={theme.placeholder}
            keyboardType="numeric"
          />
        </View>
        <Spacer width={Spacing.md} />
        <View style={styles.halfField}>
          <ThemedText type="body">{t.firePumps.ratedPressurePsi}</ThemedText>
          <Spacer height={Spacing.sm} />
          <TextInput
            style={inputStyle}
            value={ratedPressurePsi}
            onChangeText={setRatedPressurePsi}
            placeholder="125"
            placeholderTextColor={theme.placeholder}
            keyboardType="numeric"
          />
        </View>
      </View>

      <Spacer height={Spacing.lg} />

      <View style={styles.row}>
        <View style={styles.halfField}>
          <ThemedText type="body">{t.firePumps.ratedSpeedRpm}</ThemedText>
          <Spacer height={Spacing.sm} />
          <TextInput
            style={inputStyle}
            value={ratedSpeedRpm}
            onChangeText={setRatedSpeedRpm}
            placeholder="1770"
            placeholderTextColor={theme.placeholder}
            keyboardType="numeric"
          />
        </View>
        <Spacer width={Spacing.md} />
        <View style={styles.halfField}>
          <ThemedText type="body">{t.firePumps.powerHP}</ThemedText>
          <Spacer height={Spacing.sm} />
          <TextInput
            style={inputStyle}
            value={powerHP}
            onChangeText={setPowerHP}
            placeholder="75"
            placeholderTextColor={theme.placeholder}
            keyboardType="numeric"
          />
        </View>
      </View>

      <Spacer height={Spacing.lg} />

      <View style={styles.row}>
        <View style={styles.halfField}>
          <ThemedText type="body">{t.firePumps.numberOfStages}</ThemedText>
          <Spacer height={Spacing.sm} />
          <TextInput
            style={inputStyle}
            value={numberOfStages}
            onChangeText={setNumberOfStages}
            placeholder="1"
            placeholderTextColor={theme.placeholder}
            keyboardType="numeric"
          />
        </View>
        <Spacer width={Spacing.md} />
        <View style={styles.halfField}>
          <ThemedText type="body">{t.firePumps.impellerDiameter}</ThemedText>
          <Spacer height={Spacing.sm} />
          <TextInput
            style={inputStyle}
            value={impellerDiameter}
            onChangeText={setImpellerDiameter}
            placeholder="11.5"
            placeholderTextColor={theme.placeholder}
          />
        </View>
      </View>

      <Spacer height={Spacing.lg} />

      <View style={styles.row}>
        <View style={styles.halfField}>
          <ThemedText type="body">{t.firePumps.suctionSize}</ThemedText>
          <Spacer height={Spacing.sm} />
          <TextInput
            style={inputStyle}
            value={suctionSize}
            onChangeText={setSuctionSize}
            placeholder="8"
            placeholderTextColor={theme.placeholder}
          />
        </View>
        <Spacer width={Spacing.md} />
        <View style={styles.halfField}>
          <ThemedText type="body">{t.firePumps.dischargeSize}</ThemedText>
          <Spacer height={Spacing.sm} />
          <TextInput
            style={inputStyle}
            value={dischargeSize}
            onChangeText={setDischargeSize}
            placeholder="6"
            placeholderTextColor={theme.placeholder}
          />
        </View>
      </View>

      <Spacer height={Spacing.lg} />

      <View style={styles.switchRow}>
        <ThemedText type="body">{t.firePumps.ulFmListed}</ThemedText>
        <Switch
          value={ulFmListed}
          onValueChange={setUlFmListed}
          trackColor={{ false: fullTheme.colors.border, true: fullTheme.colors.primary }}
          thumbColor="#FFFFFF"
        />
      </View>

      <Spacer height={Spacing.lg} />

      <View style={styles.row}>
        <View style={styles.halfField}>
          <ThemedText type="body">{t.firePumps.voltage}</ThemedText>
          <Spacer height={Spacing.sm} />
          <TextInput
            style={inputStyle}
            value={voltage}
            onChangeText={setVoltage}
            placeholder="480"
            placeholderTextColor={theme.placeholder}
            keyboardType="numeric"
          />
        </View>
        <Spacer width={Spacing.md} />
        <View style={styles.halfField}>
          <ThemedText type="body">{t.firePumps.phases}</ThemedText>
          <Spacer height={Spacing.sm} />
          <TextInput
            style={inputStyle}
            value={phases}
            onChangeText={setPhases}
            placeholder="3"
            placeholderTextColor={theme.placeholder}
            keyboardType="numeric"
          />
        </View>
      </View>

      <Spacer height={Spacing.lg} />

      <ThemedText type="body">{t.firePumps.frequency}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={frequency}
        onChangeText={setFrequency}
        placeholder="60"
        placeholderTextColor={theme.placeholder}
        keyboardType="numeric"
      />

      {isElectric ? (
        <>
          <Spacer height={Spacing["3xl"]} />
          <ThemedText type="h3" style={{ marginBottom: Spacing.lg }}>
            {t.firePumps.motorData}
          </ThemedText>

          <ThemedText type="body">{t.firePumps.motorManufacturer}</ThemedText>
          <Spacer height={Spacing.sm} />
          <TextInput
            style={inputStyle}
            value={motorManufacturer}
            onChangeText={(text) => setMotorManufacturer(toUpperIfNotEmail(text, "motorManufacturer"))}
            placeholder="WEG, SIEMENS, ABB"
            placeholderTextColor={theme.placeholder}
            autoCapitalize="characters"
          />

          <Spacer height={Spacing.lg} />

          <View style={styles.row}>
            <View style={styles.halfField}>
              <ThemedText type="body">{t.firePumps.motorModel}</ThemedText>
              <Spacer height={Spacing.sm} />
              <TextInput
                style={inputStyle}
                value={motorModel}
                onChangeText={(text) => setMotorModel(toUpperIfNotEmail(text, "motorModel"))}
                placeholderTextColor={theme.placeholder}
                autoCapitalize="characters"
              />
            </View>
            <Spacer width={Spacing.md} />
            <View style={styles.halfField}>
              <ThemedText type="body">{t.firePumps.motorSerialNumber}</ThemedText>
              <Spacer height={Spacing.sm} />
              <TextInput
                style={inputStyle}
                value={motorSerialNumber}
                onChangeText={(text) => setMotorSerialNumber(toUpperIfNotEmail(text, "motorSerialNumber"))}
                placeholderTextColor={theme.placeholder}
                autoCapitalize="characters"
              />
            </View>
          </View>

          <Spacer height={Spacing.lg} />

          <View style={styles.row}>
            <View style={styles.halfField}>
              <ThemedText type="body">{t.firePumps.fullLoadAmperage}</ThemedText>
              <Spacer height={Spacing.sm} />
              <TextInput
                style={inputStyle}
                value={fullLoadAmperage}
                onChangeText={setFullLoadAmperage}
                placeholder="95"
                placeholderTextColor={theme.placeholder}
                keyboardType="numeric"
              />
            </View>
            <Spacer width={Spacing.md} />
            <View style={styles.halfField}>
              <ThemedText type="body">{t.firePumps.lockedRotorAmperage}</ThemedText>
              <Spacer height={Spacing.sm} />
              <TextInput
                style={inputStyle}
                value={lockedRotorAmperage}
                onChangeText={setLockedRotorAmperage}
                placeholder="580"
                placeholderTextColor={theme.placeholder}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Spacer height={Spacing.lg} />

          <View style={styles.row}>
            <View style={styles.halfField}>
              <ThemedText type="body">{t.firePumps.serviceFactor}</ThemedText>
              <Spacer height={Spacing.sm} />
              <TextInput
                style={inputStyle}
                value={serviceFactor}
                onChangeText={setServiceFactor}
                placeholder="1.15"
                placeholderTextColor={theme.placeholder}
                keyboardType="numeric"
              />
            </View>
            <Spacer width={Spacing.md} />
            <View style={styles.halfField}>
              <ThemedText type="body">{t.firePumps.frameSize}</ThemedText>
              <Spacer height={Spacing.sm} />
              <TextInput
                style={inputStyle}
                value={frameSize}
                onChangeText={setFrameSize}
                placeholder="365T"
                placeholderTextColor={theme.placeholder}
                autoCapitalize="characters"
              />
            </View>
          </View>

          <Spacer height={Spacing.lg} />

          <ThemedText type="body">{t.firePumps.enclosureType}</ThemedText>
          <Spacer height={Spacing.sm} />
          <SelectPicker
            options={enclosureTypeOptions}
            selectedId={enclosureType || ""}
            onSelect={(id) => setEnclosureType(id as EnclosureType)}
            placeholder={t.firePumps.enclosureType}
            title={t.firePumps.enclosureType}
          />

          <Spacer height={Spacing.lg} />

          <ThemedText type="body">{t.firePumps.insulationClass}</ThemedText>
          <Spacer height={Spacing.sm} />
          <SelectPicker
            options={insulationClassOptions}
            selectedId={insulationClass || ""}
            onSelect={(id) => setInsulationClass(id as InsulationClass)}
            placeholder={t.firePumps.insulationClass}
            title={t.firePumps.insulationClass}
          />
        </>
      ) : null}

      {isDiesel ? (
        <>
          <Spacer height={Spacing["3xl"]} />
          <ThemedText type="h3" style={{ marginBottom: Spacing.lg }}>
            {t.firePumps.engineData}
          </ThemedText>

          <ThemedText type="body">{t.firePumps.engineManufacturer}</ThemedText>
          <Spacer height={Spacing.sm} />
          <TextInput
            style={inputStyle}
            value={engineManufacturer}
            onChangeText={(text) => setEngineManufacturer(toUpperIfNotEmail(text, "engineManufacturer"))}
            placeholder="CUMMINS, JOHN DEERE, CLARKE"
            placeholderTextColor={theme.placeholder}
            autoCapitalize="characters"
          />

          <Spacer height={Spacing.lg} />

          <View style={styles.row}>
            <View style={styles.halfField}>
              <ThemedText type="body">{t.firePumps.engineModel}</ThemedText>
              <Spacer height={Spacing.sm} />
              <TextInput
                style={inputStyle}
                value={engineModel}
                onChangeText={(text) => setEngineModel(toUpperIfNotEmail(text, "engineModel"))}
                placeholderTextColor={theme.placeholder}
                autoCapitalize="characters"
              />
            </View>
            <Spacer width={Spacing.md} />
            <View style={styles.halfField}>
              <ThemedText type="body">{t.firePumps.engineSerialNumber}</ThemedText>
              <Spacer height={Spacing.sm} />
              <TextInput
                style={inputStyle}
                value={engineSerialNumber}
                onChangeText={(text) => setEngineSerialNumber(toUpperIfNotEmail(text, "engineSerialNumber"))}
                placeholderTextColor={theme.placeholder}
                autoCapitalize="characters"
              />
            </View>
          </View>

          <Spacer height={Spacing.lg} />

          <View style={styles.row}>
            <View style={styles.halfField}>
              <ThemedText type="body">{t.firePumps.ratedEngineHP}</ThemedText>
              <Spacer height={Spacing.sm} />
              <TextInput
                style={inputStyle}
                value={ratedEngineHP}
                onChangeText={setRatedEngineHP}
                placeholder="100"
                placeholderTextColor={theme.placeholder}
                keyboardType="numeric"
              />
            </View>
            <Spacer width={Spacing.md} />
            <View style={styles.halfField}>
              <ThemedText type="body">{t.firePumps.ratedEngineRPM}</ThemedText>
              <Spacer height={Spacing.sm} />
              <TextInput
                style={inputStyle}
                value={ratedEngineRPM}
                onChangeText={setRatedEngineRPM}
                placeholder="1760"
                placeholderTextColor={theme.placeholder}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Spacer height={Spacing.lg} />

          <View style={styles.row}>
            <View style={styles.halfField}>
              <ThemedText type="body">{t.firePumps.numberOfCylinders}</ThemedText>
              <Spacer height={Spacing.sm} />
              <TextInput
                style={inputStyle}
                value={numberOfCylinders}
                onChangeText={setNumberOfCylinders}
                placeholder="6"
                placeholderTextColor={theme.placeholder}
                keyboardType="numeric"
              />
            </View>
            <Spacer width={Spacing.md} />
            <View style={styles.halfField}>
              <ThemedText type="body">{t.firePumps.displacement}</ThemedText>
              <Spacer height={Spacing.sm} />
              <TextInput
                style={inputStyle}
                value={displacement}
                onChangeText={setDisplacement}
                placeholder="5.9L"
                placeholderTextColor={theme.placeholder}
              />
            </View>
          </View>

          <Spacer height={Spacing.lg} />

          <ThemedText type="body">{t.firePumps.fuelType}</ThemedText>
          <Spacer height={Spacing.sm} />
          <SelectPicker
            options={fuelTypeOptions}
            selectedId={fuelType || ""}
            onSelect={(id) => setFuelType(id as FuelType)}
            placeholder={t.firePumps.fuelType}
            title={t.firePumps.fuelType}
          />

          <Spacer height={Spacing.lg} />

          <View style={styles.row}>
            <View style={styles.thirdField}>
              <ThemedText type="body">{t.firePumps.fuelTankCapacity}</ThemedText>
              <Spacer height={Spacing.sm} />
              <TextInput
                style={inputStyle}
                value={fuelTankCapacity}
                onChangeText={setFuelTankCapacity}
                placeholder="100"
                placeholderTextColor={theme.placeholder}
                keyboardType="numeric"
              />
            </View>
            <Spacer width={Spacing.sm} />
            <View style={styles.thirdField}>
              <ThemedText type="body">{t.firePumps.oilCapacity}</ThemedText>
              <Spacer height={Spacing.sm} />
              <TextInput
                style={inputStyle}
                value={oilCapacity}
                onChangeText={setOilCapacity}
                placeholder="16"
                placeholderTextColor={theme.placeholder}
                keyboardType="numeric"
              />
            </View>
            <Spacer width={Spacing.sm} />
            <View style={styles.thirdField}>
              <ThemedText type="body">{t.firePumps.coolantCapacity}</ThemedText>
              <Spacer height={Spacing.sm} />
              <TextInput
                style={inputStyle}
                value={coolantCapacity}
                onChangeText={setCoolantCapacity}
                placeholder="8"
                placeholderTextColor={theme.placeholder}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Spacer height={Spacing.lg} />

          <ThemedText type="body">{t.firePumps.governorType}</ThemedText>
          <Spacer height={Spacing.sm} />
          <SelectPicker
            options={governorTypeOptions}
            selectedId={governorType || ""}
            onSelect={(id) => setGovernorType(id as GovernorType)}
            placeholder={t.firePumps.governorType}
            title={t.firePumps.governorType}
          />

          <Spacer height={Spacing.lg} />

          <View style={styles.switchRow}>
            <ThemedText type="body">{t.firePumps.isTurboSupercharged}</ThemedText>
            <Switch
              value={isTurboSupercharged}
              onValueChange={setIsTurboSupercharged}
              trackColor={{ false: fullTheme.colors.border, true: fullTheme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <Spacer height={Spacing["3xl"]} />
          <ThemedText type="h3" style={{ marginBottom: Spacing.lg }}>
            {t.firePumps.batteryData}
          </ThemedText>

          <View style={styles.row}>
            <View style={styles.halfField}>
              <ThemedText type="body">{t.firePumps.battery1Voltage}</ThemedText>
              <Spacer height={Spacing.sm} />
              <TextInput
                style={inputStyle}
                value={battery1Voltage}
                onChangeText={setBattery1Voltage}
                placeholder="24"
                placeholderTextColor={theme.placeholder}
                keyboardType="numeric"
              />
            </View>
            <Spacer width={Spacing.md} />
            <View style={styles.halfField}>
              <ThemedText type="body">{t.firePumps.battery1CCA}</ThemedText>
              <Spacer height={Spacing.sm} />
              <TextInput
                style={inputStyle}
                value={battery1CCA}
                onChangeText={setBattery1CCA}
                placeholder="800"
                placeholderTextColor={theme.placeholder}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Spacer height={Spacing.lg} />

          <View style={styles.row}>
            <View style={styles.halfField}>
              <ThemedText type="body">{t.firePumps.battery2Voltage}</ThemedText>
              <Spacer height={Spacing.sm} />
              <TextInput
                style={inputStyle}
                value={battery2Voltage}
                onChangeText={setBattery2Voltage}
                placeholder="24"
                placeholderTextColor={theme.placeholder}
                keyboardType="numeric"
              />
            </View>
            <Spacer width={Spacing.md} />
            <View style={styles.halfField}>
              <ThemedText type="body">{t.firePumps.battery2CCA}</ThemedText>
              <Spacer height={Spacing.sm} />
              <TextInput
                style={inputStyle}
                value={battery2CCA}
                onChangeText={setBattery2CCA}
                placeholder="800"
                placeholderTextColor={theme.placeholder}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Spacer height={Spacing.lg} />

          <View style={styles.row}>
            <View style={styles.halfField}>
              <ThemedText type="body">{t.firePumps.batteryChargerManufacturer}</ThemedText>
              <Spacer height={Spacing.sm} />
              <TextInput
                style={inputStyle}
                value={batteryChargerManufacturer}
                onChangeText={(text) => setBatteryChargerManufacturer(toUpperIfNotEmail(text, "batteryChargerManufacturer"))}
                placeholderTextColor={theme.placeholder}
                autoCapitalize="characters"
              />
            </View>
            <Spacer width={Spacing.md} />
            <View style={styles.halfField}>
              <ThemedText type="body">{t.firePumps.batteryChargerModel}</ThemedText>
              <Spacer height={Spacing.sm} />
              <TextInput
                style={inputStyle}
                value={batteryChargerModel}
                onChangeText={(text) => setBatteryChargerModel(toUpperIfNotEmail(text, "batteryChargerModel"))}
                placeholderTextColor={theme.placeholder}
                autoCapitalize="characters"
              />
            </View>
          </View>
        </>
      ) : null}

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

      <Button onPress={handleSubmit}>
        <View style={styles.saveButtonContent}>
          <Feather name="save" size={18} color={fullTheme.colors.buttonText} />
          <ThemedText type="body" style={[styles.saveButtonText, { color: fullTheme.colors.buttonText }]}>{t.form.save}</ThemedText>
        </View>
      </Button>

      {existingPump ? (
        <>
          <Spacer height={Spacing.lg} />
          <Button variant="outline" onPress={handleDeletePump}>
            {t.common.delete}
          </Button>
        </>
      ) : null}

      {existingPump ? (
        <>
          <Spacer height={Spacing["3xl"]} />

          <View style={styles.panelHeader}>
            <ThemedText type="h3">{t.firePumps.panels}</ThemedText>
            <Pressable
              onPress={handleAddPanel}
              style={[styles.addPanelButton, { backgroundColor: fullTheme.colors.primary }]}
            >
              <Feather name="plus" size={16} color="#FFFFFF" />
              <ThemedText type="small" style={{ color: "#FFFFFF", marginLeft: Spacing.xs }}>
                {t.firePumps.addPanel}
              </ThemedText>
            </Pressable>
          </View>

          <Spacer height={Spacing.md} />

          {panels.length > 0 ? (
            panels.map((panel) => (
              <View key={panel.id}>
                <PanelCard
                  panel={panel}
                  onPress={() => handlePanelPress(panel)}
                  onDelete={() => handleDeletePanel(panel)}
                />
                <Spacer height={Spacing.sm} />
              </View>
            ))
          ) : (
            <View style={styles.noPanels}>
              <Feather name="cpu" size={32} color={fullTheme.colors.textSecondary} />
              <Spacer height={Spacing.sm} />
              <ThemedText type="body" secondary style={{ textAlign: "center" }}>
                {t.firePumps.noPanels}
              </ThemedText>
            </View>
          )}
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
  thirdField: {
    flex: 1,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addPanelButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  panelCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  panelIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  panelCardContent: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  noPanels: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  saveButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  saveButtonText: {
    fontWeight: "600",
  },
});
