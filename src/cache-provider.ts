/**
 * Generic cache provider interface
 */
export interface CacheProvider<T> {
    /**
     * Get a value from the cache
     * @param key Cache key
     * @returns The cached value, or null if not found or expired
     */
    get(key: string): Promise<T | null>;

    /**
     * Set a value in the cache
     * @param key Cache key
     * @param value Value to cache
     * @param ttl Optional TTL in milliseconds
     */
    set(key: string, value: T, ttl?: number): Promise<void>;

    /**
     * Delete a value from the cache
     * @param key Cache key
     */
    delete(key: string): Promise<void>;

    /**
     * Delete all keys not in the keysToKeep array (optional, for bulk operations)
     */
    deleteMissing?(keysToKeep: string[], options?: { scanPattern?: string }): Promise<void>;
}
