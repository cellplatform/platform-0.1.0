import { expect, time } from '../test';
import { Queue } from '.';

describe.only('Queue', () => {
  const testQueue = () => {
    const queue = Queue.create();
    const results: number[] = [];
    const pushDelay = async (value: number, delay: number = 5) => {
      await time.wait(delay);
      results.push(value);
      return value;
    };

    return { queue, results, pushDelay };
  };

  it('init', () => {
    const queue = Queue.create();
    expect(queue.length).to.eql(0);
    expect(queue.isEmpty).to.eql(true);
    expect(queue.isRunning).to.eql(false);
  });

  it('dispose', () => {
    const queue = Queue.create();
    expect(queue.isDisposed).to.eql(false);
    queue.dispose();
    expect(queue.isDisposed).to.eql(true);
  });

  it('push: executes items in sequence', async () => {
    const { queue, pushDelay, results } = testQueue();
    expect(queue.isRunning).to.eql(false);

    const res1 = queue.push<number>(async () => pushDelay(1, 10));
    const res2 = queue.push<number>(async () => pushDelay(2, 5)); // NB: Runs quicker than the first item. Execution order is respected.

    expect(queue.isRunning).to.eql(true);
    expect(queue.length).to.eql(1); // NB: The first item has immediately been taken off the queue.

    await Promise.all([res1, res2]);

    expect(results).to.eql([1, 2]);
    expect(queue.isEmpty).to.eql(true);
    expect(queue.length).to.eql(0);

    expect(await res1).to.eql(1);
    expect(await res2).to.eql(2);
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
    } catch (err) {
      error = err.message;
    }

    expect(error).to.eql('Fail');
    expect(await res1).to.eql(1);
    expect(await res3).to.eql(3);
    expect(results).to.eql([1, 3]);
  });
});
