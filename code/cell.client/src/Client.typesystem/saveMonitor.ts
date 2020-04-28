import { Subject } from 'rxjs';
import { debounceTime, share, takeUntil } from 'rxjs/operators';

import { coord, defaultValue, t } from '../common';

/**
 * Monitors changes pushing changes through the given HTTP gateway.
 */
export function saveMonitor(args: { client: t.IClientTypesystem; debounce?: number }) {
  const { client } = args;
  const debounce = defaultValue(args.debounce, 300);
  const http = client.http;

  // Setup observables.
  const dispose$ = new Subject();
  const changed$ = client.changes.changed$.pipe(takeUntil(dispose$));
  const save$ = new Subject<t.ITypedSheetSaveEvent>();
  const fire = (e: t.ITypedSheetSaveEvent) => save$.next(e);

  // Monitor changes.
  let pending: t.ITypedSheetPendingChanges = {};
  changed$.pipe(debounceTime(debounce)).subscribe(e => api.save());
  changed$.subscribe(e => {
    const { sheet } = e;
    const ns = sheet.uri.toString();

    // Merge changes onto the pending list.
    let changes = pending[ns] || {};
    Object.keys(e.changes).forEach(key => {
      changes = { ...changes, [key]: { ...changes[key], ...e.changes[key] } };
    });

    pending[ns] = changes;
  });

  const api = {
    save$: save$.pipe(takeUntil(dispose$), share()),

    get debounce() {
      return debounce;
    },

    get isDisposed() {
      return !dispose$.isStopped;
    },

    dispose() {
      dispose$.next();
      dispose$.complete();
    },

    async save() {
      const target = client.http.origin;
      const sheets = client.changes.watching;
      const findSheet = (ns: string) =>
        sheets.find(sheet => sheet.uri.toString() === ns) as t.ITypedSheet;

      const changes = { ...pending };
      const changeSet = Object.keys(changes)
        .map(ns => ({
          ns,
          changes: changes[ns],
          sheet: findSheet(ns),
        }))
        .filter(sheet => Boolean(sheet));

      // Fire BEFORE event.
      changeSet.forEach(({ sheet, changes }) => {
        fire({ type: 'SHEET/saving', payload: { target, sheet, changes } });
      });

      // Invoke save requests (over network).
      const wait = changeSet.map(({ ns, changes }) => saveSheet({ ns, http, changes }));
      const res = await Promise.all(wait);

      // Reset saved state for all successful operations.
      res
        .filter(({ ok }) => ok)
        .map(({ ns }) => findSheet(ns))
        .filter(sheet => Boolean(sheet))
        .forEach(sheet => sheet.state.clearChanges('SAVED'));

      // Fire AFTER event.
      changeSet.forEach(({ sheet, changes }) => {
        fire({ type: 'SHEET/saved', payload: { target, sheet, changes } });
      });

      // Finish up.
      const ok = res.every(res => res.ok);
      if (ok) {
        pending = {};
      }
    },
  };

  return api;
}

/**
 * [Helpers]
 */

async function saveSheet(args: {
  ns: string;
  http: t.IHttpClient;
  changes: t.ITypedSheetStateChanges;
}) {
  const { ns, http, changes } = args;
  const client = http.ns(ns);
  const errors: t.IHttpError[] = [];

  if (changes.cells) {
    const cells = toChangedCells(changes);
    const res = await client.write({ cells }, { data: false });
    if (res.error) {
      errors.push(res.error);
    }
  }

  if (changes.ns) {
    const res = await client.write({ ns: changes.ns.to }, { data: false });
    if (res.error) {
      errors.push(res.error);
    }
  }

  const ok = errors.length === 0;
  return { ok, ns, errors };
}

function toChangedCells(changes: t.ITypedSheetStateChanges) {
  const res: t.ICellMap = {};
  const cells = changes.cells || {};
  Object.keys(cells)
    .filter(key => coord.cell.isCell(key))
    .forEach(key => (res[key] = cells[key].to));
  return res;
}
