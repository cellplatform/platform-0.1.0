import { BundleCache } from 'sys.net/lib/cache/BundleCache';

const ctx: ServiceWorker = self as any;

ctx.addEventListener('install', (e) => {
  console.log('🚀 service-worker installed:', e);
});

BundleCache.serviceWorker(self, { log: 'verbose' });
