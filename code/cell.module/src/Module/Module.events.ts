import { TreeState } from '@platform/state';
import { rx } from '@platform/util.value';
import { Observable, Subject } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';
import { is } from './Module.is';

import { t } from '../common';

type E = t.ModuleEvent;
type P = t.IModuleProps;

const identity = TreeState.identity;

export function create<T extends P = t.IModulePropsAny>(
  event$: Observable<t.Event>,
  until$?: Observable<any>,
): t.IModuleEvents<T> {
  const dispose$ = new Subject<void>();
  if (until$) {
    until$.subscribe(() => dispose$.next());
  }

  const raw$ = event$.pipe(takeUntil(dispose$));

  const $ = raw$.pipe(
    filter((e) => is.moduleEvent(e)),
    map((e) => e as t.ModuleEvent),
    share(),
  );

  const register$ = rx.payload<t.IModuleRegisterEvent>($, 'Module/register').pipe(share());
  const registered$ = rx.payload<t.IModuleRegisteredEvent>($, 'Module/registered').pipe(share());

  const childRegistered$ = rx
    .payload<t.IModuleChildRegisteredEvent>($, 'Module/child/registered')
    .pipe(share());
  const childDisposed$ = rx
    .payload<t.IModuleChildDisposedEvent>($, 'Module/child/disposed')
    .pipe(share());

  const changed$ = rx.payload<t.IModuleChangedEvent<T>>($, 'Module/changed').pipe(share());
  const patched$ = rx.payload<t.IModulePatchedEvent>($, 'Module/patched').pipe(share());

  const events: t.IModuleEvents<T> = {
    $,
    register$,
    registered$,
    childRegistered$,
    childDisposed$,
    changed$,
    patched$,
  };

  return events;
}

/**
 * Run a module filter.
 */
export function eventFilter<T extends E = E>(
  event$: Observable<t.Event>,
  fn?: t.ModuleFilterEvent<T>,
): Observable<T> {
  return (event$ as Observable<T>).pipe(
    filter((e) => {
      if (fn && is.moduleEvent(e)) {
        const event = e as T;
        const module = e.payload.module;
        const { key, namespace } = identity.parse(module);
        return fn({ module, key, namespace, event });
      } else {
        return true;
      }
    }),
  );
}
