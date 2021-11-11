import Worker from 'worker-loader?inline=no-fallback!../workers/web.worker';
import { ServiceWorker } from '@platform/cell.runtime.web/lib/ServiceWorker';

const url = new URL(location.href);
const dev = url.searchParams.get('dev');
const isDev = typeof dev === 'string';

/**
 * Web-worker.
 */
const worker = new Worker();
worker.onmessage = (e: MessageEvent) => console.log('🌼 event (from worker thread)', e.data);
setTimeout(() => worker.postMessage({ msg: 'Hello from [workers.init.ts]' }), 500);

/**
 * DOM (User Interface)
 */
export async function startDevHarness() {
  const init = import('./main.dev');
  init.catch((err) => console.log('INIT ERROR 🐷', err));
}

export async function startRoot() {
  const init = import('./main.root');
  init.catch((err) => console.log('INIT ERROR 🐷', err));
}

/**
 * Startup
 */
(async () => {
  await ServiceWorker.start('./service.worker.js', { localhost: false });
  if (isDev) await startDevHarness();
  if (!isDev) await startRoot();
})();
