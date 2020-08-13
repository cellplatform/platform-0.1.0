import { TreeState } from '@platform/state';
import { Observable, Subject } from 'rxjs';
import { filter, map, share, takeUntil, distinctUntilChanged } from 'rxjs/operators';
import { is } from '@platform/state/lib/common/is';
import { rx } from '@platform/util.value';
import { fire } from './Module.fire';

import { t } from '../common';

type P = t.IModuleProps;

const identity = TreeState.identity;
import { equals } from 'ramda';

export const create: t.ModuleGetEvents = (subject, until$) => {
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

  const childRegistered$ = rx
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
    childRegistered$,
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
 * the relevant events.
 */
export function monitorAndDispatch<T extends P>(module: t.IModule<T>) {
  type M = t.IModule<T>;

  const monitorChild = (parent: M, child?: M) => {
    if (child) {
      const until$ = parent.event.childRemoved$.pipe(filter((e) => e.child.id === child.id));
      monitor(child, until$); // <== RECURSION 🌳
    }
  };

  const monitor = (module: M, until$: Observable<any> = new Subject()) => {
    const id = module.id;
    const changed$ = module.event.changed$.pipe(takeUntil(until$));
    const patched$ = module.event.patched$.pipe(takeUntil(until$));
    const childAdded$ = module.event.childAdded$.pipe(takeUntil(until$));

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

    // Convert changes to the tree-navigation data into [Module/selection] events.
    changed$
      .pipe(
        map((e) => e.to.props?.treeview?.nav as NonNullable<t.ITreeviewNodeProps['nav']>),
        filter((e) => Boolean(e)),
        distinctUntilChanged((prev, next) => equals(prev, next)),
      )
      .subscribe((e) => {
        const { current, selected } = e;
        const root = module.root;
        fire(module.dispatch).selection({ root, current, selected });
      });

    childAdded$.subscribe((e) => {
      const child = module.find((child) => child.id === e.child.id);
      monitorChild(module, child); // <== RECURSION 🌳
    });

    module.children.forEach((child) => monitorChild(module, child as M)); // <== RECURSION 🌳
  };

  monitor(module);
  return module;
}
