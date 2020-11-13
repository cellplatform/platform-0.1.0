import { Store } from '@platform/state';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { t } from '../common';

/**
 * Create the application's "state" store.
 */
export function createStore(args: { event$: Subject<t.AppEvent> }): t.IAppStore {
  const event$ = args.event$;

  // Create the store.
  const initial: t.IAppState = {};
  const store = Store.create<t.IAppState, t.AppEvent>({ initial, event$ });

  // Ferry events in and out of state-machine.
  store.changed$.subscribe((payload) => event$.next({ type: 'APP:__NAME__/changed', payload }));

  // Finish up.
  return store;
}
