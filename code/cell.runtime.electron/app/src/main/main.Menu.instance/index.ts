import { ENV, t, Menu } from './common';
import { AppMenu } from './menu.App';
import { DebugMenu } from './menu.Debug';
import { EditMenu } from './menu.Edit';
import { FileMenu } from './menu.File';

export function BuildMenu(args: { bus: t.ElectronMainBus; http: t.IHttpClient }) {
  const { bus, http } = args;
  const isMac = ENV.isMac;
  const events = Menu.Events({ bus });

  const menu: t.Menu = [];

  if (isMac) menu.push(AppMenu({ bus }));
  menu.push(FileMenu({ bus }));
  menu.push(EditMenu({ bus }));
  menu.push(DebugMenu({ bus, http }));

  return {
    menu,
    load() {
      events.load.fire(menu);
      return menu;
    },
  };
}
