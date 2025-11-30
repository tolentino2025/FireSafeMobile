import React, { useState } from "react";
import { View, StyleSheet, TextInput, Alert, Pressable, Platform } from "react-native";
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
import { useInspections, FirePump, FirePumpControlPanel, PumpType } from "@/contexts/InspectionContext";
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
  const [comments, setComments] = useState(existingPump?.comments || "");

  const pumpTypeOptions = [
    { id: "electric_main", label: t.firePumps.electricMain },
    { id: "diesel_main", label: t.firePumps.dieselMain },
    { id: "jockey", label: t.firePumps.jockey },
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
});
