# Schematic Cloudflare Node

Cloudflare KV cache adapter for Schematic SDK.

## Installation

```bash
npm install @schematichq/schematic-typescript-cloudflare
```

## Usage

### With Schematic SDK

```typescript
import { SchematicClient } from "@schematichq/schematic-typescript-node";
import { CloudflareKVCache } from "@schematichq/schematic-typescript-cloudflare";

// Inside a Cloudflare Worker
export default {
  async fetch(request, env, ctx) {
    // Create a CloudflareKVCache instance
    const cache = new CloudflareKVCache<boolean>(env.MY_KV_NAMESPACE, {
        ttl: 1000 * 60 * 60, // 1 hour
      });
    
    // Initialize Schematic with the cache
    const schematic = new SchematicClient({
      apiKey: env.SCHEMATIC_API_KEY,
      cacheProviders: {
        flagChecks: [cache],
      }});
    // Your application logic...
  }
};
```

## API

### CloudflareKVCache

```typescript
class CloudflareKVCache<T> {
  constructor(
    kvNamespace: KVNamespace | string,
    options?: {
      keyPrefix?: string;  // Default: 'schematic:'
      ttl?: number;        // Default: 5000ms
    }
  );

  get(key: string): Promise<T | undefined>;
  set(key: string, value: T, ttlOverride?: number): Promise<void>;
  delete(key: string): Promise<void>;
  deleteAllExcept(keysToKeep: string[]): Promise<void>;
  clear(): Promise<void>;
}
```

## License

MIT
