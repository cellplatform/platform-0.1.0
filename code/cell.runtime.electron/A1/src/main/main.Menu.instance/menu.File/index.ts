import { t, ENV } from '../common';

/**
 * Root menu for operating on files.
 */
export function FileMenu(args: { bus: t.ElectronMainBus }): t.MenuItem {
  const isMac = ENV.isMac;

  const item: t.MenuItem = {
    id: 'sys.file',
    label: 'File',
    type: 'normal',
    submenu: [],
  };

  const submenu = item.submenu || [];
  if (isMac) submenu.push({ role: 'close', type: 'normal' });
  if (!isMac) submenu.push({ role: 'quit', type: 'normal' });

  return item;
}
