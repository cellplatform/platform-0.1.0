import { Observable, Subject } from 'rxjs';
import { filter, share, takeUntil } from 'rxjs/operators';

import { t } from '../common';

/**
 * Broadcasts events from the module (and all child modules)
 * throw the given pipe (fire).
 */
export const create: t.ModuleBroadcast = (
  module: t.IModule,
  fire: t.FireEvent<any>,
  until$?: Observable<any>,
) => {
  const pipe = (e: t.Event) => fire(e);

  const dispose$ = new Subject<void>();
  const dispose = () => dispose$.next();
  if (until$) {
    until$.subscribe(() => dispose());
  }

  // Root module events.
  module.event.$.pipe(takeUntil(dispose$)).subscribe(pipe);

  // Monitor child for events to bubble.
  module.event.childAdded$.pipe(takeUntil(dispose$)).subscribe((e) => {
    const child = module.find((child) => child.id === e.child.id);
    if (child) {
      const until$ = module.event.childRemoved$.pipe(
        takeUntil(dispose$),
        filter((e) => e.child.id === child.id),
      );
      child.event.$.pipe(takeUntil(until$)).subscribe(pipe);
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
