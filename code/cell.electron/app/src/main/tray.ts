import { Tray, Menu } from 'electron';
import { fs } from './common';
import { createWindow } from './screen';

export function init() {
  const icon = fs.join(__dirname, '../../assets/icons/tray.png');
  const tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Create Window',
      type: 'radio',
      click: () => createWindow({ def: 'cell:sys!A2' }), // TEMP 🐷
    },
    { label: 'Item2', type: 'radio' },
    { label: 'Item3', type: 'radio', checked: true },
    { label: 'Item4', type: 'radio' },
  ]);
  tray.setToolTip('This is my application.');
  tray.setContextMenu(contextMenu);

  return { tray };
}
