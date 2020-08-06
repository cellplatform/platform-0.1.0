import { Subject } from 'rxjs';
import { filter, share, takeUntil } from 'rxjs/operators';

import * as events from './Module.events';

import { t } from '../common';

/**
 * Broadcasts events from the module (and all child modules)
 * throw the given pipe (fire).
 */
export const publish = (args: t.ModulePublishArgs): t.ModulePublishResponse => {
  const { module } = args;
  const pipe = (e: t.Event) => args.fire(e);

  const dispose$ = new Subject<void>();
  const dispose = () => dispose$.next();
  if (args.until$) {
    args.until$.subscribe(() => dispose());
  }

  const filterModuleEvent = (event: t.Event) => {
    const e = event as t.ModuleEvent;
    return events.isModuleEvent(e) ? events.filterEvent(e, args.filter) : true;
  };

  // Root module events.
  module.event.$.pipe(
    takeUntil(dispose$),
    filter((e) => filterModuleEvent(e)),
  ).subscribe(pipe);

  // Monitor child for events to bubble.
  module.event.childAdded$.pipe(takeUntil(dispose$)).subscribe((e) => {
    const child = module.find((child) => child.id === e.child.id);
    if (child) {
      const until$ = module.event.childRemoved$.pipe(
        takeUntil(dispose$),
        filter((e) => e.child.id === child.id),
      );
      child.event.$.pipe(
        takeUntil(until$),
        filter((e) => filterModuleEvent(e)),
      ).subscribe(pipe);
    }
  });

  return {
    get isDisposed() {
      return dispose$.isStopped;
    },
    dispose$: dispose$.pipe(share()),
    dispose,
  };
};
