import { t, ENV } from '../common';

/**
 * Edit menu
 */
export function EditMenu(args: { bus: t.ElectronMainBus }): t.MenuItem {
  const isMac = ENV.isMac;

  const item: t.MenuItem = {
    label: 'Edit',
    type: 'normal',
    submenu: [
      { role: 'undo', type: 'normal' },
      { role: 'redo', type: 'normal' },
      { type: 'separator' },
      { role: 'cut', type: 'normal' },
      { role: 'copy', type: 'normal' },
      { role: 'paste', type: 'normal' },
    ],
  };

  const submenu = item.submenu || [];

  if (isMac) {
    submenu.push({ role: 'pasteAndMatchStyle', type: 'normal' });
    submenu.push({ role: 'delete', type: 'normal' });
    submenu.push({ role: 'selectAll', type: 'normal' });
    submenu.push({ type: 'separator' });
    submenu.push({
      label: 'Speech',
      type: 'normal',
      submenu: [
        { role: 'startSpeaking', type: 'normal' },
        { role: 'stopSpeaking', type: 'normal' },
      ],
    });
  }

  if (!isMac) {
    submenu.push({ role: 'delete', type: 'normal' });
    submenu.push({ type: 'separator' });
    submenu.push({ role: 'selectAll', type: 'normal' });
  }

  return item;
}
