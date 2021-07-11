import { System, t } from '../common';

/**
 * Dev tools menu
 */
export function DataMenu(args: { bus: t.ElectronMainBus }): t.MenuItem {
  const { bus } = args;
  const events = { system: System.Events({ bus }) };
  const getStatus = () => events.system.status.get();
  const paths = async () => (await getStatus()).runtime.paths;

  const item: t.MenuItem = {
    id:'sys.debug.data',
    type: 'normal',
    label: 'Data',
    submenu: [
      {
        type: 'normal',
        label: 'Reveal Folder',
        click: async () => events.system.open.path.fire((await paths()).dir),
      },
      { type: 'separator' },
      {
        type: 'normal',
        label: 'Snapshot',
        click: () => events.system.data.snapshot.fire({ openDir: true }),
      },
      {
        type: 'normal',
        label: 'Snapshot and Delete Data',
        click: () => events.system.data.reset.fire({ openDir: true, quit: true, reopen: true }),
      },
    ],
  };
  return item;
}
