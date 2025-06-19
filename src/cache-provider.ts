/**
 * Generic cache provider interface
 */
export interface CacheProvider<T> {
    /**
     * Get a value from the cache
     * @param key Cache key
     * @returns The cached value, or undefined if not found or expired
     */
    get(key: string): Promise<T | undefined>;

    /**
     * Set a value in the cache
     * @param key Cache key
     * @param value Value to cache
     * @param ttlOverride Optional TTL override in milliseconds
     */
    set(key: string, value: T, ttlOverride?: number): Promise<void>;
}
