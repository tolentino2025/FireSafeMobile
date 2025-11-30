import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { cancelInspectionReminder } from "@/utils/notifications";
import { 
  Inspection, 
  Property, 
  Company, 
  AppUser, 
  FirePump,
  FirePumpControlPanel,
  PumpType,
  InspectionStatus,
  InspectionFrequency,
  InspectionType,
  ChecklistItem,
  ChecklistValue,
  NumericField,
  NumericFieldType,
  TextFieldData,
  TestSection,
  InspectionTestData,
  InspectionPhoto,
  SystemInfo,
  GeoLocation,
  MainDrainTestData,
  HydrantFlowTestData,
  PumpTestData,
  DryPipeTripTestData,
  PreactionDelugeTripTestData,
  WaterTankData,
  migrateInspections,
} from "@/types/inspection";

export type {
  InspectionStatus,
  InspectionFrequency,
  InspectionType,
  ChecklistItem,
  ChecklistValue,
  NumericField,
  NumericFieldType,
  TextFieldData,
  TestSection,
  InspectionTestData,
  InspectionPhoto,
  Property,
  Company,
  AppUser,
  Inspection,
  SystemInfo,
  GeoLocation,
  MainDrainTestData,
  HydrantFlowTestData,
  PumpTestData,
  DryPipeTripTestData,
  PreactionDelugeTripTestData,
  WaterTankData,
  FirePump,
  FirePumpControlPanel,
  PumpType,
};

interface InspectionContextType {
  inspections: Inspection[];
  properties: Property[];
  companies: Company[];
  appUsers: AppUser[];
  firePumps: FirePump[];
  firePumpPanels: FirePumpControlPanel[];
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
  addFirePump: (pump: FirePump) => Promise<void>;
  updateFirePump: (id: string, updates: Partial<FirePump>) => Promise<void>;
  deleteFirePump: (id: string) => Promise<void>;
  addFirePumpPanel: (panel: FirePumpControlPanel) => Promise<void>;
  updateFirePumpPanel: (id: string, updates: Partial<FirePumpControlPanel>) => Promise<void>;
  deleteFirePumpPanel: (id: string) => Promise<void>;
  getPropertyById: (id: string) => Property | undefined;
  getCompanyById: (id: string) => Company | undefined;
  getAppUserById: (id: string) => AppUser | undefined;
  getFirePumpById: (id: string) => FirePump | undefined;
  getFirePumpsByCompany: (companyId: string) => FirePump[];
  getFirePumpPanelById: (id: string) => FirePumpControlPanel | undefined;
  getPanelsByPump: (pumpId: string) => FirePumpControlPanel[];
  refreshData: () => Promise<void>;
}

const InspectionContext = createContext<InspectionContextType | undefined>(undefined);

const INSPECTIONS_KEY = "@firesafe_inspections";
const PROPERTIES_KEY = "@firesafe_properties";
const COMPANIES_KEY = "@firesafe_companies";
const APP_USERS_KEY = "@firesafe_app_users";
const FIRE_PUMPS_KEY = "@firesafe_fire_pumps";
const FIRE_PUMP_PANELS_KEY = "@firesafe_fire_pump_panels";
const DATA_VERSION_KEY = "@firesafe_data_version";
const CURRENT_DATA_VERSION = 2;

interface InspectionProviderProps {
  children: ReactNode;
}

export function InspectionProvider({ children }: InspectionProviderProps) {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [appUsers, setAppUsers] = useState<AppUser[]>([]);
  const [firePumps, setFirePumps] = useState<FirePump[]>([]);
  const [firePumpPanels, setFirePumpPanels] = useState<FirePumpControlPanel[]>([]);
  const [currentInspection, setCurrentInspection] = useState<Partial<Inspection> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const storedVersion = await AsyncStorage.getItem(DATA_VERSION_KEY);
      const version = storedVersion ? parseInt(storedVersion, 10) : 1;
      
      const [storedInspections, storedProperties, storedCompanies, storedAppUsers, storedFirePumps, storedFirePumpPanels] = await Promise.all([
        AsyncStorage.getItem(INSPECTIONS_KEY),
        AsyncStorage.getItem(PROPERTIES_KEY),
        AsyncStorage.getItem(COMPANIES_KEY),
        AsyncStorage.getItem(APP_USERS_KEY),
        AsyncStorage.getItem(FIRE_PUMPS_KEY),
        AsyncStorage.getItem(FIRE_PUMP_PANELS_KEY),
      ]);

      if (storedInspections) {
        let parsedInspections = JSON.parse(storedInspections);
        
        if (version < CURRENT_DATA_VERSION) {
          parsedInspections = migrateInspections(parsedInspections);
          await AsyncStorage.setItem(INSPECTIONS_KEY, JSON.stringify(parsedInspections));
          await AsyncStorage.setItem(DATA_VERSION_KEY, String(CURRENT_DATA_VERSION));
        }
        
        setInspections(parsedInspections);
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
      if (storedFirePumps) {
        setFirePumps(JSON.parse(storedFirePumps));
      }
      if (storedFirePumpPanels) {
        setFirePumpPanels(JSON.parse(storedFirePumpPanels));
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
    const inspectionWithVersion = { ...inspection, version: CURRENT_DATA_VERSION };
    const newInspections = [...inspections, inspectionWithVersion];
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

  const saveFirePumps = async (newFirePumps: FirePump[]) => {
    try {
      await AsyncStorage.setItem(FIRE_PUMPS_KEY, JSON.stringify(newFirePumps));
      setFirePumps(newFirePumps);
    } catch (error) {
      console.error("Error saving fire pumps:", error);
      throw error;
    }
  };

  const addFirePump = async (pump: FirePump) => {
    const newFirePumps = [...firePumps, pump];
    await saveFirePumps(newFirePumps);
  };

  const updateFirePump = async (id: string, updates: Partial<FirePump>) => {
    const storedData = await AsyncStorage.getItem(FIRE_PUMPS_KEY);
    const currentFirePumps: FirePump[] = storedData ? JSON.parse(storedData) : [];
    
    const newFirePumps = currentFirePumps.map((pump) =>
      pump.id === id ? { ...pump, ...updates, updatedAt: new Date().toISOString() } : pump
    );
    await saveFirePumps(newFirePumps);
  };

  const deleteFirePump = async (id: string) => {
    const newFirePumps = firePumps.filter((pump) => pump.id !== id);
    await saveFirePumps(newFirePumps);
    const newPanels = firePumpPanels.filter((panel) => panel.pumpId !== id);
    await saveFirePumpPanels(newPanels);
  };

  const getFirePumpById = (id: string) => {
    return firePumps.find((pump) => pump.id === id);
  };

  const getFirePumpsByCompany = (companyId: string) => {
    return firePumps.filter((pump) => pump.companyId === companyId);
  };

  const saveFirePumpPanels = async (newPanels: FirePumpControlPanel[]) => {
    try {
      await AsyncStorage.setItem(FIRE_PUMP_PANELS_KEY, JSON.stringify(newPanels));
      setFirePumpPanels(newPanels);
    } catch (error) {
      console.error("Error saving fire pump panels:", error);
      throw error;
    }
  };

  const addFirePumpPanel = async (panel: FirePumpControlPanel) => {
    const newPanels = [...firePumpPanels, panel];
    await saveFirePumpPanels(newPanels);
  };

  const updateFirePumpPanel = async (id: string, updates: Partial<FirePumpControlPanel>) => {
    const storedData = await AsyncStorage.getItem(FIRE_PUMP_PANELS_KEY);
    const currentPanels: FirePumpControlPanel[] = storedData ? JSON.parse(storedData) : [];
    
    const newPanels = currentPanels.map((panel) =>
      panel.id === id ? { ...panel, ...updates, updatedAt: new Date().toISOString() } : panel
    );
    await saveFirePumpPanels(newPanels);
  };

  const deleteFirePumpPanel = async (id: string) => {
    const newPanels = firePumpPanels.filter((panel) => panel.id !== id);
    await saveFirePumpPanels(newPanels);
  };

  const getFirePumpPanelById = (id: string) => {
    return firePumpPanels.find((panel) => panel.id === id);
  };

  const getPanelsByPump = (pumpId: string) => {
    return firePumpPanels.filter((panel) => panel.pumpId === pumpId);
  };

  return (
    <InspectionContext.Provider
      value={{
        inspections,
        properties,
        companies,
        appUsers,
        firePumps,
        firePumpPanels,
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
        addFirePump,
        updateFirePump,
        deleteFirePump,
        addFirePumpPanel,
        updateFirePumpPanel,
        deleteFirePumpPanel,
        getPropertyById,
        getCompanyById,
        getAppUserById,
        getFirePumpById,
        getFirePumpsByCompany,
        getFirePumpPanelById,
        getPanelsByPump,
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
