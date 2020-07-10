import { Subject } from 'rxjs';
import { filter, take } from 'rxjs/operators';

import { rx, t, Uri } from '../common';

/**
 * Fires the "SHEET/changed" event returning a promise that awaits
 * the sheet to be reloaded with the updated changes.
 */
export function fireSheetChanged(args: {
  event$: Subject<t.AppEvent>;
  changes: t.ITypedSheetChanges;
  source: string;
}) {
  const { event$, source, changes } = args;
  const ns = changesToNamespace(changes);

  // Wait for the sync to complete (loop back from the server).
  const promise = rx
    .payload<t.ITypedSheetLoadedEvent>(event$, 'SHEET/loaded')
    .pipe(
      filter((e) => e.sheet.uri.id === ns),
      take(1),
    )
    .toPromise();

  // Send changes to server.
  event$.next({
    type: 'IPC/sheet/changed',
    payload: { source, ns, changes },
  });

  return promise;
}

/**
 * [Helpers]
 */

function changesToNamespace(changes: t.ITypedSheetChanges) {
  let ns = '';
  if (changes.ns) {
    ns = changes.ns.ns;
  } else if (changes.cells) {
    const first = changes.cells[Object.keys(changes.cells)[0]];
    if (first) {
      ns = first.ns;
    }
  }
  return Uri.toNs(ns).id;
}
