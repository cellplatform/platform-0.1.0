import { Store } from '@platform/state';
import { Subject } from 'rxjs';

import { t } from '../common';

/**
 * Create the Finder's state store.
 */
export function createStore(args: { event$: Subject<t.AppEvent> }): t.IAppStore {
  const event$ = args.event$;

  // Create the store.
  const initial: t.IAppState = { tree: {}, view: {} };
  const store = Store.create<t.IAppState, t.AppEvent>({ initial, event$ });

  // Ferry events in and out of state-machine.
  store.changed$.subscribe((payload) => {
    event$.next({ type: 'APP:FINDER/changed', payload });
  });

  // Finish up.
  return store;
}
