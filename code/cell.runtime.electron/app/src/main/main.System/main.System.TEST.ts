import { expect, rx } from '../../test';
import { System } from '.';

const bus = rx.bus();

describe('main.System', () => {
  describe('Events', () => {
    const events = System.Events({ bus });

    it('is.base', () => {
      const test = (type: string, expected: boolean) => {
        expect(events.is.base({ type, payload: {} })).to.eql(expected);
      };
      test('foo', false);
      test('runtime.electron/System/', true);
    });

    it('is.data', () => {
      const test = (type: string, expected: boolean) => {
        expect(events.is.data({ type, payload: {} })).to.eql(expected);
      };
      test('foo', false);
      test('runtime.electron/System/data/', true);
    });

    it('is.open', () => {
      const test = (type: string, expected: boolean) => {
        expect(events.is.open({ type, payload: {} })).to.eql(expected);
      };
      test('foo', false);
      test('runtime.electron/System/open/', true);
    });
  });
});
