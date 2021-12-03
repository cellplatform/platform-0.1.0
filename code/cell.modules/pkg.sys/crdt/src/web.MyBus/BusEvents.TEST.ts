import { expect, rx } from '../test';
import { MyBus } from '.';

const bus = rx.bus();

describe('BusEvents', () => {
  describe('is', () => {
    const is = MyBus.Events.is;

    it('is (static/instance)', () => {
      const events = MyBus.Events({ bus });
      expect(events.is).to.equal(is);
    });

    it('is.base', () => {
      const test = (type: string, expected: boolean) => {
        expect(is.base({ type, payload: {} })).to.eql(expected);
      };
      test('foo', false);
      test('my.namespace/', true);
    });

    it('is.instance', () => {
      const type = 'my.namespace/';
      expect(is.instance({ type, payload: { id: 'abc' } }, 'abc')).to.eql(true);
      expect(is.instance({ type, payload: { id: 'abc' } }, '123')).to.eql(false);
      expect(is.instance({ type: 'foo', payload: { id: 'abc' } }, 'abc')).to.eql(false);
    });
  });
});
