import React, { useState } from "react";
import { View, Pressable, StyleSheet, Platform, Modal } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface TimePickerFieldProps {
  value: string;
  onChange: (timeString: string) => void;
  placeholder?: string;
  label?: string;
}

export function TimePickerField({ value, onChange, placeholder, label }: TimePickerFieldProps) {
  const { fullTheme } = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  const [tempTime, setTempTime] = useState<Date>(new Date());

  const formatTimeHHMM = (date: Date): string => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const parseTimeToDate = (timeStr: string): Date => {
    const date = new Date();
    if (timeStr && timeStr.includes(":")) {
      const [hours, minutes] = timeStr.split(":").map(Number);
      date.setHours(hours, minutes, 0, 0);
    }
    return date;
  };

  const handleTimeChangeAndroid = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(false);
    if (event.type === "set" && selectedDate) {
      onChange(formatTimeHHMM(selectedDate));
    }
  };

  const handleTimeChangeIOS = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
      setTempTime(selectedDate);
    }
  };

  const handleConfirmIOS = () => {
    onChange(formatTimeHHMM(tempTime));
    setShowPicker(false);
  };

  const handleCancelIOS = () => {
    setShowPicker(false);
  };

  const openPicker = () => {
    setTempTime(parseTimeToDate(value));
    setShowPicker(true);
  };

  const displayValue = value || placeholder || "";

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
            type="time"
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
        onPress={openPicker}
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
        <Feather name="clock" size={20} color={fullTheme.colors.textSecondary} />
      </Pressable>

      {showPicker && Platform.OS === "android" && (
        <DateTimePicker
          value={parseTimeToDate(value)}
          mode="time"
          display="default"
          onChange={handleTimeChangeAndroid}
          is24Hour={true}
        />
      )}

      {showPicker && Platform.OS === "ios" && (
        <Modal transparent animationType="slide" visible={showPicker}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: fullTheme.colors.cardBackground }]}>
              <View style={styles.modalHeader}>
                <Pressable onPress={handleCancelIOS}>
                  <ThemedText style={{ color: fullTheme.colors.primary }}>Cancelar</ThemedText>
                </Pressable>
                <Pressable onPress={handleConfirmIOS}>
                  <ThemedText style={{ color: fullTheme.colors.primary, fontWeight: "600" }}>Confirmar</ThemedText>
                </Pressable>
              </View>
              <DateTimePicker
                value={tempTime}
                mode="time"
                display="spinner"
                onChange={handleTimeChangeIOS}
                is24Hour={true}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  label: {
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    minHeight: 48,
  },
  inputText: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    paddingBottom: Spacing.xl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
});
