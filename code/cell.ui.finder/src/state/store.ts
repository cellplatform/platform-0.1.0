import { Store } from '@platform/state';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { t } from '../common';

/**
 * Create the Finder's state store.
 */
export function createStore(args: {
  env: t.IEnv<t.FinderEvent>;
  event$: Subject<t.FinderEvent>;
}): t.IFinderStore {
  const { env } = args;

  // Create the store.
  const initial: t.IFinderState = { tree: {} };
  const store = Store.create<t.IFinderState, t.FinderEvent>({ initial });

  // Ferry events in and out of state-machine.
  env.event$.pipe(filter((e) => e.type.startsWith('FINDER/'))).subscribe((e) => store.dispatch(e));
  store.changed$.subscribe((payload) => args.event$.next({ type: 'FINDER/changed', payload }));

  // Finish up.
  return store;
}
