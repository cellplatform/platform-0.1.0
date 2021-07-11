import { filter } from 'rxjs/operators';

import { Bundle, Menu, t, log } from '../common';

type Events = {
  menu: t.MenuEvents;
  bundle: t.BundleEvents;
};

/**
 * Root "Application Modules" menu items.
 */
export function AppModulesMenuSection(args: { bus: t.EventBus<any> }): t.Menu {
  const { bus } = args;

  const events = {
    menu: Menu.Events({ bus }),
    bundle: Bundle.Events({ bus }),
  };

  const preferences = PreferencesMenuItem({ events });
  const installed = InstalledModulesItem({ events });

  return [preferences, installed];
}

/**
 * A1: Preferences
 */
function PreferencesMenuItem(args: { events: Events }) {
  const id = 'sys.app.prefs';
  const item: t.MenuItem = {
    id,
    label: 'Preferences',
    type: 'normal',
    accelerator: 'CommandOrControl+,',
    click() {
      log.info('click prefs');
    },
  };

  return item;
}

/**
 * A1: Installed Modules
 */
function InstalledModulesItem(args: { events: Events }) {
  const { events } = args;
  const id = 'sys.app.modules.items';

  const load = async () => {
    const list = await events.bundle.list.get();

    const items = list.items.map((module): t.MenuItem => {
      const { domain, namespace, version } = module;
      const id = `${domain}/${namespace}`;
      const label = id;

      /**
       * Installed Module Item
       */

      const item: t.MenuItem = {
        id,
        label,
        type: 'checkbox',
        click() {
          //
          log.info('click', module);
          //
        },
      };

      return item;
    });

    await events.menu.change(id, (menu) => {
      menu.submenu = items;
      menu.enabled = items.length > 0;
    });
  };

  /**
   * Listen for newly installed modules and update the list.
   */
  events.bundle.install.res$.pipe(filter((e) => e.ok)).subscribe((e) => {
    load();
  });

  load();
  const item: t.MenuItem = { id, label: 'Installed', type: 'normal' };
  return item;
}
