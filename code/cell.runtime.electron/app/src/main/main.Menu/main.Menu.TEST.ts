import { expect, rx } from '../../test';
import { Menu } from '.';

const bus = rx.bus();

describe('main.Menu', () => {
  describe('Events', () => {
    it('is', () => {
      const events = Menu.Events({ bus });

      const test = (type: string, expected: boolean) => {
        const event = { type, payload: {} };
        expect(events.is.base(event)).to.eql(expected);
      };

      test('foo', false);
      test('runtime.electron/Menu', false);

      test('runtime.electron/Menu/', true);
      test('runtime.electron/Menu/status:req', true);
    });
  });
});
