import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, Switch, Alert, Linking, Platform, Modal } from "react-native";
import { Feather } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as Haptics from "expo-haptics";
import * as MailComposer from "expo-mail-composer";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { ThemeMode } from "@/contexts/ThemeContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import {
  getNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermissions,
  checkNotificationPermissions,
  sendTestNotification,
} from "@/utils/notifications";

const ADMIN_EMAIL = "suporte@firesafeitm.com";

type HelpType = "question" | "comment" | "suggestion" | "bugReport" | "other";

export default function ProfileScreen() {
  const { fullTheme, mode, setMode } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    const settings = await getNotificationSettings();
    setNotificationsEnabled(settings.enabled);
    const permission = await checkNotificationPermissions();
    setHasPermission(permission);
  };

  const toggleLanguage = () => {
    setLanguage(language === "pt-BR" ? "en" : "pt-BR");
  };

  const handleThemeChange = (newMode: ThemeMode) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    setMode(newMode);
  };

  const handleAbout = () => {
    Alert.alert(
      "FireSafe ITM",
      "Sistema de Inspeção, Teste e Manutenção NFPA 25\n\nVersion: 1.0.0\n\nCompliance with NFPA 25 standards for fire protection systems inspection.",
      [{ text: "OK" }]
    );
  };

  const handleHelp = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    setHelpModalVisible(true);
  };

  const sendHelpEmail = async (type: HelpType) => {
    setHelpModalVisible(false);
    
    const subjectMap: Record<HelpType, string> = {
      question: t.profile.helpEmailSubjectQuestion,
      comment: t.profile.helpEmailSubjectComment,
      suggestion: t.profile.helpEmailSubjectSuggestion,
      bugReport: t.profile.helpEmailSubjectBugReport,
      other: t.profile.helpEmailSubjectOther,
    };

    const isAvailable = await MailComposer.isAvailableAsync();
    
    if (!isAvailable) {
      Alert.alert(
        t.profile.help,
        t.common.emailNotAvailable,
        [
          { text: t.common.cancel, style: "cancel" },
          {
            text: "OK",
            onPress: () => {
              Linking.openURL(`mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(subjectMap[type])}`);
            },
          },
        ]
      );
      return;
    }

    try {
      await MailComposer.composeAsync({
        recipients: [ADMIN_EMAIL],
        subject: subjectMap[type],
        body: t.profile.helpEmailBody,
      });
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }

    if (value && !hasPermission) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          t.notifications.title,
          t.notifications.permissionRequired,
          [
            { text: t.common.cancel, style: "cancel" },
            Platform.OS !== "web"
              ? {
                  text: "Settings",
                  onPress: () => {
                    try {
                      Linking.openSettings();
                    } catch (error) {
                      console.error("Failed to open settings:", error);
                    }
                  },
                }
              : null,
          ].filter(Boolean) as any
        );
        return;
      }
      setHasPermission(true);
    }

    setNotificationsEnabled(value);
    await saveNotificationSettings({ enabled: value, reminderDaysBefore: 1 });

    if (value) {
      try {
        await sendTestNotification(language as "en" | "pt-BR");
      } catch (error) {
        console.error("Error sending test notification:", error);
      }
    }
  };

  const version = Constants.expoConfig?.version || "1.0.0";

  return (
    <ScreenScrollView>
      <View style={styles.profileHeader}>
        <View style={[styles.avatar, { backgroundColor: fullTheme.colors.primary }]}>
          <Feather name="user" size={40} color="#FFFFFF" />
        </View>
        <Spacer height={Spacing.lg} />
        <ThemedText type="h2">{t.profile.inspector}</ThemedText>
        <ThemedText type="body" secondary>
          NFPA 25 Certified
        </ThemedText>
      </View>

      <Spacer height={Spacing["3xl"]} />

      <ThemedText type="h3" style={styles.sectionTitle}>
        {t.profile.certifications}
      </ThemedText>
      <Spacer height={Spacing.md} />
      <View style={[styles.certificationCard, { backgroundColor: fullTheme.colors.cardBackground, borderColor: fullTheme.colors.border }]}>
        <View style={[styles.certBadge, { backgroundColor: `${fullTheme.colors.success}20` }]}>
          <Feather name="award" size={24} color={fullTheme.colors.success} />
        </View>
        <View style={styles.certInfo}>
          <ThemedText type="h4">NFPA 25 ITM</ThemedText>
          <ThemedText type="small" secondary>
            Fire Protection Systems
          </ThemedText>
        </View>
        <Feather name="check-circle" size={20} color={fullTheme.colors.success} />
      </View>

      <Spacer height={Spacing["3xl"]} />

      <ThemedText type="h3" style={styles.sectionTitle}>
        {t.profile.theme}
      </ThemedText>
      <Spacer height={Spacing.md} />

      <View style={[styles.settingsCard, { backgroundColor: fullTheme.colors.cardBackground, borderColor: fullTheme.colors.border }]}>
        <ThemeOption
          icon="sun"
          label={t.profile.themeLight}
          selected={mode === "light"}
          onPress={() => handleThemeChange("light")}
        />
        <ThemeOption
          icon="moon"
          label={t.profile.themeDark}
          selected={mode === "dark"}
          onPress={() => handleThemeChange("dark")}
        />
        <ThemeOption
          icon="smartphone"
          label={t.profile.themeSystem}
          selected={mode === "system"}
          onPress={() => handleThemeChange("system")}
          isLast
        />
      </View>

      <Spacer height={Spacing["3xl"]} />

      <ThemedText type="h3" style={styles.sectionTitle}>
        Settings
      </ThemedText>
      <Spacer height={Spacing.md} />

      <View style={[styles.settingsCard, { backgroundColor: fullTheme.colors.cardBackground, borderColor: fullTheme.colors.border }]}>
        <SettingsRow
          icon="globe"
          label={t.profile.language}
          value={language === "pt-BR" ? "Português (BR)" : "English"}
          onPress={toggleLanguage}
        />
        <SettingsRow
          icon="bell"
          label={t.notifications.title}
          rightElement={
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: fullTheme.colors.border, true: fullTheme.colors.primary }}
              thumbColor={notificationsEnabled ? "#FFFFFF" : "#F4F4F4"}
            />
          }
        />
        <SettingsRow
          icon="info"
          label={t.profile.about}
          onPress={handleAbout}
        />
        <SettingsRow
          icon="help-circle"
          label={t.profile.help}
          onPress={handleHelp}
          isLast
        />
      </View>

      <Spacer height={Spacing["3xl"]} />

      <View style={styles.versionContainer}>
        <ThemedText type="small" secondary>
          {t.profile.version} {version}
        </ThemedText>
      </View>

      <Spacer height={Spacing["4xl"]} />

      <Modal
        visible={helpModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setHelpModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setHelpModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: fullTheme.colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="h3">{t.profile.help}</ThemedText>
              <Pressable onPress={() => setHelpModalVisible(false)}>
                <Feather name="x" size={24} color={fullTheme.colors.textSecondary} />
              </Pressable>
            </View>
            <ThemedText type="body" secondary style={styles.modalSubtitle}>
              {t.profile.helpSubtitle}
            </ThemedText>
            <Spacer height={Spacing.lg} />
            
            <HelpOption
              icon="help-circle"
              label={t.profile.helpQuestion}
              onPress={() => sendHelpEmail("question")}
            />
            <HelpOption
              icon="message-circle"
              label={t.profile.helpComment}
              onPress={() => sendHelpEmail("comment")}
            />
            <HelpOption
              icon="star"
              label={t.profile.helpSuggestion}
              onPress={() => sendHelpEmail("suggestion")}
            />
            <HelpOption
              icon="alert-triangle"
              label={t.profile.helpBugReport}
              onPress={() => sendHelpEmail("bugReport")}
            />
            <HelpOption
              icon="mail"
              label={t.profile.helpOther}
              onPress={() => sendHelpEmail("other")}
              isLast
            />
          </View>
        </Pressable>
      </Modal>
    </ScreenScrollView>
  );
}

interface SettingsRowProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  isLast?: boolean;
  rightElement?: React.ReactNode;
}

function SettingsRow({ icon, label, value, onPress, isLast, rightElement }: SettingsRowProps) {
  const { fullTheme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingsRow,
        !isLast && styles.settingsRowBorder,
        { borderBottomColor: fullTheme.colors.border, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={styles.settingsRowLeft}>
        <Feather name={icon} size={20} color={fullTheme.colors.textSecondary} />
        <ThemedText type="body" style={{ marginLeft: Spacing.md }}>
          {label}
        </ThemedText>
      </View>
      {rightElement ? (
        rightElement
      ) : (
        <View style={styles.settingsRowRight}>
          {value ? (
            <ThemedText type="small" secondary style={{ marginRight: Spacing.sm }}>
              {value}
            </ThemedText>
          ) : null}
          <Feather name="chevron-right" size={20} color={fullTheme.colors.textSecondary} />
        </View>
      )}
    </Pressable>
  );
}

interface ThemeOptionProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  selected: boolean;
  onPress: () => void;
  isLast?: boolean;
}

function ThemeOption({ icon, label, selected, onPress, isLast }: ThemeOptionProps) {
  const { fullTheme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingsRow,
        !isLast && styles.settingsRowBorder,
        { borderBottomColor: fullTheme.colors.border, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={styles.settingsRowLeft}>
        <Feather name={icon} size={20} color={fullTheme.colors.textSecondary} />
        <ThemedText type="body" style={{ marginLeft: Spacing.md }}>
          {label}
        </ThemedText>
      </View>
      <View style={[styles.radioOuter, { borderColor: selected ? fullTheme.colors.primary : fullTheme.colors.border }]}>
        {selected ? <View style={[styles.radioInner, { backgroundColor: fullTheme.colors.primary }]} /> : null}
      </View>
    </Pressable>
  );
}

interface HelpOptionProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  isLast?: boolean;
}

function HelpOption({ icon, label, onPress, isLast }: HelpOptionProps) {
  const { fullTheme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.helpOption,
        !isLast && styles.helpOptionBorder,
        { borderBottomColor: fullTheme.colors.border, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={[styles.helpIconContainer, { backgroundColor: `${fullTheme.colors.primary}15` }]}>
        <Feather name={icon} size={20} color={fullTheme.colors.primary} />
      </View>
      <ThemedText type="body" style={{ marginLeft: Spacing.md, flex: 1 }}>
        {label}
      </ThemedText>
      <Feather name="chevron-right" size={20} color={fullTheme.colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: "center",
    paddingTop: Spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    marginLeft: Spacing.sm,
  },
  certificationCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  certBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  certInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  settingsCard: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    borderWidth: 1,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  settingsRowBorder: {
    borderBottomWidth: 1,
  },
  settingsRowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingsRowRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  versionContainer: {
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalSubtitle: {
    marginTop: Spacing.xs,
  },
  helpOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  helpOptionBorder: {
    borderBottomWidth: 1,
  },
  helpIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
