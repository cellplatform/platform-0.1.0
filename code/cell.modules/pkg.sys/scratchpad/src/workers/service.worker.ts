import { BrowserCache } from 'sys.net/lib/cache/BrowserCache';

const ctx: ServiceWorker = self as any;

ctx.addEventListener('install', (e) => {
  console.log('🚀 service-worker installed:', e);
});

BrowserCache.serviceWorker(ctx);
