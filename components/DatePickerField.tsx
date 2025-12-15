import React, { useState, useEffect } from "react";
import { View, Pressable, StyleSheet, Platform, Modal } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { Spacing, BorderRadius } from "@/constants/theme";

interface DatePickerFieldProps {
  value: string;
  onChange: (dateString: string) => void;
  placeholder?: string;
  label?: string;
}

export function DatePickerField({ value, onChange, placeholder, label }: DatePickerFieldProps) {
  const { fullTheme } = useTheme();
  const { language } = useLanguage();
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());

  const parseDate = (dateStr: string): Date => {
    if (!dateStr) return new Date();
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getLocalTimeZone = (): string | undefined => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return undefined;
    }
  };

  const formatDisplayDate = (dateStr: string): string => {
    if (!dateStr) return "";
    const date = parseDate(dateStr);
    const timeZone = getLocalTimeZone();
    if (language === "pt-BR") {
      return date.toLocaleDateString("pt-BR", { timeZone });
    }
    return date.toLocaleDateString("en-US", { timeZone });
  };

  useEffect(() => {
    if (showPicker) {
      setTempDate(parseDate(value));
    }
  }, [showPicker, value]);

  const handleDateChangeAndroid = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(false);
    if (event.type === "set" && selectedDate) {
      onChange(formatDate(selectedDate));
    }
  };

  const handleDateChangeIOS = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const handleConfirmIOS = () => {
    onChange(formatDate(tempDate));
    setShowPicker(false);
  };

  const handleCancelIOS = () => {
    setShowPicker(false);
  };

  const displayValue = value ? formatDisplayDate(value) : placeholder || "";

  if (Platform.OS === "web") {
    return (
      <View style={styles.container}>
        {label ? <ThemedText type="body" style={styles.label}>{label}</ThemedText> : null}
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: fullTheme.colors.inputBackground,
              borderColor: fullTheme.colors.border,
            },
          ]}
        >
          <input
            type="date"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            style={{
              flex: 1,
              backgroundColor: "transparent",
              border: "none",
              color: fullTheme.colors.textPrimary,
              fontSize: 16,
              outline: "none",
              padding: 0,
              height: "100%",
            }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {label ? <ThemedText type="body" style={styles.label}>{label}</ThemedText> : null}
      <Pressable
        onPress={() => setShowPicker(true)}
        style={[
          styles.inputContainer,
          {
            backgroundColor: fullTheme.colors.inputBackground,
            borderColor: fullTheme.colors.border,
          },
        ]}
      >
        <ThemedText
          type="body"
          style={[
            styles.inputText,
            !value && { color: fullTheme.colors.placeholder },
          ]}
        >
          {displayValue}
        </ThemedText>
        <Feather name="calendar" size={20} color={fullTheme.colors.textSecondary} />
      </Pressable>

      {showPicker && Platform.OS === "android" ? (
        <DateTimePicker
          value={parseDate(value)}
          mode="date"
          display="default"
          onChange={handleDateChangeAndroid}
        />
      ) : null}

      {showPicker && Platform.OS === "ios" ? (
        <Modal
          transparent
          animationType="slide"
          visible={showPicker}
          onRequestClose={handleCancelIOS}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: fullTheme.colors.cardBackground },
              ]}
            >
              <View style={styles.modalHeader}>
                <Pressable onPress={handleCancelIOS}>
                  <ThemedText type="body" style={{ color: fullTheme.colors.primary }}>
                    {language === "pt-BR" ? "Cancelar" : "Cancel"}
                  </ThemedText>
                </Pressable>
                <Pressable onPress={handleConfirmIOS}>
                  <ThemedText type="body" style={{ color: fullTheme.colors.primary, fontWeight: "600" }}>
                    {language === "pt-BR" ? "Confirmar" : "Confirm"}
                  </ThemedText>
                </Pressable>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleDateChangeIOS}
                style={styles.iosPicker}
              />
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  label: {
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    height: Spacing.inputHeight,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputText: {
    flex: 1,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    paddingBottom: Spacing["2xl"],
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  iosPicker: {
    height: 200,
  },
});
