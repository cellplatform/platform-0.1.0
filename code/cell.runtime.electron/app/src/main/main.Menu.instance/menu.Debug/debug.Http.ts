import { shell } from 'electron';
import { t, System, Uri, Genesis } from '../common';

/**
 * Dev tools menu.
 */
export function ServerMenu(args: { bus: t.ElectronMainBus; http: t.IHttpClient }): t.MenuItem {
  const { bus, http } = args;
  const events = { system: System.Events({ bus }) };
  const genesis = Genesis(http);

  const getStatus = () => events.system.status.get();

  const open = {
    finder: async (path: string) => shell.openPath(path),

    async browser(path: string) {
      path = path.replace(/^\//, '');
      const status = await getStatus();
      const url = `${status.service.url}/${path}`;
      shell.openExternal(url);
    },
  };

  const item: t.MenuItem = {
    type: 'normal',
    label: 'Local (HTTP)',
    submenu: [
      {
        type: 'normal',
        label: 'Local Runtime',
        click: () => open.browser('/'),
      },
      { type: 'separator' },
      {
        type: 'normal',
        label: 'Genesis (Cell)',
        click: async () => {
          const uri = await genesis.cell.uri();
          open.browser(`/${uri.toString()}`);
        },
      },
      {
        type: 'normal',
        label: 'System Modules',
        click: async () => {
          const uri = await genesis.modules.uri();
          open.browser(`/${uri}`);
        },
      },
    ],
  };
  return item;
}
