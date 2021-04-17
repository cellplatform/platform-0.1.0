import { BundleHttpCache } from 'sys.net/lib/cache';

const ctx: ServiceWorker = self as any;

ctx.addEventListener('install', (e) => {
  console.log('🚀 service-worker installed:', e);
});

BundleHttpCache.serviceWorker(self, { log: 'verbose' });
