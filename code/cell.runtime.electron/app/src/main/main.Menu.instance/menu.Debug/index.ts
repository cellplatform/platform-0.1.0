import { shell } from 'electron';
import { t, System } from '../common';
import { DataMenu } from './debug.Data';
import { DevToolsMenu } from './debug.Tools';
import { ServerMenu } from './debug.Http';
import { ModulesMenu } from './debug.Modules';

/**
 * Debug menu
 */
export function DebugMenu(args: { bus: t.ElectronMainBus; http: t.IHttpClient }): t.MenuItem {
  const { bus, http } = args;
  const events = { system: System.Events({ bus }) };

  const getStatus = () => events.system.status.get();

  const open = {
    finder: async (path: string) => shell.openPath(path),
  };

  const item: t.MenuItem = {
    label: 'Debug',
    type: 'normal',
    submenu: [
      ModulesMenu({ bus }),

      { type: 'separator' },

      ServerMenu({ bus, http }),
      DataMenu({ bus }),
      DevToolsMenu({ bus }),

      { type: 'separator' },

      {
        type: 'normal',
        label: 'Logs',
        async click() {
          const status = await getStatus();
          open.finder(status.runtime.paths.log);
        },
      },
    ],
  };
  return item;
}
