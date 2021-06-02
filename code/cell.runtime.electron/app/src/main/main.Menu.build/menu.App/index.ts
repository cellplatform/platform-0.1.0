import { app } from 'electron';
import { t } from '../common';

/**
 * Root menu for the application
 */
export function AppMenu(args: { bus: t.ElectronMainBus }): t.MenuItem {
  const item: t.MenuItem = {
    label: app.name,
    type: 'normal',
    submenu: [
      { role: 'about', label: 'About', type: 'normal' },
      { type: 'separator' },
      { role: 'services', type: 'normal' },
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
