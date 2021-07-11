import { app } from 'electron';
import { t } from '../common';
import { AppModulesMenuSection } from './AppMenu.Modules';

/**
 * Root menu for the application
 */
export function AppMenu(args: { bus: t.ElectronMainBus }): t.MenuItem {
  const { bus } = args;

  const modules = AppModulesMenuSection({ bus });

  const item: t.MenuItem = {
    id: 'sys.app',
    label: app.name,
    type: 'normal',
    submenu: [
      { role: 'about', label: 'About A1', type: 'normal' },

      { type: 'separator' },
      ...modules,
      { type: 'separator' },

      { role: 'hide', label: 'Hide', type: 'normal' },
      { role: 'hideOthers', type: 'normal' },
      { role: 'unhide', type: 'normal' },
      { type: 'separator' },
      { role: 'quit', label: 'Quit', type: 'normal' },
    ],
  };

  return item;
}
