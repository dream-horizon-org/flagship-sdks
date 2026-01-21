import type { StorageAdapter } from '../interfaces/StorageAdapter';
import { WebStorageAdapter } from '../../platform/storage/WebStorageAdapter';
import { ReactNativeStorageAdapter } from '../../platform/storage/ReactNativeStorageAdapter';
import { isBrowser, isReactNative, isNode } from '../../utils/platformDetection';

async function loadNodeStorageAdapter() {
  const { NodeStorageAdapter } = await import('../../platform/storage/NodeStorageAdapter');
  return NodeStorageAdapter;
}

export async function createStorageAdapter(): Promise<StorageAdapter> {
  if (isBrowser()) {
    return new WebStorageAdapter();
  }
  
  if (isReactNative()) {
    return new ReactNativeStorageAdapter();
  }
  
  if (isNode()) {
    const NodeStorageAdapter = await loadNodeStorageAdapter();
    return new NodeStorageAdapter();
  }
  
  throw new Error('Unable to determine platform for storage adapter');
}

export function createStorageAdapterSync(): StorageAdapter {
  if (isBrowser()) {
    return new WebStorageAdapter();
  }
  
  if (isReactNative()) {
    return new ReactNativeStorageAdapter();
  }
  
  throw new Error('createStorageAdapterSync only works in browser or React Native. For Node.js, use createStorageAdapter() and await initialization');
}

