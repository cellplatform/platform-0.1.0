import { shell } from 'electron';
import { t, System, Uri } from '../common';

/**
 * Dev tools menu
 */
export function DevToolsMenu(args: { bus: t.ElectronMainBus }): t.MenuItem {
  const { bus } = args;
  const events = { system: System.Events({ bus }) };

  const getStatus = () => events.system.status.get();

  const open = {
    finder: async (path: string) => shell.openPath(path),
  };

  const item: t.MenuItem = {
    type: 'normal',
    label: 'Tools',
    submenu: [
      {
        type: 'normal',
        label: 'Logs',
        async click() {
          const status = await getStatus();
          open.finder(status.runtime.paths.log);
        },
      },

      { type: 'separator' },

      { role: 'reload', type: 'normal' },
      { role: 'forceReload', type: 'normal' },
      { role: 'toggleDevTools', type: 'normal' },
    ],
  };
  return item;
}
