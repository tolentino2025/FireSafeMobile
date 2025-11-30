import React, { useState } from "react";
import { View, StyleSheet, TextInput, Alert, Switch } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useInspections, FirePumpControlPanel } from "@/contexts/InspectionContext";
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
  const [startingType, setStartingType] = useState(existingPanel?.startingType || "");
  const [hasAutomaticTransfer, setHasAutomaticTransfer] = useState(existingPanel?.hasAutomaticTransfer || false);
  const [comments, setComments] = useState(existingPanel?.comments || "");

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

      <Spacer height={Spacing.lg} />

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

      <Spacer height={Spacing.lg} />

      <ThemedText type="body">{t.firePumps.supplyVoltage}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={supplyVoltage}
        onChangeText={setSupplyVoltage}
        placeholder="480V / 3F / 60Hz"
        placeholderTextColor={theme.placeholder}
      />

      <Spacer height={Spacing.lg} />

      <ThemedText type="body">{t.firePumps.startingType}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={startingType}
        onChangeText={(text) => setStartingType(toUpperIfNotEmail(text, "startingType"))}
        placeholder="PARTIDA DIRETA, SOFT STARTER, VFD"
        placeholderTextColor={theme.placeholder}
        autoCapitalize="characters"
      />

      <Spacer height={Spacing.lg} />

      <View style={styles.switchRow}>
        <ThemedText type="body">{t.firePumps.hasAutomaticTransfer}</ThemedText>
        <Switch
          value={hasAutomaticTransfer}
          onValueChange={setHasAutomaticTransfer}
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
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
