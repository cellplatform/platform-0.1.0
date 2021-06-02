import { Menu, MenuItemConstructorOptions as M } from 'electron';

import { t, rx, slug, Patch, R } from '../common';
import { Events } from './main.Menu.Events';
import { MenuTree } from './util';

/**
 * Behavioral event controller.
 */
export function Controller(args: { bus: t.EventBus<any> }) {
  const bus = rx.busAsType<t.MenuEvent>(args.bus);
  const events = Events({ bus });
  const { dispose, dispose$ } = events;

  /**
   * Load a menu structure.
   */
  events.load.req$.subscribe((e) => {
    const { tx = slug() } = e;

    // Ensure each item has an id.
    const menu = R.clone(e.menu);
    MenuTree(menu).walk((e) => {
      if (!e.id) e.item.id = slug();
    });

    // Load into electron.
    const template = R.clone(menu);
    MenuTree(template).walk((e) => {
      // NB: Electron assumes "normal" and passign in the "normal" type causes the menu to not load.
      if (e.item.type === 'normal') delete (e.item as any).type;
    });
    Menu.setApplicationMenu(Menu.buildFromTemplate(template as any));

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
