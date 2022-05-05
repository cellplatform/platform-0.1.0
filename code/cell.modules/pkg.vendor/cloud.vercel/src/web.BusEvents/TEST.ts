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
    expect(is.instance({ type: 'vendor.vercel/', payload: { id: 'abc' } }, 'abc')).to.eql(true);
    expect(is.instance({ type: 'vendor.vercel/', payload: { id: 'abc' } }, '123')).to.eql(false);
    expect(is.instance({ type: 'foo', payload: { id: 'abc' } }, 'abc')).to.eql(false);
  });
});
