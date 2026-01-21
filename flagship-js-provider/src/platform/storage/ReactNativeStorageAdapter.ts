import type { StorageAdapter } from '../../common/interfaces/StorageAdapter';

export class ReactNativeStorageAdapter implements StorageAdapter {
  async get(key: string): Promise<string | null> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  }

  async set(key: string, value: string): Promise<void> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem(key, value);
    } catch {
    }
  }

  async remove(key: string): Promise<void> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.removeItem(key);
    } catch {
    }
  }

  async clear(): Promise<void> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.clear();
    } catch {
    }
  }
}

