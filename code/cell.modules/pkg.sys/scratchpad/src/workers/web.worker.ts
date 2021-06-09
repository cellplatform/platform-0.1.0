import { WorkerBus, WorkerTransport } from '@platform/cell.runtime.web';

const ctx: Worker = self as any;
export default ctx;

const transport = WorkerTransport();

type MyEvent = { type: 'foo'; payload: { msg?: string } };
const bus = WorkerBus<MyEvent>(transport);
// console.log('bus', bus);

bus.$.subscribe((e) => {
  console.log('WORKER subscribe', e);
});

setTimeout(() => {
  bus.fire({ type: 'foo', payload: { msg: 'hello from worker' } });
}, 3500);
