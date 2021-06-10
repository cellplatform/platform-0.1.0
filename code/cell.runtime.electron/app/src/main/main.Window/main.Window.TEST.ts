import { expect, rx } from '../../test';
import { Window } from '.';

const bus = rx.bus();

describe('main.Window', () => {
  describe('Events', () => {
    const events = Window.Events({ bus });

    it('is.base', () => {
      const test = (type: string, expected: boolean) => {
        expect(events.is.base({ type, payload: {} })).to.eql(expected);
      };

      test('foo', false);
      test('runtime.electron/Window', false);

      test('runtime.electron/Window/', true);
      test('runtime.electron/Window/status:req', true);
    });
  });
});
