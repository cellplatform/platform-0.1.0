import { ipcMain } from 'electron';
import { Subject } from 'rxjs';
import { debounceTime, filter, map } from 'rxjs/operators';

import { constants, t } from '../common';

/**
 * Initializes the IPC ("inter-process-communication") event stream.
 */
export function ipc(args: { ctx: t.IContext; event$: Subject<t.AppEvent> }) {
  const { ctx, event$ } = args;
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
  ipcMain.on(IPC.CHANNEL, (ipc, event: t.IpcEvent) => event$.next(event));

  const ipc$ = event$.pipe(
    filter((e) => e.type.startsWith('IPC/')),
    map((e) => e as t.IpcEvent),
  );

  const fromWindow$ = ipc$.pipe(filter((e) => e.payload.source !== 'MAIN'));

  /**
   * Monitor changes to sheets from window.
   */
  fromWindow$.subscribe(async (e) => {
    const { ns, changes } = e.payload;
    const sheet = await ctx.client.sheet(ns);
    sheet.change(changes);
  });
}
