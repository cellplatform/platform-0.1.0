import { expect, rx } from '../../test';
import { Window } from '.';

const bus = rx.bus();

describe('main.Window', () => {
  describe('Events', () => {
    const is = Window.Events.is;

    it('is (static/instance)', () => {
      const events = Window.Events({ bus });
      expect(events.is).to.equal(Window.Events.is);
    });

    it('is.base', () => {
      const test = (type: string, expected: boolean) => {
        expect(is.base({ type, payload: {} })).to.eql(expected);
      };

      test('foo', false);
      test('runtime.electron/Window', false);

      test('runtime.electron/Window/', true);
      test('runtime.electron/Window/status:req', true);
    });
  });
});
