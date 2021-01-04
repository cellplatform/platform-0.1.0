import { Subject } from 'rxjs';
import { debounceTime, filter, map, share, takeUntil } from 'rxjs/operators';

import { defaultValue, MemoryQueue, t, Uri } from '../common';
import { saveChanges } from './typesystem.saveChanges';

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
  const dispose$ = new Subject<void>();
  const changed$ = client.changes.changed$.pipe(takeUntil(dispose$));
  const subject$ = args.event$ || new Subject<E>();
  const event$ = subject$.pipe(takeUntil(dispose$), share());

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
    const sheets = client.changes.watching;
    const findSheet = (ns: string) =>
      sheets.find((sheet) => Uri.eq(sheet.uri, ns)) as t.ITypedSheet;

    const changeSet = Object.keys(changes)
      .map((ns) => ({
        ns,
        changes: changes[ns],
        sheet: findSheet(ns),
      }))
      .filter((sheet) => Boolean(sheet));

    // Invoke save requests (over network).
    const fire = subject$;
    const wait = changeSet
      .filter(({ sheet }) => Boolean(sheet))
      .map(({ sheet, changes }) => saveChanges({ http, sheet, changes, fire }));
    await Promise.all(wait);
  };

  const api = {
    event$,

    saving$: event$.pipe(
      filter((e) => e.type === 'TypedSheet/saving'),
      map((e) => e.payload as t.ITypedSheetSaving),
      share(),
    ),

    saved$: event$.pipe(
      filter((e) => e.type === 'TypedSheet/saved'),
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
