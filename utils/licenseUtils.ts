import * as Application from "expo-application";
import * as Device from "expo-device";
import { Platform } from "react-native";

const LICENSE_PREFIX = "FIRE";

const LICENSE_API_URL = __DEV__ 
  ? "https://firesafe-itm-mauromelo.replit.app/api"
  : "https://firesafe-itm-mauromelo.replit.app/api";

export interface LicenseData {
  key: string;
  activatedAt: string;
  expiresAt: string;
  validityMonths: number;
}

export interface LicenseValidationResult {
  isValid: boolean;
  isExpired: boolean;
  daysRemaining: number;
  expirationDate: string | null;
  errorMessage?: string;
}

export interface LicenseKeyValidation {
  valid: boolean;
  validityMonths?: number;
  error?: string;
}

export function validateLicenseKeyFormat(key: string): boolean {
  if (!key || typeof key !== "string") return false;
  
  const normalizedKey = key.toUpperCase().trim();
  const pattern = /^FIRE-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  
  if (!pattern.test(normalizedKey)) return false;
  
  const parts = normalizedKey.split("-");
  if (parts[0] !== LICENSE_PREFIX) return false;
  
  return true;
}

export function validateLicenseKeyCrypto(key: string): LicenseKeyValidation {
  const normalizedKey = key.toUpperCase().trim();
  const pattern = /^FIRE-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  
  if (!pattern.test(normalizedKey)) {
    return { valid: false, error: 'invalid_format' };
  }

  const parts = normalizedKey.split('-');
  if (parts[0] !== LICENSE_PREFIX) {
    return { valid: false, error: 'invalid_prefix' };
  }

  return { valid: true };
}

export function generateLicenseKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  
  const generatePart = () => {
    let part = "";
    for (let i = 0; i < 4; i++) {
      part += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return part;
  };
  
  const part1 = generatePart();
  const part2 = generatePart();
  
  let sum = 0;
  for (let i = 0; i < part1.length; i++) {
    sum += part1.charCodeAt(i);
  }
  for (let i = 0; i < part2.length; i++) {
    sum += part2.charCodeAt(i);
  }
  
  const checksumChar = String.fromCharCode(65 + (sum % 26));
  const part3 = checksumChar + generatePart().substring(1);
  
  return `${LICENSE_PREFIX}-${part1}-${part2}-${part3}`;
}

export function calculateExpirationDate(activatedAt: Date, validityMonths: number = 6): Date {
  const expirationDate = new Date(activatedAt);
  expirationDate.setMonth(expirationDate.getMonth() + validityMonths);
  return expirationDate;
}

export function checkLicenseExpiration(licenseData: LicenseData): LicenseValidationResult {
  const now = new Date();
  const expirationDate = new Date(licenseData.expiresAt);
  
  const isExpired = now > expirationDate;
  const timeDiff = expirationDate.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
  
  return {
    isValid: !isExpired,
    isExpired,
    daysRemaining,
    expirationDate: licenseData.expiresAt,
  };
}

export function formatDate(dateString: string, language: "pt-BR" | "en"): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(language === "pt-BR" ? "pt-BR" : "en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function createLicenseData(key: string, validityMonths: number = 6): LicenseData {
  const activatedAt = new Date();
  const expiresAt = calculateExpirationDate(activatedAt, validityMonths);
  
  return {
    key: key.toUpperCase().trim(),
    activatedAt: activatedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    validityMonths,
  };
}

export async function getDeviceId(): Promise<string> {
  try {
    if (Platform.OS === "ios") {
      const iosId = await Application.getIosIdForVendorAsync();
      if (iosId) return iosId;
    }
    
    if (Platform.OS === "android") {
      const androidId = Application.androidId;
      if (androidId) return androidId;
    }
    
    const deviceName = Device.deviceName || "unknown";
    const brand = Device.brand || "unknown";
    const model = Device.modelName || "unknown";
    const osVersion = Device.osVersion || "unknown";
    const fallbackId = `${brand}-${model}-${deviceName}-${osVersion}`.replace(/\s/g, "_");
    
    if (fallbackId !== "unknown-unknown-unknown-unknown") {
      return fallbackId;
    }
    
    return `web-${Math.random().toString(36).substring(2, 15)}`;
  } catch (error) {
    console.error("Error getting device ID:", error);
    return `web-${Math.random().toString(36).substring(2, 15)}`;
  }
}

export interface ApiActivationResult {
  success: boolean;
  validityMonths?: number;
  activatedAt?: string;
  expiresAt?: string;
  error?: string;
}

export async function activateLicenseWithApi(
  licenseKey: string,
  deviceId: string
): Promise<ApiActivationResult> {
  try {
    const response = await fetch(`${LICENSE_API_URL}/license/activate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        licenseKey: licenseKey.toUpperCase().trim(),
        deviceId,
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || "activation_failed",
      };
    }
    
    return {
      success: true,
      validityMonths: data.validityMonths,
      activatedAt: data.activatedAt,
      expiresAt: data.expiresAt,
    };
  } catch (error) {
    console.error("API activation error:", error);
    return {
      success: false,
      error: "network_error",
    };
  }
}

export async function validateLicenseWithApi(
  licenseKey: string,
  deviceId: string
): Promise<ApiActivationResult> {
  try {
    const response = await fetch(`${LICENSE_API_URL}/license/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        licenseKey: licenseKey.toUpperCase().trim(),
        deviceId,
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || "validation_failed",
      };
    }
    
    return {
      success: true,
      validityMonths: data.validityMonths,
      activatedAt: data.activatedAt,
      expiresAt: data.expiresAt,
    };
  } catch (error) {
    console.error("API validation error:", error);
    return {
      success: false,
      error: "network_error",
    };
  }
}
