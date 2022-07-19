import Worker from 'worker-loader?inline=no-fallback!./workers/worker.web';

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
    const registration = await navigator.serviceWorker.register('./worker.service.js');
    console.log('🎉 Service worker registered:', registration);
  } catch (error: any) {
    console.log('Service worker registration failed:', error);
  }
}

if ('serviceWorker' in navigator) {
  startServiceWorker();
} else {
  console.log('Service workers are not supported.');
}
