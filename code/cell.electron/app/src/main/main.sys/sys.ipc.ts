import { ipcMain } from 'electron';
import { Subject } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';

import { constants, t } from '../common';

/**
 * Initializes the IPC (inter-process communications) event streams.
 */
export function ipc(args: { ctx: t.IContext }) {
  const { ctx } = args;
  const { client } = ctx;
  const { IPC } = constants;

  /**
   * Broadcast changes to each window.
   */
  client.changes.changed$.pipe(debounceTime(50)).subscribe((e) => {
    const payload: t.IpcSheetChangedEvent = {
      type: 'IPC/sheet/changed',
      payload: {
        source: 'MAIN',
        ns: e.sheet.uri.id,
        changes: e.changes,
      },
    };
    ctx.windowRefs.forEach((ref) => ref.send(IPC.CHANNEL, payload));
  });

  /**
   * Listen for events broadcast back from windows.
   */
  const event$ = new Subject<t.IpcEvent>();
  ipcMain.on(IPC.CHANNEL, (ipc, event: t.IpcEvent) => event$.next(event));

  const ipc$ = event$.pipe(filter((e) => e.type.startsWith('IPC/')));
  const fromWindow$ = ipc$.pipe(filter((e) => e.payload.source !== 'MAIN'));

  // TEMP 🐷
  fromWindow$.subscribe((e) => {
    console.log('IPC MAIN from', e.payload.source);
    console.log('e.payload.changes', e.payload.changes);

    // event$.next(e as any); // TEMP 🐷HACK
  });
}
