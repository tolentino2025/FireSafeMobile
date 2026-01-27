import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';
import { compressImageForUpload } from './imageCompressor';
import type { Company, AppUser, Property, Inspection, InspectionSchedule } from '../types/inspection';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || '';
const SYNC_KEY = '@firesafe_last_sync';
const PENDING_SYNC_KEY = '@firesafe_pending_sync';

interface SyncData {
  companies: Company[];
  inspectors: AppUser[];
  properties: Property[];
  inspections: Inspection[];
  schedules: InspectionSchedule[];
}

interface PendingSync {
  companies: Company[];
  inspectors: AppUser[];
  properties: Property[];
  inspections: Inspection[];
  schedules: InspectionSchedule[];
  photos: {
    inspectionId: string;
    checklistItemId?: string;
    uri: string;
    caption: string;
  }[];
}

export const isOnline = async (): Promise<boolean> => {
  try {
    const state = await Network.getNetworkStateAsync();
    return state.isConnected === true && state.isInternetReachable === true;
  } catch {
    return false;
  }
};

export const getLastSyncTime = async (): Promise<string | null> => {
  return AsyncStorage.getItem(SYNC_KEY);
};

export const setLastSyncTime = async (time: string): Promise<void> => {
  await AsyncStorage.setItem(SYNC_KEY, time);
};

export const getPendingSync = async (): Promise<PendingSync> => {
  const data = await AsyncStorage.getItem(PENDING_SYNC_KEY);
  if (data) {
    return JSON.parse(data);
  }
  return {
    companies: [],
    inspectors: [],
    properties: [],
    inspections: [],
    schedules: [],
    photos: [],
  };
};

export const setPendingSync = async (data: PendingSync): Promise<void> => {
  await AsyncStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(data));
};

export const clearPendingSync = async (): Promise<void> => {
  await AsyncStorage.removeItem(PENDING_SYNC_KEY);
};

export const addToPendingSync = async <T extends keyof Omit<PendingSync, 'photos'>>(
  type: T,
  item: PendingSync[T][number]
): Promise<void> => {
  const pending = await getPendingSync();
  const existingIndex = pending[type].findIndex((i: any) => i.id === (item as any).id);
  
  if (existingIndex >= 0) {
    (pending[type] as any[])[existingIndex] = item;
  } else {
    (pending[type] as any[]).push(item);
  }
  
  await setPendingSync(pending);
};

export const addPhotoToPendingSync = async (photo: PendingSync['photos'][number]): Promise<void> => {
  const pending = await getPendingSync();
  pending.photos.push(photo);
  await setPendingSync(pending);
};

export const syncPush = async (data: Partial<SyncData>): Promise<{ success: boolean; error?: string }> => {
  if (!API_BASE_URL) {
    return { success: false, error: 'API URL not configured' };
  }

  const online = await isOnline();
  if (!online) {
    return { success: false, error: 'No internet connection' };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error || 'Sync failed' };
    }

    const result = await response.json();
    await setLastSyncTime(result.syncedAt);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export const syncPull = async (): Promise<{ success: boolean; data?: SyncData; error?: string }> => {
  if (!API_BASE_URL) {
    return { success: false, error: 'API URL not configured' };
  }

  const online = await isOnline();
  if (!online) {
    return { success: false, error: 'No internet connection' };
  }

  try {
    const lastSync = await getLastSyncTime();
    const url = lastSync 
      ? `${API_BASE_URL}/api/sync/pull?lastSyncAt=${encodeURIComponent(lastSync)}`
      : `${API_BASE_URL}/api/sync/pull`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error || 'Pull failed' };
    }

    const result = await response.json();
    await setLastSyncTime(result.syncedAt);

    return {
      success: true,
      data: {
        companies: result.companies || [],
        inspectors: result.inspectors || [],
        properties: result.properties || [],
        inspections: result.inspections || [],
        schedules: result.schedules || [],
      },
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export const uploadPhoto = async (
  inspectionId: string,
  uri: string,
  caption: string,
  checklistItemId?: string
): Promise<{ success: boolean; error?: string }> => {
  if (!API_BASE_URL) {
    await addPhotoToPendingSync({ inspectionId, uri, caption, checklistItemId });
    return { success: false, error: 'API URL not configured - saved for later sync' };
  }

  const online = await isOnline();
  if (!online) {
    await addPhotoToPendingSync({ inspectionId, uri, caption, checklistItemId });
    return { success: false, error: 'No internet - saved for later sync' };
  }

  try {
    const compressedBase64 = await compressImageForUpload(uri);
    
    const response = await fetch(`${API_BASE_URL}/api/photos/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inspection_id: inspectionId,
        checklist_item_id: checklistItemId,
        base64: compressedBase64,
        caption,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      await addPhotoToPendingSync({ inspectionId, uri, caption, checklistItemId });
      return { success: false, error: errorData.error || 'Upload failed' };
    }

    return { success: true };
  } catch (error) {
    await addPhotoToPendingSync({ inspectionId, uri, caption, checklistItemId });
    return { success: false, error: (error as Error).message };
  }
};

export const syncPendingData = async (): Promise<{ success: boolean; syncedCounts: Record<string, number>; error?: string }> => {
  const pending = await getPendingSync();
  const counts: Record<string, number> = {
    companies: 0,
    inspectors: 0,
    properties: 0,
    inspections: 0,
    schedules: 0,
    photos: 0,
  };

  const hasData = pending.companies.length > 0 ||
    pending.inspectors.length > 0 ||
    pending.properties.length > 0 ||
    pending.inspections.length > 0 ||
    pending.schedules.length > 0 ||
    pending.photos.length > 0;

  if (!hasData) {
    return { success: true, syncedCounts: counts };
  }

  const online = await isOnline();
  if (!online) {
    return { success: false, syncedCounts: counts, error: 'No internet connection' };
  }

  try {
    if (pending.companies.length || pending.inspectors.length || pending.properties.length || 
        pending.inspections.length || pending.schedules.length) {
      const result = await syncPush({
        companies: pending.companies,
        inspectors: pending.inspectors,
        properties: pending.properties,
        inspections: pending.inspections,
        schedules: pending.schedules,
      });

      if (result.success) {
        counts.companies = pending.companies.length;
        counts.inspectors = pending.inspectors.length;
        counts.properties = pending.properties.length;
        counts.inspections = pending.inspections.length;
        counts.schedules = pending.schedules.length;
        
        pending.companies = [];
        pending.inspectors = [];
        pending.properties = [];
        pending.inspections = [];
        pending.schedules = [];
      }
    }

    const remainingPhotos = [];
    for (const photo of pending.photos) {
      const result = await uploadPhoto(
        photo.inspectionId,
        photo.uri,
        photo.caption,
        photo.checklistItemId
      );
      
      if (result.success) {
        counts.photos++;
      } else {
        remainingPhotos.push(photo);
      }
    }
    pending.photos = remainingPhotos;

    await setPendingSync(pending);

    return { success: true, syncedCounts: counts };
  } catch (error) {
    return { success: false, syncedCounts: counts, error: (error as Error).message };
  }
};

export const getSyncStatus = async (): Promise<{
  lastSync: string | null;
  pendingCount: number;
  isOnline: boolean;
}> => {
  const [lastSync, pending, online] = await Promise.all([
    getLastSyncTime(),
    getPendingSync(),
    isOnline(),
  ]);

  const pendingCount = 
    pending.companies.length +
    pending.inspectors.length +
    pending.properties.length +
    pending.inspections.length +
    pending.schedules.length +
    pending.photos.length;

  return { lastSync, pendingCount, isOnline: online };
};
