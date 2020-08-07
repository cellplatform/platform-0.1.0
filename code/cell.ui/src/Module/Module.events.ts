import { TreeState } from '@platform/state';
import { Observable, Subject } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';
import { is } from '@platform/state/lib/common/is';
import { rx } from '@platform/util.value';

import { t } from '../common';

const identity = TreeState.identity;

export const create: t.ModuleEvents = (subject, until$) => {
  const subject$ = is.observable(subject) ? subject : (subject as t.IModule).event.$;
  const event$ = subject$ as Observable<t.Event>;

  const dispose$ = new Subject<void>();
  if (until$) {
    until$.subscribe(() => dispose$.next());
  }

  const raw$ = event$.pipe(takeUntil(dispose$));

  const $ = raw$.pipe(
    filter((e) => isModuleEvent(e)),
    map((e) => e as t.ModuleEvent),
    share(),
  );

  const registered$ = rx
    .payload<t.IModuleChildRegisteredEvent>($, 'Module/child/registered')
    .pipe(share());
  const childDisposed$ = rx
    .payload<t.IModuleChildDisposedEvent>($, 'Module/child/disposed')
    .pipe(share());
  const changed$ = rx.payload<t.IModuleChangedEvent>($, 'Module/changed').pipe(share());
  const patched$ = rx.payload<t.IModulePatchedEvent>($, 'Module/patched').pipe(share());
  const selection$ = rx.payload<t.IModuleSelectionEvent>($, 'Module/selection').pipe(share());
  const render$ = rx.payload<t.IModuleRenderEvent>($, 'Module/render').pipe(share());
  const rendered$ = rx.payload<t.IModuleRenderedEvent>($, 'Module/rendered').pipe(share());

  const events: t.IModuleEvents = {
    $,
    registered$,
    childDisposed$,
    changed$,
    patched$,
    selection$,
    render$,
    rendered$,

    /**
     * Creates a new event object with a filter constraint.
     */
    filter(fn) {
      const event$ = $.pipe(filter((event) => filterEvent(event, fn)));
      return create(event$, dispose$); // <== RECURSION 🌳
    },
  };

  return events;
};

/**
 * Determine if the given event is a module.
 */
export function isModuleEvent(event: t.Event) {
  return event.type.startsWith('Module/');
}

/**
 * Run a module filter.
 */
export function filterEvent(event: t.ModuleEvent, filter?: t.ModuleFilter) {
  if (filter) {
    const id = event.payload.module;
    const { key, namespace } = identity.parse(id);
    return filter({ id, key, namespace, event });
  } else {
    return true;
  }
}

/**
 * Monitors the events of a module (and it's children) and bubbles
 * the "MODULE/changed" event.
 */
export function monitorAndDispatch(module: t.IModule) {
  type M = t.IModule<any>;

  const monitorChild = (parent: M, child?: M) => {
    if (child) {
      const until$ = parent.event.childRemoved$.pipe(filter((e) => e.child.id === child.id));
      monitor(child, until$); // <== RECURSION 🌳
    }
  };

  const monitor = (module: M, until$: Observable<any> = new Subject()) => {
    const id = module.id;
    const events = module.event;
    const changed$ = events.changed$.pipe(takeUntil(until$));
    const patched$ = events.patched$.pipe(takeUntil(until$));
    const child$ = events.childAdded$.pipe(takeUntil(until$));

    changed$.subscribe((change) => {
      module.dispatch({
        type: 'Module/changed',
        payload: { module: id, change },
      });
    });

    patched$.subscribe((patch) => {
      module.dispatch({
        type: 'Module/patched',
        payload: { module: id, patch },
      });
    });

    child$.subscribe((e) => {
      const child = module.find((child) => child.id === e.child.id);
      monitorChild(module, child); // <== RECURSION 🌳
    });

    module.children.forEach((child) => monitorChild(module, child as M)); // <== RECURSION 🌳
  };

  monitor(module);
  return module;
}
