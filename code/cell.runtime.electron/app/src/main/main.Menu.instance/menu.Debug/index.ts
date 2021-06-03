import { t } from '../common';
import { DataMenu } from './debug.Data';
import { DevToolsMenu } from './debug.DevTools';
import { ServerMenu } from './debug.Server';
import { ModulesMenu } from './debug.Modules';

/**
 * Debug menu
 */
export function DebugMenu(args: { bus: t.ElectronMainBus }): t.MenuItem {
  const { bus } = args;
  const item: t.MenuItem = {
    label: 'Debug',
    type: 'normal',
    submenu: [
      ModulesMenu({ bus }),
      { type: 'separator' },
      DevToolsMenu({ bus }),
      ServerMenu({ bus }),
      DataMenu({ bus }),
    ],
  };
  return item;
}
