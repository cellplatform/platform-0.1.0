import Worker from 'worker-loader?inline=no-fallback!../workers/worker.web';

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
  const init = import('./main.dom');
  init.catch((err) => console.log('INIT ERROR 🐷', err));
}

/**
 * Startup
 */
(async () => {
  await startDom();
})();
