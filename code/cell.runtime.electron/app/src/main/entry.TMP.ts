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
      console.log('ipcbus:', e);
      const events = Window.Events({ bus });
      const status = await events.status.get();
      ipcbus.fire({
        type: 'runtime.electron/Window/status:res',
        payload: { tx: e.payload.tx, windows: status.windows },
      });
    }
  });
}
