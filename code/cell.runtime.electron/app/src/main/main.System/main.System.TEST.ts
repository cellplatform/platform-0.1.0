import { expect, rx } from '../../test';
import { System } from '.';

const bus = rx.bus();

describe('main.System', () => {
  describe('Events', () => {
    it('is', () => {
      const events = System.Events({ bus });

      const test = (type: string, expected: boolean) => {
        const event = { type, payload: {} };
        expect(events.is.base(event)).to.eql(expected);
      };

      test('foo', false);
      test('runtime.electron/System', false);

      test('runtime.electron/System/', true);
      test('runtime.electron/System/status:req', true);
    });
  });
});
