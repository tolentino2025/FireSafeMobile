import React, { useState } from "react";
import {
  StyleSheet,
  ScrollView,
  Pressable,
  View,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { DatePickerField } from "@/components/DatePickerField";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useInspections } from "@/contexts/InspectionContext";
import { useITM } from "@/contexts/ITMContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { sistemasDisponiveis } from "@/utils/itm/labels";
import { ITMStackParamList } from "@/navigation/ITMStackNavigator";

type Props = NativeStackScreenProps<ITMStackParamList, "ITMPlanForm">;

function hojeISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export default function ITMPlanFormScreen({ navigation }: Props) {
  const { fullTheme } = useTheme();
  const { t, language } = useLanguage();
  const { properties } = useInspections();
  const { criarPlano } = useITM();
  const insets = useSafeAreaInsets();

  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>(hojeISO());
  const [selectedSystems, setSelectedSystems] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const sistemas = sistemasDisponiveis(language);

  const toggleSystem = (key: string) => {
    setSelectedSystems((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key],
    );
  };

  const handleSave = async () => {
    if (!propertyId) {
      Alert.alert(t.itm.form.validationProperty);
      return;
    }
    if (!startDate) {
      Alert.alert(t.itm.form.validationStartDate);
      return;
    }
    if (selectedSystems.length === 0) {
      Alert.alert(t.itm.form.validationSystems);
      return;
    }

    const property = properties.find((p) => p.id === propertyId);
    if (!property) {
      Alert.alert(t.itm.form.validationProperty);
      return;
    }

    try {
      setSaving(true);
      const plano = await criarPlano({
        assetId: property.id,
        propertyName: property.name,
        startDate,
        systemKeys: selectedSystems,
      });
      navigation.replace("ITMSchedule", { planId: plano.id });
    } catch (error) {
      console.error("Error creating ITM plan:", error);
      Alert.alert(t.common.error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 60,
            paddingBottom: insets.bottom + Spacing["5xl"],
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Propriedade */}
        <ThemedText type="h4" style={styles.sectionTitle}>
          {t.itm.form.property}
        </ThemedText>
        {properties.length === 0 ? (
          <ThemedText type="body" secondary style={styles.helper}>
            {t.itm.form.selectProperty}
          </ThemedText>
        ) : (
          <View style={styles.list}>
            {properties.map((property) => {
              const selected = property.id === propertyId;
              return (
                <Pressable
                  key={property.id}
                  onPress={() => setPropertyId(property.id)}
                  style={[
                    styles.optionRow,
                    {
                      backgroundColor: fullTheme.colors.cardBackground,
                      borderColor: selected
                        ? fullTheme.colors.primary
                        : fullTheme.colors.border,
                    },
                  ]}
                >
                  <ThemedText type="body" style={styles.optionLabel} numberOfLines={1}>
                    {property.name}
                  </ThemedText>
                  <Feather
                    name={selected ? "check-circle" : "circle"}
                    size={20}
                    color={
                      selected
                        ? fullTheme.colors.primary
                        : fullTheme.colors.textSecondary
                    }
                  />
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Data de inicio */}
        <ThemedText type="h4" style={styles.sectionTitle}>
          {t.itm.form.startDate}
        </ThemedText>
        <DatePickerField value={startDate} onChange={setStartDate} />

        {/* Sistemas */}
        <ThemedText type="h4" style={styles.sectionTitle}>
          {t.itm.form.systems}
        </ThemedText>
        <ThemedText type="small" secondary style={styles.helper}>
          {t.itm.form.selectSystems}
        </ThemedText>
        {sistemas.length === 0 ? (
          <ThemedText type="body" secondary>
            {t.itm.form.noSystems}
          </ThemedText>
        ) : (
          <View style={styles.list}>
            {sistemas.map((sistema) => {
              const selected = selectedSystems.includes(sistema.key);
              return (
                <Pressable
                  key={sistema.key}
                  onPress={() => toggleSystem(sistema.key)}
                  style={[
                    styles.optionRow,
                    {
                      backgroundColor: fullTheme.colors.cardBackground,
                      borderColor: selected
                        ? fullTheme.colors.primary
                        : fullTheme.colors.border,
                    },
                  ]}
                >
                  <ThemedText type="body" style={styles.optionLabel} numberOfLines={1}>
                    {sistema.label}
                  </ThemedText>
                  <Feather
                    name={selected ? "check-square" : "square"}
                    size={20}
                    color={
                      selected
                        ? fullTheme.colors.primary
                        : fullTheme.colors.textSecondary
                    }
                  />
                </Pressable>
              );
            })}
          </View>
        )}

        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={[
            styles.saveButton,
            {
              backgroundColor: fullTheme.colors.primary,
              opacity: saving ? 0.6 : 1,
              ...fullTheme.shadows.medium,
            },
          ]}
        >
          <ThemedText type="h4" style={styles.saveButtonText}>
            {t.itm.form.save}
          </ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  helper: {
    marginBottom: Spacing.md,
  },
  list: {
    gap: Spacing.sm,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
  },
  optionLabel: {
    flex: 1,
    marginRight: Spacing.md,
  },
  saveButton: {
    marginTop: Spacing["2xl"],
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
  },
});
