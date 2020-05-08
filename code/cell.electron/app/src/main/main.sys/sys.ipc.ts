import { debounceTime } from 'rxjs/operators';

import { constants, t } from '../common';

const { IPC } = constants;

/**
 * Initializes the IPC (inter-process communications) event streams.
 */
export function ipc(args: { ctx: t.IAppCtx__OLD }) {
  const { ctx } = args;
  const { client } = ctx;

  // Broadcast changes to each window.
  client.changes.changed$.pipe(debounceTime(50)).subscribe(e => {
    const payload: t.IpcSheetChangedEvent = {
      type: 'IPC/sheet/changed',
      payload: { ns: e.sheet.uri.id, changes: e.changes },
    };
    ctx.windowRefs.forEach(ref => ref.send(IPC.CHANNEL, payload));
  });
}
