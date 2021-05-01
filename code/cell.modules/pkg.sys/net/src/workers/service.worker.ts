import { BundleCache } from '../cache/BundleCache';

const ctx: ServiceWorker = self as any;

BundleCache.serviceWorker(self, { log: 'verbose', localhost: false });

ctx.addEventListener('install', (e) => {
  console.log('🚀 service-worker installed:', e);
});
