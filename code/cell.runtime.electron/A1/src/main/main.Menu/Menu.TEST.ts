import { expect, rx, t, time, R } from '../../test';
import { Menu } from '.';
import { MenuTree } from './util';

type N = t.MenuItemNormal;

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

  describe('Controller: load', () => {
    it('auto add IDs to menu items (deep)', async () => {
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

  describe('Controller: status', () => {
    it('get status', async () => {
      const mock = Mock.init();
      const menu: t.Menu = [{ id: 'foo', label: 'Foo', type: 'normal' }];

      const res1 = await mock.events.status.get();
      await mock.events.load.fire(menu);
      const res2 = await mock.events.status.get();
      await mock.events.load.fire([]);
      const res3 = await mock.events.status.get();

      expect(res1.menu).to.eql([]);
      expect(res2.menu).to.eql(menu);
      expect(res3.menu).to.eql([]);

      mock.dispose();
    });
  });

  describe('Controller: change (via patches)', () => {
    it('error: menu item not found', async () => {
      const mock = Mock.init();

      const menu: t.Menu = [{ id: 'foo', label: 'Foo', type: 'normal' }];
      await mock.events.load.fire(menu);

      const res = await mock.events.change('404', async (e) => null);
      expect(res.error).to.match(/Menu with id '404' not found/);

      mock.dispose();
    });

    const sample: t.Menu = [
      {
        id: 'root-1',
        label: 'root-1',
        type: 'normal',
        submenu: [
          { id: 'child-1', label: 'one', type: 'normal' },
          {
            id: 'child-2',
            label: 'two',
            type: 'normal',
            submenu: [{ id: 'child-2a', label: 'child-2a', type: 'normal' }],
          },
        ],
      },
      { id: 'root-2', label: 'root-2', type: 'normal' },
    ];

    it('change: root menu item', async () => {
      const menu = R.clone(sample);
      const mock = Mock.init();
      await mock.events.load.fire(menu);

      const res = await mock.events.change('root-1', async (menu) => {
        await time.delay(5); // NB: prove async
        menu.label = 'Hello';
      });
      const status = await mock.events.status.get();

      expect(res.id).to.eql('root-1');
      expect((res.menu[0] as N).label).to.eql('Hello');
      expect((status.menu[0] as N).label).to.eql('Hello');

      mock.dispose();
    });

    it('change: sub-menu item (deep)', async () => {
      const menu = R.clone(sample);
      const mock = Mock.init();
      await mock.events.load.fire(menu);

      const id = 'child-2a';
      const res = await mock.events.change(id, (menu) => {
        // NB: Not an async-promise
        menu.label = 'Hello';
      });
      const status = await mock.events.status.get();

      expect(res.id).to.eql(id);

      const expectLabel = (root: t.Menu, expected: string) => {
        const item = MenuTree(root).find<N>((e) => e.id === id);
        expect(item?.label).to.eql(expected);
      };

      expectLabel(res.menu, 'Hello');
      expectLabel(status.menu, 'Hello');

      mock.dispose();
    });
  });
});
