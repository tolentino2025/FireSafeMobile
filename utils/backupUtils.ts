import { writeAsStringAsync, readAsStringAsync, cacheDirectory } from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const STORAGE_KEYS = [
  "@firesafe_inspections",
  "@firesafe_properties", 
  "@firesafe_companies",
  "@firesafe_app_users",
  "@firesafe_technical_responsibles",
  "@firesafe_fire_pumps",
  "@firesafe_fire_pump_panels",
  "@firesafe_schedules",
  "@firesafe_contractors",
  "@firesafe_job_sites",
  "@firesafe_diesel_performance_tests",
  "@firesafe_electric_performance_tests",
  "@firesafe_data_version",
  "@firesafe_license",
];

export interface BackupData {
  version: string;
  timestamp: string;
  appVersion: string;
  data: Record<string, any>;
}

export async function exportAllData(): Promise<{ success: boolean; filePath?: string; error?: string }> {
  try {
    const backupData: BackupData = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      appVersion: "1.0.0",
      data: {},
    };

    for (const key of STORAGE_KEYS) {
      try {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          backupData.data[key] = JSON.parse(value);
        }
      } catch (e) {
        console.log(`Could not read key ${key}:`, e);
      }
    }

    const jsonString = JSON.stringify(backupData, null, 2);
    const dateStr = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const fileName = `FireSafeITM_Backup_${dateStr}.json`;
    const docDir = cacheDirectory || "";
    const filePath = `${docDir}${fileName}`;

    await writeAsStringAsync(filePath, jsonString);

    if (Platform.OS !== "web") {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(filePath, {
          mimeType: "application/json",
          dialogTitle: "Exportar Backup FireSafe ITM",
          UTI: "public.json",
        });
      }
    }

    return { success: true, filePath };
  } catch (error) {
    console.error("Export error:", error);
    return { success: false, error: String(error) };
  }
}

export async function importAllData(): Promise<{ 
  success: boolean; 
  error?: string;
  counts?: {
    inspections: number;
    companies: number;
    appUsers: number;
    properties: number;
    firePumps: number;
  };
}> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/json",
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return { success: false, error: "cancelled" };
    }

    const fileUri = result.assets[0].uri;
    const fileContent = await readAsStringAsync(fileUri);

    const backupData: BackupData = JSON.parse(fileContent);

    if (!backupData.version || !backupData.data) {
      return { success: false, error: "invalid_format" };
    }

    const counts = {
      inspections: 0,
      companies: 0,
      appUsers: 0,
      properties: 0,
      firePumps: 0,
    };

    for (const key of STORAGE_KEYS) {
      try {
        await AsyncStorage.removeItem(key);
      } catch (e) {
        console.log(`Could not clear key ${key}:`, e);
      }
    }

    for (const [key, value] of Object.entries(backupData.data)) {
      if (STORAGE_KEYS.includes(key)) {
        await AsyncStorage.setItem(key, JSON.stringify(value));
        
        if (key === "@firesafe_inspections" && Array.isArray(value)) {
          counts.inspections = value.length;
        } else if (key === "@firesafe_companies" && Array.isArray(value)) {
          counts.companies = value.length;
        } else if (key === "@firesafe_app_users" && Array.isArray(value)) {
          counts.appUsers = value.length;
        } else if (key === "@firesafe_properties" && Array.isArray(value)) {
          counts.properties = value.length;
        } else if (key === "@firesafe_fire_pumps" && Array.isArray(value)) {
          counts.firePumps = value.length;
        }
      }
    }

    return { success: true, counts };
  } catch (error) {
    console.error("Import error:", error);
    return { success: false, error: String(error) };
  }
}

export async function getDataSummary(): Promise<{
  inspections: number;
  companies: number;
  appUsers: number;
  properties: number;
  firePumps: number;
}> {
  const counts = {
    inspections: 0,
    companies: 0,
    appUsers: 0,
    properties: 0,
    firePumps: 0,
  };

  try {
    const inspections = await AsyncStorage.getItem("@firesafe_inspections");
    if (inspections) counts.inspections = JSON.parse(inspections).length;

    const companies = await AsyncStorage.getItem("@firesafe_companies");
    if (companies) counts.companies = JSON.parse(companies).length;

    const appUsers = await AsyncStorage.getItem("@firesafe_app_users");
    if (appUsers) counts.appUsers = JSON.parse(appUsers).length;

    const properties = await AsyncStorage.getItem("@firesafe_properties");
    if (properties) counts.properties = JSON.parse(properties).length;

    const firePumps = await AsyncStorage.getItem("@firesafe_fire_pumps");
    if (firePumps) counts.firePumps = JSON.parse(firePumps).length;
  } catch (e) {
    console.error("Error getting data summary:", e);
  }

  return counts;
}
