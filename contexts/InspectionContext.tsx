import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { cancelInspectionReminder } from "@/utils/notifications";

export type InspectionStatus = "pending" | "in_progress" | "completed";
export type InspectionFrequency = "daily" | "weekly" | "monthly" | "quarterly" | "annually" | "five_years";

export type InspectionType = 
  | "wet_pipe" | "dry_pipe" | "preaction_deluge" | "foam_water" | "water_spray" | "water_mist"
  | "pump_weekly" | "pump_monthly" | "pump_annual"
  | "aboveground" | "underground" | "hydrant_flow"
  | "water_tank" | "hazard_eval" | "standpipe";

export interface ChecklistItem {
  id: string;
  label: string;
  value: "yes" | "no" | "na" | null;
  psiValue?: string;
  notes?: string;
}

export interface InspectionPhoto {
  id: string;
  uri: string;
  base64?: string;
  caption: string;
  timestamp: string;
}

export interface Company {
  id: string;
  name: string;
  cnpj: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  phone: string;
  contact: string;
  companyId: string;
}

export interface Inspection {
  id: string;
  type: InspectionType;
  status: InspectionStatus;
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  propertyPhone: string;
  inspectorName: string;
  contractNo: string;
  date: string;
  frequency: InspectionFrequency;
  checklist: ChecklistItem[];
  observations: string;
  signature: string | null;
  photos: InspectionPhoto[];
  scheduledDate?: string;
  notificationId?: string;
  companyId?: string;
  companyData?: Company;
  inspectorId?: string;
  inspectorData?: AppUser;
  createdAt: string;
  updatedAt: string;
}

interface InspectionContextType {
  inspections: Inspection[];
  properties: Property[];
  companies: Company[];
  appUsers: AppUser[];
  currentInspection: Partial<Inspection> | null;
  isLoading: boolean;
  addInspection: (inspection: Inspection) => Promise<void>;
  updateInspection: (id: string, updates: Partial<Inspection>) => Promise<void>;
  deleteInspection: (id: string) => Promise<void>;
  setCurrentInspection: (inspection: Partial<Inspection> | null) => void;
  addProperty: (property: Property) => Promise<void>;
  updateProperty: (id: string, updates: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  addCompany: (company: Company) => Promise<void>;
  updateCompany: (id: string, updates: Partial<Company>) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
  addAppUser: (user: AppUser) => Promise<void>;
  updateAppUser: (id: string, updates: Partial<AppUser>) => Promise<void>;
  deleteAppUser: (id: string) => Promise<void>;
  getPropertyById: (id: string) => Property | undefined;
  getCompanyById: (id: string) => Company | undefined;
  getAppUserById: (id: string) => AppUser | undefined;
  refreshData: () => Promise<void>;
}

const InspectionContext = createContext<InspectionContextType | undefined>(undefined);

const INSPECTIONS_KEY = "@firesafe_inspections";
const PROPERTIES_KEY = "@firesafe_properties";
const COMPANIES_KEY = "@firesafe_companies";
const APP_USERS_KEY = "@firesafe_app_users";

interface InspectionProviderProps {
  children: ReactNode;
}

export function InspectionProvider({ children }: InspectionProviderProps) {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [appUsers, setAppUsers] = useState<AppUser[]>([]);
  const [currentInspection, setCurrentInspection] = useState<Partial<Inspection> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [storedInspections, storedProperties, storedCompanies, storedAppUsers] = await Promise.all([
        AsyncStorage.getItem(INSPECTIONS_KEY),
        AsyncStorage.getItem(PROPERTIES_KEY),
        AsyncStorage.getItem(COMPANIES_KEY),
        AsyncStorage.getItem(APP_USERS_KEY),
      ]);

      if (storedInspections) {
        setInspections(JSON.parse(storedInspections));
      }
      if (storedProperties) {
        setProperties(JSON.parse(storedProperties));
      }
      if (storedCompanies) {
        setCompanies(JSON.parse(storedCompanies));
      }
      if (storedAppUsers) {
        setAppUsers(JSON.parse(storedAppUsers));
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    await loadData();
  };

  const saveInspections = async (newInspections: Inspection[]) => {
    try {
      await AsyncStorage.setItem(INSPECTIONS_KEY, JSON.stringify(newInspections));
      setInspections(newInspections);
    } catch (error) {
      console.error("Error saving inspections:", error);
      throw error;
    }
  };

  const addInspection = async (inspection: Inspection) => {
    const newInspections = [...inspections, inspection];
    await saveInspections(newInspections);
  };

  const updateInspection = async (id: string, updates: Partial<Inspection>) => {
    const storedData = await AsyncStorage.getItem(INSPECTIONS_KEY);
    const currentInspections: Inspection[] = storedData ? JSON.parse(storedData) : [];
    
    const newInspections = currentInspections.map((insp) =>
      insp.id === id ? { ...insp, ...updates, updatedAt: new Date().toISOString() } : insp
    );
    await saveInspections(newInspections);
  };

  const deleteInspection = async (id: string) => {
    const inspectionToDelete = inspections.find((insp) => insp.id === id);
    
    if (inspectionToDelete?.notificationId) {
      await cancelInspectionReminder(inspectionToDelete.notificationId, true);
    } else {
      await cancelInspectionReminder(id);
    }
    
    const newInspections = inspections.filter((insp) => insp.id !== id);
    await saveInspections(newInspections);
  };

  const saveProperties = async (newProperties: Property[]) => {
    try {
      await AsyncStorage.setItem(PROPERTIES_KEY, JSON.stringify(newProperties));
      setProperties(newProperties);
    } catch (error) {
      console.error("Error saving properties:", error);
      throw error;
    }
  };

  const addProperty = async (property: Property) => {
    const newProperties = [...properties, property];
    await saveProperties(newProperties);
  };

  const updateProperty = async (id: string, updates: Partial<Property>) => {
    const newProperties = properties.map((prop) =>
      prop.id === id ? { ...prop, ...updates } : prop
    );
    await saveProperties(newProperties);
  };

  const deleteProperty = async (id: string) => {
    const newProperties = properties.filter((prop) => prop.id !== id);
    await saveProperties(newProperties);
  };

  const getPropertyById = (id: string) => {
    return properties.find((prop) => prop.id === id);
  };

  const saveCompanies = async (newCompanies: Company[]) => {
    try {
      await AsyncStorage.setItem(COMPANIES_KEY, JSON.stringify(newCompanies));
      setCompanies(newCompanies);
    } catch (error) {
      console.error("Error saving companies:", error);
      throw error;
    }
  };

  const addCompany = async (company: Company) => {
    const newCompanies = [...companies, company];
    await saveCompanies(newCompanies);
  };

  const updateCompany = async (id: string, updates: Partial<Company>) => {
    const storedData = await AsyncStorage.getItem(COMPANIES_KEY);
    const currentCompanies: Company[] = storedData ? JSON.parse(storedData) : [];
    
    const newCompanies = currentCompanies.map((comp) =>
      comp.id === id ? { ...comp, ...updates, updatedAt: new Date().toISOString() } : comp
    );
    await saveCompanies(newCompanies);
  };

  const deleteCompany = async (id: string) => {
    const newCompanies = companies.filter((comp) => comp.id !== id);
    await saveCompanies(newCompanies);
  };

  const getCompanyById = (id: string) => {
    return companies.find((comp) => comp.id === id);
  };

  const saveAppUsers = async (newAppUsers: AppUser[]) => {
    try {
      await AsyncStorage.setItem(APP_USERS_KEY, JSON.stringify(newAppUsers));
      setAppUsers(newAppUsers);
    } catch (error) {
      console.error("Error saving app users:", error);
      throw error;
    }
  };

  const addAppUser = async (user: AppUser) => {
    const newAppUsers = [...appUsers, user];
    await saveAppUsers(newAppUsers);
  };

  const updateAppUser = async (id: string, updates: Partial<AppUser>) => {
    const storedData = await AsyncStorage.getItem(APP_USERS_KEY);
    const currentAppUsers: AppUser[] = storedData ? JSON.parse(storedData) : [];
    
    const newAppUsers = currentAppUsers.map((user) =>
      user.id === id ? { ...user, ...updates, updatedAt: new Date().toISOString() } : user
    );
    await saveAppUsers(newAppUsers);
  };

  const deleteAppUser = async (id: string) => {
    const newAppUsers = appUsers.filter((user) => user.id !== id);
    await saveAppUsers(newAppUsers);
  };

  const getAppUserById = (id: string) => {
    return appUsers.find((user) => user.id === id);
  };

  return (
    <InspectionContext.Provider
      value={{
        inspections,
        properties,
        companies,
        appUsers,
        currentInspection,
        isLoading,
        addInspection,
        updateInspection,
        deleteInspection,
        setCurrentInspection,
        addProperty,
        updateProperty,
        deleteProperty,
        addCompany,
        updateCompany,
        deleteCompany,
        addAppUser,
        updateAppUser,
        deleteAppUser,
        getPropertyById,
        getCompanyById,
        getAppUserById,
        refreshData,
      }}
    >
      {children}
    </InspectionContext.Provider>
  );
}

export function useInspections() {
  const context = useContext(InspectionContext);
  if (context === undefined) {
    throw new Error("useInspections must be used within an InspectionProvider");
  }
  return context;
}
