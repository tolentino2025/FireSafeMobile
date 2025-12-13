import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  LicenseData,
  LicenseValidationResult,
  validateLicenseKeyFormat,
  checkLicenseExpiration,
  createLicenseData,
} from "@/utils/licenseUtils";
import {
  scheduleLicenseExpirationReminders,
  cancelLicenseExpirationReminders,
} from "@/utils/notifications";

const LICENSE_STORAGE_KEY = "@firesafe_license";

interface LicenseContextType {
  licenseData: LicenseData | null;
  licenseStatus: LicenseValidationResult | null;
  isLoading: boolean;
  activateLicense: (key: string, language?: "en" | "pt-BR") => Promise<{ success: boolean; error?: string }>;
  clearLicense: () => Promise<void>;
  refreshLicenseStatus: () => void;
  scheduleExpirationNotifications: (language: "en" | "pt-BR") => Promise<void>;
}

const LicenseContext = createContext<LicenseContextType | undefined>(undefined);

export function LicenseProvider({ children }: { children: ReactNode }) {
  const [licenseData, setLicenseData] = useState<LicenseData | null>(null);
  const [licenseStatus, setLicenseStatus] = useState<LicenseValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLicense();
  }, []);

  const loadLicense = async () => {
    try {
      const storedLicense = await AsyncStorage.getItem(LICENSE_STORAGE_KEY);
      if (storedLicense) {
        const data: LicenseData = JSON.parse(storedLicense);
        setLicenseData(data);
        const status = checkLicenseExpiration(data);
        setLicenseStatus(status);
      } else {
        setLicenseData(null);
        setLicenseStatus(null);
      }
    } catch (error) {
      console.error("Error loading license:", error);
      setLicenseData(null);
      setLicenseStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  const activateLicense = async (key: string, language: "en" | "pt-BR" = "pt-BR"): Promise<{ success: boolean; error?: string }> => {
    const isValidFormat = validateLicenseKeyFormat(key);
    
    if (!isValidFormat) {
      return { success: false, error: "invalid_key" };
    }

    try {
      const newLicenseData = createLicenseData(key);
      await AsyncStorage.setItem(LICENSE_STORAGE_KEY, JSON.stringify(newLicenseData));
      setLicenseData(newLicenseData);
      const status = checkLicenseExpiration(newLicenseData);
      setLicenseStatus(status);
      
      await scheduleLicenseExpirationReminders({
        expirationDate: newLicenseData.expiresAt,
        language,
      });
      
      return { success: true };
    } catch (error) {
      console.error("Error saving license:", error);
      return { success: false, error: "save_error" };
    }
  };

  const clearLicense = async () => {
    try {
      await AsyncStorage.removeItem(LICENSE_STORAGE_KEY);
      await cancelLicenseExpirationReminders();
      setLicenseData(null);
      setLicenseStatus(null);
    } catch (error) {
      console.error("Error clearing license:", error);
    }
  };

  const refreshLicenseStatus = () => {
    if (licenseData) {
      const status = checkLicenseExpiration(licenseData);
      setLicenseStatus(status);
    }
  };

  const scheduleExpirationNotifications = async (language: "en" | "pt-BR") => {
    if (licenseData && licenseStatus?.isValid) {
      await scheduleLicenseExpirationReminders({
        expirationDate: licenseData.expiresAt,
        language,
      });
    }
  };

  return (
    <LicenseContext.Provider
      value={{
        licenseData,
        licenseStatus,
        isLoading,
        activateLicense,
        clearLicense,
        refreshLicenseStatus,
        scheduleExpirationNotifications,
      }}
    >
      {children}
    </LicenseContext.Provider>
  );
}

export function useLicense() {
  const context = useContext(LicenseContext);
  if (context === undefined) {
    throw new Error("useLicense must be used within a LicenseProvider");
  }
  return context;
}
