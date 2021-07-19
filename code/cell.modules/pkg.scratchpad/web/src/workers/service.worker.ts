import { BundleCache } from '@platform/cell.runtime.web/lib/BundleCache';

const ctx: ServiceWorker = self as any;

ctx.addEventListener('install', (e) => {
  console.log('🚀 service-worker installed:', e);
});

BundleCache.serviceWorker(self, { log: 'verbose' });
