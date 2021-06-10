import Worker from 'worker-loader?inline=no-fallback!./workers/web.worker';

/**
 * Web-worker.
 */
const worker = new Worker();
worker.onmessage = (e: MessageEvent) => console.log('🌼 event (from worker thread)', e.data);

setTimeout(() => {
  worker.postMessage({ msg: 'Hello from [App.entry.tsx]' });
}, 500);

/**
 * Service-worker.
 */
async function startServiceWorker() {
  try {
    const registration = await navigator.serviceWorker.register('./service.worker.js');
    console.log('🎉 Service worker registered:', registration);
  } catch (error) {
    console.log('Service worker registration failed:', error);
  }
}

if ('serviceWorker' in navigator) {
  startServiceWorker();
} else {
  console.log('Service workers are not supported.');
}
