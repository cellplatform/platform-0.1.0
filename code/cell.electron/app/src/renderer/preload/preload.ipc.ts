import { ipcRenderer } from 'electron';
import { Subject } from 'rxjs';
import { share, filter, map } from 'rxjs/operators';

import { constants, t } from '../common';

const { IPC } = constants;

/**
 * Hook into IPC events.
 */
export function init(args: { def: string; cache: t.IEnv['cache'] }) {
  const event$ = new Subject<t.Event>();

  // Listen for global variables being broadcast through the electron IPC channels.
  const ipc$ = new Subject<t.IpcEvent>();
  ipcRenderer.on(IPC.CHANNEL, (ipc, event: t.IpcEvent) => ipc$.next(event));
  ipc$.subscribe((e) => {
    // const isSelf = e.payload.window === args.windowUri;
    // const out = isSelf ? { ...e, isSelf } : e;
    console.log('preload | 🌼ipc event:', e);

    event$.next(e as any); // TEMP 🐷HACK
  });

  // Listen for sheet changes fired by the window.
  event$
    .pipe(
      filter((e) => e.type.startsWith('IPC/')),
      map((e) => e as t.IpcEvent),
      filter((e) => e.payload.source === args.def),
    )
    .subscribe((e) => ipcRenderer.send(IPC.CHANNEL, e));

  // Finish up.
  return { ipc$, event$ };
}
