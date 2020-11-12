const ctx: ServiceWorker = self as any;

ctx.addEventListener('install', function (e) {
  // console.log('service-worker-installed:', e);
});

ctx.addEventListener('fetch', async function (e) {
  // console.log('fetch:', e);
  const manifest = await getManifest();
});

export async function getManifest() {
  /**
   * TODO 🐷
   */
}
