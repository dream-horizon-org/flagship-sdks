export type Platform = 'web' | 'react-native' | 'node';

export function detectPlatform(): Platform {
  if (isBrowser()) {
    return 'web';
  }
  
  if (isReactNative()) {
    return 'react-native';
  }
  
  return 'node';
}

export function isBrowser(): boolean {
  return typeof globalThis !== 'undefined' 
    && typeof (globalThis as unknown as { window?: { localStorage?: unknown } }).window !== 'undefined'
    && typeof (globalThis as unknown as { window: { localStorage?: unknown } }).window.localStorage !== 'undefined';
}

export function isReactNative(): boolean {
  return typeof globalThis !== 'undefined' 
    && typeof (globalThis as unknown as { navigator?: { product?: string } }).navigator !== 'undefined'
    && (globalThis as unknown as { navigator: { product?: string } }).navigator.product === 'ReactNative';
}

export function isNode(): boolean {
  return typeof process !== 'undefined' 
    && process.versions != null 
    && process.versions.node != null;
}

