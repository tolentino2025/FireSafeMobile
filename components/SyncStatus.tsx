import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { useTheme } from '../hooks/useTheme';
import { getSyncStatus, syncPendingData, isOnline } from '../utils/syncService';
import { useLanguage } from '../contexts/LanguageContext';

interface SyncStatusInfo {
  lastSync: string | null;
  pendingCount: number;
  isOnline: boolean;
}

export const SyncStatus: React.FC = () => {
  const { fullTheme } = useTheme();
  const { t } = useLanguage();
  const [status, setStatus] = useState<SyncStatusInfo | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchStatus = useCallback(async () => {
    const syncStatus = await getSyncStatus();
    setStatus(syncStatus);
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleSync = async () => {
    if (isSyncing) return;
    
    const online = await isOnline();
    if (!online) {
      return;
    }

    setIsSyncing(true);
    try {
      await syncPendingData();
      await fetchStatus();
    } finally {
      setIsSyncing(false);
    }
  };

  if (!status) return null;

  const formatLastSync = (dateStr: string | null): string => {
    if (!dateStr) return t.sync?.never || 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return t.sync?.justNow || 'Just now';
    if (diffMins < 60) return `${diffMins} ${t.sync?.minutesAgo || 'min ago'}`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} ${t.sync?.hoursAgo || 'h ago'}`;
    
    return date.toLocaleDateString();
  };

  return (
    <View style={[styles.container, { backgroundColor: fullTheme.colors.cardBackground }]}>
      <View style={styles.statusRow}>
        <View style={styles.statusIndicator}>
          <View 
            style={[
              styles.dot, 
              { backgroundColor: status.isOnline ? fullTheme.colors.success : fullTheme.colors.warning }
            ]} 
          />
          <ThemedText style={styles.statusText}>
            {status.isOnline ? (t.sync?.online || 'Online') : (t.sync?.offline || 'Offline')}
          </ThemedText>
        </View>

        {status.pendingCount > 0 && (
          <View style={[styles.pendingBadge, { backgroundColor: fullTheme.colors.warning + '20' }]}>
            <ThemedText style={[styles.pendingText, { color: fullTheme.colors.warning }]}>
              {status.pendingCount} {t.sync?.pending || 'pending'}
            </ThemedText>
          </View>
        )}
      </View>

      <View style={styles.syncRow}>
        <ThemedText style={[styles.lastSyncText, { color: fullTheme.colors.textSecondary }]}>
          {t.sync?.lastSync || 'Last sync'}: {formatLastSync(status.lastSync)}
        </ThemedText>

        <Pressable 
          onPress={handleSync} 
          disabled={isSyncing || !status.isOnline}
          style={({ pressed }) => [
            styles.syncButton,
            { 
              backgroundColor: status.isOnline 
                ? (pressed ? fullTheme.colors.primary + '80' : fullTheme.colors.primary)
                : fullTheme.colors.border,
              opacity: isSyncing ? 0.7 : 1,
            }
          ]}
        >
          {isSyncing ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Feather name="refresh-cw" size={14} color="#FFF" />
              <ThemedText style={styles.syncButtonText}>
                {t.sync?.sync || 'Sync'}
              </ThemedText>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
  },
  pendingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  pendingText: {
    fontSize: 11,
    fontWeight: '600',
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastSyncText: {
    fontSize: 12,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  syncButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default SyncStatus;
