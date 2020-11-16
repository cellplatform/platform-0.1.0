const ctx: ServiceWorker = self as any;

ctx.addEventListener('install', (e) => {
  console.log('🚀 service-worker installed:', e);
});

ctx.addEventListener('fetch', async (e) => {
  // console.log('fetch:', e);
});
