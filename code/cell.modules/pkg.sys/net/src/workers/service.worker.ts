import { BundleCache } from '../cache';

const ctx: ServiceWorker = self as any;

BundleCache.serviceWorker(self, { log: 'verbose' });

ctx.addEventListener('install', (e) => {
  console.log('🚀 service-worker installed:', e);
});
