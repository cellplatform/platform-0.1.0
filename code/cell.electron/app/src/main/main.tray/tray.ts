import { Tray, Menu } from 'electron';
import { fs, t } from '../common';
import { createWindow } from '../main.window';

export function init(args: { host: string; def: string; ctx: t.IAppCtx__OLD }) {
  const { host, def, ctx } = args;

  const icon = fs.join(__dirname, '../../../assets/icons/tray/tray.png');
  const tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    // {
    //   label: 'Create Window',
    //   type: 'radio',
    //   // click: () => createWindow({ host, def, ctx }), // TEMP 🐷
    // },
    { label: 'Item2', type: 'radio' },
    { label: 'Item3', type: 'radio', checked: true },
    { label: 'Item4', type: 'radio' },
  ]);
  tray.setToolTip('This is my application.');
  tray.setContextMenu(contextMenu);

  return { tray };
}
