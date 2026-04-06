/**
 * INFRASTRUCTURE - LOCAL STORAGE
 * Utilitaires pour persister les données locales
 */

import { logger } from '@shared/utils/logger';

class StorageManager {
  private prefix = 'app_';

  setItem<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(this.prefix + key, serialized);
    } catch (error) {
      logger.error('Failed to set storage item', { key, error });
    }
  }

  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return null;
      return JSON.parse(item) as T;
    } catch (error) {
      logger.error('Failed to get storage item', { key, error });
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      logger.error('Failed to remove storage item', { key, error });
    }
  }

  clear(): void {
    try {
      Object.keys(localStorage)
        .filter((key) => key.startsWith(this.prefix))
        .forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      logger.error('Failed to clear storage', { error });
    }
  }
}

export const storage = new StorageManager();
