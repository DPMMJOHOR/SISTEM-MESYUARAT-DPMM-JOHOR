import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const SYNC_QUEUE_KEY = 'dpmm_sync_queue';
const ATTENDEE_CACHE_KEY = 'dpmm_attendee_cache';

export interface SyncOperation {
  id: string;
  type: 'checkin';
  timestamp: string;
  data: any;
  eventId: string;
  retryCount: number;
}

export interface AttendeeCache {
  eventId: string;
  attendees: any[];
  cachedAt: string;
}

/**
 * Check if device is online
 */
export const isOnline = async (): Promise<boolean> => {
  const state = await NetInfo.fetch();
  return state.isConnected ?? false;
};

/**
 * Add operation to sync queue
 */
export const addToSyncQueue = async (operation: SyncOperation): Promise<void> => {
  try {
    const queue = await getSyncQueue();
    queue.push(operation);
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Error adding to sync queue:', error);
  }
};

/**
 * Get sync queue
 */
export const getSyncQueue = async (): Promise<SyncOperation[]> => {
  try {
    const queueJson = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    return queueJson ? JSON.parse(queueJson) : [];
  } catch (error) {
    console.error('Error getting sync queue:', error);
    return [];
  }
};

/**
 * Clear sync queue
 */
export const clearSyncQueue = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
  } catch (error) {
    console.error('Error clearing sync queue:', error);
  }
};

/**
 * Remove operation from sync queue
 */
export const removeFromSyncQueue = async (operationId: string): Promise<void> => {
  try {
    const queue = await getSyncQueue();
    const filteredQueue = queue.filter(op => op.id !== operationId);
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(filteredQueue));
  } catch (error) {
    console.error('Error removing from sync queue:', error);
  }
};

/**
 * Cache attendee data for offline use
 */
export const cacheAttendeeData = async (eventId: string, attendees: any[]): Promise<void> => {
  try {
    const cache: AttendeeCache = {
      eventId,
      attendees,
      cachedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(`${ATTENDEE_CACHE_KEY}_${eventId}`, JSON.stringify(cache));
  } catch (error) {
    console.error('Error caching attendee data:', error);
  }
};

/**
 * Get cached attendee data
 */
export const getCachedAttendeeData = async (eventId: string): Promise<AttendeeCache | null> => {
  try {
    const cacheJson = await AsyncStorage.getItem(`${ATTENDEE_CACHE_KEY}_${eventId}`);
    return cacheJson ? JSON.parse(cacheJson) : null;
  } catch (error) {
    console.error('Error getting cached attendee data:', error);
    return null;
  }
};

/**
 * Clear cached attendee data
 */
export const clearCachedAttendeeData = async (eventId: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(`${ATTENDEE_CACHE_KEY}_${eventId}`);
  } catch (error) {
    console.error('Error clearing cached attendee data:', error);
  }
};

/**
 * Process sync queue when online
 */
export const processSyncQueue = async (): Promise<void> => {
  const online = await isOnline();
  if (!online) {
    console.log('Device is offline, skipping sync');
    return;
  }

  const queue = await getSyncQueue();
  if (queue.length === 0) {
    console.log('Sync queue is empty');
    return;
  }

  console.log(`Processing ${queue.length} sync operations`);

  for (const operation of queue) {
    try {
      // Process based on operation type
      if (operation.type === 'checkin') {
        await processCheckInOperation(operation);
      }
      
      // Remove successfully processed operation
      await removeFromSyncQueue(operation.id);
    } catch (error) {
      console.error(`Error processing operation ${operation.id}:`, error);
      
      // Increment retry count
      operation.retryCount += 1;
      
      // Remove if max retries exceeded
      if (operation.retryCount >= 3) {
        await removeFromSyncQueue(operation.id);
      } else {
        // Update operation in queue
        const updatedQueue = await getSyncQueue();
        const index = updatedQueue.findIndex(op => op.id === operation.id);
        if (index !== -1) {
          updatedQueue[index] = operation;
          await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(updatedQueue));
        }
      }
    }
  }
};

/**
 * Process individual check-in operation
 */
const processCheckInOperation = async (operation: SyncOperation): Promise<void> => {
  // Import api dynamically to avoid circular dependency
  const { updateCheckIn } = await import('./api');
  
  await updateCheckIn(operation.data.rsvpId, operation.data.checkInTime);
  console.log(`Successfully synced check-in for operation ${operation.id}`);
};

/**
 * Get sync status
 */
export const getSyncStatus = async (): Promise<{ pending: number; lastSync: string | null }> => {
  const queue = await getSyncQueue();
  const lastSync = await AsyncStorage.getItem('dpmm_last_sync');
  
  return {
    pending: queue.length,
    lastSync: lastSync,
  };
};

/**
 * Update last sync timestamp
 */
export const updateLastSync = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem('dpmm_last_sync', new Date().toISOString());
  } catch (error) {
    console.error('Error updating last sync:', error);
  }
};
