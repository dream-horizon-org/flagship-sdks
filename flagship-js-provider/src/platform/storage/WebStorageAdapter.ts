import type { StorageAdapter } from '../../common/interfaces/StorageAdapter';

export class WebStorageAdapter implements StorageAdapter {
  private storage: Storage;

  constructor(useSessionStorage: boolean = false) {
    this.storage = useSessionStorage ? sessionStorage : localStorage;
  }

  async get(key: string): Promise<string | null> {
    return this.storage.getItem(key);
  }

  async set(key: string, value: string): Promise<void> {
    this.storage.setItem(key, value);
  }

  async remove(key: string): Promise<void> {
    this.storage.removeItem(key);
  }

  async clear(): Promise<void> {
    this.storage.clear();
  }
}

