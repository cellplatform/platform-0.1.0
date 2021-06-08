import Worker from 'worker-loader?inline=no-fallback!../workers/web.worker';

import { WindowTransport, WorkerBus } from '../WorkerBus';

/**
 * Web-worker.
 */
const worker1 = new Worker();
const worker2 = new Worker();
// worker.onmessage = (e: MessageEvent) => console.log('🌼 event (from worker thread)', e.data);

const transport = WindowTransport().add(worker1).add(worker1); //.add(worker2);
console.log('MAIN transport', transport);

type MyEvent = { type: 'foo'; payload: { msg?: string } };

const bus = WorkerBus<MyEvent>(transport);

bus.$.subscribe((e) => {
  console.log('MAIN', e);
});

setTimeout(async () => {
  // worker.postMessage({ msg: 'Hello from [workers.init]' });
  const remotes = await transport.remotes();
  console.log('remotes', remotes);

  bus.fire({ type: 'foo', payload: { msg: 'hello' } });
}, 3000);

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
