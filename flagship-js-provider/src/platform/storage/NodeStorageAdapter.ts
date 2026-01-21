import fs from 'fs/promises';
import path from 'path';
import type { StorageAdapter } from '../../common/interfaces/StorageAdapter';

export class NodeStorageAdapter implements StorageAdapter {
  private storageDir: string;

  constructor(storageDir: string = './flagship-storage') {
    this.storageDir = storageDir;
  }

  private getFilePath(key: string): string {
    return path.join(this.storageDir, `${key}.json`);
  }

  async get(key: string): Promise<string | null> {
    try {
      const filePath = this.getFilePath(key);
      const data = await fs.readFile(filePath, 'utf-8');
      return data;
    } catch {
      return null;
    }
  }

  async set(key: string, value: string): Promise<void> {
    const filePath = this.getFilePath(key);
    await fs.mkdir(this.storageDir, { recursive: true });
    await fs.writeFile(filePath, value, 'utf-8');
  }

  async remove(key: string): Promise<void> {
    try {
      const filePath = this.getFilePath(key);
      await fs.unlink(filePath);
    } catch {
    }
  }

  async clear(): Promise<void> {
    try {
      await fs.rm(this.storageDir, { recursive: true });
    } catch {
    }
  }
}

