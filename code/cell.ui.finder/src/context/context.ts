import { Subject } from 'rxjs';
import { share } from 'rxjs/operators';

import { Client, t, ui } from '../common';
import { createStore, behavior } from '../state';

/**
 * Creates an environment context.
 */
export function create(args: { env: t.IEnv }) {
  const { env } = args;
  const event$ = env.event$ as Subject<t.AppEvent>;
  const store = createStore({ event$ });

  // Create the context.
  const ctx: t.IAppContext = {
    env,
    client: Client.env(env),
    event$: event$.pipe(share()),
    getState: () => store.state,
    fire: (e) => event$.next(e),
  };

  // Finish up.
  behavior.init({ ctx, store });
  const Provider = ui.createProvider({ ctx });
  return { ctx, store, Provider };
}
