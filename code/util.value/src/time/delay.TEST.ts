import { expect } from 'chai';
import * as moment from 'moment';
import { wait, delay } from './delay';

describe('delay', () => {
  it('delays then executes', async () => {
    const startedAt = moment();
    let count = 0;
    expect(moment().diff(startedAt)).to.be.lessThan(8);
    await delay(10, () => (count += 1));
    expect(moment().diff(startedAt)).to.be.greaterThan(8);
  });

  it('does not fail when no callback is specified', async () => {
    const startedAt = moment();
    expect(moment().diff(startedAt)).to.be.lessThan(8);
    await delay(10);
    expect(moment().diff(startedAt)).to.be.greaterThan(8);
  });
});

describe('wait', () => {
  it('pauses for given time', async () => {
    const startedAt = moment();
    expect(moment().diff(startedAt)).to.be.lessThan(10);
    await wait(15);
    expect(moment().diff(startedAt)).to.be.greaterThan(10);
  });
});
