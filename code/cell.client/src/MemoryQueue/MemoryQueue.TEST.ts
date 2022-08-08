import { expect, time, t } from '../test';
import { MemoryQueue } from '.';

describe('MemoryQueue', () => {
  const testQueue = () => {
    const queue = MemoryQueue.create();
    const results: number[] = [];
    const pushDelay = async (value: number, delay = 5) => {
      await time.wait(delay);
      results.push(value);
      return value;
    };

    return { queue, results, pushDelay };
  };

  beforeEach(() => {
    MemoryQueue.reset();
  });

  describe('lifecycle', () => {
    it('create (default)', () => {
      const queue = MemoryQueue.create();
      expect(queue.id.length).to.greaterThan(3);
      expect(queue.length).to.eql(0);
      expect(queue.isRunning).to.eql(true);
    });

    it('create (stopped)', () => {
      const queue = MemoryQueue.create({ isRunning: false });
      expect(queue.isRunning).to.eql(false);
    });

    it('dispose', () => {
      const queue = MemoryQueue.create();
      expect(queue.isDisposed).to.eql(false);
      queue.dispose();
      expect(queue.isDisposed).to.eql(true);
    });
  });

  describe('start/stop', () => {
    it('isRunning', () => {
      const queue = MemoryQueue.create();
      expect(queue.isRunning).to.eql(true);
      expect(queue.stop().isRunning).to.eql(false);
      expect(queue.start().isRunning).to.eql(true);
    });

    it('event: QUEUE/status', () => {
      const queue = MemoryQueue.create();
      const fired: t.QueueEvent[] = [];

      queue.event$.subscribe((e) => fired.push(e));
      queue
        .stop()
        .stop() // NB: Does not repeat events when state does not differ.
        .start()
        .start();

      expect(fired.length).to.eql(2);
      expect(fired[0].type).to.eql('QUEUE/status');
      expect(fired[1].type).to.eql('QUEUE/status');

      const e1 = fired[0].payload as t.IQueueStatus;
      const e2 = fired[1].payload as t.IQueueStatus;

      expect(e1.id).to.eql(queue.id);
      expect(e1.isRunning).to.eql(false);
      expect(e1.length).to.eql(0);

      expect(e2.id).to.eql(queue.id);
      expect(e2.isRunning).to.eql(true);
      expect(e2.length).to.eql(0);
    });
  });

  describe('push', () => {
    it('event: QUEUE/pushed', async () => {
      const queue = MemoryQueue.create().stop();

      const fired: t.QueueEvent[] = [];
      queue.event$.subscribe((e) => fired.push(e));

      queue.push<number>(async () => 123);

      expect(fired.length).to.eql(1);
      expect(fired[0].type).to.eql('QUEUE/pushed');

      const e1 = fired[0].payload as t.IQueuePushed;
      expect(e1.id).to.eql(`${queue.id}:1`);
      expect(e1.isRunning).to.eql(false);

      queue.start();
      await time.wait(10);

      queue.push<number>(async () => 456);

      const e2 = fired[fired.length - 1].payload as t.IQueuePushed;
      expect(e2.id).to.eql(`${queue.id}:2`);
      expect(e2.isRunning).to.eql(true);
    });

    it('events: QUEUE/item/(start ➔ done)', async () => {
      const { queue, pushDelay } = testQueue();

      queue.stop();
      const item = queue.push<number>(async () => pushDelay(123, 10));

      const fired: t.QueueItemEvent[] = [];
      item.event$.subscribe((e) => fired.push(e));

      const id = `${queue.id}:1`;
      expect(item.id).to.eql(id);

      queue.start();
      await time.delay(20);

      expect(fired.length).to.eql(2);

      expect(fired[0].type).to.eql('QUEUE/item/start');
      expect(fired[1].type).to.eql('QUEUE/item/done');

      expect(fired[0].payload.id).to.eql(id);
      expect(fired[1].payload.id).to.eql(id);

      const done = fired[1].payload as t.IQueueItemDone;
      expect(done.result).to.eql(123);
      expect(done.elapsed).to.greaterThan(8); // NB: The delay on the handler (set in test above)
    });

    it('single item: promise (isDone: false ➔ true)', async () => {
      const { queue, pushDelay } = testQueue();
      const item = queue.push<number>(async () => pushDelay(123, 10));

      expect(item.isDone).to.eql(false);
      expect(item.elapsed).to.eql(-1);
      expect(item.result).to.eql(undefined);
      expect(item.error).to.eql(undefined);

      const res = await item;
      expect(res).to.eql(123);

      expect(item.isDone).to.eql(true);
      expect(item.elapsed).to.greaterThan(8);
      expect(item.result).to.eql(123);
      expect(item.error).to.eql(undefined);
    });

    it('push: executes items in sequence', async () => {
      const { queue, pushDelay, results } = testQueue();

      const res1 = queue.push<number>(async () => pushDelay(1, 10));
      const res2 = queue.push<number>(async () => pushDelay(2, 5)); // NB: Runs quicker than the first item. Execution order is respected.

      expect(queue.length).to.eql(1); // NB: The first item has immediately been taken off the queue.

      await Promise.all([res1, res2]);

      expect(results).to.eql([1, 2]);
      expect(queue.length).to.eql(0);
    });

    it('push: continues after error', async () => {
      const { queue, pushDelay, results } = testQueue();

      const res1 = queue.push<number>(async () => pushDelay(1, 10));
      const res2 = queue.push<number>(async () => {
        throw new Error('Fail');
      });

      const res3 = queue.push<number>(async () => pushDelay(3));

      let error = '';
      try {
        await res2;
      } catch (err: any) {
        error = err.message;
      }

      expect(error).to.eql('Fail');
      expect(await res1).to.eql(1);
      expect(await res3).to.eql(3);
      expect(results).to.eql([1, 3]);
    });
  });
});
