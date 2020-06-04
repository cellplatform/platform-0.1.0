import { Store } from '@platform/state';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { t } from '../common';

/**
 * Create the Finder's state store.
 */
export function createStore(args: { event$: Subject<t.Event> }): t.IFinderStore {
  const event$ = args.event$ as Subject<t.FinderEvent>;

  // Create the store.
  const initial: t.IFinderState = { tree: {}, view: {} };
  const store = Store.create<t.IFinderState, t.FinderEvent>({ initial });

  // Ferry events in and out of state-machine.
  store.changed$.subscribe((payload) => {
    event$.next({ type: 'FINDER/changed', payload });
  });
  event$
    .pipe(
      filter((e) => e.type.startsWith('FINDER/')),
      filter((e) => e.type !== 'FINDER/changed'),
    )
    .subscribe((e) => store.dispatch(e));

  // Finish up.
  return store;
}
