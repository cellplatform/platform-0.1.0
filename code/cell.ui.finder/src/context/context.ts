import { Subject } from 'rxjs';
import { share } from 'rxjs/operators';

import { Client, t } from '../common';
import { createStore, behavior } from '../state';

/**
 * Creates an environment context.
 */
export function create(args: { env: t.IEnv }) {
  const { env } = args;
  const event$ = env.event$;

  const client = Client.typesystem({
    http: env.host,
    event$: event$ as Subject<t.TypedSheetEvent>,
    cache: env.cache,
  });

  const store = createStore({ event$ });

  const ctx: t.IFinderContext = {
    client,
    getState: () => store.state,
    event$: (event$ as Subject<t.FinderEvent>).pipe(share()),
    fire: (e) => event$.next(e),
  };

  behavior.init({ ctx, store });
  return { ctx, store };
}
