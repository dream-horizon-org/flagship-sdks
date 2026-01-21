import type { StorageAdapter } from '../interfaces/StorageAdapter';

export class CacheManager {
  private storage: StorageAdapter;
  private cacheKey: string;

  constructor(storage: StorageAdapter, cacheKey: string = 'flagship_flags') {
    this.storage = storage;
    this.cacheKey = cacheKey;
  }

  async getCachedFlags(): Promise<unknown | null> {
    const cached = await this.storage.get(this.cacheKey);
    if (!cached) {
      return null;
    }
    try {
      return JSON.parse(cached);
    } catch {
      return null;
    }
  }

  async setCachedFlags(flags: unknown): Promise<void> {
    await this.storage.set(this.cacheKey, JSON.stringify(flags));
  }

  async clearCache(): Promise<void> {
    await this.storage.remove(this.cacheKey);
  }
}

