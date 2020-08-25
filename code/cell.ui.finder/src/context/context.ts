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

  const bus: t.EventBus<t.AppEvent> = {
    event$: event$.pipe(share()),
    fire: (e) => event$.next(e),
  };

  // Create the context.
  const ctx: t.IAppContext = {
    env,
    bus,
    client: Client.env(env),
    getState: () => store.state,
  };

  // Finish up.
  behavior.init({ ctx, store });
  const Provider = ui.createProvider({ ctx });
  return { ctx, store, Provider };
}
