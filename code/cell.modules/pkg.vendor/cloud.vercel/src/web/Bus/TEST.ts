import { Test, expect } from 'sys.ui.dev';
import { BusEvents } from '.';

export default Test.describe('BusEvents', (e) => {
  const is = BusEvents.is;

  e.it('✨✨ See [BusController] tests', () => {
    //
  });

  e.it('is.base', () => {
    const test = (type: string, expected: boolean) => {
      expect(is.base({ type, payload: {} })).to.eql(expected);
    };
    test('foo', false);
    test('vendor.vercel/', true);
  });

  e.it('is.instance', () => {
    const res1 = is.instance({ type: 'vendor.vercel/', payload: { instance: 'abc' } }, 'abc');
    const res2 = is.instance({ type: 'vendor.vercel/', payload: { instance: 'abc' } }, '123');
    const res3 = is.instance({ type: 'foo', payload: { instance: 'abc' } }, 'abc');

    expect(res1).to.eql(true);
    expect(res2).to.eql(false);
    expect(res3).to.eql(false);
  });
});
