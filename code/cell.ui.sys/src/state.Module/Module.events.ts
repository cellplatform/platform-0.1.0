import { TreeState } from '@platform/state';
import { Observable, Subject } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';
import { is } from '@platform/state/lib/common/is';

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
    filter((e) => e.type.startsWith('Module/')),
    map((e) => e as t.ModuleEvent),
    share(),
  );

  const changed$ = $.pipe(
    filter((e) => e.type === 'Module/changed'),
    map((e) => e.payload as t.IModuleChanged),
    share(),
  );

  const events: t.IModuleEvents = {
    $,
    changed$,

    /**
     * Creates a new event object with a filter constraint.
     */
    filter(fn) {
      const event$ = $.pipe(
        filter((event) => {
          const id = event.payload.id;
          const { key, namespace } = identity.parse(id);
          return fn({ id, key, namespace, event });
        }),
      );
      return create(event$, dispose$); // <== RECURSION 🌳
    },
  };

  return events;
};

/**
 * Monitors the events of a module (and it's children) and bubbles
 * the "MODULE/changed" event.
 */
export function monitorAndDispatchChanged(module: t.IModule) {
  type M = t.IModule<any, t.ModuleEvent>;

  const monitorChild = (parent: M, child?: M) => {
    if (child) {
      const until$ = parent.event.childRemoved$.pipe(filter((e) => e.child.id === child.id));
      monitor(child, until$); // <== RECURSION 🌳
    }
  };

  const monitor = (module: M, until$: Observable<any> = new Subject()) => {
    const events = module.event;
    const changed$ = events.changed$.pipe(takeUntil(until$));
    const child$ = events.childAdded$.pipe(takeUntil(until$));

    changed$.subscribe((change) => {
      module.dispatch({
        type: 'Module/changed',
        payload: { id: module.id, change },
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
