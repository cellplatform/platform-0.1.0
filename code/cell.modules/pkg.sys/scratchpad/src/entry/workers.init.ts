import Worker from 'worker-loader?inline=no-fallback!../workers/web.worker';

/**
 * Web-worker.
 */
const worker = new Worker();
worker.onmessage = (e: MessageEvent) => console.log('🌼 event (from worker thread)', e.data);

setTimeout(() => {
  worker.postMessage({ msg: 'Hello from [workers.init]' });
}, 500);

/**
 * Service-worker.
 */
async function startServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return console.log('Service workers are not supported.');
  }

  try {
    const registration = await navigator.serviceWorker.register('./service.worker.js');
    console.log('🎉 Service worker registered:', registration);
  } catch (error) {
    console.log('Service worker registration failed:', error);
  }
}

if (location.hostname !== 'localhost') {
  // HACK: Don't start service worker during dev (supress caching).
  startServiceWorker();
}
