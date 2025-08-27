// CloudflareKVCache implementation for TypeScript
import { CacheProvider } from './cache-provider';

/**
 * Interface for KV namespace operations that matches Cloudflare Workers KV API
 */
export interface KVNamespace {
  get<T>(key: string, type: 'json'): Promise<T | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string }): Promise<{ keys: Array<{ name: string }> }>;
}

/**
 * Options for configuring the CloudflareKVCache
 */
export interface CloudflareKVCacheOptions {
  /** Prefix for cache keys */
  keyPrefix?: string;
  /** Default TTL in milliseconds */
  ttl?: number;
}

/**
 * Cache provider that uses Cloudflare KV for persistent storage
 */
export class CloudflareKVCache<T> implements CacheProvider<T> {
  private kv: KVNamespace;
  private keyPrefix: string;
  private defaultTTL: number;

  /**
   * Create a new CloudflareKVCache instance
   * @param kvNamespace KV namespace or its ID when outside Workers
   * @param options Configuration options
   */
  constructor(
    kvNamespace: KVNamespace,
    options: CloudflareKVCacheOptions = {}
  ) {
    this.keyPrefix = options.keyPrefix || 'schematic:';
    this.defaultTTL = options.ttl || 5000; // 5 seconds default
    
    this.kv = kvNamespace;
  }

  /**
   * Get a value from the KV store
   * @param key Cache key
   * @returns The cached value, or undefined if not found or expired
   */
  async get(key: string): Promise<T | undefined> {
    const fullKey = this.getFullKey(key);
    
    try {
      // Use the typed version for better type safety
      const value = await this.kv.get<T>(fullKey, 'json');
      return value === null ? undefined : value;
    } catch (error) {
      // If typed version fails, log warning and return undefined
      console.warn(`Failed to get cached value for key ${fullKey}:`, error);
      return undefined;
    }
  }

  /**
   * Set a value in the KV store
   * @param key Cache key
   * @param value Value to cache
   * @param ttlOverride Optional TTL override in milliseconds
   */
  async set(key: string, value: T, ttlOverride?: number): Promise<void> {
    const fullKey = this.getFullKey(key);
    const ttl = ttlOverride ?? this.defaultTTL;
    
    // TTL in CloudflareKV is in seconds
    const ttlSeconds = Math.max(Math.ceil(ttl / 1000), 60); // Minimum 60s in Cloudflare KV
    
    await this.kv.put(fullKey, JSON.stringify(value), {
      expirationTtl: ttlSeconds,
    });
  }

  /**
   * Delete a value from the KV store
   * @param key Cache key
   */
  async delete(key: string): Promise<void> {
    const fullKey = this.getFullKey(key);
    await this.kv.delete(fullKey);
  }

  /**
   * Delete all keys except the ones provided
   * @param keysToKeep Keys to retain in the cache
   */
  async deleteAllExcept(keysToKeep: string[]): Promise<void> {
    const fullKeysToKeep = new Set(keysToKeep.map(k => this.getFullKey(k)));
    
  // List all keys with our prefix
  const { keys } = await this.kv.list({ prefix: this.keyPrefix });
    
  // Delete keys not in the list to keep
  const deletePromises: Promise<void>[] = [];
    keys.forEach((key) => {
      if (!fullKeysToKeep.has(key.name)) {
        deletePromises.push(this.kv.delete(key.name));
      }
    });

    await Promise.all(deletePromises);
  }

  /**
   * Clear the entire cache with the configured prefix
   */
  async clear(): Promise<void> {
    // List all keys with our prefix
    const { keys } = await this.kv.list({ prefix: this.keyPrefix });
    
    // Delete all keys
    const deletePromises = keys.map((key) => this.kv.delete(key.name));
    await Promise.all(deletePromises);
  }

  /**
   * Get the full key with prefix applied
   * @param key The base key
   * @returns The full key with prefix
   */
  private getFullKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }
}
