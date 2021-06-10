import { shell } from 'electron';
import { t, System, Uri } from '../common';

/**
 * Dev tools menu.
 */
export function ServerMenu(args: { bus: t.ElectronMainBus }): t.MenuItem {
  const { bus } = args;
  const events = { system: System.Events({ bus }) };

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
        label: '• Local Runtime',
        click: () => open.browser('/'),
      },
      {
        type: 'normal',
        label: '• Genesis Cell',
        click: async () => {
          const status = await getStatus();
          const uri = Uri.create.cell(status.refs.genesis, 'A1');
          open.browser(`/${uri}`);
        },
      },
    ],
  };
  return item;
}
