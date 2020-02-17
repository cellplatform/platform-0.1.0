import { Tray, Menu } from 'electron';
import { fs } from './common';

export function init() {
  const icon = fs.resolve('assets/icons/tray.png');
  const tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Item1', type: 'radio' },
    { label: 'Item2', type: 'radio' },
    { label: 'Item3', type: 'radio', checked: true },
    { label: 'Item4', type: 'radio' },
  ]);
  tray.setToolTip('This is my application.');
  tray.setContextMenu(contextMenu);

  return { tray };
}
