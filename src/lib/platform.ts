// In-memory cache with TTL
const store = new Map<string, { value: any; expiresAt: number }>();

export const cache = {
  get<T>(key: string): T | null {
    const entry = store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) { store.delete(key); return null; }
    return entry.value as T;
  },

  set(key: string, value: any, ttlSeconds = 60) {
    store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  },

  async getOrSet<T>(key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T> {
    const cached = cache.get<T>(key);
    if (cached !== null) return cached;
    const value = await fn();
    cache.set(key, value, ttlSeconds);
    return value;
  },

  invalidate(pattern?: string) {
    if (!pattern) { store.clear(); return; }
    for (const key of store.keys()) {
      if (key.includes(pattern)) store.delete(key);
    }
  },

  size() { return store.size; },
};

// Feature Flags
export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description: string;
}

const defaultFlags: FeatureFlag[] = [
  { key: 'enable_projects', enabled: true, description: 'Show Projects module' },
  { key: 'enable_testimonials', enabled: true, description: 'Show Testimonials module' },
  { key: 'enable_quotes', enabled: true, description: 'Quote request system' },
  { key: 'enable_landing_pages', enabled: true, description: 'Landing page builder' },
  { key: 'enable_plugins', enabled: false, description: 'Plugin system (beta)' },
];

let flags: FeatureFlag[] = [...defaultFlags];

export const featureFlags = {
  isEnabled(key: string): boolean {
    return flags.find(f => f.key === key)?.enabled ?? false;
  },
  getAll(): FeatureFlag[] { return [...flags]; },
  set(key: string, enabled: boolean) {
    const flag = flags.find(f => f.key === key);
    if (flag) flag.enabled = enabled;
  },
  reset() { flags = [...defaultFlags]; },
};

// Plugin Registry
export interface Plugin {
  id: string;
  name: string;
  enabled: boolean;
  version: string;
}

const plugins: Record<string, Plugin> = {};

export const pluginRegistry = {
  register(plugin: Plugin) { plugins[plugin.id] = plugin; },
  get(id: string) { return plugins[id]; },
  list() { return Object.values(plugins); },
  isEnabled(id: string) { return plugins[id]?.enabled ?? false; },
};

// Background Job Queue
type JobFn = () => Promise<void>;
const jobQueue: Array<{ id: string; fn: JobFn }> = [];
let processing = false;

export async function enqueue(id: string, fn: JobFn) {
  jobQueue.push({ id, fn });
  if (!processing) processQueue();
}

async function processQueue() {
  processing = true;
  while (jobQueue.length > 0) {
    const job = jobQueue.shift()!;
    try {
      await job.fn();
    } catch (e: any) {
      console.error(`[JOB] ${job.id} failed:`, e.message);
    }
    // Small delay between jobs
    await new Promise(r => setTimeout(r, 10));
  }
  processing = false;
}

// Example: schedule sitemap regeneration after product changes
export function scheduleDeferredJobs(types: string[]) {
  if (types.includes('product') || types.includes('category') || types.includes('brand')) {
    enqueue('sitemap:regenerate', async () => {
      // Sitemap would be regenerated here
      console.log('[JOB] Sitemap regeneration triggered');
    });
  }
}
