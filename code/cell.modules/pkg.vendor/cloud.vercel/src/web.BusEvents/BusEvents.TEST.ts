import { expect } from '../test';
import { BusEvents } from '.';

describe.only('BusEvents', () => {
  const is = BusEvents.is;

  it('✨✨ See [BusController] tests', () => {
    //
  });

  it('is.base', () => {
    const test = (type: string, expected: boolean) => {
      expect(is.base({ type, payload: {} })).to.eql(expected);
    };
    test('foo', false);
    test('vendor.vercel/', true);
  });

  it('is.instance', () => {
    expect(is.instance({ type: 'vendor.vercel/', payload: { id: 'abc' } }, 'abc')).to.eql(true);
    expect(is.instance({ type: 'vendor.vercel/', payload: { id: 'abc' } }, '123')).to.eql(false);
    expect(is.instance({ type: 'foo', payload: { id: 'abc' } }, 'abc')).to.eql(false);
  });
});
