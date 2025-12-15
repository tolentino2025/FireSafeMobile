import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import { Language, translations, TranslationKeys } from "@/constants/i18n";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
  timezone: string;
  locale: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = "@firesafe_language";

interface LanguageProviderProps {
  children: ReactNode;
}

function getDeviceLocale(): Language {
  try {
    const locales = Localization.getLocales();
    if (locales && locales.length > 0) {
      const deviceLocale = locales[0].languageTag || locales[0].languageCode || "";
      if (deviceLocale.startsWith("pt")) {
        return "pt-BR";
      }
    }
  } catch (error) {
    console.error("Error getting device locale:", error);
  }
  return "en";
}

function getDeviceTimezone(): string {
  try {
    const calendars = Localization.getCalendars();
    if (calendars && calendars.length > 0 && calendars[0].timeZone) {
      return calendars[0].timeZone;
    }
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>("pt-BR");
  const [timezone, setTimezone] = useState<string>("UTC");
  const [locale, setLocale] = useState<string>("pt-BR");

  useEffect(() => {
    loadLanguage();
    detectLocalization();
  }, []);

  const detectLocalization = () => {
    const detectedTimezone = getDeviceTimezone();
    setTimezone(detectedTimezone);
    
    try {
      const locales = Localization.getLocales();
      if (locales && locales.length > 0) {
        setLocale(locales[0].languageTag || locales[0].languageCode || "pt-BR");
      }
    } catch (error) {
      console.error("Error detecting localization:", error);
    }
  };

  const loadLanguage = async () => {
    try {
      const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (storedLanguage && (storedLanguage === "pt-BR" || storedLanguage === "en")) {
        setLanguageState(storedLanguage);
      } else {
        const deviceLanguage = getDeviceLocale();
        setLanguageState(deviceLanguage);
        await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, deviceLanguage);
      }
    } catch (error) {
      console.error("Error loading language:", error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      setLanguageState(lang);
    } catch (error) {
      console.error("Error saving language:", error);
    }
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, timezone, locale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
