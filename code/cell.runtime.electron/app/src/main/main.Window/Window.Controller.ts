import { constants, RuntimeUri, rx, t } from '../common';
import { IpcSysInfo } from './IpcSysInfo';
import { WindowCreationController } from './Window.Controller.create';
import { WindowStatusController } from './Window.Controller.status';
import { Events } from './Window.Events';
import { WindowChangeController } from './Window.Controller.change';

/**
 * Controller logic for working with Electron windows.
 */
export function Controller(args: { bus: t.EventBus<any> }) {
  const channel = constants.IPC.CHANNEL;
  const bus = rx.busAsType<t.WindowEvent>(args.bus);
  const events = Events({ bus });
  const { dispose, dispose$ } = events;

  /**
   * Initialize sub-controllers
   */
  const windows = WindowCreationController({ bus, events, broadcastStatus: () => ipc.broadcast() });
  const getRefs = () => windows.refs;
  WindowStatusController({ bus, events, getRefs });
  WindowChangeController({ bus, events, getRefs });
  const ipc = IpcSysInfo({ channel, getRefs }).listen();

  /**
   * IPC: Broadcast event/data to windows.
   */
  rx.event<t.IpcMessageEvent>(bus.$, 'runtime.electron/ipc/msg')
    .pipe()
    .subscribe((e) => {
      const targets = e.payload.targets.filter((uri) => uri !== RuntimeUri.main);
      const windows = getRefs().filter((ref) => targets.includes(ref.uri));
      windows.forEach(({ browser }) => browser.webContents.send(channel, e));
      console.log('ipc/msg', windows.length);
    });

  /**
   * API
   */
  return { dispose$, dispose };
}
