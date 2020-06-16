import { Subject } from 'rxjs';
import { share } from 'rxjs/operators';

import { Client, t, ui } from '../common';
import { createStore, behavior } from '../state';

/**
 * Creates an environment context.
 */
export function create(args: { env: t.IEnv }) {
  const { env } = args;
  const def = env.def;
  const event$ = env.event$ as Subject<t.AppEvent>;
  const client = Client.env(env);
  const store = createStore({ event$ });

  const ctx: t.IFinderContext = {
    def,
    client,
    getState: () => store.state,
    event$: event$.pipe(share()),
    fire: (e) => event$.next(e),
  };

  behavior.init({ ctx, store });
  const Provider = ui.createProvider({ ctx });

  return { ctx, store, Provider };
}
