import { expect } from 'chai';
import { wait, delay } from './delay';

const now = () => new Date().getTime();

describe('delay', () => {
  it('delays then executes', async () => {
    const startedAt = now();
    let count = 0;

    expect(now() - startedAt).to.be.lessThan(8);
    await delay(10, () => (count += 1));

    expect(now() - startedAt).to.be.greaterThan(8);
    expect(count).to.eql(1);
  });

  it('does not fail when no callback is specified', async () => {
    const startedAt = now();
    expect(now() - startedAt).to.be.lessThan(8);
    await delay(10);
    expect(now() - startedAt).to.be.greaterThan(8);
  });
});

describe('wait', () => {
  it('pauses for given time', async () => {
    const startedAt = now();
    expect(now() - startedAt).to.be.lessThan(10);
    await wait(15);
    expect(now() - startedAt).to.be.greaterThan(10);
  });
});
