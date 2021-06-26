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

  const item: t.MenuItem = { type: 'normal', label: 'Modules', submenu: [] };
  const submenu = item.submenu || [];

  const openWindow = async (url: string) => {
    const res = await events.window.create.fire({
      url,
      devTools: true,
      props: { width: 1200, height: 900 },
    });
    console.log('create/res:', res);
  };

  submenu.push({
    type: 'normal',
    label: 'Install: app.sys/web (local)',
    async click() {
      const status = {
        system: await events.system.status.get(),
        bundle: await events.bundle.status.get({ dir: 'app.sys/web' }),
      };

      // console.log('status.bundle', status.bundle);

      const urls = {
        dev: 'http://localhost:5050', // TEMP 🐷
        prod: status.bundle?.url || '',
      };

      const url = status.system.is.prod ? urls.prod : urls.dev;
      console.log('url', url);

      await openWindow(url);
    },
  });

  submenu.push({ type: 'separator' });

  const Push = {
    item(label: string, url: string) {
      const handler = async () => {
        console.log('url', url);
        await openWindow(url);
      };
      submenu.push({ type: 'normal', label: label, click: handler });
    },
    separator() {
      submenu.push({ type: 'separator' });
    },
  };

  type T = { ns: string; url: string };
  const refs: T[] = [
    {
      ns: 'sys.net',
      url: 'https://dev.db.team/cell:ckmv1vll1000e01etelnr0s9a:A1/fs/sys.net/index.html',
    },
    {
      ns: 'sys.scratchpad',
      url: 'https://dev.db.team/cell:ckmv3zeal000d1xetdafghfj9:A1/fs/sys.scratchpad/index.html?ui.dev.ns=ui/SlugProject',
    },
  ];

  refs.forEach((ref) => Push.item(ref.ns, ref.url));

  if (ENV.isDev) {
    Push.separator();

    const ports = [3032, 3033, 3034, 3036, 3037, 3040];
    ports.forEach((port) => Push.item(`localhost:${port}`, `http://localhost:${port}`));
  }

  // Finish up.
  return item;
}
