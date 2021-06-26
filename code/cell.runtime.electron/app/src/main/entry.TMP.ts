import { t } from './common';
import { IpcBus } from './main.Bus';
import { Window } from './main.Window';

/**
 * TODO / TEMP 🐷
 * event bridging between the IPCBus and the MAIN event bnus.
 */
export async function TestIpcBusBridging(args: { bus: t.ElectronMainBus }) {
  const { bus } = args;

  const ipcbus = IpcBus<t.ElectronRuntimeEvent>({ bus });

  ipcbus.$.subscribe(async (e) => {
    if (Window.Events.is.base(e)) {
      bus.fire(e as any);
    }
    if (e.type === 'runtime.electron/Window/status:req') {
      // TEMP 🐷

      /**
       * TODO 🐷
       * - make ferrying events from the IPC bus smarter
       * - BUG: The TEMP code here is causing the same event to be fired multiple times.
       *
       */

      console.log('ipcbus (bridge):', e);
      const events = Window.Events({ bus });
      const status = await events.status.get();
      ipcbus.fire({
        type: 'runtime.electron/Window/status:res',
        payload: { tx: e.payload.tx, windows: status.windows },
      });
    }
  });
}
