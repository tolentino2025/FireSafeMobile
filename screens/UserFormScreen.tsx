import React, { useState } from "react";
import { View, StyleSheet, TextInput, Pressable } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useInspections, AppUser } from "@/contexts/InspectionContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { PropertiesStackParamList } from "@/navigation/PropertiesStackNavigator";
import { toUpperIfNotEmail } from "@/utils/textTransform";
import { showAlert, showConfirm } from "@/utils/appAlert";

type UserFormScreenProps = NativeStackScreenProps<PropertiesStackParamList, "UserForm">;

export default function UserFormScreen({ navigation, route }: UserFormScreenProps) {
  const { userId } = route.params || {};
  const { theme, fullTheme } = useTheme();
  const { t } = useLanguage();
  const { appUsers, addAppUser, updateAppUser, deleteAppUser } = useInspections();

  const existingUser = userId ? appUsers.find((u) => u.id === userId) : undefined;

  const [name, setName] = useState(existingUser?.name || "");
  const [email, setEmail] = useState(existingUser?.email || "");
  const [phone, setPhone] = useState(existingUser?.phone || "");
  const [role, setRole] = useState(existingUser?.role || "INSPETOR");

  const handleSubmit = async () => {
    if (!name.trim()) {
      showAlert(t.common.error, t.form.required);
      return;
    }

    const userData: AppUser = {
      id: existingUser?.id || Date.now().toString(),
      name,
      email,
      phone,
      role,
      createdAt: existingUser?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (existingUser) {
        await updateAppUser(existingUser.id, userData);
      } else {
        await addAppUser(userData);
      }
      navigation.goBack();
    } catch (error) {
      console.error("Error saving user:", error);
      showAlert(t.common.error, t.report.shareError);
    }
  };

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border },
  ];

  return (
    <ScreenKeyboardAwareScrollView>
      <ThemedText type="h3">{t.users?.name || "Nome"}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={name}
        onChangeText={(text) => setName(toUpperIfNotEmail(text, "name"))}
        placeholder={t.users?.name || "Nome Completo"}
        placeholderTextColor={theme.placeholder}
        autoCapitalize="characters"
      />

      <Spacer height={Spacing.lg} />

      <ThemedText type="h3">{t.users?.role || "Cargo"}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={role}
        onChangeText={(text) => setRole(toUpperIfNotEmail(text, "role"))}
        placeholder={t.users?.role || "Inspetor, Supervisor, etc."}
        placeholderTextColor={theme.placeholder}
        autoCapitalize="characters"
      />

      <Spacer height={Spacing.lg} />

      <ThemedText type="h3">{t.companies?.email || "Email"}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={email}
        onChangeText={(text) => setEmail(toUpperIfNotEmail(text, "email"))}
        placeholder="email@exemplo.com"
        placeholderTextColor={theme.placeholder}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Spacer height={Spacing.lg} />

      <ThemedText type="h3">{t.form.propertyPhone}</ThemedText>
      <Spacer height={Spacing.sm} />
      <TextInput
        style={inputStyle}
        value={phone}
        onChangeText={setPhone}
        placeholder={t.form.propertyPhone}
        placeholderTextColor={theme.placeholder}
        keyboardType="phone-pad"
      />

      <Spacer height={Spacing["3xl"]} />

      <View style={styles.buttonRow}>
        <Pressable
          onPress={handleSubmit}
          style={[styles.saveButton, { backgroundColor: fullTheme.colors.primary }]}
        >
          <Feather name="save" size={20} color="#FFFFFF" />
        </Pressable>
        {existingUser ? (
          <Pressable
            onPress={() => {
              showConfirm(
                t.common.confirm,
                `${t.common.delete} "${existingUser.name}"?`,
                async () => {
                  await deleteAppUser(existingUser.id);
                  navigation.goBack();
                },
                { confirmText: t.common.delete, cancelText: t.common.cancel, destructive: true }
              );
            }}
            style={[styles.deleteButton, { backgroundColor: fullTheme.colors.error }]}
          >
            <Feather name="trash-2" size={20} color="#FFFFFF" />
          </Pressable>
        ) : null}
      </View>

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
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  saveButton: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
