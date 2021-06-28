import { filter, take } from 'rxjs/operators';

import { t } from './common';
import { IpcBus } from './main.Bus';

/**
 * TODO / TEMP 🐷
 * event bridging between the IPCBus and the MAIN event bnus.
 */
export async function TestIpcBusBridging(args: { bus: t.ElectronMainBus }) {
  const { bus } = args;

  const localbus = bus;
  const ipcbus = IpcBus<t.ElectronRuntimeEvent>({ bus });

  ipcbus.$.subscribe(async (e) => {
    /**
     * Match a "req:res" (request => response) event pattern.
     * Once matched:
     *  - grab the "tx" (transaction id)
     *  - setup a filter that looks for the corresponding response (matching on "type" and "tx")
     *  - fire the response, when it comes, back through the [NetworkBus].
     */
    type P = { tx: string };
    const isRequest = e.type.endsWith(':req');
    const tx = (e.payload as P).tx;

    if (isRequest && tx && typeof tx === 'string') {
      const responseType = e.type.replace(/\:req$/, ':res');

      const res$ = localbus.$.pipe(
        filter((e) => e.type === responseType),
        filter((e) => (e.payload as P).tx === tx),
      );

      res$.pipe(take(1)).subscribe((e) => {
        console.log('NetworkBus (IPC) Response:', e);
        ipcbus.fire(e);
      });
    }

    // Fire incoming event from the [NetworkBus] into the local [EventBus].
    /**
     * TODO 🐷
     * - insert security check here.
     */
    localbus.fire(e);
  });
}
