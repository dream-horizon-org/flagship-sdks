export function multiply(a: number, b: number): number {
  return a * b;
}

export { FlagshipProvider } from './common/facade/FlagshipProvider';
export type { FlagshipConfig } from './common/facade/FlagshipConfig';

export { createStorageAdapter } from './common/factories/StorageFactory';
export { createHttpClient } from './common/factories/HttpFactory';
export type { StorageAdapter } from './common/interfaces/StorageAdapter';
export type { HttpClient } from './common/interfaces/HttpClient';

