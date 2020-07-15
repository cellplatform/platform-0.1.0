import { Store } from '@platform/state';
import { Subject } from 'rxjs';
import { delay } from 'rxjs/operators';

import { t } from '../common';

/**
 * Create the application's "state" store.
 */
export function createStore(args: { event$: Subject<t.AppEvent> }): t.IAppStore {
  const event$ = args.event$;

  // Create the store.
  const initial: t.IAppState = { uri: '', text: '' };
  const store = Store.create<t.IAppState, t.AppEvent>({ initial, event$ });

  // Ferry events in and out of state-machine.
  store.changed$
    .pipe(delay(0)) // NB: Allow direct listeners to store events to complete before firing.
    .subscribe((payload) => event$.next({ type: 'APP:IDE/changed', payload }));

  // Finish up.
  return store;
}
