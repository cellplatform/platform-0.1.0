import { Subject } from 'rxjs';
import { debounceTime, filter, map, share, takeUntil } from 'rxjs/operators';

import { coord, defaultValue, ERROR, MemoryQueue, t } from '../common';

type E = t.TypedSheetEvent;

/**
 * Monitors changes pushing changes through the given HTTP gateway.
 */
export function saveMonitor(args: {
  client: t.IClientTypesystem;
  event$?: Subject<E>;
  debounce?: number;
}) {
  const { client } = args;
  const http = client.http;
  const debounce = defaultValue(args.debounce, 300);
  const queue = MemoryQueue.create();

  // Setup observables.
  const dispose$ = new Subject();
  const changed$ = client.changes.changed$.pipe(takeUntil(dispose$));
  const subject$ = args.event$ || new Subject<E>();
  const event$ = subject$.pipe(takeUntil(dispose$), share());

  const fire = (e: E) => subject$.next(e);

  // Monitor changes.
  let pending: t.ITypedSheetPendingChanges = {};
  changed$.pipe(debounceTime(debounce)).subscribe((e) => api.save());
  changed$.subscribe((e) => {
    const { sheet } = e;
    const ns = sheet.uri.toString();

    // Merge changes onto the pending list.
    let changes = pending[ns] || { uri: e.changes.uri };
    Object.keys(e.changes)
      .map((key) => ({ key, obj: e.changes[key] }))
      .filter(({ obj }) => typeof obj === 'object')
      .forEach(({ key, obj }) => {
        changes = {
          ...changes,
          [key]: { ...changes[key], ...obj },
        };
      });

    pending[ns] = changes;
  });

  const save = async (changes: t.ITypedSheetPendingChanges) => {
    const target = client.http.origin;
    const sheets = client.changes.watching;
    const findSheet = (ns: string) =>
      sheets.find((sheet) => sheet.uri.toString() === ns) as t.ITypedSheet;

    const changeSet = Object.keys(changes)
      .map((ns) => ({
        ns,
        changes: changes[ns],
        sheet: findSheet(ns),
      }))
      .filter((sheet) => Boolean(sheet));

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
      .filter((sheet) => Boolean(sheet))
      .forEach((sheet) => sheet.state.clear.changes('SAVE'));

    // Fire AFTER event.
    changeSet.forEach(({ sheet, changes }) => {
      const ns = sheet.uri.toString();
      const errors: t.ITypedSheetSaved['errors'] = res
        .filter((res) => res.ns === ns)
        .filter((res) => Boolean(res.error))
        .map((res) => ({ ns, error: res.error as t.IHttpError }));
      const ok = errors.length === 0;
      fire({ type: 'SHEET/saved', payload: { ok, target, sheet, changes, errors } });
      fire({ type: 'SHEET/sync', payload: { changes } });
    });
  };

  const api = {
    event$,

    saving$: event$.pipe(
      filter((e) => e.type === 'SHEET/saving'),
      map((e) => e.payload as t.ITypedSheetSaving),
      share(),
    ),

    saved$: event$.pipe(
      filter((e) => e.type === 'SHEET/saved'),
      map((e) => e.payload as t.ITypedSheetSaved),
      share(),
    ),

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
      // Make a copy of the changes, reset the cache,
      // then pass the copy of changes into the queue for processing.
      const changes = { ...pending };
      pending = {};
      return queue.push(() => save(changes));
    },
  };

  return api;
}

/**
 * [Helpers]
 */

async function saveSheet(args: { ns: string; http: t.IHttpClient; changes: t.ITypedSheetChanges }) {
  const { ns, http, changes } = args;
  const client = http.ns(ns);
  let error: t.IHttpError | undefined;

  if (changes.cells || changes.ns) {
    const payload = {
      cells: changes.cells ? toChangedCells(changes) : undefined,
      ns: changes.ns ? changes.ns.to : undefined,
    };
    const res = await client.write(payload, { data: false });

    if (!res.ok) {
      error = {
        status: res.status,
        type: ERROR.HTTP.SERVER,
        message: `Failed while saving data to ${http.origin}`,
        children: res.error ? [res.error] : undefined,
      };
    }
  }

  const ok = !Boolean(error);
  return { ok, ns, error };
}

function toChangedCells(changes: t.ITypedSheetChanges) {
  const res: t.ICellMap = {};
  const cells = changes.cells || {};
  Object.keys(cells)
    .filter((key) => coord.cell.isCell(key))
    .forEach((key) => (res[key] = cells[key].to));
  return res;
}
