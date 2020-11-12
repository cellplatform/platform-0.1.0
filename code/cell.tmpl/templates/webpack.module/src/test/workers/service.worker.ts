const ctx: ServiceWorker = self as any;

ctx.addEventListener('install', function (e) {
  console.log('service-worker/installed:', e);
});

self.addEventListener('fetch', async function (e) {
  console.log('service-worker/fetch:', e);
});
