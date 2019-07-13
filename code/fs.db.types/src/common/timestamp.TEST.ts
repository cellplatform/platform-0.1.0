import { expect } from 'chai';
import { timestamp } from '.';

describe('util: timestamp', () => {
  it('does nothing with non-object', () => {
    expect(timestamp.ensure(undefined as any)).to.eql(undefined);
    expect(timestamp.ensure(null as any)).to.eql(null);
    expect(timestamp.ensure(123 as any)).to.eql(123);
    expect(timestamp.ensure(true as any)).to.eql(true);
    expect(timestamp.ensure('hello' as any)).to.eql('hello');

    expect(timestamp.ensure(null as any)).to.eql(null);
    expect(timestamp.ensure(undefined as any)).to.eql(undefined);
    expect(timestamp.ensure(123 as any)).to.eql(123);
    expect(timestamp.ensure(true as any)).to.eql(true);
    expect(timestamp.ensure('hello' as any)).to.eql('hello');
  });

  it('does nothing with non-timestamp object', () => {
    expect(timestamp.ensure({} as any)).to.eql({});
    expect(timestamp.increment({} as any)).to.eql({});
  });

  it('does nothing timestamp values are not numbers', () => {
    const model: any = { createdAt: 'hello', modifiedAt: { foo: 123 } };
    expect(timestamp.ensure(model)).to.eql(model);
  });

  it('converts to now', () => {
    const now = timestamp.now;
    const model = timestamp.ensure({ createdAt: -1, modifiedAt: -1 });
    expect(model.createdAt).to.be.within(now - 5, now + 20);
    expect(model.modifiedAt).to.be.within(now - 5, now + 20);
  });

  it('converts to given default date', () => {
    const now = 1234;
    const model = timestamp.ensure({ createdAt: -1, modifiedAt: -1 }, now);
    expect(model).to.eql({ createdAt: now, modifiedAt: now });
  });

  it('increments modified date', () => {
    const initial = 1234;
    const now = timestamp.now;
    const model1 = timestamp.ensure({ createdAt: -1, modifiedAt: -1 }, initial);
    const model2 = timestamp.increment(model1);
    expect(model2.createdAt).to.eql(initial);
    expect(model2.modifiedAt).to.be.within(now - 5, now + 20);
  });
});
