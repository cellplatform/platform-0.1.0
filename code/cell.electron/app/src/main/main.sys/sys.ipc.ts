import { ipcMain } from 'electron';
import { Subject } from 'rxjs';
import { debounceTime, filter, map } from 'rxjs/operators';

import { constants, t, rx } from '../common';

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

  // rx.m style={ styles. }

  const window$ = ipc$.pipe(filter((e) => e.payload.source !== 'MAIN'));

  /**
   * Monitor changes to sheets from window.
   */
  rx.payload<t.IpcSheetChangedEvent>(window$, 'IPC/sheet/changed').subscribe(async (e) => {
    const { ns, changes } = e;

    console.log();
    console.log('CHANGE', ns);
    console.log('changes', changes);

    /**
     * TODO 🐷
     * - The sheet-save below will fail if the NS is passed and it's
     *   not written here first (NO EXIST).
     * - TODO: put this all into a save/sync operation that is sane/easy-to-understand.
     *
     * TODO
     * - make sure change-monitor tracks 2..n levels deep.
     *
     */
    if (changes.ns) {
      const to = changes.ns.to;
      await ctx.client.http.ns(ns).write({ ns: to });
    }

    // Change sheet.
    const sheet = await ctx.client.sheet(ns);
    sheet.change(changes);

    // console.log('-------------------------------------------');
    // console.log('changes', changes.ns);
  });
}
