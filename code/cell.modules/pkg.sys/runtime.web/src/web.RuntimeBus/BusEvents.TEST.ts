import { expect, rx } from '../test';
import { WebRuntimeBus } from '.';

const bus = rx.bus();

describe('BusEvents', () => {
  describe('is', () => {
    const is = WebRuntimeBus.Events.is;

    it('is (static/instance)', () => {
      const events = WebRuntimeBus.Events({ bus });
      expect(events.is).to.equal(is);
    });

    it('is.base', () => {
      const test = (type: string, expected: boolean) => {
        expect(is.base({ type, payload: {} })).to.eql(expected);
      };
      test('foo', false);
      test('sys.runtime.web/', true);
    });

    it('is.instance', () => {
      const type = 'sys.runtime.web/';
      expect(is.instance({ type, payload: { id: 'abc' } }, 'abc')).to.eql(true);
      expect(is.instance({ type, payload: { id: 'abc' } }, '123')).to.eql(false);
      expect(is.instance({ type: 'foo', payload: { id: 'abc' } }, 'abc')).to.eql(false);
    });
  });
});
