import { debounceTime } from 'rxjs/operators';

import { constants, t, coord, R, Uri } from '../common';
const { IPC } = constants;

/**
 * Initializes the IPC (inter-process communications) event streams.
 */
export function ipc(args: { ctx: t.IAppCtx }) {
  const { ctx } = args;
  const { client } = ctx;

  client.changes.changed$.pipe(debounceTime(50)).subscribe(e => {
    const ns = e.sheet.uri.id;

    // Broadcast the change to all windows.
    changesByRow(e.changes.cells)
      .map(e => ({ window: Uri.create.row(ns, e.row), changes: e.changes }))
      .forEach(({ window, changes }) => {
        const event: t.IpcWindowChangedEvent = {
          type: 'WINDOW/changed',
          payload: { window, changes },
        };
        ctx.windowRefs.forEach(ref => ref.send(IPC.CHANNEL, event));
      });
  });
}

/**
 * [Helpers]
 */

type R = {
  row: string;
  changes: { [key: string]: t.ITypedSheetChangeCellDiff };
};

function changesByRow(cells: t.ITypedSheetStateChanges['cells'] = {}): R[] {
  const items = Object.keys(cells).map(key => ({ key, change: cells[key] }));
  const groups = R.groupBy(next => coord.cell.toRowKey(next.key), items);
  return Object.keys(groups).reduce((acc, row) => {
    const changes = groups[row].reduce((acc, next) => {
      acc[next.key] = next.change;
      return acc;
    }, {});
    acc.push({ row, changes });
    return acc;
  }, [] as R[]);
}
