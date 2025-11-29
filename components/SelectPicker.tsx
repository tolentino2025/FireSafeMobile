import React, { useState } from "react";
import { View, StyleSheet, Pressable, Modal, FlatList, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, AppColors } from "@/constants/theme";

interface SelectOption {
  id: string;
  label: string;
  sublabel?: string;
}

interface SelectPickerProps {
  options: SelectOption[];
  selectedId: string | undefined;
  onSelect: (id: string) => void;
  placeholder: string;
  title: string;
  emptyText?: string;
}

export function SelectPicker({
  options,
  selectedId,
  onSelect,
  placeholder,
  title,
  emptyText = "No options available",
}: SelectPickerProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.id === selectedId);

  const handleOpen = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsOpen(true);
  };

  const handleSelect = (id: string) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    onSelect(id);
    setIsOpen(false);
  };

  const renderOption = ({ item }: { item: SelectOption }) => (
    <Pressable
      onPress={() => handleSelect(item.id)}
      style={[
        styles.option,
        {
          backgroundColor: item.id === selectedId ? `${AppColors.primary}15` : "transparent",
          borderBottomColor: theme.border,
        },
      ]}
    >
      <View style={styles.optionContent}>
        <ThemedText type="body" numberOfLines={1}>{item.label}</ThemedText>
        {item.sublabel ? (
          <ThemedText type="small" style={{ color: theme.textSecondary }} numberOfLines={1}>
            {item.sublabel}
          </ThemedText>
        ) : null}
      </View>
      {item.id === selectedId ? (
        <Feather name="check" size={20} color={AppColors.primary} />
      ) : null}
    </Pressable>
  );

  return (
    <>
      <Pressable
        onPress={handleOpen}
        style={[
          styles.picker,
          { backgroundColor: theme.inputBackground, borderColor: theme.border },
        ]}
      >
        <ThemedText
          type="body"
          style={{ color: selectedOption ? theme.text : theme.placeholder, flex: 1 }}
          numberOfLines={1}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </ThemedText>
        <Feather name="chevron-down" size={20} color={theme.textSecondary} />
      </Pressable>

      <Modal
        visible={isOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsOpen(false)}
      >
        <ThemedView style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <View style={styles.headerSpacer} />
            <ThemedText type="h3">{title}</ThemedText>
            <Pressable onPress={() => setIsOpen(false)} style={styles.closeButton}>
              <Feather name="x" size={24} color={theme.text} />
            </Pressable>
          </View>

          {options.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center" }}>
                {emptyText}
              </ThemedText>
            </View>
          ) : (
            <FlatList
              data={options}
              renderItem={renderOption}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
            />
          )}
        </ThemedView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  picker: {
    flexDirection: "row",
    alignItems: "center",
    height: Spacing.inputHeight,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  headerSpacer: {
    width: 40,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
  },
  optionContent: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
});
