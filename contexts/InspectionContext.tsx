import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { cancelInspectionReminder, scheduleNotificationForSchedule, cancelScheduleNotification } from "@/utils/notifications";
import { addInterval, generateScheduleId, getFrequencyLabel, getInspectionTypeLabel } from "@/utils/scheduleUtils";
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
  InspectionSchedule,
  Contractor,
  JobSite,
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
  InspectionSchedule,
  Contractor,
  JobSite,
};

interface InspectionContextType {
  inspections: Inspection[];
  properties: Property[];
  companies: Company[];
  appUsers: AppUser[];
  firePumps: FirePump[];
  firePumpPanels: FirePumpControlPanel[];
  schedules: InspectionSchedule[];
  contractors: Contractor[];
  jobSites: JobSite[];
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
  addContractor: (contractor: Contractor) => Promise<void>;
  updateContractor: (id: string, updates: Partial<Contractor>) => Promise<void>;
  deleteContractor: (id: string) => Promise<void>;
  addJobSite: (jobSite: JobSite) => Promise<void>;
  updateJobSite: (id: string, updates: Partial<JobSite>) => Promise<void>;
  deleteJobSite: (id: string) => Promise<void>;
  getPropertyById: (id: string) => Property | undefined;
  getCompanyById: (id: string) => Company | undefined;
  getAppUserById: (id: string) => AppUser | undefined;
  getFirePumpById: (id: string) => FirePump | undefined;
  getFirePumpsByCompany: (companyId: string) => FirePump[];
  getFirePumpPanelById: (id: string) => FirePumpControlPanel | undefined;
  getPanelsByPump: (pumpId: string) => FirePumpControlPanel[];
  getContractorById: (id: string) => Contractor | undefined;
  getJobSiteById: (id: string) => JobSite | undefined;
  getJobSitesByContractor: (contractorId: string) => JobSite[];
  createOrUpdateScheduleForInspection: (inspection: Inspection, language: "en" | "pt-BR") => Promise<void>;
  refreshData: () => Promise<void>;
}

const InspectionContext = createContext<InspectionContextType | undefined>(undefined);

const INSPECTIONS_KEY = "@firesafe_inspections";
const PROPERTIES_KEY = "@firesafe_properties";
const COMPANIES_KEY = "@firesafe_companies";
const APP_USERS_KEY = "@firesafe_app_users";
const FIRE_PUMPS_KEY = "@firesafe_fire_pumps";
const FIRE_PUMP_PANELS_KEY = "@firesafe_fire_pump_panels";
const SCHEDULES_KEY = "@firesafe_schedules";
const CONTRACTORS_KEY = "@firesafe_contractors";
const JOB_SITES_KEY = "@firesafe_job_sites";
const DATA_VERSION_KEY = "@firesafe_data_version";
const CURRENT_DATA_VERSION = 3;

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
  const [schedules, setSchedules] = useState<InspectionSchedule[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [jobSites, setJobSites] = useState<JobSite[]>([]);
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
      
      const [storedInspections, storedProperties, storedCompanies, storedAppUsers, storedFirePumps, storedFirePumpPanels, storedSchedules, storedContractors, storedJobSites] = await Promise.all([
        AsyncStorage.getItem(INSPECTIONS_KEY),
        AsyncStorage.getItem(PROPERTIES_KEY),
        AsyncStorage.getItem(COMPANIES_KEY),
        AsyncStorage.getItem(APP_USERS_KEY),
        AsyncStorage.getItem(FIRE_PUMPS_KEY),
        AsyncStorage.getItem(FIRE_PUMP_PANELS_KEY),
        AsyncStorage.getItem(SCHEDULES_KEY),
        AsyncStorage.getItem(CONTRACTORS_KEY),
        AsyncStorage.getItem(JOB_SITES_KEY),
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
      if (storedSchedules) {
        setSchedules(JSON.parse(storedSchedules));
      }
      if (storedContractors) {
        setContractors(JSON.parse(storedContractors));
      }
      if (storedJobSites) {
        setJobSites(JSON.parse(storedJobSites));
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
    const storedData = await AsyncStorage.getItem(FIRE_PUMPS_KEY);
    const currentFirePumps: FirePump[] = storedData ? JSON.parse(storedData) : [];
    const newFirePumps = [...currentFirePumps, pump];
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
    const storedPumps = await AsyncStorage.getItem(FIRE_PUMPS_KEY);
    const currentFirePumps: FirePump[] = storedPumps ? JSON.parse(storedPumps) : [];
    const newFirePumps = currentFirePumps.filter((pump) => pump.id !== id);
    await saveFirePumps(newFirePumps);
    
    const storedPanels = await AsyncStorage.getItem(FIRE_PUMP_PANELS_KEY);
    const currentPanels: FirePumpControlPanel[] = storedPanels ? JSON.parse(storedPanels) : [];
    const newPanels = currentPanels.filter((panel) => panel.pumpId !== id);
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

  const saveContractors = async (newContractors: Contractor[]) => {
    try {
      await AsyncStorage.setItem(CONTRACTORS_KEY, JSON.stringify(newContractors));
      setContractors(newContractors);
    } catch (error) {
      console.error("Error saving contractors:", error);
      throw error;
    }
  };

  const addContractor = async (contractor: Contractor) => {
    const storedData = await AsyncStorage.getItem(CONTRACTORS_KEY);
    const currentContractors: Contractor[] = storedData ? JSON.parse(storedData) : [];
    const newContractors = [...currentContractors, contractor];
    await saveContractors(newContractors);
  };

  const updateContractor = async (id: string, updates: Partial<Contractor>) => {
    const storedData = await AsyncStorage.getItem(CONTRACTORS_KEY);
    const currentContractors: Contractor[] = storedData ? JSON.parse(storedData) : [];
    
    const newContractors = currentContractors.map((contractor) =>
      contractor.id === id ? { ...contractor, ...updates, updatedAt: new Date().toISOString() } : contractor
    );
    await saveContractors(newContractors);
  };

  const deleteContractor = async (id: string) => {
    const storedData = await AsyncStorage.getItem(CONTRACTORS_KEY);
    const currentContractors: Contractor[] = storedData ? JSON.parse(storedData) : [];
    const newContractors = currentContractors.filter((contractor) => contractor.id !== id);
    await saveContractors(newContractors);
    
    const storedJobs = await AsyncStorage.getItem(JOB_SITES_KEY);
    const currentJobSites: JobSite[] = storedJobs ? JSON.parse(storedJobs) : [];
    const newJobSites = currentJobSites.filter((job) => job.contractorId !== id);
    await saveJobSites(newJobSites);
  };

  const getContractorById = (id: string) => {
    return contractors.find((contractor) => contractor.id === id);
  };

  const saveJobSites = async (newJobSites: JobSite[]) => {
    try {
      await AsyncStorage.setItem(JOB_SITES_KEY, JSON.stringify(newJobSites));
      setJobSites(newJobSites);
    } catch (error) {
      console.error("Error saving job sites:", error);
      throw error;
    }
  };

  const addJobSite = async (jobSite: JobSite) => {
    const storedData = await AsyncStorage.getItem(JOB_SITES_KEY);
    const currentJobSites: JobSite[] = storedData ? JSON.parse(storedData) : [];
    const newJobSites = [...currentJobSites, jobSite];
    await saveJobSites(newJobSites);
  };

  const updateJobSite = async (id: string, updates: Partial<JobSite>) => {
    const storedData = await AsyncStorage.getItem(JOB_SITES_KEY);
    const currentJobSites: JobSite[] = storedData ? JSON.parse(storedData) : [];
    
    const newJobSites = currentJobSites.map((jobSite) =>
      jobSite.id === id ? { ...jobSite, ...updates, updatedAt: new Date().toISOString() } : jobSite
    );
    await saveJobSites(newJobSites);
  };

  const deleteJobSite = async (id: string) => {
    const storedData = await AsyncStorage.getItem(JOB_SITES_KEY);
    const currentJobSites: JobSite[] = storedData ? JSON.parse(storedData) : [];
    const newJobSites = currentJobSites.filter((jobSite) => jobSite.id !== id);
    await saveJobSites(newJobSites);
  };

  const getJobSiteById = (id: string) => {
    return jobSites.find((jobSite) => jobSite.id === id);
  };

  const getJobSitesByContractor = (contractorId: string) => {
    return jobSites.filter((jobSite) => jobSite.contractorId === contractorId);
  };

  const saveSchedules = async (newSchedules: InspectionSchedule[]) => {
    try {
      await AsyncStorage.setItem(SCHEDULES_KEY, JSON.stringify(newSchedules));
      setSchedules(newSchedules);
    } catch (error) {
      console.error("Error saving schedules:", error);
      throw error;
    }
  };

  const createOrUpdateScheduleForInspection = async (inspection: Inspection, language: "en" | "pt-BR") => {
    try {
      const storedData = await AsyncStorage.getItem(SCHEDULES_KEY);
      const currentSchedules: InspectionSchedule[] = storedData ? JSON.parse(storedData) : [];

      const existingSchedule = currentSchedules.find(
        (s) =>
          s.isActive &&
          s.inspectionType === inspection.type &&
          s.frequency === inspection.frequency &&
          (s.companyId || "") === (inspection.companyId || "") &&
          (s.propertyId || "") === (inspection.propertyId || "") &&
          (s.firePumpId || "") === (inspection.firePumpId || "")
      );

      const inspectionDate = new Date(inspection.date);
      const nextDueDate = addInterval(inspectionDate, inspection.frequency);
      const now = new Date().toISOString();

      let newSchedules: InspectionSchedule[];
      let scheduleId: string;

      if (existingSchedule) {
        scheduleId = existingSchedule.id;
        newSchedules = currentSchedules.map((s) =>
          s.id === existingSchedule.id
            ? {
                ...s,
                lastInspectionDate: inspection.date,
                nextDueDate: nextDueDate.toISOString(),
                updatedAt: now,
              }
            : s
        );
      } else {
        scheduleId = generateScheduleId();
        const newSchedule: InspectionSchedule = {
          id: scheduleId,
          companyId: inspection.companyId,
          propertyId: inspection.propertyId,
          firePumpId: inspection.firePumpId,
          inspectionType: inspection.type,
          frequency: inspection.frequency,
          startDate: inspection.date,
          lastInspectionDate: inspection.date,
          nextDueDate: nextDueDate.toISOString(),
          isActive: true,
          createdAt: now,
          updatedAt: now,
        };
        newSchedules = [...currentSchedules, newSchedule];
      }

      await saveSchedules(newSchedules);

      const company = inspection.companyId ? companies.find((c) => c.id === inspection.companyId) : undefined;
      const property = inspection.propertyId ? properties.find((p) => p.id === inspection.propertyId) : undefined;

      const notificationId = await scheduleNotificationForSchedule({
        scheduleId,
        inspectionType: getInspectionTypeLabel(inspection.type, language),
        frequency: getFrequencyLabel(inspection.frequency, language),
        nextDueDate,
        companyName: company?.name,
        propertyName: property?.name,
        language,
      });

      if (notificationId) {
        const updatedSchedules = newSchedules.map((s) =>
          s.id === scheduleId ? { ...s, notificationId } : s
        );
        await saveSchedules(updatedSchedules);
      }
    } catch (error) {
      console.error("Error creating/updating schedule:", error);
    }
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
        schedules,
        contractors,
        jobSites,
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
        addContractor,
        updateContractor,
        deleteContractor,
        addJobSite,
        updateJobSite,
        deleteJobSite,
        getPropertyById,
        getCompanyById,
        getAppUserById,
        getFirePumpById,
        getFirePumpsByCompany,
        getFirePumpPanelById,
        getPanelsByPump,
        getContractorById,
        getJobSiteById,
        getJobSitesByContractor,
        createOrUpdateScheduleForInspection,
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
