import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { coord, defaultValue, t } from '../common';

/**
 * Monitors changes pushing changes through the given HTTP gateway.
 */
export function saveMonitor(args: { client: t.IClientTypesystem; debounce?: number }) {
  const { client } = args;
  const debounce = defaultValue(args.debounce, 300);
  const http = client.http;

  // Setup observables.
  const stop$ = new Subject();
  const changed$ = client.changes.changed$.pipe(takeUntil(stop$));

  type C = { [ns: string]: t.ITypedSheetStateChanges };
  let pending: C = {};

  // Monitor changes.
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
    get debounce() {
      return debounce;
    },

    get isActive() {
      return !stop$.isStopped;
    },

    stop() {
      stop$.next();
      stop$.complete();
    },

    async save() {
      const changes = { ...pending };
      const sheets = client.changes.watching;

      const wait = Object.keys(changes)
        .map(ns => ({ ns, changes: changes[ns] }))
        .map(({ ns, changes }) => saveSheet({ ns, http, changes }));
      const res = await Promise.all(wait);

      res
        .filter(({ ok }) => ok)
        .map(({ ns }) => sheets.find(sheet => sheet.uri.toString() === ns) as t.ITypedSheet)
        .filter(sheet => Boolean(sheet))
        .forEach(sheet => sheet.state.clearChanges('SAVED'));

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
