import {
  Bundle,
  ENV,
  ManifestSource,
  ManifestUrl,
  Menu,
  Paths,
  System,
  t,
  Window,
} from '../common';

/**
 * Module management
 */
export function ModulesMenu(args: { bus: t.ElectronMainBus; localhost: string }): t.MenuItem {
  const { bus, localhost } = args;
  const events = {
    window: Window.Events({ bus }),
    system: System.Events({ bus }),
    bundle: Bundle.Events({ bus }),
    menu: Menu.Events({ bus }),
  };

  const item: t.MenuItem = {
    id: 'sys.debug.modules',
    type: 'normal',
    label: 'Modules',
    submenu: [],
  };
  const submenu = item.submenu || [];

  const openWindow = async (url: string) => {
    const res = await events.window.create.fire({
      url,
      devTools: true,
      props: { width: 1200, height: 900 },
    });
    console.log('create/res:', res);
  };

  const installModule = async (from: string) => {
    const source = ManifestSource(from);

    const res = await events.bundle.install.fire(source.toString(), {
      /**
       * TODO 🐷
       * test error on repeat installs ("URI not specified")
       */

      // force: ENV.isDev, // NB: Only repeat upload when running in development mode.
      timeout: 30000,
    });

    console.log('install response:', res);

    return res;
  };

  const openRuntimeUI = async (params?: t.Json) => {
    const getStatus = () => {
      return events.bundle.status.get({
        domain: 'runtime:electron:bundle',
        namespace: 'sys.ui.runtime',
      });
    };

    let bundle = await getStatus();
    if (!bundle.exists) {
      await installModule(Paths.bundle.sys.source.manifest);
      bundle = await getStatus();
    }

    const urls = {
      dev: 'http://localhost:5050', // TEMP 🐷
      prod: bundle.status?.urls.entry || '',
    };

    // TEMP 🐷
    const status = (await getStatus()).status;

    // const url = urls.prod;
    const url = ENV.isProd ? urls.prod : urls.dev;

    await openWindow(url);
  };

  submenu.push({
    type: 'normal',
    label: 'Install: sys.runtime (local)',
    click: () => {
      installModule(Paths.bundle.sys.source.manifest);
    },
  });

  submenu.push({
    type: 'normal',
    label: 'Install: sys.runtime (remote)',
    click: async () => {
      const url = 'https://dev.db.team/cell:ckqua3ubz000f4eet1ndfghx1:A1/fs/ui.runtime/index.json';
      installModule(url);
    },
  });

  submenu.push({ type: 'separator' });

  submenu.push({
    type: 'normal',
    label: `${Paths.bundle.sys.target} (local)`,
    click: () => openRuntimeUI({ view: 'ui.dev' }),
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
  ];

  refs.forEach((ref) => Push.item(ref.ns, ref.url));

  // Localhost addresses.
  Push.separator();
  const ports = [3000, 3032, 3033, 3034, 3036, 3037, 3040, 5050];
  ports.forEach((port) => Push.item(`localhost:${port}`, `http://localhost:${port}`));

  // Finish up.
  return item;
}
