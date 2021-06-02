import { Menu } from 'electron';

import { t, rx, slug, R } from '../common';
import { Events } from './main.Menu.Events';
import { MenuTree } from './util';

/**
 * Behavioral event controller.
 */
export function Controller(args: { bus: t.EventBus<any> }) {
  const bus = rx.busAsType<t.MenuEvent>(args.bus);
  const events = Events({ bus });
  const { dispose, dispose$ } = events;

  const ref = { current: [] as t.Menu };

  const clickHandler = (args: { item: t.MenuItem; parent?: t.MenuItem; handler?: () => void }) => {
    return () => {
      args.handler?.();
      events.clicked.fire(args.item, args.parent);
    };
  };

  const setApplicationMenu = (menu: t.Menu) => {
    const template = R.clone(menu);

    MenuTree(template).walk((e) => {
      const { item, parent } = e;

      // Intercept click handlers.
      if (item.type !== 'separator') {
        const handler = item.click;
        item.click = clickHandler({ item, parent, handler });
      }

      // NB: Electron assumes "normal" and passign in the "normal" type causes the menu to not load.
      if (item.type === 'normal') delete (item as any).type;
    });

    Menu.setApplicationMenu(Menu.buildFromTemplate(template as any));
  };

  /**
   * Status
   */
  events.status.req$.subscribe((e) => {
    const { tx = slug() } = e;
    bus.fire({
      type: 'runtime.electron/Menu/status:res',
      payload: { tx, menu: ref.current },
    });
  });

  /**
   * Load a menu structure.
   */
  events.load.req$.subscribe((e) => {
    const { tx = slug() } = e;

    // Ensure each item has an id.
    const menu = R.clone(e.menu);
    MenuTree(menu)
      .filter((e) => !e.id)
      .walk((e) => (e.item.id = slug()));

    // Load into the electron menu.
    setApplicationMenu(menu);
    ref.current = menu;

    // Finish up.
    bus.fire({
      type: 'runtime.electron/Menu/load:res',
      payload: { tx, menu },
    });
  });

  return {
    dispose,
    dispose$,
  };
}
