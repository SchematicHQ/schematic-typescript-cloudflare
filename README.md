# Schematic Cloudflare Node

Cloudflare KV cache adapter for Schematic SDK.

## Installation

```bash
npm install schematic-typescript-cloudflare
```

## Usage

### In a Cloudflare Worker environment

```typescript
import { CloudflareKVCache } from 'schematic-typescript-cloudflare';

// Inside a Cloudflare Worker
export default {
  async fetch(request, env, ctx) {
    // Create a CloudflareKVCache instance
    const cache = new CloudflareKVCache(env.MY_KV_NAMESPACE, {
      keyPrefix: 'my-app:',  // Optional key prefix
      ttl: 60000,            // Optional TTL in ms (default: 5000ms)
    });

    // Use the cache
    await cache.set('key', { data: 'example' });
    const data = await cache.get('key');
    
    // Use in your application logic
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
```

### With Schematic SDK

```typescript
import { Schematic } from '@schematicio/sdk';
import { CloudflareKVCache } from 'schematic-typescript-cloudflare';

// Inside a Cloudflare Worker
export default {
  async fetch(request, env, ctx) {
    // Create a CloudflareKVCache instance
    const cache = new CloudflareKVCache(env.MY_KV_NAMESPACE);
    
    // Initialize Schematic with the cache
    const schematic = new Schematic({
      apiKey: env.SCHEMATIC_API_KEY,
      cache,
    });
    
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
