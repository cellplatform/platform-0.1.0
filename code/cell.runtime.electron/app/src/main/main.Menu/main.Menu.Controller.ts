import { Menu, MenuItemConstructorOptions as M } from 'electron';

import { t, rx } from '../common';
import { Events } from './main.Menu.Events';

/**
 * Behavioral event controller.
 */
export function Controller(args: { bus: t.EventBus<any> }) {
  const bus = rx.busAsType<t.BundleEvent>(args.bus);
  const events = Events({ bus });
  const { dispose, dispose$ } = events;

  // const $ = bus.$.pipe(takeUntil(dispose$));
  events.load.req$.subscribe((e) => {
    console.log('load menu', e);

    const menu = Menu.buildFromTemplate(e.menu as M[]);
    Menu.setApplicationMenu(menu);
  });

  return {
    dispose,
    dispose$,
  };
}
