import React from "react";
import { View, StyleSheet, Pressable, TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChecklistItem } from "@/contexts/InspectionContext";
import { Spacing, BorderRadius } from "@/constants/theme";

interface ChecklistItemRowProps {
  item: ChecklistItem;
  onValueChange: (value: "yes" | "no" | "na" | null) => void;
  onPsiChange?: (psi: string) => void;
}

export function ChecklistItemRow({ item, onValueChange, onPsiChange }: ChecklistItemRowProps) {
  const { fullTheme } = useTheme();
  const { t } = useLanguage();

  const getButtonStyle = (value: "yes" | "no" | "na") => {
    const isSelected = item.value === value;
    let backgroundColor = "transparent";
    let borderColor = fullTheme.colors.border;

    if (isSelected) {
      switch (value) {
        case "yes":
          backgroundColor = fullTheme.colors.success;
          borderColor = fullTheme.colors.success;
          break;
        case "no":
          backgroundColor = fullTheme.colors.error;
          borderColor = fullTheme.colors.error;
          break;
        case "na":
          backgroundColor = fullTheme.colors.textSecondary;
          borderColor = fullTheme.colors.textSecondary;
          break;
      }
    }

    return {
      backgroundColor,
      borderColor,
    };
  };

  const getTextColor = (value: "yes" | "no" | "na") => {
    if (item.value === value) return "#FFFFFF";
    return fullTheme.colors.textPrimary;
  };

  const getIconColor = (value: "yes" | "no" | "na") => {
    if (item.value === value) return "#FFFFFF";
    switch (value) {
      case "yes":
        return fullTheme.colors.success;
      case "no":
        return fullTheme.colors.error;
      case "na":
        return fullTheme.colors.textSecondary;
    }
  };

  const hasPsi = item.label.toLowerCase().includes("psi") || item.label.toLowerCase().includes("pressure");

  return (
    <View style={[styles.container, { borderBottomColor: fullTheme.colors.border }]}>
      <ThemedText type="body" style={styles.label}>
        {item.label}
      </ThemedText>
      
      <View style={styles.buttonsRow}>
        <Pressable
          onPress={() => onValueChange(item.value === "yes" ? null : "yes")}
          style={[styles.button, getButtonStyle("yes")]}
        >
          <Feather
            name="check"
            size={14}
            color={getIconColor("yes")}
          />
          <ThemedText
            type="small"
            style={[styles.buttonText, { color: getTextColor("yes") }]}
          >
            {t.checklist.yes}
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={() => onValueChange(item.value === "no" ? null : "no")}
          style={[styles.button, getButtonStyle("no")]}
        >
          <Feather
            name="x"
            size={14}
            color={getIconColor("no")}
          />
          <ThemedText
            type="small"
            style={[styles.buttonText, { color: getTextColor("no") }]}
          >
            {t.checklist.no}
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={() => onValueChange(item.value === "na" ? null : "na")}
          style={[styles.button, getButtonStyle("na")]}
        >
          <Feather
            name="minus"
            size={14}
            color={getIconColor("na")}
          />
          <ThemedText
            type="small"
            style={[styles.buttonText, { color: getTextColor("na") }]}
          >
            {t.checklist.na}
          </ThemedText>
        </Pressable>
      </View>

      {hasPsi && (
        <View style={styles.psiRow}>
          <TextInput
            style={[
              styles.psiInput,
              { 
                backgroundColor: fullTheme.colors.inputBackground, 
                color: fullTheme.colors.textPrimary, 
                borderColor: fullTheme.colors.border 
              },
            ]}
            value={item.psiValue || ""}
            onChangeText={onPsiChange}
            placeholder="0"
            placeholderTextColor={fullTheme.colors.placeholder}
            keyboardType="numeric"
          />
          <ThemedText type="small" secondary style={{ marginLeft: Spacing.xs }}>
            psi
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
  },
  label: {
    marginBottom: Spacing.md,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    minWidth: 70,
  },
  buttonText: {
    marginLeft: 4,
    fontWeight: "500",
  },
  psiRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.md,
  },
  psiInput: {
    width: 80,
    height: 40,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
    textAlign: "center",
  },
});
