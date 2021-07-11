import { filter } from 'rxjs/operators';

import { Bundle, Menu, t, log, Window } from '../common';

type Events = {
  menu: t.MenuEvents;
  bundle: t.BundleEvents;
  window: t.WindowEvents;
};

/**
 * Root "Application Modules" menu items.
 */
export function AppModulesMenuSection(args: { bus: t.EventBus<any> }): t.Menu {
  const { bus } = args;

  const events = {
    menu: Menu.Events({ bus }),
    bundle: Bundle.Events({ bus }),
    window: Window.Events({ bus }),
  };

  const preferences = PreferencesMenuItem({ events });
  const installed = InstalledModulesItem({ events });

  return [preferences, installed];
}

/**
 * A1: Preferences
 */
function PreferencesMenuItem(args: { events: Events }) {
  const { events } = args;

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

  const openWindow = async (url: string) => {
    const res = await events.window.create.fire({
      url,
      devTools: true,
      props: { width: 1200, height: 900 },
    });
    console.log('create/res:', res);
  };

  const load = async () => {
    const list = await events.bundle.list.get();

    const items = list.items.map((module): t.MenuItem => {
      const { domain, namespace, version } = module;

      const scope = domain.startsWith('runtime:electron') ? 'system' : 'domain';

      const id = `${domain}/${namespace}`;
      const label = `Open: '${namespace}' (${scope})`;

      /**
       * Installed Module Item
       */

      const item: t.MenuItem = {
        id,
        label,
        type: 'normal',
        async click() {
          //
          log.info('click', module);
          // const {  } = module;
          const info = await events.bundle.status.get({ domain, namespace, version });

          if (info.error) log.error(`Failed to retrieve bundle info. ${info.error}`);

          console.log('info', info);

          const url = info.status?.urls.entry || '';
          if (!url) log.error(`Failed to retieve module entry URL.`);
          if (url) {
            console.log('OPEN:', url);
            openWindow(url);
          }
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
