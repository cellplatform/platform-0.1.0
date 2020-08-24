import { TreeState } from '@platform/state';
import { is } from '@platform/state/lib/common/is';
import { rx } from '@platform/util.value';
import { equals } from 'ramda';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, share, takeUntil } from 'rxjs/operators';

import { t } from '../common';
import { fire } from './Module.fire';

type P = t.IModuleProps;

const identity = TreeState.identity;
export function create<T extends P = t.IModulePropsAny>(
  subject: Observable<t.Event> | t.IModule,
  until$?: Observable<any>,
): t.IModuleEvents<T> {
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

  const register$ = rx.payload<t.IModuleRegisterEvent>($, 'Module/register').pipe(share());
  const registered$ = rx.payload<t.IModuleRegisteredEvent>($, 'Module/registered').pipe(share());

  const childRegistered$ = rx
    .payload<t.IModuleChildRegisteredEvent>($, 'Module/child/registered')
    .pipe(share());
  const childDisposed$ = rx
    .payload<t.IModuleChildDisposedEvent>($, 'Module/child/disposed')
    .pipe(share());
  const changed$ = rx.payload<t.IModuleChangedEvent>($, 'Module/changed').pipe(share());
  const patched$ = rx.payload<t.IModulePatchedEvent>($, 'Module/patched').pipe(share());
  const selection$ = rx.payload<t.IModuleSelectionEvent<T>>($, 'Module/selection').pipe(share());
  const render$ = rx.payload<t.IModuleRenderEvent<T>>($, 'Module/render').pipe(share());
  const rendered$ = rx.payload<t.IModuleRenderedEvent>($, 'Module/rendered').pipe(share());

  const events: t.IModuleEvents<T> = {
    $,
    register$,
    registered$,
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

    /**
     * Filters on render requests for the given view, only returning
     * matching events that have not yet been handled.
     */
    render(view) {
      return render$.pipe(
        filter((e) => !e.handled),
        filter((e) => (view === undefined ? true : e.view === view)),
      );
    },
  };

  return events;
}

/**
 * Determine if the given event is a module.
 */
export function isModuleEvent(event: t.Event) {
  return event.type.startsWith('Module/');
}

/**
 * Run a module filter.
 */
export function filterEvent(event: t.ModuleEvent, filter?: t.ModuleFilterEvent) {
  if (filter) {
    const id = event.payload.module;
    const { key, namespace } = identity.parse(id);
    return filter({ module: id, key, namespace, event });
  } else {
    return true;
  }
}

/**
 * Monitors the events of a module (and it's children) and bubbles
 * the relevant events.
 */
export function monitorAndDispatch<T extends P>(
  bus: t.EventBus<t.ModuleEvent>,
  module: t.IModule<T>,
) {
  const until$ = module.dispose$;
  const event$ = bus.event$.pipe(takeUntil(until$));
  const next = fire(bus);

  /**
   * Bubble module events through the StateObject's internal dispatch.
   */
  event$
    .pipe(
      filter((e) => isModuleEvent(e)),
      filter((e) => e.payload.module === module.id),
    )
    .subscribe((e) => module.dispatch(e));

  const id = module.id;
  const objChanged$ = module.event.changed$.pipe(takeUntil(until$));
  const objPatched$ = module.event.patched$.pipe(takeUntil(until$));

  objChanged$.subscribe((change) => {
    module.dispatch({
      type: 'Module/changed',
      payload: { module: id, change },
    });
  });

  objPatched$.subscribe((patch) => {
    module.dispatch({
      type: 'Module/patched',
      payload: { module: id, patch },
    });
  });

  /**
   * Convert changes to the tree-navigation data into ["Module/selection"] events.
   */
  objChanged$
    .pipe(
      map((e) => e.to.props?.treeview?.nav as NonNullable<t.ITreeviewNodeProps['nav']>),
      filter((e) => Boolean(e)),
      distinctUntilChanged((prev, next) => equals(prev, next)),
    )
    .subscribe((e) => {
      next.selection({ root: module.root, selected: e.selected });
    });

  // Finish up.
  return module;
}
