import { ipcRenderer } from 'electron';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { constants, t } from '../common';

const { IPC } = constants;

/**
 * Hook into IPC events.
 */
export function init(args: { def: string; cache: t.IEnv['cache']; event$: Subject<t.AppEvent> }) {
  const { def, event$ } = args;
  const fire = (e: t.AppEvent) => event$.next(e);
  const isIpcEvent = (e: t.Event) => e.type.startsWith(IPC.EVENT_PREFIX);

  // Listen for global events being broadcast through the electron IPC channels.
  const ipc$ = new Subject<t.IpcEvent_OLD>();
  ipcRenderer.on(IPC.CHANNEL, (ipc, event: t.IpcEvent_OLD) => ipc$.next(event));

  // Listen for IPC events fired by this window and broadcast
  // out to other processes (ie. "MAIN" | <renderer>'s).
  event$
    .pipe(
      filter(isIpcEvent),
      map((e) => e as t.IpcEvent_OLD),
      filter((e) => e.payload.source === args.def),
    )
    .subscribe((e) => {
      ipcRenderer.send(IPC.CHANNEL, e);
    });

  // Finish up.
  ferryIpcEventsToLocalBus({ def, ipc$, fire });
}

/**
 * [Helpers]
 */

function ferryIpcEventsToLocalBus(args: {
  def: string;
  ipc$: Observable<t.IpcEvent_OLD>;
  fire: (e: t.AppEvent) => void;
}) {
  const { ipc$, fire } = args;

  ipc$.subscribe((e) => {
    console.log('🌼 preload | ipc event:', e); // TEMP 🐷
  });

  /**
   * Listen for changed sheets on other processes.
   */
  ipc$
    .pipe(
      filter((e) => e.type === 'IPC/sheet/changed'),
      map((e) => e.payload as t.IpcSheetChanged),
      filter((e) => e.source !== args.def),
    )
    .subscribe((e) => {
      const { changes } = e;
      fire({ type: 'TypedSheet/sync', payload: { changes } });
    });
}
