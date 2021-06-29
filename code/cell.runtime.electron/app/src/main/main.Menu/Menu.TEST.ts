import { expect, rx } from '../../test';
import { Menu } from '.';

const bus = rx.bus();

describe('main.Menu', () => {
  describe('Events', () => {
    const is = Menu.Events.is;

    it('is (static/instance)', () => {
      const events = Menu.Events({ bus });
      expect(events.is).to.equal(Menu.Events.is);
    });

    it('is.base', () => {
      const test = (type: string, expected: boolean) => {
        expect(is.base({ type, payload: {} })).to.eql(expected);
      };

      test('foo', false);
      test('runtime.electron/Menu', false);

      test('runtime.electron/Menu/', true);
      test('runtime.electron/Menu/status:req', true);
    });
  });
});
