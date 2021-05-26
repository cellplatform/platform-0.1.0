import { Observable, Subject, BehaviorSubject, firstValueFrom } from 'rxjs';
import {
  takeUntil,
  take,
  takeWhile,
  map,
  filter,
  share,
  delay,
  distinctUntilChanged,
  debounceTime,
  tap,
} from 'rxjs/operators';
import { t, NetworkBus, RuntimeUri, constants } from '../common';
import { ipcMain } from 'electron';
import { Window } from '../main.Window';

const CHANNEL = constants.IPC.CHANNEL;

/**
 * An event-pump for passing messages over an
 * Electron IPC ("inter-process communications") network transport.
 *
 * Refs:
 *    https://www.electronjs.org/docs/api/ipc-main
 *
 */
export function IpcNetworkPump<E extends t.Event>(args: { bus: t.ElectronRuntimeBus }) {
  const { bus } = args;

  console.log('IpcNetworkPump', IpcNetworkPump);

  const in$ = new Subject<t.Event>();
  ipcMain.on(CHANNEL, (ipc, event: t.Event) => in$.next(event));

  const pump: t.NetworkPump<E> = {
    in: (fn) => {
      // fn()
      // data.in$.pipe(map((e) => e.data as E)).subscribe(fn);
      console.log('pump/in', fn); // TODO 🐷
    },
    out: (e) => {
      const { targets, event } = e;
      if (targets.length > 0) {
        console.log('pump/out', e);

        /**
         * Broadcast event to windows.
         */
        const sender = RuntimeUri.main;
        bus.fire({
          type: 'runtime.electron/ipc/send',
          payload: { sender, targets, event },
        });
      }
    },
  };

  return pump;
}
