import { System, t } from '../common';

/**
 * Dev tools menu
 */
export function DevToolsMenu(args: { bus: t.ElectronMainBus }): t.MenuItem {
  const { bus } = args;
  const events = { system: System.Events({ bus }) };

  const item: t.MenuItem = {
    type: 'normal',
    label: 'Tools',
    submenu: [
      { role: 'reload', type: 'normal' },
      { role: 'forceReload', type: 'normal' },
      { role: 'toggleDevTools', type: 'normal' },
    ],
  };
  return item;
}
