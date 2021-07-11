import { Menu, app } from 'electron';

import { R, slug, t, time } from '../common';
import { MenuTree } from '../util';

export function LoadController(args: {
  bus: t.EventBus<t.MenuEvent>;
  events: t.MenuEvents;
  ref: { current: t.Menu };
}) {
  const { bus, events, ref } = args;

  /**
   * Load a menu structure.
   */
  events.load.req$.subscribe((e) => {
    const timer = time.timer();
    const { tx = slug() } = e;

    const done = (args: { menu?: t.Menu; error?: string }) => {
      const { menu = [], error } = args;
      const elapsed = timer.elapsed.msec;
      bus.fire({
        type: 'runtime.electron/Menu/load:res',
        payload: { tx, menu, error, elapsed },
      });
    };

    try {
      // Ensure each item has an ID.
      const menu = R.clone(e.menu);
      MenuTree(menu)
        .filter((e) => !e.id)
        .walk((e) => (e.item.id = slug()));

      // Load into the electron menu.
      setApplicationMenu({ events, menu });
      ref.current = menu;

      done({ menu }); // Success.
    } catch (err) {
      const error = `Failed while loading menu. ${err.message}`;
      done({ error }); // Failure.
    }
  });
}

/**
 * [Helpers]
 */

const clickHandler = (args: {
  events: t.MenuEvents;
  item: t.MenuItem;
  parent?: t.MenuItem;
  handler?: () => void;
}) => {
  return () => {
    args.handler?.();
    args.events.clicked.fire(args.item, args.parent);
  };
};

const setApplicationMenu = (args: { menu: t.Menu; events: t.MenuEvents }) => {
  const { events } = args;
  const template = R.clone(args.menu);

  if (!Menu) {
    /**
     * NOTE: The function is being called prior to the Electron app having been loaded.
     *       This will occur during unit-testing (where the menu state is mocked)
     *       so it is safe to ignore this final step of passing the menu into the
     *       electron Menu system.
     */
    return;
  }

  MenuTree(template).walk((e) => {
    const { item, parent } = e;

    // Intercept click handlers.
    if (item.type !== 'separator') {
      const handler = item.click;
      item.click = clickHandler({ events, item, parent, handler });
    }

    // NB: Electron assumes "normal" and passing in the "normal" type causes the menu to not load.
    if (item.type === 'normal') delete (item as any).type;
  });

  const menu = Menu.buildFromTemplate(template as any);
  Menu.setApplicationMenu(menu);
};
