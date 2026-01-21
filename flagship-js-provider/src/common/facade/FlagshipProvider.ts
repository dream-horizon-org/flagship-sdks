import type {
  Provider,
  EvaluationContext,
  ResolutionDetails,
  ProviderMetadata,
  JsonValue,
  Logger
} from '@openfeature/web-sdk';

import type { FlagshipConfig } from './FlagshipConfig';
import { createStorageAdapter, createStorageAdapterSync } from '../factories/StorageFactory';
import { createHttpClient, createHttpClientSync } from '../factories/HttpFactory';
import type { StorageAdapter } from '../interfaces/StorageAdapter';
import type { HttpClient } from '../interfaces/HttpClient';
import { CacheManager } from '../core/CacheManager';
import { ContextManager } from '../core/ContextManager';

export class FlagshipProvider implements Provider {
  private config: FlagshipConfig;
  private isInitialized: boolean = false;
  private storage!: StorageAdapter;
  private http!: HttpClient;
  private cacheManager!: CacheManager;
  private contextManager: ContextManager;
  private initPromise: Promise<void> | null = null;

  public readonly metadata: ProviderMetadata = {
    name: 'FlagshipProvider'
  };

  public readonly hooks = [];

  constructor(config: FlagshipConfig) {
    this.config = config;
    this.contextManager = new ContextManager();
    
    try {
      this.storage = createStorageAdapterSync();
      this.http = createHttpClientSync();
      this.cacheManager = new CacheManager(this.storage);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Node.js') || errorMessage.includes('asynchronously')) {
        this.initPromise = this.initializeAsync();
      } else {
        console.error('FlagshipProvider initialization error:', error);
        throw error;
      }
    }
  }

  private async initializeAsync(): Promise<void> {
    this.storage = await createStorageAdapter();
    this.http = await createHttpClient();
    this.cacheManager = new CacheManager(this.storage);
  }

  async ensureInitialized(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
    }
  }

  async initialize(initialContext?: EvaluationContext): Promise<void> {
    if (this.isInitialized) {
      return;
    }
    this.isInitialized = true;
  }

  async onContextSet(
    oldContext: EvaluationContext,
    newContext: EvaluationContext
  ): Promise<void> {
  }

  resolveBooleanEvaluation(
    flagKey: string,
    defaultValue: boolean,
    context: EvaluationContext,
    logger: Logger
  ): ResolutionDetails<boolean> {
    return {
      value: defaultValue,
      reason: 'DEFAULT'
    };
  }

  resolveStringEvaluation(
    flagKey: string,
    defaultValue: string,
    context: EvaluationContext,
    logger: Logger
  ): ResolutionDetails<string> {
    return {
      value: defaultValue,
      reason: 'DEFAULT'
    };
  }

  resolveNumberEvaluation(
    flagKey: string,
    defaultValue: number,
    context: EvaluationContext,
    logger: Logger
  ): ResolutionDetails<number> {
    return {
      value: defaultValue,
      reason: 'DEFAULT'
    };
  }

  resolveObjectEvaluation<T extends JsonValue>(
    flagKey: string,
    defaultValue: T,
    context: EvaluationContext,
    logger: Logger
  ): ResolutionDetails<T> {
    return {
      value: defaultValue,
      reason: 'DEFAULT'
    };
  }
}

