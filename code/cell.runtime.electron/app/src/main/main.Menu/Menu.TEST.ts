import { expect, rx, t } from '../../test';
import { Menu } from '.';

const bus = rx.bus();

const Mock = {
  init() {
    const events = Menu.Events({ bus });
    const controller = Menu.Controller({ bus });

    return {
      events,
      controller,
      dispose() {
        events.dispose();
        controller.dispose();
      },
    };
  },
};

describe.only('main.Menu', () => {
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

  describe.only('Controller: Load', () => {
    it('auto adds IDs', async () => {
      const mock = Mock.init();
      const menu: t.Menu = [
        {
          id: 'foo',
          label: 'Foo',
          type: 'normal',
          submenu: [{ role: 'quit', label: 'Quit', type: 'normal' }],
        },
      ];

      const res1 = await mock.events.load.fire(menu);
      const submenu2 = (res1.menu[0] as t.MenuItemNormal).submenu ?? [];

      expect(res1.menu[0].id).to.eql('foo'); // Explicit id (no change).
      expect(submenu2[0].id).to.exist; // Slug inserted.

      // Does not change auto-id on subsequence calls.
      const res2 = await mock.events.load.fire(res1.menu);
      expect(res2.menu).to.eql(res1.menu);

      mock.dispose();
    });
  });

  describe('Controller: Status', () => {
    it('get status', async () => {
      const mock = Mock.init();
      // const events = Menu.Events({ bus });
      // Menu.Controller({ bus });

      const res = await mock.events.status.get();

      console.log('-------------------------------------------');
      console.log('res', res);
      mock.dispose();
    });
  });
});
