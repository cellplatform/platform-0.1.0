import { expect, rx } from '../test';
import { BusEvents } from '.';

const bus = rx.bus();

describe('BusEvents', () => {
  const is = BusEvents.is;

  it('is.base', () => {
    const test = (type: string, expected: boolean) => {
      expect(is.base({ type, payload: {} })).to.eql(expected);
    };
    test('foo', false);
    test('http.vercel/', true);
  });
});
