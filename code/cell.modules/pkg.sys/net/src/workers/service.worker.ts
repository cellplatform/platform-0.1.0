import { BundleHttpCache } from '../cache';

const ctx: ServiceWorker = self as any;

BundleHttpCache.serviceWorker(self, { log: 'verbose' });

ctx.addEventListener('install', (e) => {
  console.log('🚀 service-worker installed:', e);
});
