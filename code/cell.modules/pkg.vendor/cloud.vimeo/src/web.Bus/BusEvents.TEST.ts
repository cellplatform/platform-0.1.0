import { expect, rx } from '../test';
import { VimeoBus } from '.';

const bus = rx.bus();

describe('BusEvents', () => {
  describe('is', () => {
    const is = VimeoBus.Events.is;

    it('is (static/instance)', () => {
      const events = VimeoBus.Events({ bus });
      expect(events.is).to.equal(is);
    });

    it('is.base', () => {
      const test = (type: string, expected: boolean) => {
        expect(is.base({ type, payload: {} })).to.eql(expected);
      };
      test('foo', false);
      test('vendor.vimeo/', true);
    });

    it('is.instance', () => {
      expect(is.instance({ type: 'vendor.vimeo/', payload: { id: 'abc' } }, 'abc')).to.eql(true);
      expect(is.instance({ type: 'vendor.vimeo/', payload: { id: 'abc' } }, '123')).to.eql(false);
      expect(is.instance({ type: 'foo', payload: { id: 'abc' } }, 'abc')).to.eql(false);
    });
  });
});
