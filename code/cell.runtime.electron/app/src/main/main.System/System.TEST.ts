import { expect, rx } from '../../test';
import { System } from '.';

const bus = rx.bus();

describe('main.System', () => {
  describe('Events', () => {
    const is = System.Events.is;

    it('is (static/instance)', () => {
      const events = System.Events({ bus });
      expect(events.is).to.equal(System.Events.is);
    });

    it('is.base', () => {
      const test = (type: string, expected: boolean) => {
        expect(is.base({ type, payload: {} })).to.eql(expected);
      };
      test('foo', false);
      test('runtime.electron/System/', true);
    });

    it('is.data', () => {
      const test = (type: string, expected: boolean) => {
        expect(is.data({ type, payload: {} })).to.eql(expected);
      };
      test('foo', false);
      test('runtime.electron/System/data/', true);
    });

    it('is.open', () => {
      const test = (type: string, expected: boolean) => {
        expect(is.open({ type, payload: {} })).to.eql(expected);
      };
      test('foo', false);
      test('runtime.electron/System/open/', true);
    });
  });
});
