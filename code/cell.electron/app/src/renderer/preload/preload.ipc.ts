import { ipcRenderer } from 'electron';
import { Subject } from 'rxjs';
import { share } from 'rxjs/operators';

import { constants, t } from '../common';

const { IPC } = constants;

/**
 * Hook into IPC events.
 */
export function init(args: { windowUri: string; cache: t.IEnv['cache'] }) {
  const event$ = new Subject<t.EnvEvent>();

  // Listen for global variables being broadcast through the
  // electron IPC channels.
  const ipc$ = new Subject<t.IpcEvent>();
  ipcRenderer.on(IPC.CHANNEL, (ipc, event: t.IpcEvent) => ipc$.next(event));
  ipc$.subscribe(e => {
    // const isSelf = e.payload.window === args.windowUri;
    // const out = isSelf ? { ...e, isSelf } : e;
    console.log('preload | 🌼ipc event:', e);

    // event$.next(e);
  });

  // Finish up.
  return {
    ipc$,
    event$: event$.pipe(share()),
  };
}
