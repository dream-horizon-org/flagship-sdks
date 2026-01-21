import type { HttpClient } from '../interfaces/HttpClient';
import { FetchHttpAdapter } from '../../platform/http/FetchHttpAdapter';
import { ReactNativeHttpAdapter } from '../../platform/http/ReactNativeHttpAdapter';
import { isBrowser, isReactNative, isNode } from '../../utils/platformDetection';

export async function createHttpClient(): Promise<HttpClient> {
  if (isBrowser()) {
    return new FetchHttpAdapter();
  }
  
  if (isReactNative()) {
    return new ReactNativeHttpAdapter();
  }
  
  if (isNode()) {
    const { NodeHttpAdapter } = await import('../../platform/http/NodeHttpAdapter');
    return new NodeHttpAdapter();
  }
  
  throw new Error('Unable to determine platform for HTTP client');
}

export function createHttpClientSync(): HttpClient {
  if (isBrowser()) {
    return new FetchHttpAdapter();
  }
  
  if (isReactNative()) {
    return new ReactNativeHttpAdapter();
  }
  
  throw new Error('createHttpClientSync only works in browser or React Native. For Node.js, use createHttpClient() and await initialization');
}

