import { t, ENV, Window, System, Bundle } from '../common';

/**
 * Module management
 */
export function ModulesMenu(args: { bus: t.ElectronMainBus }): t.MenuItem {
  const { bus } = args;
  const events = {
    window: Window.Events({ bus }),
    system: System.Events({ bus }),
    bundle: Bundle.Events({ bus }),
  };
  // const getStatus = () => events.system.status.get();

  const item: t.MenuItem = {
    type: 'normal',
    label: 'Modules',
    submenu: [],
  };

  const submenu = item.submenu || [];

  submenu.push({
    type: 'normal',
    label: 'Install...',
    async click() {
      //
      const status = {
        system: await events.system.status.get(),
        bundle: await events.bundle.status.get({ dir: 'app.sys/web' }),
      };

      console.log('status.bundle', status.bundle);

      // const url = 'http://localhost:5050'; // app.sys (localhost)
      // const url = status.bundle.

      const urls = {
        dev: 'http://localhost:5050', // TEMP 🐷
        prod: status.bundle?.url || '',
      };

      const url = status.system.is.prod ? urls.prod : urls.dev;

      console.log('url', url);

      // const url = ``

      const res = await events.window.create.fire({
        url,
        devTools: true,
        props: { width: 1200, height: 900 },
      });

      // console.log('create/res:', res);
    },
  });

  return item;
}
