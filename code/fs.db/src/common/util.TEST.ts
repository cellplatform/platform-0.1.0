import { expect } from 'chai';
import { util, time } from '.';

describe('util: timestamp', () => {
  it('does nothing with non-object', () => {
    expect(util.ensureTimestamps(undefined as any)).to.eql(undefined);
    expect(util.ensureTimestamps(null as any)).to.eql(null);
    expect(util.ensureTimestamps(123 as any)).to.eql(123);
    expect(util.ensureTimestamps(true as any)).to.eql(true);
    expect(util.ensureTimestamps('hello' as any)).to.eql('hello');

    expect(util.ensureTimestamps(null as any)).to.eql(null);
    expect(util.ensureTimestamps(undefined as any)).to.eql(undefined);
    expect(util.ensureTimestamps(123 as any)).to.eql(123);
    expect(util.ensureTimestamps(true as any)).to.eql(true);
    expect(util.ensureTimestamps('hello' as any)).to.eql('hello');
  });

  it('does nothing with non-timestamp object', () => {
    expect(util.ensureTimestamps({} as any)).to.eql({});
    expect(util.incrementTimestamps({} as any)).to.eql({});
  });

  it('does nothing timestamp values are not numbers', () => {
    const model: any = { createdAt: 'hello', modifiedAt: { foo: 123 } };
    expect(util.ensureTimestamps(model)).to.eql(model);
  });

  it('converts to now', () => {
    const now = time.now.timestamp;
    const model = util.ensureTimestamps({ createdAt: -1, modifiedAt: -1 });

    // expect(model.).to.eql(initial);
    expect(model.createdAt).to.be.within(now - 5, now + 20);
    expect(model.modifiedAt).to.be.within(now - 5, now + 20);

    // expect(model).to.eql({ createdAt: now, modifiedAt: now });
  });

  it('converts to given default date', () => {
    const now = 1234;
    const model = util.ensureTimestamps({ createdAt: -1, modifiedAt: -1 }, now);
    expect(model).to.eql({ createdAt: now, modifiedAt: now });
  });

  it('increments modified date', () => {
    const initial = 1234;
    const now = time.now.timestamp;
    const model1 = util.ensureTimestamps({ createdAt: -1, modifiedAt: -1 }, initial);
    const model2 = util.incrementTimestamps(model1);
    expect(model2.createdAt).to.eql(initial);
    expect(model2.modifiedAt).to.be.within(now - 5, now + 20);
  });
});
