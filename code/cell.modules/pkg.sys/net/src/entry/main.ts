import { ServiceWorker } from '@platform/cell.runtime.web/lib/ServiceWorker';
import Worker from 'worker-loader?inline=no-fallback!../workers/web.worker';

/**
 * Web-worker.
 */
const worker = new Worker();
worker.onmessage = (e: MessageEvent) => console.log('🌼 event (from worker thread)', e.data);
setTimeout(() => worker.postMessage({ msg: 'Hello from [workers.init.ts]' }), 500);

/**
 * DOM (User Interface)
 */
export async function startDom() {
  const init = import('./ui');
  init.catch((err) => console.log('INIT ERROR 🐷', err));
}

/**
 * Startup
 */
(async () => {
  await ServiceWorker.start('./service.worker.js', { localhost: false });
  await startDom();
})();
