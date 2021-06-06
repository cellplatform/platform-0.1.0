import { t } from '../common';
import { DataMenu } from './debug.Data';
import { DevToolsMenu } from './debug.Tools';
import { ServerMenu } from './debug.Http';
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
      ServerMenu({ bus }),
      DataMenu({ bus }),
      DevToolsMenu({ bus }),
    ],
  };
  return item;
}
