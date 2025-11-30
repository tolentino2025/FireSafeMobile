import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { Spacing } from "@/constants/theme";

interface ActionBarProps {
  onShare?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSend?: () => void;
  showSend?: boolean;
}

export function ActionBar({
  onShare,
  onEdit,
  onDelete,
  onSend,
  showSend = false,
}: ActionBarProps) {
  const { fullTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <View
      style={[
        styles.container,
        { borderColor: fullTheme.colors.border },
      ]}
    >
      {onShare ? (
        <Pressable style={styles.action} onPress={onShare}>
          <Feather name="share-2" size={18} color={fullTheme.colors.primary} />
          <ThemedText style={[styles.label, { color: fullTheme.colors.primary }]}>
            {t.report.share}
          </ThemedText>
        </Pressable>
      ) : null}

      {onEdit ? (
        <Pressable style={styles.action} onPress={onEdit}>
          <Feather name="edit-3" size={18} color={fullTheme.colors.primary} />
          <ThemedText style={[styles.label, { color: fullTheme.colors.primary }]}>
            {t.common.edit}
          </ThemedText>
        </Pressable>
      ) : null}

      {onDelete ? (
        <Pressable style={styles.action} onPress={onDelete}>
          <Feather name="trash-2" size={18} color={fullTheme.colors.error} />
          <ThemedText style={[styles.label, { color: fullTheme.colors.error }]}>
            {t.common.delete}
          </ThemedText>
        </Pressable>
      ) : null}

      {showSend && onSend ? (
        <Pressable style={styles.action} onPress={onSend}>
          <Feather name="send" size={18} color={fullTheme.colors.primary} />
          <ThemedText style={[styles.label, { color: fullTheme.colors.primary }]}>
            {t.report.send || "Enviar"}
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderTopWidth: 1,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
});
