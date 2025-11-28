import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, Switch, Alert, Linking, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as Haptics from "expo-haptics";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { Spacing, BorderRadius, AppColors } from "@/constants/theme";
import {
  getNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermissions,
  checkNotificationPermissions,
  sendTestNotification,
} from "@/utils/notifications";

export default function ProfileScreen() {
  const { theme, isDark } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

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

  const handleAbout = () => {
    Alert.alert(
      "FireSafe ITM",
      "Sistema de Inspeção, Teste e Manutenção NFPA 25\n\nVersion: 1.0.0\n\nCompliance with NFPA 25 standards for fire protection systems inspection.",
      [{ text: "OK" }]
    );
  };

  const handleHelp = () => {
    Alert.alert(
      t.profile.help,
      "For support, please contact:\nsupport@firesafeitm.com",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send Email",
          onPress: () => {
            Linking.openURL("mailto:support@firesafeitm.com");
          },
        },
      ]
    );
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
        <View style={[styles.avatar, { backgroundColor: AppColors.primary }]}>
          <Feather name="user" size={40} color="#FFFFFF" />
        </View>
        <Spacer height={Spacing.lg} />
        <ThemedText type="h2">{t.profile.inspector}</ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          NFPA 25 Certified
        </ThemedText>
      </View>

      <Spacer height={Spacing["3xl"]} />

      <ThemedText type="h3" style={styles.sectionTitle}>
        {t.profile.certifications}
      </ThemedText>
      <Spacer height={Spacing.md} />
      <View style={[styles.certificationCard, { backgroundColor: theme.backgroundDefault }]}>
        <View style={[styles.certBadge, { backgroundColor: `${AppColors.success}20` }]}>
          <Feather name="award" size={24} color={AppColors.success} />
        </View>
        <View style={styles.certInfo}>
          <ThemedText type="h4">NFPA 25 ITM</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Fire Protection Systems
          </ThemedText>
        </View>
        <Feather name="check-circle" size={20} color={AppColors.success} />
      </View>

      <Spacer height={Spacing["3xl"]} />

      <ThemedText type="h3" style={styles.sectionTitle}>
        Settings
      </ThemedText>
      <Spacer height={Spacing.md} />

      <View style={[styles.settingsCard, { backgroundColor: theme.backgroundDefault }]}>
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
              trackColor={{ false: theme.border, true: AppColors.primary }}
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
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {t.profile.version} {version}
        </ThemedText>
      </View>

      <Spacer height={Spacing["4xl"]} />
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
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingsRow,
        !isLast && styles.settingsRowBorder,
        { borderBottomColor: theme.border, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={styles.settingsRowLeft}>
        <Feather name={icon} size={20} color={theme.textSecondary} />
        <ThemedText type="body" style={{ marginLeft: Spacing.md }}>
          {label}
        </ThemedText>
      </View>
      {rightElement ? (
        rightElement
      ) : (
        <View style={styles.settingsRowRight}>
          {value && (
            <ThemedText type="small" style={{ color: theme.textSecondary, marginRight: Spacing.sm }}>
              {value}
            </ThemedText>
          )}
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </View>
      )}
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
  versionContainer: {
    alignItems: "center",
  },
});
